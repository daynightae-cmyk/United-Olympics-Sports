import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import { recordAudit } from '../audit.ts';
import { ApiError, normalizeString } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';

export type NotificationStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';
export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms';

export interface NotificationRecord {
  id: string;
  recipientUid: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  template?: string;
  locale: string;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  providerReference?: string;
  attemptCount: number;
  lastError?: string;
  payload: Record<string, unknown>;
  dispatchedAt?: string;
  createdAt: string;
}

export class NotificationDomainRepository {
  private clientOverride?: DbQueryClient;

  constructor(clientOverride?: DbQueryClient) {
    this.clientOverride = clientOverride;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  // --- QUEUE NOTIFICATION ---
  async queueNotification(
    ctx: AuthorizationContext,
    input: {
      recipientUid: string;
      channel?: NotificationChannel;
      template?: string;
      locale?: string;
      title: string;
      titleAr?: string;
      body: string;
      bodyAr?: string;
      payload?: Record<string, unknown>;
    },
  ): Promise<NotificationRecord> {
    const recipientUid = normalizeString(input.recipientUid, 128);
    const title = normalizeString(input.title, 200);
    const body = normalizeString(input.body, 2000);

    if (!recipientUid || !title || !body) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Recipient UID, title, and body are required.');
    }

    const id = randomUUID();
    const channel: NotificationChannel = input.channel || 'in_app';
    const locale = input.locale || 'ar';
    const payload = input.payload || {};

    await this.db.query(
      `insert into notifications
         (id, recipient_uid, channel, status, template, locale, title, title_ar, body, body_ar, attempt_count, payload, created_at, updated_at)
       values ($1, $2, $3, 'queued', $4, $5, $6, $7, $8, $9, 0, $10::jsonb, now(), now())`,
      [
        id,
        recipientUid,
        channel,
        input.template || null,
        locale,
        title,
        input.titleAr || null,
        body,
        input.bodyAr || null,
        JSON.stringify(payload),
      ],
    );

    await recordAudit(ctx, {
      action: 'notification.queue',
      entityType: 'notification',
      entityId: id,
      metadata: { recipientUid, channel, template: input.template },
    });

    return {
      id,
      recipientUid,
      channel,
      status: 'queued',
      template: input.template,
      locale,
      title,
      titleAr: input.titleAr,
      body,
      bodyAr: input.bodyAr,
      attemptCount: 0,
      payload,
      createdAt: new Date().toISOString(),
    };
  }

  // --- UPDATE STATUS ---
  async updateStatus(
    id: string,
    status: NotificationStatus,
    details?: { providerReference?: string; error?: string },
  ): Promise<void> {
    await this.db.query(
      `update notifications
          set status = $1,
              provider_reference = coalesce($2, provider_reference),
              last_error = coalesce($3, last_error),
              attempt_count = attempt_count + 1,
              dispatched_at = case when $1 in ('sent', 'delivered') then now() else dispatched_at end,
              updated_at = now()
        where id = $4`,
      [status, details?.providerReference || null, details?.error || null, id],
    );
  }

  // --- LIST FOR RECIPIENT ---
  async listForRecipient(recipientUid: string, limit = 50): Promise<NotificationRecord[]> {
    const res = await this.db.query<{
      id: string;
      recipient_uid: string;
      channel: NotificationChannel;
      status: NotificationStatus;
      template: string | null;
      locale: string;
      title: string;
      title_ar: string | null;
      body: string;
      body_ar: string | null;
      provider_reference: string | null;
      attempt_count: number;
      last_error: string | null;
      payload: Record<string, unknown>;
      dispatched_at: string | Date | null;
      created_at: string | Date;
    }>(
      `select *
         from notifications
        where recipient_uid = $1
        order by created_at desc
        limit $2`,
      [recipientUid, limit],
    );

    return res.rows.map((r) => ({
      id: r.id,
      recipientUid: r.recipient_uid,
      channel: r.channel,
      status: r.status,
      template: r.template || undefined,
      locale: r.locale,
      title: r.title,
      titleAr: r.title_ar || undefined,
      body: r.body,
      bodyAr: r.body_ar || undefined,
      providerReference: r.provider_reference || undefined,
      attemptCount: r.attempt_count,
      lastError: r.last_error || undefined,
      payload: r.payload,
      dispatchedAt: r.dispatched_at ? new Date(r.dispatched_at).toISOString() : undefined,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
}
