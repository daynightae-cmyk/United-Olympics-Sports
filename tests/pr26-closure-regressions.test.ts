import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getConcurrentIndexName, splitConcurrentIndexStatements } from '../src/db/migrate.ts';
import {
  claimOrderPayment,
  expireAbandonedOrderPaymentClaim,
  failOrderPaymentClaim,
} from '../src/server/order-payment-claim.ts';
import { normalizeStripeIntentStatus } from '../src/server/payment-provider.ts';
import { StoreDomainRepository } from '../src/server/repositories/store-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const ctx: AuthorizationContext = {
  uid: 'customer-1',
  provider: 'supabase',
  roles: ['player'],
  scopes: [],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

const strangerCtx: AuthorizationContext = { ...ctx, uid: 'customer-2' };

type OrderRow = {
  id: string;
  customer_uid: string;
  status: string;
  total_minor: number;
  currency: string;
  items: Array<{ productId: string; quantity: number }>;
};

type IntentRow = {
  id: string;
  idempotency_key: string;
  amount_minor: number;
  currency: string;
  status: string;
  provider: string;
  provider_intent_id: string | null;
  metadata: { orderId?: string; paymentClaim?: boolean };
  created_at: string;
  updated_at: string;
};

class ClaimRaceDb implements DbQueryClient {
  order: OrderRow = {
    id: 'order-1',
    customer_uid: 'customer-1',
    status: 'pending',
    total_minor: 24000,
    currency: 'AED',
    items: [{ productId: 'product-1', quantity: 1 }],
  };
  inventory = new Map<string, number>([['product-1', 0]]);
  intents = new Map<string, IntentRow>();

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<{ rows: T[]; rowCount?: number }> {
    const normalized = sql.toLowerCase().replace(/\s+/g, ' ').trim();

    if (normalized.includes('from orders where id = $1 for update')) {
      const id = String(params[0] ?? '');
      const rows = id === this.order.id ? [this.order] : [];
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }

    if (
      normalized.includes('from payment_intents')
      && normalized.includes("status = 'requires_payment_method'")
      && normalized.includes('provider_intent_id is not null')
      && normalized.includes("metadata->>'orderid' = $1")
    ) {
      const orderId = String(params[0] ?? '');
      const cutoff = new Date(params[1] as string | number | Date).getTime();
      const found = [...this.intents.values()].find((intent) =>
        intent.metadata.orderId === orderId
        && intent.status === 'requires_payment_method'
        && intent.provider_intent_id !== null
        && new Date(intent.updated_at).getTime() <= cutoff
      );
      const rows = found
        ? [{ id: found.id, provider: found.provider, provider_intent_id: found.provider_intent_id }]
        : [];
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }

    if (normalized.includes('from payment_intents where id = $1 for update')) {
      const id = String(params[0] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.id === id);
      return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
    }

    if (normalized.includes("from payment_intents") && normalized.includes("metadata->>'orderid' = $1")) {
      const orderId = String(params[0] ?? '');
      const excludedKey = normalized.includes('idempotency_key <> $2') ? String(params[1] ?? '') : null;
      const terminal = new Set(['failed', 'cancelled']);
      const rows = [...this.intents.values()]
        .filter((intent) => intent.metadata.orderId === orderId)
        .filter((intent) => excludedKey === null || intent.idempotency_key !== excludedKey)
        .filter((intent) => !terminal.has(intent.status))
        .map((intent) => ({ id: intent.id }));
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }

    if (normalized.includes('from payment_intents where idempotency_key = $1')) {
      const key = String(params[0] ?? '');
      const found = this.intents.get(key);
      return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
    }

    if (normalized.includes('select metadata from payment_intents where provider_intent_id = $1')) {
      const providerIntentId = String(params[0] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.provider_intent_id === providerIntentId);
      const rows = found ? [{ metadata: found.metadata }] : [];
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }

    if (normalized.startsWith('insert into payment_intents')) {
      const [id, key, amountMinor, currency, provider, metadataJson] = params;
      const now = new Date().toISOString();
      const row: IntentRow = {
        id: String(id),
        idempotency_key: String(key),
        amount_minor: Number(amountMinor),
        currency: String(currency),
        status: 'processing',
        provider: String(provider),
        provider_intent_id: null,
        metadata: JSON.parse(String(metadataJson)) as IntentRow['metadata'],
        created_at: now,
        updated_at: now,
      };
      this.intents.set(row.idempotency_key, row);
      return { rows: [row] as unknown as T[], rowCount: 1 };
    }

    if (normalized.startsWith("update payment_intents set status = 'cancelling'")) {
      const id = String(params[0] ?? '');
      const providerIntentId = String(params[1] ?? '');
      const found = [...this.intents.values()].find((intent) =>
        intent.id === id
        && intent.status === 'requires_payment_method'
        && intent.provider_intent_id === providerIntentId
      );
      if (!found) return { rows: [], rowCount: 0 };
      found.status = 'cancelling';
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith("update payment_intents set status = 'requires_payment_method'")) {
      const id = String(params[0] ?? '');
      const providerIntentId = String(params[1] ?? '');
      const found = [...this.intents.values()].find((intent) =>
        intent.id === id
        && intent.status === 'cancelling'
        && intent.provider_intent_id === providerIntentId
      );
      if (!found) return { rows: [], rowCount: 0 };
      found.status = 'requires_payment_method';
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith("update payment_intents set status = 'cancelled'")) {
      const id = String(params[0] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.id === id && intent.status !== 'succeeded');
      if (!found) return { rows: [], rowCount: 0 };
      found.status = 'cancelled';
      found.updated_at = new Date().toISOString();
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith('update payment_intents set status = $1')) {
      const status = String(params[0] ?? '');
      const providerIntentId = String(params[1] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.provider_intent_id === providerIntentId);
      if (!found || found.status === status) return { rows: [], rowCount: 0 };
      found.status = status;
      found.updated_at = new Date().toISOString();
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith("update payment_intents set status = 'failed'")) {
      const id = String(params[0] ?? '');
      const orderId = String(params[1] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.id === id && intent.metadata.orderId === orderId && intent.provider_intent_id === null);
      if (!found) return { rows: [], rowCount: 0 };
      found.status = 'failed';
      found.updated_at = new Date().toISOString();
      return { rows: [], rowCount: 1 };
    }

    if (normalized.includes("update inventory set available_quantity = available_quantity + $1")) {
      const quantity = Number(params[0] ?? 0);
      const productId = String(params[1] ?? '');
      this.inventory.set(productId, (this.inventory.get(productId) ?? 0) + quantity);
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith("update orders set status = 'cancelled'")) {
      const id = String(params[0] ?? '');
      if (id !== this.order.id || this.order.status !== 'pending') return { rows: [], rowCount: 0 };
      this.order.status = 'cancelled';
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith("update orders set status = 'paid'")) {
      const id = String(params[0] ?? '');
      if (id !== this.order.id || this.order.status !== 'pending') return { rows: [], rowCount: 0 };
      this.order.status = 'paid';
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith('insert into audit_logs')) {
      return { rows: [], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }
}

function seedStaleClaim(db: ClaimRaceDb, key: string, providerIntentId: string): void {
  const staleAt = new Date(Date.now() - 60 * 60_000).toISOString();
  db.intents.set(key, {
    id: `intent-${key}`,
    idempotency_key: key,
    amount_minor: 24000,
    currency: 'AED',
    status: 'requires_payment_method',
    provider: 'stripe',
    provider_intent_id: providerIntentId,
    metadata: { orderId: 'order-1', paymentClaim: true },
    created_at: staleAt,
    updated_at: staleAt,
  });
}

async function run(): Promise<void> {
  console.log('=== PR #26 CLOSURE REGRESSION TESTS ===');

  const migration = await readFile(new URL('../src/db/migrations/0008_store_catalog_richness.sql', import.meta.url), 'utf8');
  const split = splitConcurrentIndexStatements(migration);
  assert.equal(split.concurrentStatements.length, 3, '0008 must expose three standalone concurrent index statements');
  for (const statement of split.concurrentStatements) {
    assert.match(statement, /^create\s+(?:unique\s+)?index\s+concurrently\s+if\s+not\s+exists/i);
    assert.equal((statement.match(/;/g) ?? []).length, 1, 'each concurrent index must execute as one standalone query');
    assert.match(getConcurrentIndexName(statement), /^[a-zA-Z_][\w$]*(?:\.[a-zA-Z_][\w$]*)?$/);
  }
  assert.equal(
    /^\s*create\s+(?:unique\s+)?index\s+concurrently\b/im.test(split.transactionalSql),
    false,
    'transactional migration fragment must contain no concurrent index statement',
  );

  const migrateSource = await readFile(new URL('../src/db/migrate.ts', import.meta.url), 'utf8');
  assert.ok(
    migrateSource.includes('executeConcurrentIndexStatement(client, statement)')
      && migrateSource.includes('i.indisvalid')
      && migrateSource.includes('i.indisready')
      && migrateSource.includes('drop index concurrently if exists'),
    'runner must validate concurrent indexes and recover invalid leftovers before tracking the migration',
  );
  const validityMarker = migrateSource.indexOf('failed final validity verification');
  const migrationInsertMarker = migrateSource.indexOf('insert into schema_migrations');
  assert.ok(
    validityMarker >= 0 && migrationInsertMarker >= 0 && validityMarker < migrationInsertMarker,
    'concurrent index validity must be checked before schema_migrations is written',
  );

  const db = new ClaimRaceDb();
  const claim = await claimOrderPayment(ctx, {
    orderId: 'order-1',
    idempotencyKey: 'checkout-order-1-attempt-1',
    amountMinor: 24000,
    currency: 'AED',
    provider: 'stripe',
  }, db);
  assert.equal(db.intents.get(claim.idempotencyKey)?.status, 'processing');

  const storeRepo = new StoreDomainRepository(db);
  await assert.rejects(
    () => storeRepo.cancelOrder(ctx, 'order-1'),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 409);
      assert.equal(error.code, 'ORDER_PAYMENT_IN_PROGRESS');
      return true;
    },
  );
  assert.equal(db.order.status, 'pending', 'active provider claim must keep the order pending');
  assert.equal(db.inventory.get('product-1'), 0, 'active provider claim must not release reserved inventory');

