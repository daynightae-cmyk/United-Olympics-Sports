import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../db/index';
import type { AuthorizationContext } from './authorization-context';
import { recordAudit } from './audit';
import { ApiError, normalizeString } from './http';
import type { DbQueryClient } from './vertical-slice';

const ADMIN_ROLES = ['super_admin', 'admin', 'owner', 'administrator'];
const TERMINAL_CLAIM_STATUSES = ['failed', 'cancelled'];

type TransactionDb = DbQueryClient & {
  connect?: () => Promise<{
    query: <R = unknown>(text: string, params?: unknown[]) => Promise<{ rows: R[]; rowCount?: number }>;
    release: () => void;
  }>;
};

export interface OrderPaymentClaim {
  paymentIntentId: string;
  idempotencyKey: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
}

function resolveDb(override?: TransactionDb): TransactionDb {
  if (override) return override;
  if (databaseConfigured()) return getPool() as TransactionDb;
  throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
}

async function inTransaction<T>(db: TransactionDb, work: (client: DbQueryClient) => Promise<T>): Promise<T> {
  if (typeof db.connect !== 'function') return work(db);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* best-effort */ }
    throw error;
  } finally {
    client.release();
  }
}

export async function assertOrderPaymentNotClaimed(db: DbQueryClient, orderId: string): Promise<void> {
  const active = await db.query<{ id: string }>(
    `select id from payment_intents
      where metadata->>'orderId' = $1
        and status <> all($2::text[])
      limit 1`,
    [orderId, TERMINAL_CLAIM_STATUSES],
  );
  if (active.rows.length > 0) {
    throw new ApiError(409, 'ORDER_PAYMENT_IN_PROGRESS', 'This order has an active payment attempt and cannot be cancelled.');
  }
}

export async function claimOrderPayment(
  ctx: AuthorizationContext,
  input: { orderId: unknown; idempotencyKey: unknown; amountMinor?: unknown; currency?: unknown; provider?: unknown },
  override?: TransactionDb,
): Promise<OrderPaymentClaim> {
  const orderId = normalizeString(input.orderId, 64);
  const idempotencyKey = normalizeString(input.idempotencyKey, 128);
  const provider = normalizeString(input.provider, 50) || 'stripe';
  if (!orderId) throw new ApiError(400, 'VALIDATION_ERROR', 'orderId is required.');
  if (!idempotencyKey) throw new ApiError(400, 'VALIDATION_ERROR', 'Idempotency key is required.');

  return inTransaction(resolveDb(override), async (db) => {
    const orderRes = await db.query<{
      id: string;
      customer_uid: string;
      status: string;
      total_minor: number;
      currency: string;
    }>('select id, customer_uid, status, total_minor, currency from orders where id = $1 for update', [orderId]);
    if (orderRes.rows.length === 0) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');

    const order = orderRes.rows[0];
    const isOwner = order.customer_uid === ctx.uid;
    const isAdmin = ctx.roles.some((role) => ADMIN_ROLES.includes(role));
    if (!isOwner && !isAdmin) throw new ApiError(403, 'ORDER_ACCESS_DENIED', 'This order belongs to another customer.');
    if (order.status !== 'pending') throw new ApiError(409, 'ORDER_NOT_PAYABLE', 'Only pending orders can be paid.');
    if (typeof input.amountMinor === 'number' && input.amountMinor !== order.total_minor) {
      throw new ApiError(422, 'AMOUNT_MISMATCH', 'Payable amount is set by the order and cannot be overridden.');
    }
    const currency = (order.currency || 'AED').toUpperCase();
    const requestedCurrency = normalizeString(input.currency, 3)?.toUpperCase();
    if (requestedCurrency && requestedCurrency !== currency) {
      throw new ApiError(422, 'CURRENCY_MISMATCH', 'Payable currency is set by the order and cannot be overridden.');
    }

    const otherClaim = await db.query<{ id: string }>(
      `select id from payment_intents
        where metadata->>'orderId' = $1
          and idempotency_key <> $2
          and status <> all($3::text[])
        limit 1`,
      [orderId, idempotencyKey, TERMINAL_CLAIM_STATUSES],
    );
    if (otherClaim.rows.length > 0) {
      throw new ApiError(409, 'ORDER_PAYMENT_IN_PROGRESS', 'Another payment attempt is already active for this order.');
    }

    const existing = await db.query<{
      id: string;
      amount_minor: number;
      currency: string;
      status: string;
      metadata: { orderId?: unknown } | null;
    }>(
      'select id, amount_minor, currency, status, metadata from payment_intents where idempotency_key = $1 limit 1',
      [idempotencyKey],
    );

    let paymentIntentId: string;
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const linkedOrderId = typeof row.metadata?.orderId === 'string' ? row.metadata.orderId : null;
      if (linkedOrderId !== orderId || row.amount_minor !== order.total_minor || row.currency !== currency) {
        throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'This idempotency key is already bound to different payment data.');
      }
      paymentIntentId = row.id;
      if (TERMINAL_CLAIM_STATUSES.includes(row.status)) {
        await db.query(
          `update payment_intents set status = 'processing', provider = $2, provider_intent_id = null, updated_at = now() where id = $1`,
          [paymentIntentId, provider],
        );
      }
    } else {
      paymentIntentId = randomUUID();
      await db.query(
        `insert into payment_intents
          (id, idempotency_key, amount_minor, currency, status, provider, provider_intent_id, metadata, created_at, updated_at)
         values ($1, $2, $3, $4, 'processing', $5, null, $6::jsonb, now(), now())`,
        [paymentIntentId, idempotencyKey, order.total_minor, currency, provider, JSON.stringify({ orderId, paymentClaim: true })],
      );
    }

    await recordAudit(ctx, {
      action: 'payment.order.claim',
      entityType: 'payment_intent',
      entityId: paymentIntentId,
      metadata: { orderId, idempotencyKey, amountMinor: order.total_minor, currency, provider },
    }, db);

    return { paymentIntentId, idempotencyKey, orderId, amountMinor: order.total_minor, currency, provider };
  });
}

