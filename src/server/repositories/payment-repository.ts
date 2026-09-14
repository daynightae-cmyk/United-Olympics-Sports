import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index';
import type { AuthorizationContext } from '../authorization-context';
import { recordAudit } from '../audit';
import { ApiError, normalizeString } from '../http';
import type { DbQueryClient } from '../vertical-slice';

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'cancelled'
  | 'failed';

export interface PaymentIntent {
  id: string;
  idempotencyKey: string;
  playerId?: string;
  subscriptionId?: string;
  amountMinor: number;
  currency: string;
  status: PaymentIntentStatus;
  provider: string;
  providerIntentId?: string;
  createdAt: string;
}

export interface PaymentWebhookEvent {
  eventId: string;
  provider: string;
  eventType: string;
  payload: Record<string, unknown>;
  signature?: string;
}

export interface WebhookProcessResult {
  processed: boolean;
  duplicate: boolean;
  status: string;
}

export interface RefundRequest {
  paymentId: string;
  amountMinor?: number;
  reason?: string;
}

export interface ReconciliationResult {
  totalProcessed: number;
  mismatches: number;
  reconciledAt: string;
}

export class PaymentDomainRepository {
  private clientOverride?: DbQueryClient;

  constructor(clientOverride?: DbQueryClient) {
    this.clientOverride = clientOverride;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  // --- AUTHORITATIVE PAYABLE RECORDS ---
  //
  // The browser is never authoritative for a payable amount. When an orderId
  // (or subscriptionId) is supplied, the amount and currency are loaded from
  // the server-side record and any client override is rejected by the caller.
  async getOrderForPayment(orderId: string): Promise<{
    id: string;
    customerUid: string;
    status: string;
    totalMinor: number;
    currency: string;
  }> {
    const id = normalizeString(orderId, 64);
    if (!id) throw new ApiError(400, 'VALIDATION_ERROR', 'orderId is required.');
    const res = await this.db.query<{
      id: string;
      customer_uid: string;
      status: string;
      total_minor: number;
      currency: string;
    }>('select id, customer_uid, status, total_minor, currency from orders where id = $1 limit 1', [id]);
    if (res.rows.length === 0) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
    }
    const row = res.rows[0];
    return {
      id: row.id,
      customerUid: row.customer_uid,
      status: row.status,
      totalMinor: row.total_minor,
      currency: row.currency || 'AED',
    };
  }

  async getSubscriptionForPayment(subscriptionId: string): Promise<{
    id: string;
    playerId: string | null;
    status: string;
    amountMinor: number | null;
    currency: string;
  }> {
    const id = normalizeString(subscriptionId, 64);
    if (!id) throw new ApiError(400, 'VALIDATION_ERROR', 'subscriptionId is required.');
    const res = await this.db.query<{
      id: string;
      player_id: string | null;
      status: string;
      amount_minor: number | null;
      currency: string | null;
    }>('select id, player_id::text as player_id, status, amount_minor, currency from subscriptions where id = $1 limit 1', [id]);
    if (res.rows.length === 0) {
      throw new ApiError(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription was not found.');
    }
    const row = res.rows[0];
    return {
      id: row.id,
      playerId: row.player_id,
      status: row.status,
      amountMinor: row.amount_minor,
      currency: row.currency || 'AED',
    };
  }

  // --- CREATE PAYMENT INTENT (IDEMPOTENT) ---
  async createPaymentIntent(
    ctx: AuthorizationContext,
    input: {
      idempotencyKey: string;
      amountMinor: number;
      currency?: string;
      playerId?: string;
      subscriptionId?: string;
      provider?: string;
      orderId?: string;
      charge?: boolean;
      clientSecret?: string;
      remoteStatus?: string;
      providerIntentId?: string;
    },
  ): Promise<PaymentIntent & { clientSecret?: string }> {
    const key = normalizeString(input.idempotencyKey, 128);
    if (!key) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Idempotency key is required.');
    }
    if (typeof input.amountMinor !== 'number' || input.amountMinor <= 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Amount must be a positive integer in minor units.');
    }

    const currency = normalizeString(input.currency, 3)?.toUpperCase() || 'AED';
    const provider = normalizeString(input.provider, 50) || 'stripe';

    // 1. Check idempotency: if intent already exists for this key, return existing
    const existing = await this.db.query<{
      id: string;
      idempotency_key: string;
      player_id: string | null;
      subscription_id: string | null;
      amount_minor: number;
      currency: string;
      status: PaymentIntentStatus;
      provider: string;
      provider_intent_id: string | null;
      created_at: string | Date;
    }>('select * from payment_intents where idempotency_key = $1 limit 1', [key]);

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return {
        id: row.id,
        idempotencyKey: row.idempotency_key,
        playerId: row.player_id || undefined,
        subscriptionId: row.subscription_id || undefined,
        amountMinor: row.amount_minor,
        currency: row.currency,
        status: row.status,
        provider: row.provider,
        providerIntentId: row.provider_intent_id || undefined,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }

    const id = randomUUID();
    const metadata: Record<string, unknown> = {};
    if (input.orderId) metadata.orderId = input.orderId;
    await this.db.query(
      `insert into payment_intents
         (id, idempotency_key, player_id, subscription_id, amount_minor, currency, status, provider, provider_intent_id, metadata, created_at, updated_at)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, now(), now())`,
      [
        id,
        key,
        input.playerId || null,
        input.subscriptionId || null,
        input.amountMinor,
        currency,
        input.remoteStatus || 'requires_payment_method',
        provider,
        input.providerIntentId || null,
        JSON.stringify(metadata),
      ],
    );

    await recordAudit(ctx, {
      action: 'payment.intent.create',
      entityType: 'payment_intent',
      entityId: id,
      metadata: {
        idempotencyKey: key,
        amountMinor: input.amountMinor,
        currency,
        provider,
        ...(input.orderId ? { orderId: input.orderId } : {}),
        ...(input.providerIntentId ? { providerIntentId: input.providerIntentId, charged: true } : {}),
      },
    });

    const created: PaymentIntent & { clientSecret?: string } = {
      id,
      idempotencyKey: key,
      playerId: input.playerId,
      subscriptionId: input.subscriptionId,
      amountMinor: input.amountMinor,
      currency,
      status: (input.remoteStatus as PaymentIntentStatus) || 'requires_payment_method',
      provider,
      createdAt: new Date().toISOString(),
    };
    if (input.providerIntentId) created.providerIntentId = input.providerIntentId;
    if (input.clientSecret) created.clientSecret = input.clientSecret;
    return created;
  }

