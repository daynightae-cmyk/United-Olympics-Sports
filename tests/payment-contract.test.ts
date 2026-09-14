import assert from 'node:assert/strict';
import { PaymentDomainRepository } from '../src/server/repositories/payment-repository.ts';
import { resolvePayableAmount } from '../src/server/payment-handlers.ts';
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
  public orders = new Map<string, any>([
    ['order-pending-1', { id: 'order-pending-1', customer_uid: 'u-payer-1', status: 'pending', total_minor: 24000, currency: 'AED' }],
    ['order-paid-1', { id: 'order-paid-1', customer_uid: 'u-payer-1', status: 'paid', total_minor: 24000, currency: 'AED' }],
    ['order-other-1', { id: 'order-other-1', customer_uid: 'u-stranger', status: 'pending', total_minor: 5000, currency: 'AED' }],
  ]);
  public subscriptions = new Map<string, any>([
    ['sub-priced-1', { id: 'sub-priced-1', player_id: 'player-1', status: 'active', amount_minor: 15000, currency: 'AED' }],
  ]);

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from payment_intents where idempotency_key = $1')) {
      const key = params?.[0] as string;
      const found = this.intents.get(key);
      return { rows: found ? [found as unknown as T] : [], rowCount: found ? 1 : 0 };
    }
    if (s.includes('insert into payment_intents')) {
      const [id, key, playerId, subId, amountMinor, currency, status, provider, providerIntentId, metadataJson] = params as any[];
      const record = {
        id,
        idempotency_key: key,
        player_id: playerId,
        subscription_id: subId,
        amount_minor: amountMinor,
        currency,
        status,
        provider,
        provider_intent_id: providerIntentId,
        metadata: metadataJson ? JSON.parse(metadataJson) : {},
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
    if (s.includes('from orders where id = $1')) {
      const found = this.orders.get(params?.[0] as string);
      return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
    }
    if (s.includes('from subscriptions where id = $1')) {
      const found = this.subscriptions.get(params?.[0] as string);
      return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
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

  // 5. Server-authoritative payable amounts: the browser never sets the total
  // for an order or a priced subscription.
  const ownerCtx = { uid: 'u-payer-1', roles: ['player'], bindings: payerCtx.bindings };

  // 5a. Order path uses the DB total; a matching client echo is accepted.
  const orderPayable = await resolvePayableAmount(ownerCtx, { orderId: 'order-pending-1', amountMinor: 24000, currency: 'AED' }, repo);
  assert.equal(orderPayable.amountMinor, 24000);
  assert.equal(orderPayable.currency, 'AED');

  // 5b. Client amount override for an order is rejected, never corrected.
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { orderId: 'order-pending-1', amountMinor: 1, currency: 'AED' }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 422);
      assert.equal(err.code, 'AMOUNT_MISMATCH');
      return true;
    },
  );

  // 5c. Another customer's order is forbidden.
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { orderId: 'order-other-1', amountMinor: 5000 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'ORDER_ACCESS_DENIED');
      return true;
    },
  );

  // 5d. Non-pending orders cannot be paid.
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { orderId: 'order-paid-1' }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 409);
      assert.equal(err.code, 'ORDER_NOT_PAYABLE');
      return true;
    },
  );

  // 5e. Unknown orders are 404 (no phantom charges).
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { orderId: 'order-ghost', amountMinor: 100 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 404);
      assert.equal(err.code, 'ORDER_NOT_FOUND');
      return true;
    },
  );

  // 5f. Priced subscriptions are authoritative and family-scoped.
  const guardianCtx = {
    uid: 'u-guardian-1',
    roles: [],
    bindings: { ...payerCtx.bindings, guardianPlayerIds: ['player-1'] },
  };
  const subPayable = await resolvePayableAmount(guardianCtx, { subscriptionId: 'sub-priced-1', amountMinor: 15000 }, repo);
  assert.equal(subPayable.amountMinor, 15000);
  await assert.rejects(
    () => resolvePayableAmount(guardianCtx, { subscriptionId: 'sub-priced-1', amountMinor: 1 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 422);
      return true;
    },
  );
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { subscriptionId: 'sub-priced-1', amountMinor: 15000 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'SUBSCRIPTION_ACCESS_DENIED');
      return true;
    },
  );

  // 5g. Generic ledger path still validates client amounts.
  const generic = await resolvePayableAmount(ownerCtx, { amountMinor: 5000, currency: 'aed' }, repo);
  assert.equal(generic.amountMinor, 5000);
  assert.equal(generic.currency, 'AED');
  await assert.rejects(
    () => resolvePayableAmount(ownerCtx, { amountMinor: -5 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      return true;
    },
  );

  console.log('Payment architecture contract tests: PASS');
}

runPaymentContractTests().catch((err) => {
  console.error('FATAL: Payment contract test failure:', err);
  process.exit(1);
});
