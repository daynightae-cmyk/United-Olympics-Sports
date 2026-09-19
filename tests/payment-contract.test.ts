import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

  // 5h. Order payment cannot be bound to another family's subscription (regression for raw fallback)
  // Even if the browser smuggles a subscriptionId alongside an orderId, the resolved
  // payable must be order-only and the handler must never persist that subscription.
  const orderWithSmuggledSub = await resolvePayableAmount(ownerCtx, { orderId: 'order-pending-1', subscriptionId: 'sub-priced-1', amountMinor: 24000 }, repo);
  assert.equal(orderWithSmuggledSub.orderId, 'order-pending-1');
  assert.equal(orderWithSmuggledSub.subscriptionId, undefined, 'order payable must not carry a smuggled subscriptionId');
  // A stranger's subscription alongside a valid order must still resolve as order-only,
  // not leak the stranger's subscription.
  // (guardian-2 cannot pay order-pending-1 anyway, but the resolver must ignore subscriptionId when orderId is present)
  const orderPayableNoSub = await resolvePayableAmount(ownerCtx, { orderId: 'order-pending-1', subscriptionId: 'sub-priced-1' }, repo);
  assert.equal(orderPayableNoSub.subscriptionId, undefined);

  // 5i. Malformed/unvalidated subscription values are never persisted
  // Numbers, objects, or empty strings in body.subscriptionId must not be treated as a
  // validated subscription and must not be returned as payable.subscriptionId.
  for (const malformed of [12345, { id: 'sub-priced-1' }, '', '   ', null, undefined] as unknown[]) {
    const malformedPayable = await resolvePayableAmount(ownerCtx, { subscriptionId: malformed as unknown as string, amountMinor: 7000, currency: 'AED' }, repo);
    assert.equal(malformedPayable.subscriptionId, undefined, `malformed subscription ${String(malformed)} must not be persisted`);
    assert.equal(malformedPayable.amountMinor, 7000);
  }
  // Unknown subscription IDs must be rejected, not silently persisted via generic path.
  await assert.rejects(
    () => resolvePayableAmount(guardianCtx, { subscriptionId: 'sub-ghost', amountMinor: 15000 }, repo),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 404);
      return true;
    },
  );

  // 6. Payment handler source must not contain raw body.subscriptionId fallback
  const paymentHandlerSource = await readFile(new URL('../src/server/payment-handlers.ts', import.meta.url), 'utf8');
  assert.equal(paymentHandlerSource.includes('body.subscriptionId as string'), false, 'payment handler must not fallback to raw body.subscriptionId');
  assert.equal(/payable\.subscriptionId \?\? \(normalizeString/.test(paymentHandlerSource), false, 'payable subscription fallback must be removed');
  assert.ok(paymentHandlerSource.includes('const subscriptionId = payable.subscriptionId;'), 'handler must use only validated payable.subscriptionId');
  // Must persist only validated subscription via spread, not raw fallback
  assert.ok(paymentHandlerSource.includes('...(subscriptionId ? { subscriptionId } : {})'), 'handler must persist only validated subscriptionId');

  // 6b. Store checkout must use Stripe Payment Element through the server-authoritative order flow.
  const checkoutSource = await readFile(new URL('../src/store/StorePages.tsx', import.meta.url), 'utf8');
  const stripeElementSource = await readFile(new URL('../src/store/components/payment/StripePaymentElement.tsx', import.meta.url), 'utf8');
  assert.ok(checkoutSource.includes("fetch('/api/v1/payments/config')"), 'checkout must read browser-safe payment readiness from the server');
  assert.ok(checkoutSource.includes("fetch('/api/v1/store/checkout'"), 'checkout must create the pending order on the server');
  assert.ok(checkoutSource.includes("fetch('/api/v1/payments/intent'"), 'checkout must create the order-bound payment intent on the server');
  assert.ok(checkoutSource.includes('charge: true'), 'checkout payment intent must explicitly request a provider charge');
  assert.ok(checkoutSource.includes("fetch('/api/v1/store/orders/cancel'"), 'checkout must release a freshly prepared order when intent setup fails');
  assert.ok(checkoutSource.includes('<StripePaymentElement'), 'checkout must render the provider-owned payment element');
  assert.ok(stripeElementSource.includes("elements.create('payment'"), 'card collection must use Stripe Payment Element');
  assert.ok(stripeElementSource.includes("stripe.confirmPayment"), 'payment element must confirm through Stripe.js');
  assert.ok(stripeElementSource.includes("/api/v1/store/account"), 'provider success must be reconciled against server order status');
  assert.equal(/PAYMENTS_SECRET_KEY|PAYMENTS_WEBHOOK_SECRET|sk_(?:live|test)_/.test(stripeElementSource), false, 'browser payment component must never contain server payment secrets');
  assert.equal(/name=["'](?:card|cardNumber|cvc|expiry)/i.test(stripeElementSource), false, 'application must not collect raw card fields');

  // 7. Rate-limit header correctness: IP rejection must emit ipLimit Retry-After
  const rateSource = paymentHandlerSource;
  // Verify the IP-limit branch applies ipLimit headers, not stale userLimit
  assert.ok(/const ipLimit = await defaultRateLimiter\.consume/.test(rateSource), 'payment handler must have ipLimit');
  assert.ok(/if \(!ipLimit\.allowed\) \{\s*applyRateLimitHeaders\(res, ipLimit\)/.test(rateSource), 'IP rejection must apply ipLimit headers');
  const paymentStoreLimiterSource = await readFile(new URL('../src/server/store-handlers.ts', import.meta.url), 'utf8');
  assert.ok(/if \(!ipLimit\.allowed\) \{\s*applyRateLimitHeaders\(res, ipLimit\)/.test(paymentStoreLimiterSource), 'store handler IP rejection must apply ipLimit headers');

  console.log('Payment architecture contract tests: PASS');
}

runPaymentContractTests().catch((err) => {
  console.error('FATAL: Payment contract test failure:', err);
  process.exit(1);
});