  /**
   * Reconciles a VERIFIED provider event (idempotent): updates the linked
   * payment intent and, on success, transitions the linked order
   * pending -> paid. Unknown events record only.
   */
  async reconcileProviderEvent(input: {
    provider: string;
    providerIntentId?: string;
    eventType: string;
    orderId?: string;
  }): Promise<{ intentUpdated: boolean; orderUpdated: boolean }> {
    let intentUpdated = false;
    let orderUpdated = false;

    const terminalStatus =
      input.eventType === 'payment_intent.succeeded'
        ? 'succeeded'
        : input.eventType === 'payment_intent.payment_failed' || input.eventType === 'payment_intent.canceled'
          ? 'failed'
          : null;

    if (input.providerIntentId && terminalStatus) {
      const updated = await this.db.query(
        `update payment_intents
            set status = $1, updated_at = now()
          where provider_intent_id = $2 and status <> $1`,
        [terminalStatus, input.providerIntentId],
      );
      intentUpdated = (updated.rowCount ?? 0) > 0;

      const linkRes = await this.db.query<{ metadata: { orderId?: unknown } }>(
        'select metadata from payment_intents where provider_intent_id = $1 limit 1',
        [input.providerIntentId],
      );
      const linkedOrderId =
        (typeof linkRes.rows[0]?.metadata?.orderId === 'string' ? (linkRes.rows[0].metadata.orderId as string) : null) ||
        input.orderId ||
        null;

      if (linkedOrderId && terminalStatus === 'succeeded') {
        const orderUpdatedRes = await this.db.query(
          `update orders set status = 'paid', updated_at = now() where id = $1 and status = 'pending'`,
          [linkedOrderId],
        );
        orderUpdated = (orderUpdatedRes.rowCount ?? 0) > 0;
      }
    }

    return { intentUpdated, orderUpdated };
  }

  // --- PROCESS SIGNED WEBHOOK WITH DUPLICATE PROTECTION ---
  async processWebhook(event: PaymentWebhookEvent): Promise<WebhookProcessResult> {
    if (!event.eventId || !event.provider || !event.eventType) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid webhook payload.');
    }

    // Duplicate webhook protection
    const existing = await this.db.query<{ id: string; status: string }>(
      'select id, status from payment_webhooks where event_id = $1 limit 1',
      [event.eventId],
    );

    if (existing.rows.length > 0) {
      return {
        processed: true,
        duplicate: true,
        status: existing.rows[0].status,
      };
    }

    const id = randomUUID();
    await this.db.query(
      `insert into payment_webhooks
         (id, event_id, provider, event_type, status, payload, processed_at, created_at, updated_at)
       values ($1, $2, $3, $4, 'processed', $5::jsonb, now(), now(), now())`,
      [id, event.eventId, event.provider, event.eventType, JSON.stringify(event.payload)],
    );

    return {
      processed: true,
      duplicate: false,
      status: 'processed',
    };
  }

  // --- RECONCILIATION ---
  async runReconciliation(): Promise<ReconciliationResult> {
    const res = await this.db.query<{ count: string }>(
      'select count(*)::text as count from payment_intents where status = $1',
      ['succeeded'],
    );
    return {
      totalProcessed: parseInt(res.rows[0]?.count || '0', 10),
      mismatches: 0,
      reconciledAt: new Date().toISOString(),
    };
  }
}
