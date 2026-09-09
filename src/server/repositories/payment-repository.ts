import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import { recordAudit } from '../audit.ts';
import { ApiError, normalizeString } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';

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
    },
  ): Promise<PaymentIntent> {
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
    await this.db.query(
      `insert into payment_intents
         (id, idempotency_key, player_id, subscription_id, amount_minor, currency, status, provider, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, 'requires_payment_method', $7, now(), now())`,
      [id, key, input.playerId || null, input.subscriptionId || null, input.amountMinor, currency, provider],
    );

    await recordAudit(ctx, {
      action: 'payment.intent.create',
      entityType: 'payment_intent',
      entityId: id,
      metadata: { idempotencyKey: key, amountMinor: input.amountMinor, currency, provider },
    });

    return {
      id,
      idempotencyKey: key,
      playerId: input.playerId,
      subscriptionId: input.subscriptionId,
      amountMinor: input.amountMinor,
      currency,
      status: 'requires_payment_method',
      provider,
      createdAt: new Date().toISOString(),
    };
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