  await failOrderPaymentClaim(claim, db);
  assert.equal(db.intents.get(claim.idempotencyKey)?.status, 'failed');
  const cancelled = await storeRepo.cancelOrder(ctx, 'order-1');
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(db.inventory.get('product-1'), 1, 'failed claim release allows cancellation to restore inventory exactly once');

  assert.equal(normalizeStripeIntentStatus('canceled'), 'cancelled', 'Stripe canceled must normalize to local cancelled');

  const expiryDb = new ClaimRaceDb();
  seedStaleClaim(expiryDb, 'stale-attempt', 'pi_stale_1');
  const expired = await expireAbandonedOrderPaymentClaim(
    ctx,
    'order-1',
    expiryDb,
    {
      nowMs: Date.now(),
      ttlMinutes: 30,
      providerConfig: { provider: 'stripe', secretKey: 'sk_test_not_used' },
      cancelIntent: async (_config, providerIntentId) => ({ providerIntentId, status: 'cancelled' }),
    },
  );
  assert.equal(expired.expired, true);
  assert.equal(expired.orderCancelled, true);
  assert.equal(expiryDb.intents.get('stale-attempt')?.status, 'cancelled');
  assert.equal(expiryDb.order.status, 'cancelled', 'expired provider claim must cancel the pending local order');
  assert.equal(expiryDb.inventory.get('product-1'), 1, 'expired claim must release reserved inventory exactly once');