export async function completeOrderPaymentClaim(
  ctx: AuthorizationContext,
  input: { claim: OrderPaymentClaim; providerIntentId: string; remoteStatus: string; clientSecret?: string },
  override?: TransactionDb,
): Promise<Record<string, unknown>> {
  const db = resolveDb(override);
  const providerIntentId = normalizeString(input.providerIntentId, 255);
  if (!providerIntentId) throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Provider payment intent ID is missing.');

  const updated = await db.query<{ created_at: string | Date }>(
    `update payment_intents
        set provider_intent_id = $2, status = $3, provider = $4, updated_at = now()
      where id = $1 and metadata->>'orderId' = $5
      returning created_at`,
    [input.claim.paymentIntentId, providerIntentId, input.remoteStatus || 'processing', input.claim.provider, input.claim.orderId],
  );
  if ((updated.rowCount ?? 0) === 0 || updated.rows.length === 0) {
    throw new ApiError(409, 'PAYMENT_CLAIM_LOST', 'The order payment claim is no longer available.');
  }

  await recordAudit(ctx, {
    action: 'payment.order.claim.finalize',
    entityType: 'payment_intent',
    entityId: input.claim.paymentIntentId,
    metadata: { orderId: input.claim.orderId, providerIntentId, status: input.remoteStatus || 'processing' },
  });

  return {
    id: input.claim.paymentIntentId,
    idempotencyKey: input.claim.idempotencyKey,
    orderId: input.claim.orderId,
    amountMinor: input.claim.amountMinor,
    currency: input.claim.currency,
    status: input.remoteStatus || 'processing',
    provider: input.claim.provider,
    providerIntentId,
    createdAt: new Date(updated.rows[0].created_at).toISOString(),
    ...(input.clientSecret ? { clientSecret: input.clientSecret } : {}),
  };
}

export async function failOrderPaymentClaim(claim: OrderPaymentClaim, override?: TransactionDb): Promise<void> {
  const released = await resolveDb(override).query(
    `update payment_intents
        set status = 'failed', updated_at = now()
      where id = $1 and metadata->>'orderId' = $2 and provider_intent_id is null`,
    [claim.paymentIntentId, claim.orderId],
  );
  if ((released.rowCount ?? 0) === 0) {
    throw new ApiError(409, 'PAYMENT_CLAIM_RELEASE_FAILED', 'The failed payment claim could not be released safely.');
  }
}
