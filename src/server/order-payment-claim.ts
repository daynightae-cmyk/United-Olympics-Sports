import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../db/index.js';
import type { AuthorizationContext } from './authorization-context.js';
import { recordAudit } from './audit.js';
import { ApiError, normalizeString } from './http.js';
import {
  cancelStripeIntent,
  getPaymentProviderConfig,
  retrieveStripeIntent,
  type PaymentProviderConfig,
  type RemoteIntentResult,
} from './payment-provider.js';
import type { DbQueryClient } from './vertical-slice.js';

const ADMIN_ROLES = ['super_admin', 'admin', 'owner', 'administrator'];
const TERMINAL_CLAIM_STATUSES = ['failed', 'cancelled'];
export const DEFAULT_PAYMENT_CLAIM_TTL_MINUTES = 30;

type TransactionDb = DbQueryClient & {
  connect?: () => Promise<{
    query: <R = unknown>(text: string, params?: unknown[]) => Promise<{ rows: R[]; rowCount?: number }>;
    release: () => void;
  }>;
};

type CancelProviderIntent = (
  config: PaymentProviderConfig,
  providerIntentId: string,
) => Promise<RemoteIntentResult>;

type RetrieveProviderIntent = (
  config: PaymentProviderConfig,
  providerIntentId: string,
) => Promise<RemoteIntentResult>;

export interface OrderPaymentClaim {
  paymentIntentId: string;
  idempotencyKey: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
}

export interface OrderPaymentClaimExpiryResult {
  expired: boolean;
  orderCancelled: boolean;
  paymentIntentId?: string;
}

export interface OrderPaymentClaimExpiryOptions {
  nowMs?: number;
  ttlMinutes?: number;
  providerConfig?: PaymentProviderConfig | null;
  cancelIntent?: CancelProviderIntent;
  retrieveIntent?: RetrieveProviderIntent;
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

async function restoreCancellingClaim(
  db: DbQueryClient,
  paymentIntentId: string,
  providerIntentId: string,
): Promise<void> {
  await db.query(
    `update payment_intents set status = 'requires_payment_method'
      where id = $1 and status = 'cancelling' and provider_intent_id = $2`,
    [paymentIntentId, providerIntentId],
  );
}

export function getPaymentClaimTtlMinutes(): number {
  const configured = Number.parseInt(process.env.PAYMENT_CLAIM_TTL_MINUTES || '', 10);
  if (!Number.isFinite(configured) || configured < 5 || configured > 1440) {
    return DEFAULT_PAYMENT_CLAIM_TTL_MINUTES;
  }
  return configured;
}

export function getPaymentClaimExpiryCutoff(
  nowMs = Date.now(),
  ttlMinutes = getPaymentClaimTtlMinutes(),
): Date {
  return new Date(nowMs - ttlMinutes * 60_000);
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

/**
 * Safely expires a stale order-bound Stripe claim.
 *
 * The caller is authorized against the locked order before the claim is
 * touched. The remote provider intent is cancelled before any local inventory
 * is released. If Stripe rejects cancellation because the intent is already
 * terminal, provider truth is retrieved: canceled continues local release,
 * while succeeded is reconciled to a paid order. Only resumable/non-terminal
 * provider states are restored to requires_payment_method.
 */
export async function expireAbandonedOrderPaymentClaim(
  ctx: AuthorizationContext,
  orderIdInput: unknown,
  override?: TransactionDb,
  options: OrderPaymentClaimExpiryOptions = {},
): Promise<OrderPaymentClaimExpiryResult> {
  const orderId = normalizeString(orderIdInput, 64);
  if (!orderId) throw new ApiError(400, 'VALIDATION_ERROR', 'orderId is required.');

  const db = resolveDb(override);
  const cutoff = getPaymentClaimExpiryCutoff(options.nowMs, options.ttlMinutes ?? getPaymentClaimTtlMinutes());
  const candidateRes = await db.query<{
    id: string;
    provider: string;
    provider_intent_id: string | null;
  }>(
    `select id, provider, provider_intent_id
       from payment_intents
      where metadata->>'orderId' = $1
        and status = 'requires_payment_method'
        and provider_intent_id is not null
        and updated_at <= $2
      order by updated_at asc
      limit 1`,
    [orderId, cutoff],
  );
  if (candidateRes.rows.length === 0) return { expired: false, orderCancelled: false };

  const candidate = candidateRes.rows[0];
  if (candidate.provider !== 'stripe' || !candidate.provider_intent_id) {
    return { expired: false, orderCancelled: false };
  }

  const marked = await inTransaction(db, async (tx) => {
    const orderRes = await tx.query<{ id: string; status: string; customer_uid: string }>(
      'select id, status, customer_uid from orders where id = $1 for update',
      [orderId],
    );
    if (orderRes.rows.length === 0) return false;

    const order = orderRes.rows[0];
    const isOwner = order.customer_uid === ctx.uid;
    const isAdmin = ctx.roles.some((role) => ADMIN_ROLES.includes(role));
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'ORDER_ACCESS_DENIED', 'This order belongs to another customer.');
    }
    if (order.status !== 'pending') return false;

    const claimRes = await tx.query<{
      id: string;
      status: string;
      provider_intent_id: string | null;
      metadata: { orderId?: unknown } | null;
      updated_at: string | Date;
    }>(
      'select id, status, provider_intent_id, metadata, updated_at from payment_intents where id = $1 for update',
      [candidate.id],
    );
    if (claimRes.rows.length === 0) return false;
    const claimRow = claimRes.rows[0];
    const linkedOrderId = typeof claimRow.metadata?.orderId === 'string' ? claimRow.metadata.orderId : null;
    if (
      linkedOrderId !== orderId
      || claimRow.status !== 'requires_payment_method'
      || claimRow.provider_intent_id !== candidate.provider_intent_id
      || new Date(claimRow.updated_at).getTime() > cutoff.getTime()
    ) {
      return false;
    }

    const update = await tx.query(
      `update payment_intents
          set status = 'cancelling'
        where id = $1
          and status = 'requires_payment_method'
          and provider_intent_id = $2`,
      [candidate.id, candidate.provider_intent_id],
    );
    return (update.rowCount ?? 0) > 0;
  });
  if (!marked) return { expired: false, orderCancelled: false };