  const idorDb = new ClaimRaceDb();
  seedStaleClaim(idorDb, 'foreign-stale-attempt', 'pi_foreign_stale');
  let foreignProviderCalls = 0;
  await assert.rejects(
    () => expireAbandonedOrderPaymentClaim(strangerCtx, 'order-1', idorDb, {
      nowMs: Date.now(),
      ttlMinutes: 30,
      providerConfig: { provider: 'stripe', secretKey: 'sk_test_not_used' },
      cancelIntent: async (_config, providerIntentId) => {
        foreignProviderCalls++;
        return { providerIntentId, status: 'cancelled' };
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 403);
      assert.equal(error.code, 'ORDER_ACCESS_DENIED');
      return true;
    },
  );
  assert.equal(foreignProviderCalls, 0, 'unauthorized callers must never reach the payment provider');
  assert.equal(idorDb.order.status, 'pending');
  assert.equal(idorDb.intents.get('foreign-stale-attempt')?.status, 'requires_payment_method');
  assert.equal(idorDb.inventory.get('product-1'), 0);

  const alreadyCancelledDb = new ClaimRaceDb();
  seedStaleClaim(alreadyCancelledDb, 'already-cancelled', 'pi_already_cancelled');
  const alreadyCancelled = await expireAbandonedOrderPaymentClaim(ctx, 'order-1', alreadyCancelledDb, {
    nowMs: Date.now(),
    ttlMinutes: 30,
    providerConfig: { provider: 'stripe', secretKey: 'sk_test_not_used' },
    cancelIntent: async () => { throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'already canceled'); },
    retrieveIntent: async (_config, providerIntentId) => ({ providerIntentId, status: 'cancelled' }),
  });
  assert.equal(alreadyCancelled.expired, true);
  assert.equal(alreadyCancelled.orderCancelled, true);
  assert.equal(alreadyCancelledDb.intents.get('already-cancelled')?.status, 'cancelled');
  assert.equal(alreadyCancelledDb.order.status, 'cancelled');
  assert.equal(alreadyCancelledDb.inventory.get('product-1'), 1);

