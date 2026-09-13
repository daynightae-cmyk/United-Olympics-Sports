import assert from 'node:assert/strict';
import { PaymentDomainRepository } from '../src/server/repositories/payment-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const payerCtx: AuthorizationContext = {
  uid: 'u-payer-1',
  provider: 'supabase',
  roles: ['player'],
  scopes: [],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
};

class MockPaymentDb implements DbQueryClient {
  public intents = new Map<string, any>();
  public webhooks = new Map<string, any>();

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from payment_intents where idempotency_key = $1')) {
      const key = params?.[0] as string;
      const found = this.intents.get(key);
      return { rows: found ? [found as unknown as T] : [], rowCount: found ? 1 : 0 };
    }
    if (s.includes('insert into payment_intents')) {
      const [id, key, playerId, subId, amountMinor, currency, provider] = params as any[];
      const record = {
        id,
        idempotency_key: key,
        player_id: playerId,
        subscription_id: subId,
        amount_minor: amountMinor,
        currency,
        status: 'requires_payment_method',
        provider,
        provider_intent_id: null,
        created_at: new Date().toISOString(),
      };
      this.intents.set(key, record);
      return { rows: [record as unknown as T], rowCount: 1 };
    }
    if (s.includes('from payment_webhooks where event_id = $1')) {
      const id = params?.[0] as string;
      const found = this.webhooks.get(id);
      return { rows: found ? [found as unknown as T] : [], rowCount: found ? 1 : 0 };
    }
    if (s.includes('insert into payment_webhooks')) {
      const [id, eventId, provider, eventType] = params as any[];
      const w = { id, event_id: eventId, provider, event_type: eventType, status: 'processed' };
      this.webhooks.set(eventId, w);
      return { rows: [w as unknown as T], rowCount: 1 };
    }
    if (s.includes('from payment_intents where status = $1')) {
      return { rows: [{ count: '5' } as unknown as T], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runPaymentContractTests() {
  console.log('=== RUNNING PAYMENT ARCHITECTURE CONTRACT TESTS ===');
  const db = new MockPaymentDb();
  const repo = new PaymentDomainRepository(db);

  // 1. Idempotent Payment Intent Creation
  const key = 'idem-key-999';
  const intent1 = await repo.createPaymentIntent(payerCtx, {
    idempotencyKey: key,
    amountMinor: 50000,
    currency: 'AED',
  });
  assert.equal(intent1.idempotencyKey, key);
  assert.equal(intent1.amountMinor, 50000);
  assert.equal(intent1.status, 'requires_payment_method');

  // Second call with same key returns existing (idempotency preserved)
  const intent2 = await repo.createPaymentIntent(payerCtx, {
    idempotencyKey: key,
    amountMinor: 50000,
  });
  assert.equal(intent2.id, intent1.id);

  // 2. Non-positive amount rejection
  await assert.rejects(
    async () => {
      await repo.createPaymentIntent(payerCtx, {
        idempotencyKey: 'key-neg',
        amountMinor: -100,
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      assert.equal(err.code, 'VALIDATION_ERROR');
      return true;
    },
  );

  // 3. Webhook handling & duplicate protection
  const event = {
    eventId: 'evt_stripe_123',
    provider: 'stripe',
    eventType: 'payment_intent.succeeded',
    payload: { id: 'pi_123', amount: 50000 },
  };
  const w1 = await repo.processWebhook(event);
  assert.equal(w1.processed, true);
  assert.equal(w1.duplicate, false);

  // Re-delivery of same event
  const w2 = await repo.processWebhook(event);
  assert.equal(w2.processed, true);
  assert.equal(w2.duplicate, true);

  // 4. Reconciliation
  const recon = await repo.runReconciliation();
  assert.equal(recon.totalProcessed, 5);
  assert.equal(recon.mismatches, 0);

  console.log('Payment architecture contract tests: PASS');
}

runPaymentContractTests().catch((err) => {
  console.error('FATAL: Payment contract test failure:', err);
  process.exit(1);
});
