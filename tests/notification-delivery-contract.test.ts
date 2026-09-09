import assert from 'node:assert/strict';
import { NotificationDomainRepository } from '../src/server/repositories/notification-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const adminCtx: AuthorizationContext = {
  uid: 'admin-1',
  provider: 'supabase',
  roles: ['admin'],
  scopes: [],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
};

class MockNotificationDb implements DbQueryClient {
  public notifications = new Map<string, any>();

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase().replace(/\s+/g, ' ');
    if (s.includes('insert into notifications')) {
      const [id, recipientUid, channel, status, template, locale, title, titleAr, body, bodyAr, payload] = params as any[];
      const record = {
        id,
        recipient_uid: recipientUid,
        channel,
        status,
        template,
        locale,
        title,
        title_ar: titleAr,
        body,
        body_ar: bodyAr,
        attempt_count: 0,
        last_error: null,
        provider_reference: null,
        payload: JSON.parse(payload || '{}'),
        dispatched_at: null,
        created_at: new Date().toISOString(),
      };
      this.notifications.set(id, record);
      return { rows: [record as unknown as T], rowCount: 1 };
    }
    if (s.includes('update notifications')) {
      const [status, providerRef, error, id] = params as any[];
      const n = this.notifications.get(id);
      if (n) {
        n.status = status;
        n.provider_reference = providerRef;
        n.last_error = error;
        n.attempt_count += 1;
        if (['sent', 'delivered'].includes(status)) {
          n.dispatched_at = new Date().toISOString();
        }
      }
      return { rows: [], rowCount: 1 };
    }
    if (s.includes('from notifications where recipient_uid = $1')) {
      const uid = params?.[0];
      const list = Array.from(this.notifications.values()).filter((n) => n.recipient_uid === uid);
      return { rows: list as unknown as T[], rowCount: list.length };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runNotificationDeliveryTests() {
  console.log('=== RUNNING NOTIFICATION DELIVERY CONTRACT TESTS ===');
  const db = new MockNotificationDb();
  const repo = new NotificationDomainRepository(db);

  // 1. Queue notification
  const queued = await repo.queueNotification(adminCtx, {
    recipientUid: 'user-recip-1',
    channel: 'in_app',
    title: 'Training Session Tomorrow',
    titleAr: 'تدريب الغد',
    body: 'Swimming squad session at 10:00 AM.',
    bodyAr: 'تدريب فريق السباحة الساعة 10:00 صباحاً.',
  });
  assert.equal(queued.status, 'queued');
  assert.equal(queued.recipientUid, 'user-recip-1');

  // 2. Status transition to 'sent'
  await repo.updateStatus(queued.id, 'sent', { providerReference: 'push-123' });

  // 3. List notifications for recipient
  const list = await repo.listForRecipient('user-recip-1');
  assert.equal(list.length, 1);
  assert.equal(list[0].status, 'sent');
  assert.equal(list[0].providerReference, 'push-123');
  assert.ok(list[0].dispatchedAt);

  console.log('Notification delivery contract tests: PASS');
}

runNotificationDeliveryTests().catch((err) => {
  console.error('FATAL: Notification delivery test failure:', err);
  process.exit(1);
});
