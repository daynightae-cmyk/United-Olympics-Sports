import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  createStripeIntent,
  getPaymentClientConfig,
  getPaymentProviderConfig,
  verifyStripeSignature,
} from '../src/server/payment-provider.ts';
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

function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void> | void): Promise<void> | void {
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    saved[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  const restore = () => {
    for (const key of Object.keys(vars)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  };
  const out = fn();
  if (out instanceof Promise) return out.finally(restore);
  restore();
}

class MockProviderDb implements DbQueryClient {
  public intents: Array<{ provider_intent_id: string | null; status: string; metadata: { orderId?: string } }> = [];
  public orders = new Map<string, { status: string }>();

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.startsWith('update payment_intents')) {
      const [status, providerIntentId] = params as [string, string];
      const row = this.intents.find((i) => i.provider_intent_id === providerIntentId && i.status !== status);
      if (row) {
        row.status = status;
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (s.startsWith('select metadata from payment_intents')) {
      const [providerIntentId] = params as [string];
      const row = this.intents.find((i) => i.provider_intent_id === providerIntentId);
      return { rows: (row ? [{ metadata: row.metadata }] : []) as unknown as T[], rowCount: row ? 1 : 0 };
    }
    if (s.startsWith('update orders set status')) {
      const [orderId] = params as [string];
      const order = this.orders.get(orderId);
      if (order && order.status === 'pending') {
        order.status = 'paid';
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  }
}

function sign(raw: string, secret: string, timestamp: number): string {
  const hmac = createHmac('sha256', secret).update(`${timestamp}.${raw}`, 'utf8').digest('hex');
  return `t=${timestamp},v1=${hmac}`;
}

async function runPaymentProviderTests() {
  console.log('=== RUNNING PAYMENT PROVIDER TESTS ===');

  // 1. Unconfigured provider fails closed
  await withEnv({ PAYMENTS_PROVIDER: undefined, PAYMENTS_SECRET_KEY: undefined }, () => {
    assert.equal(getPaymentProviderConfig(), null);
  });

  // 1b. Browser-safe client configuration is fail-closed and never exposes secrets.
  await withEnv({
    PAYMENTS_PROVIDER: 'stripe',
    PAYMENTS_PUBLISHABLE_KEY: 'pk_test_uos_public',
    PAYMENTS_SECRET_KEY: 'sk_test_uos_secret',
    PAYMENTS_WEBHOOK_SECRET: 'whsec_uos_secret',
  }, () => {
    const client = getPaymentClientConfig();
    assert.equal(client.enabled, true);
    assert.equal(client.provider, 'stripe');
    assert.equal(client.publishableKey, 'pk_test_uos_public');
    const serialized = JSON.stringify(client);
    assert.equal(serialized.includes('sk_test_uos_secret'), false);
    assert.equal(serialized.includes('whsec_uos_secret'), false);
  });
  await withEnv({
    PAYMENTS_PROVIDER: 'stripe',
    PAYMENTS_PUBLISHABLE_KEY: undefined,
    PAYMENTS_SECRET_KEY: 'sk_test_uos_secret',
    PAYMENTS_WEBHOOK_SECRET: 'whsec_uos_secret',
  }, () => {
    const client = getPaymentClientConfig();
    assert.equal(client.enabled, false);
    assert.equal(client.reason, 'incomplete_configuration');
  });

  // 2. Unknown provider is rejected
  await withEnv({ PAYMENTS_PROVIDER: 'acme-pay', PAYMENTS_SECRET_KEY: 'sk_x' }, () => {
    assert.throws(() => getPaymentProviderConfig(), (e: unknown) => e instanceof ApiError && e.code === 'EXTERNAL_PROVIDER_REQUIRED');
  });

  // 3. Selected provider without secret fails closed
  await withEnv({ PAYMENTS_PROVIDER: 'stripe', PAYMENTS_SECRET_KEY: undefined }, () => {
    assert.throws(() => getPaymentProviderConfig(), (e: unknown) => e instanceof ApiError && e.status === 503);
  });

  // 4. Stripe intent creation maps provider fields, sends idempotency + metadata
  await withEnv({ PAYMENTS_PROVIDER: 'stripe', PAYMENTS_SECRET_KEY: 'sk_test_123' }, async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const stubFetch = (async (url: string, init?: RequestInit) => {
      seen.url = url;
      seen.init = init;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'pi_test_1', client_secret: 'pi_test_1_secret_x', status: 'requires_payment_method' }),
      };
    }) as unknown as typeof fetch;
    const config = getPaymentProviderConfig();
    assert.ok(config);
    const remote = await createStripeIntent(
      config,
      { amountMinor: 19900, currency: 'AED', idempotencyKey: 'idem-1', metadata: { orderId: 'order-1' } },
      stubFetch,
    );
    assert.equal(remote.providerIntentId, 'pi_test_1');
    assert.equal(remote.clientSecret, 'pi_test_1_secret_x');
    assert.equal(remote.status, 'requires_payment_method');
    assert.equal(seen.url, 'https://api.stripe.com/v1/payment_intents');
    const headers = seen.init?.headers as Record<string, string>;
    assert.equal(headers['Idempotency-Key'], 'idem-1');
    assert.ok(String(headers.Authorization).startsWith('Basic '));
    assert.ok(!String(headers.Authorization).includes('sk_test_123'));
    assert.ok(String(seen.init?.body).includes('metadata%5BorderId%5D=order-1'));
  });

  // 5. Provider error maps to 502 without leaking the secret
  await withEnv({ PAYMENTS_PROVIDER: 'stripe', PAYMENTS_SECRET_KEY: 'sk_test_123' }, async () => {
    const stubFetch = (async () => ({
      ok: false,
      status: 402,
      json: async () => ({ error: { message: 'Your card was declined.' } }),
    })) as unknown as typeof fetch;
    const config = getPaymentProviderConfig();
    assert.ok(config);
    await assert.rejects(
      createStripeIntent(config, { amountMinor: 100, currency: 'AED', idempotencyKey: 'idem-2' }, stubFetch),
      (e: unknown) => e instanceof ApiError && e.status === 502 && !String((e as Error).message).includes('sk_test_123'),
    );
  });

  // 6. Webhook signature: valid passes, forged/stale/missing fail 401
  const secret = 'whsec_test';
  const raw = JSON.stringify({
    id: 'evt_1',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test_1', metadata: { orderId: 'order-1' } } },
  });
  const now = Date.now();
  const verified = verifyStripeSignature(raw, sign(raw, secret, Math.floor(now / 1000)), secret, 300, now);
  assert.equal(verified.eventId, 'evt_1');
  assert.equal(verified.providerIntentId, 'pi_test_1');
  assert.equal(verified.orderId, 'order-1');
  assert.throws(
    () => verifyStripeSignature(raw, sign(raw, 'wrong-secret', Math.floor(now / 1000)), secret, 300, now),
    (e: unknown) => e instanceof ApiError && e.status === 401,
  );
  assert.throws(
    () => verifyStripeSignature(raw, sign(raw, secret, Math.floor(now / 1000) - 3600), secret, 300, now),
    (e: unknown) => e instanceof ApiError && e.status === 401,
  );
  assert.throws(
    () => verifyStripeSignature(raw, undefined, secret, 300, now),
    (e: unknown) => e instanceof ApiError && e.status === 401,
  );

  // 7. Reconciliation: succeeded intent marks the linked order paid (idempotent)
  const db = new MockProviderDb();
  db.intents.push({ provider_intent_id: 'pi_test_1', status: 'processing', metadata: { orderId: 'order-1' } });
  db.orders.set('order-1', { status: 'pending' });
  const repo = new PaymentDomainRepository(db);
  const first = await repo.reconcileProviderEvent({
    provider: 'stripe',
    providerIntentId: 'pi_test_1',
    eventType: 'payment_intent.succeeded',
    orderId: 'order-1',
  });
  assert.deepEqual(first, { intentUpdated: true, orderUpdated: true });
  assert.equal(db.orders.get('order-1')?.status, 'paid');
  const replay = await repo.reconcileProviderEvent({
    provider: 'stripe',
    providerIntentId: 'pi_test_1',
    eventType: 'payment_intent.succeeded',
    orderId: 'order-1',
  });
  assert.deepEqual(replay, { intentUpdated: false, orderUpdated: false });

  // 8. Failed intents never mark orders paid
  db.intents.push({ provider_intent_id: 'pi_test_2', status: 'processing', metadata: { orderId: 'order-2' } });
  db.orders.set('order-2', { status: 'pending' });
  const failed = await repo.reconcileProviderEvent({
    provider: 'stripe',
    providerIntentId: 'pi_test_2',
    eventType: 'payment_intent.payment_failed',
  });
  assert.equal(failed.intentUpdated, true);
  assert.equal(failed.orderUpdated, false);
  assert.equal(db.orders.get('order-2')?.status, 'pending');

  // 9. Intent creation links order metadata for later reconciliation
  const linkDb = new (class implements DbQueryClient {
    public lastMetadata: unknown = null;
    async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
      const s = sql.toLowerCase();
      if (s.includes('from payment_intents where idempotency_key')) return { rows: [], rowCount: 0 };
      if (s.includes('insert into payment_intents')) {
        this.lastMetadata = JSON.parse(String((params as unknown[])[9]));
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
  })();
  const linkRepo = new PaymentDomainRepository(linkDb);
  const created = await linkRepo.createPaymentIntent(payerCtx, {
    idempotencyKey: 'idem-order-link',
    amountMinor: 5000,
    orderId: 'order-9',
    providerIntentId: 'pi_test_9',
    remoteStatus: 'requires_payment_method',
    clientSecret: 'secret_9',
  });
  assert.equal(created.providerIntentId, 'pi_test_9');
  assert.equal(created.clientSecret, 'secret_9');
  assert.deepEqual(linkDb.lastMetadata, { orderId: 'order-9' });

  console.log('Payment provider tests: PASS');
}

runPaymentProviderTests().catch((err) => {
  console.error('FATAL: Payment provider test failure:', err);
  process.exit(1);
});