  const providerConfig = options.providerConfig !== undefined
    ? options.providerConfig
    : getPaymentProviderConfig();
  if (!providerConfig || providerConfig.provider !== 'stripe') {
    await restoreCancellingClaim(db, candidate.id, candidate.provider_intent_id);
    return { expired: false, orderCancelled: false };
  }

  const cancelIntent = options.cancelIntent ?? cancelStripeIntent;
  const retrieveIntent = options.retrieveIntent ?? retrieveStripeIntent;
  let providerConfirmedCancelled: boolean;
  try {
    const remote = await cancelIntent(providerConfig, candidate.provider_intent_id);
    if (remote.status !== 'cancelled') {
      throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider did not confirm timed-out intent cancellation.');
    }
    providerConfirmedCancelled = true;
  } catch (providerError) {
    let inspected: RemoteIntentResult;
    try {
      inspected = await retrieveIntent(providerConfig, candidate.provider_intent_id);
    } catch (inspectionError) {
      console.error('[PAYMENT] Failed to inspect provider intent after cancellation rejection:', inspectionError);
      try {
        await restoreCancellingClaim(db, candidate.id, candidate.provider_intent_id);
      } catch (restoreError) {
        console.error('[PAYMENT] Failed to restore stale claim after provider cancellation error:', restoreError);
      }
      throw providerError;
    }

    if (inspected.status === 'cancelled') {
      providerConfirmedCancelled = true;
    } else if (inspected.status === 'succeeded') {
      const { PaymentDomainRepository } = await import('./repositories/payment-repository.js');
      const paymentRepo = new PaymentDomainRepository(db);
      await paymentRepo.reconcileProviderEvent({
        provider: 'stripe',
        providerIntentId: candidate.provider_intent_id,
        eventType: 'payment_intent.succeeded',
        orderId,
      });
      return { expired: false, orderCancelled: false, paymentIntentId: candidate.id };
    } else {
      try {
        await restoreCancellingClaim(db, candidate.id, candidate.provider_intent_id);
      } catch (restoreError) {
        console.error('[PAYMENT] Failed to restore stale claim after provider cancellation error:', restoreError);
      }
      throw providerError;
    }
  }