  const alreadySucceededDb = new ClaimRaceDb();
  seedStaleClaim(alreadySucceededDb, 'already-succeeded', 'pi_already_succeeded');
  const alreadySucceeded = await expireAbandonedOrderPaymentClaim(ctx, 'order-1', alreadySucceededDb, {
    nowMs: Date.now(),
    ttlMinutes: 30,
    providerConfig: { provider: 'stripe', secretKey: 'sk_test_not_used' },
    cancelIntent: async () => { throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'already succeeded'); },
    retrieveIntent: async (_config, providerIntentId) => ({ providerIntentId, status: 'succeeded' }),
  });
  assert.equal(alreadySucceeded.expired, false);
  assert.equal(alreadySucceeded.orderCancelled, false);
  assert.equal(alreadySucceededDb.intents.get('already-succeeded')?.status, 'succeeded');
  assert.equal(alreadySucceededDb.order.status, 'paid', 'terminal succeeded provider state must reconcile the order to paid');
  assert.equal(alreadySucceededDb.inventory.get('product-1'), 0, 'succeeded payment must keep the reserved inventory consumed');

  const paymentHandlerSource = await readFile(new URL('../src/server/payment-handlers.ts', import.meta.url), 'utf8');
  const claimCall = paymentHandlerSource.indexOf('orderClaim = await claimOrderPayment');
  const providerCall = paymentHandlerSource.indexOf('remote = await createStripeIntent');
  assert.ok(claimCall >= 0 && providerCall > claimCall, 'order claim must happen before remote provider intent creation');
  const claimReleaseMarker = paymentHandlerSource.indexOf('failOrderPaymentClaim(orderClaim)');
  const providerRethrowMarker = paymentHandlerSource.indexOf('throw error;', claimReleaseMarker);
  assert.ok(
    paymentHandlerSource.includes("console.error('[PAYMENT] Failed to release order payment claim after provider error:'")
      && claimReleaseMarker >= 0
      && providerRethrowMarker >= 0
      && providerRethrowMarker > claimReleaseMarker,
    'provider errors must remain the primary error even if local claim release also fails',
  );

  const storeSource = await readFile(new URL('../src/server/repositories/store-repository.ts', import.meta.url), 'utf8');
  const orderLock = storeSource.indexOf("select id, customer_uid, status, items from orders where id = $1 for update");
  const claimGuard = storeSource.indexOf('await assertOrderPaymentNotClaimed(db, id)');
  assert.ok(orderLock >= 0 && claimGuard > orderLock, 'cancelOrder must lock the order before checking active payment claims');

  const paymentRepoSource = await readFile(new URL('../src/server/repositories/payment-repository.ts', import.meta.url), 'utf8');
  assert.ok(
    paymentRepoSource.includes("input.eventType === 'payment_intent.canceled'")
      && paymentRepoSource.includes("? 'cancelled'"),
    'canceled webhook events must normalize to cancelled rather than failed',
  );
  assert.ok(
    paymentRepoSource.includes('expireAbandonedOrderPaymentClaim(RECONCILIATION_CONTEXT'),
    'reconciliation must run bounded abandoned-claim expiry',
  );

  const claimSource = await readFile(new URL('../src/server/order-payment-claim.ts', import.meta.url), 'utf8');
  assert.ok(
    claimSource.includes('select id, status, customer_uid from orders where id = $1 for update')
      && claimSource.includes("throw new ApiError(403, 'ORDER_ACCESS_DENIED'")
      && claimSource.includes('retrieveStripeIntent')
      && claimSource.includes("eventType: 'payment_intent.succeeded'"),
    'expiry must authorize the locked order and reconcile terminal provider truth after cancellation rejection',
  );

  console.log('PR #26 closure regression tests: PASS');
}

run().catch((error: unknown) => {
  console.error('FATAL: PR #26 closure regression failure:', error);
  process.exit(1);
});
