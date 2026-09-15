import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { splitConcurrentIndexStatements } from '../src/db/migrate.ts';
import { claimOrderPayment, failOrderPaymentClaim } from '../src/server/order-payment-claim.ts';
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

    if (normalized.startsWith('insert into payment_intents')) {
      const [id, key, amountMinor, currency, provider, metadataJson] = params;
      const row: IntentRow = {
        id: String(id),
        idempotency_key: String(key),
        amount_minor: Number(amountMinor),
        currency: String(currency),
        status: 'processing',
        provider: String(provider),
        provider_intent_id: null,
        metadata: JSON.parse(String(metadataJson)) as IntentRow['metadata'],
        created_at: new Date().toISOString(),
      };
      this.intents.set(row.idempotency_key, row);
      return { rows: [row] as unknown as T[], rowCount: 1 };
    }

    if (normalized.startsWith("update payment_intents set status = 'failed'")) {
      const id = String(params[0] ?? '');
      const orderId = String(params[1] ?? '');
      const found = [...this.intents.values()].find((intent) => intent.id === id && intent.metadata.orderId === orderId && intent.provider_intent_id === null);
      if (!found) return { rows: [], rowCount: 0 };
      found.status = 'failed';
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

    if (normalized.startsWith('insert into audit_logs')) {
      return { rows: [], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }
}

async function run(): Promise<void> {
  console.log('=== PR #26 CLOSURE REGRESSION TESTS ===');

  const migration = await readFile(new URL('../src/db/migrations/0008_store_catalog_richness.sql', import.meta.url), 'utf8');
  const split = splitConcurrentIndexStatements(migration);
  assert.equal(split.concurrentStatements.length, 3, '0008 must expose three standalone concurrent index statements');
  for (const statement of split.concurrentStatements) {
    assert.match(statement, /^create\s+(?:unique\s+)?index\s+concurrently\s+if\s+not\s+exists/i);
    assert.equal((statement.match(/;/g) ?? []).length, 1, 'each concurrent index must execute as one standalone query');
  }
  assert.equal(
    /^\s*create\s+(?:unique\s+)?index\s+concurrently\b/im.test(split.transactionalSql),
    false,
    'transactional migration fragment must contain no concurrent index statement',
  );

  const migrateSource = await readFile(new URL('../src/db/migrate.ts', import.meta.url), 'utf8');
  assert.ok(
    migrateSource.includes('for (const statement of concurrentStatements)') && migrateSource.includes('await client.query(statement)'),
    'runner must execute each concurrent index statement separately',
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

  const paymentHandlerSource = await readFile(new URL('../src/server/payment-handlers.ts', import.meta.url), 'utf8');
  const claimCall = paymentHandlerSource.indexOf('orderClaim = await claimOrderPayment');
  const providerCall = paymentHandlerSource.indexOf('remote = await createStripeIntent');
  assert.ok(claimCall >= 0 && providerCall > claimCall, 'order claim must happen before remote provider intent creation');

  const storeSource = await readFile(new URL('../src/server/repositories/store-repository.ts', import.meta.url), 'utf8');
  const orderLock = storeSource.indexOf("select id, customer_uid, status, items from orders where id = $1 for update");
  const claimGuard = storeSource.indexOf('await assertOrderPaymentNotClaimed(db, id)');
  assert.ok(orderLock >= 0 && claimGuard > orderLock, 'cancelOrder must lock the order before checking active payment claims');

  console.log('PR #26 closure regression tests: PASS');
}

run().catch((error: unknown) => {
  console.error('FATAL: PR #26 closure regression failure:', error);
  process.exit(1);
});