  if (!providerConfirmedCancelled) {
    throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider cancellation state could not be established.');
  }

  return inTransaction(db, async (tx) => {
    const claimRes = await tx.query<{
      id: string;
      status: string;
      provider_intent_id: string | null;
      metadata: { orderId?: unknown } | null;
    }>(
      'select id, status, provider_intent_id, metadata from payment_intents where id = $1 for update',
      [candidate.id],
    );
    if (claimRes.rows.length === 0) {
      throw new ApiError(409, 'PAYMENT_CLAIM_LOST', 'The timed-out payment claim is no longer available.');
    }
    const claimRow = claimRes.rows[0];
    const linkedOrderId = typeof claimRow.metadata?.orderId === 'string' ? claimRow.metadata.orderId : null;
    if (linkedOrderId !== orderId || claimRow.provider_intent_id !== candidate.provider_intent_id) {
      throw new ApiError(409, 'PAYMENT_CLAIM_LOST', 'The timed-out payment claim changed during provider cancellation.');
    }
    if (claimRow.status === 'succeeded') {
      throw new ApiError(409, 'ORDER_ALREADY_PAID', 'The order payment completed while expiry was being reconciled.');
    }

    const orderRes = await tx.query<{
      id: string;
      status: string;
      items: Array<{ productId: string; quantity: number }>;
    }>(
      'select id, status, items from orders where id = $1 for update',
      [orderId],
    );

    await tx.query(
      `update payment_intents
          set status = 'cancelled', updated_at = now()
        where id = $1 and status <> 'succeeded'`,
      [candidate.id],
    );

    if (orderRes.rows.length === 0 || orderRes.rows[0].status !== 'pending') {
      await recordAudit(ctx, {
        action: 'payment.order.claim.expire',
        entityType: 'payment_intent',
        entityId: candidate.id,
        metadata: { orderId, providerIntentId: candidate.provider_intent_id, orderCancelled: false },
      }, tx);
      return { expired: true, orderCancelled: false, paymentIntentId: candidate.id };
    }

    const lines = Array.isArray(orderRes.rows[0].items) ? orderRes.rows[0].items : [];
    const releaseLines = lines
      .filter((line): line is { productId: string; quantity: number } =>
        Boolean(line && typeof line.productId === 'string' && Number.isInteger(line.quantity) && line.quantity > 0)
      )
      .sort((a, b) => a.productId.localeCompare(b.productId));

    for (const line of releaseLines) {
      await tx.query(
        'update inventory set available_quantity = available_quantity + $1, updated_at = now() where product_id = $2',
        [line.quantity, line.productId],
      );
    }

    const orderUpdated = await tx.query(
      `update orders set status = 'cancelled', updated_at = now() where id = $1 and status = 'pending'`,
      [orderId],
    );
    if ((orderUpdated.rowCount ?? 0) === 0) {
      throw new ApiError(409, 'ORDER_NOT_CANCELLABLE', 'Timed-out payment order changed before inventory release completed.');
    }

    await recordAudit(ctx, {
      action: 'payment.order.claim.expire',
      entityType: 'payment_intent',
      entityId: candidate.id,
      metadata: {
        orderId,
        providerIntentId: candidate.provider_intent_id,
        releasedLines: releaseLines.length,
        orderCancelled: true,
      },
    }, tx);

    return { expired: true, orderCancelled: true, paymentIntentId: candidate.id };
  });
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
      if (row.status === 'cancelling') {
        throw new ApiError(409, 'ORDER_PAYMENT_IN_PROGRESS', 'This payment attempt is being expired and cannot be reused yet.');
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
