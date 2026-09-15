import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { StoreDomainRepository } from '../src/server/repositories/store-repository.ts';
import { storeProductsHandler } from '../src/server/store-handlers.ts';
import { resolveRouteKey } from '../src/server/routes.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError, type ApiRequest, type ApiResponse } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const userCtx: AuthorizationContext = {
  uid: 'u-cust-1',
  provider: 'supabase',
  roles: ['player'],
  scopes: [],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
};

class MockStoreDb implements DbQueryClient {
  public products = [
    { id: 'p-1', sku: 'UOS-SWIM-GOGGLE', name: 'Olympic Swim Goggles', name_ar: 'نظارات سباحة أولمبية', price_minor: 12000, currency: 'AED', available_quantity: 15, status: 'active' },
    { id: 'p-2', sku: 'UOS-CAP', name: 'Olympic Silicone Cap', name_ar: 'قبعة سباحة سيليكون', price_minor: 4500, currency: 'AED', available_quantity: 2, status: 'active' },
  ];
  public inventory = new Map<string, number>([['p-1', 15], ['p-2', 2]]);
  public orders: any[] = [];

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from catalog_products') && s.includes('left join inventory')) {
      if (s.includes('where p.id = any($1)')) {
        const ids = params?.[0] as string[];
        const filtered = this.products
          .filter((p) => ids.includes(p.id))
          .map((p) => ({ ...p, available_quantity: this.inventory.get(p.id) ?? 0 }));
        return { rows: filtered as unknown as T[], rowCount: filtered.length };
      }
      return { rows: this.products as unknown as T[], rowCount: this.products.length };
    }
    if (s.includes('from inventory where product_id = any($1)')) {
      const ids = params?.[0] as string[];
      const rows = ids
        .filter((id) => this.inventory.has(id))
        .map((id) => ({ product_id: id }));
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }
    if (s.includes('update inventory') && s.includes('available_quantity - $1')) {
      const [qty, productId] = params as [number, string];
      const available = this.inventory.get(productId) ?? 0;
      if (available >= qty) {
        this.inventory.set(productId, available - qty);
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (s.includes('update inventory') && s.includes('available_quantity + $1')) {
      const [qty, productId] = params as [number, string];
      this.inventory.set(productId, (this.inventory.get(productId) ?? 0) + qty);
      return { rows: [], rowCount: 1 };
    }
    if (s.includes('insert into orders')) {
      const [id, orderNumber, custUid, totalMinor, currency, items, shipping] = params as any[];
      const o = { id, order_number: orderNumber, customer_uid: custUid, status: 'pending', total_minor: totalMinor, currency, items: JSON.parse(items), shipping };
      this.orders.push(o);
      return { rows: [o as unknown as T], rowCount: 1 };
    }
    if (s.includes('from orders where id = $1')) {
      const [id] = params as [string];
      const found = this.orders.find((o) => o.id === id);
      return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
    }
    if (s.includes("update orders set status = 'cancelled'")) {
      const [id] = params as [string];
      const found = this.orders.find((o) => o.id === id && o.status === 'pending');
      if (found) {
        found.status = 'cancelled';
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runStoreProductionTests() {
  console.log('=== RUNNING STORE PRODUCTION DATA TESTS ===');
  const db = new MockStoreDb();
  const repo = new StoreDomainRepository(db);

  // 1. Catalog list
  const catalog = await repo.listActiveProducts();
  assert.equal(catalog.length, 2);
  assert.equal(catalog[0].sku, 'UOS-SWIM-GOGGLE');
  assert.ok(catalog[0].priceMinor > 0);
  // 1b. Richness columns default to honest nulls when the row carries no
  // catalog metadata (never invented by the repository).
  assert.equal(catalog[0].description, null);
  assert.equal(catalog[0].category, null);
  assert.equal(catalog[0].slug, null);

  // 1c. Rich catalog rows round-trip real metadata end to end.
  const richDb = new MockStoreDb();
  richDb.products.push({
    id: 'p-rich', sku: 'UOS-SWIM-PARKA', name: 'Team Parka', name_ar: 'باركا الفريق',
    price_minor: 35000, currency: 'AED', available_quantity: 4, status: 'active',
    description: 'Water-resistant team parka', description_ar: 'باركا مقاومة للماء',
    category: 'apparel', sport: 'swimming', product_type: 'Team apparel',
    product_type_ar: 'ملابس الفريق', media_url: '/media/store/parka.jpg', slug: 'team-parka',
  } as never);
  richDb.inventory.set('p-rich', 4);
  const richRepo = new StoreDomainRepository(richDb);
  const richCatalog = await richRepo.listActiveProducts();
  const rich = richCatalog.find((p) => p.id === 'p-rich');
  assert.ok(rich);
  assert.equal(rich.description, 'Water-resistant team parka');
  assert.equal(rich.descriptionAr, 'باركا مقاومة للماء');
  assert.equal(rich.category, 'apparel');
  assert.equal(rich.sport, 'swimming');
  assert.equal(rich.productType, 'Team apparel');
  assert.equal(rich.mediaUrl, '/media/store/parka.jpg');
  assert.equal(rich.slug, 'team-parka');

  // 2. Server-authoritative checkout order
  const order = await repo.prepareOrder(userCtx, [{ productId: 'p-1', quantity: 2 }]);
  assert.equal(order.totalMinor, 24000); // 12000 * 2
  assert.equal(order.currency, 'AED');
  assert.equal(order.status, 'pending');
  assert.ok(order.orderNumber.startsWith('UOS-ORD-'));
  assert.equal(db.inventory.get('p-1'), 13); // reservation decremented

  // 2b. Duplicate product lines are consolidated, never double-counted
  const dupOrder = await repo.prepareOrder(userCtx, [
    { productId: 'p-1', quantity: 1 },
    { productId: 'p-1', quantity: 2 },
  ]);
  assert.equal(dupOrder.items.length, 1);
  assert.equal(dupOrder.items[0].quantity, 3);
  assert.equal(dupOrder.totalMinor, 36000);
  assert.equal(db.inventory.get('p-1'), 10);

  // 2c. Non-integer quantities are rejected
  await assert.rejects(
    async () => {
      await repo.prepareOrder(userCtx, [{ productId: 'p-1', quantity: 1.5 }]);
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      assert.equal(err.code, 'INVALID_QUANTITY');
      return true;
    },
  );

  // 2d. Mixed-currency baskets are rejected (single-currency orders only)
  const mixedDb = new MockStoreDb();
  mixedDb.products.push({ id: 'p-eur', sku: 'UOS-EUR', name: 'Euro Item', name_ar: null, price_minor: 1000, currency: 'EUR', available_quantity: 5, status: 'active' });
  mixedDb.inventory.set('p-eur', 5);
  const mixedRepo = new StoreDomainRepository(mixedDb);
  await assert.rejects(
    async () => {
      await mixedRepo.prepareOrder(userCtx, [
        { productId: 'p-1', quantity: 1 },
        { productId: 'p-eur', quantity: 1 },
      ]);
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 422);
      assert.equal(err.code, 'CURRENCY_MISMATCH');
      return true;
    },
  );

  // 2e. Cancel releases the reservation; only the owner (or admin) may cancel
  const cancellable = await repo.prepareOrder(userCtx, [{ productId: 'p-2', quantity: 1 }]);
  assert.equal(db.inventory.get('p-2'), 1);
  const strangerCtx = { ...userCtx, uid: 'u-stranger' };
  await assert.rejects(
    async () => { await repo.cancelOrder(strangerCtx, cancellable.orderId); },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      return true;
    },
  );
  const cancelled = await repo.cancelOrder(userCtx, cancellable.orderId);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(db.inventory.get('p-2'), 2); // reservation released
  await assert.rejects(
    async () => { await repo.cancelOrder(userCtx, cancellable.orderId); },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 409);
      assert.equal(err.code, 'ORDER_NOT_CANCELLABLE');
      return true;
    },
  );

  // 3. Concurrency / inventory rejection (quantity > available)
  await assert.rejects(
    async () => {
      await repo.prepareOrder(userCtx, [{ productId: 'p-2', quantity: 10 }]); // only 2 available
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 409);
      assert.equal(err.code, 'INSUFFICIENT_INVENTORY');
      return true;
    },
  );

  // 3b. Deterministic inventory lock order: product_ids are sorted before FOR UPDATE
  // Prevents deadlock when two concurrent checkouts contain the same products in opposite order.
  class LockOrderCapturingDb extends MockStoreDb {
    public lastLockProductIds: string[] | null = null;
    public lastLockSql: string | null = null;
    public updateOrder: string[] = [];
    async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
      const s = sql.toLowerCase();
      if (s.includes('from inventory where product_id = any($1)') && s.includes('for update')) {
        this.lastLockProductIds = [...(params?.[0] as string[])];
        this.lastLockSql = sql;
        // Verify ORDER BY product_id is present (global lock order)
        assert.ok(s.includes('order by product_id'), 'lock query must use ORDER BY product_id');
      }
      if (s.includes('update inventory') && s.includes('available_quantity - $1')) {
        this.updateOrder.push(params?.[1] as string);
      }
      return super.query(sql, params);
    }
  }
  const lockDb = new LockOrderCapturingDb();
  lockDb.products.push({ id: 'p-3', sku: 'UOS-TENNIS-BALL', name: 'Tennis Ball', name_ar: null, price_minor: 1000, currency: 'AED', available_quantity: 10, status: 'active' } as never);
  lockDb.inventory.set('p-3', 10);
  const lockRepo = new StoreDomainRepository(lockDb);
  // Submit in reverse order; lock must still be sorted
  await lockRepo.prepareOrder(userCtx, [{ productId: 'p-3', quantity: 1 }, { productId: 'p-1', quantity: 1 }]);
  assert.deepEqual(lockDb.lastLockProductIds, ['p-1', 'p-3'], 'lock product_ids must be sorted deterministically');
  assert.deepEqual(lockDb.updateOrder, ['p-1', 'p-3'], 'inventory decrements must be in deterministic product_id order');

  // 3c. Cancellation deterministic order: release lines sorted by productId
  class CancelOrderCapturingDb extends MockStoreDb {
    public releaseOrder: string[] = [];
    async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
      const s = sql.toLowerCase();
      if (s.includes('update inventory') && s.includes('available_quantity + $1')) {
        this.releaseOrder.push(params?.[1] as string);
      }
      return super.query(sql, params);
    }
  }
  const cancelDb = new CancelOrderCapturingDb();
  cancelDb.products.push({ id: 'p-3', sku: 'UOS-TENNIS-BALL', name: 'Tennis Ball', name_ar: null, price_minor: 1000, currency: 'AED', available_quantity: 10, status: 'active' } as never);
  cancelDb.inventory.set('p-3', 10);
  cancelDb.products.push({ id: 'p-1', sku: 'UOS-SWIM-GOGGLE', name: 'Olympic Swim Goggles', name_ar: 'نظارات سباحة أولمبية', price_minor: 12000, currency: 'AED', available_quantity: 15, status: 'active' } as never);
  // Create order with opposite item order in JSON; cancellation must release in sorted order
  const txOrder = await (new StoreDomainRepository(cancelDb)).prepareOrder(userCtx, [{ productId: 'p-3', quantity: 1 }, { productId: 'p-1', quantity: 1 }]);
  // Manually reorder items in stored order to opposite to test sorting on release (simulates JSON unordered)
  const stored = cancelDb.orders.find((o) => o.id === txOrder.orderId);
  if (stored) stored.items = [...stored.items].reverse();
  cancelDb.releaseOrder = [];
  await (new StoreDomainRepository(cancelDb)).cancelOrder(userCtx, txOrder.orderId);
  assert.deepEqual(cancelDb.releaseOrder, ['p-1', 'p-3'], 'cancellation inventory release must be in deterministic product_id order');

  // 3d. Transactional audit atomicity: audit insert uses same transaction client and rolls back with business mutation
  // Use a transactional mock that snapshots on BEGIN and reverts on ROLLBACK
  class TxAuditMockDb implements DbQueryClient {
    public products = [
      { id: 'p-1', sku: 'UOS-SWIM-GOGGLE', name: 'Olympic Swim Goggles', name_ar: 'نظارات سباحة أولمبية', price_minor: 12000, currency: 'AED', available_quantity: 15, status: 'active' },
    ];
    public inventory = new Map<string, number>([['p-1', 15]]);
    public orders: any[] = [];
    public auditInserts: string[] = [];
    public shouldFailAudit = false;
    private txSnapshot: { inventory: Map<string, number>; ordersLength: number } | null = null;
    async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
      const s = sql.toLowerCase().trim();
      if (s === 'begin') {
        this.txSnapshot = { inventory: new Map(this.inventory), ordersLength: this.orders.length };
        return { rows: [] as unknown as T[], rowCount: 0 };
      }
      if (s === 'commit') {
        this.txSnapshot = null;
        return { rows: [] as unknown as T[], rowCount: 0 };
      }
      if (s === 'rollback') {
        if (this.txSnapshot) {
          this.inventory = this.txSnapshot.inventory;
          this.orders.length = this.txSnapshot.ordersLength;
          this.txSnapshot = null;
        }
        return { rows: [] as unknown as T[], rowCount: 0 };
      }
      if (s.includes('from catalog_products') && s.includes('left join inventory')) {
        const ids = params?.[0] as string[];
        const filtered = this.products.filter((p) => ids.includes(p.id)).map((p) => ({ ...p, available_quantity: this.inventory.get(p.id) ?? 0 }));
        return { rows: filtered as unknown as T[], rowCount: filtered.length };
      }
      if (s.includes('from inventory where product_id = any($1)')) {
        return { rows: [] as unknown as T[], rowCount: 0 };
      }
      if (s.includes('update inventory') && s.includes('available_quantity - $1')) {
        const [qty, productId] = params as [number, string];
        const avail = this.inventory.get(productId) ?? 0;
        if (avail >= qty) {
          this.inventory.set(productId, avail - qty);
          return { rows: [], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (s.includes('insert into orders')) {
        const [id, orderNumber] = params as any[];
        this.orders.push({ id, order_number: orderNumber, customer_uid: userCtx.uid, status: 'pending', items: JSON.parse((params as any[])[5]) });
        return { rows: [] as unknown as T[], rowCount: 1 };
      }
      if (s.includes('insert into audit_logs')) {
        if (this.shouldFailAudit) throw new Error('AUDIT_PERSISTENCE_FAILURE');
        this.auditInserts.push(params?.[0] as string);
        return { rows: [] as unknown as T[], rowCount: 1 };
      }
      return { rows: [] as unknown as T[], rowCount: 0 };
    }
    async connect() {
      // Provide a client with query/release that shares this instance's state (simulates Pool.connect)
      return { query: this.query.bind(this), release: () => {} };
    }
  }
  const txDb = new TxAuditMockDb();
  // Make audit use the transaction client by wiring Database via getPool override? Instead verify via source:
  const repoSource = await readFile(new URL('../src/server/repositories/store-repository.ts', import.meta.url), 'utf8');
  assert.ok(repoSource.includes('await recordAudit(ctx, {') && repoSource.includes('}, db)'), 'prepareOrder/cancelOrder audit must use transaction db client');
  const auditSource = await readFile(new URL('../src/server/audit.ts', import.meta.url), 'utf8');
  assert.ok(auditSource.includes('dbOverride'), 'audit must accept transaction client override');
  assert.ok(auditSource.includes('if (auditingInTransaction) throw err'), 'transactional audit failure must propagate to rollback');
  // Runtime proof: when audit fails, inventory and order must roll back
  const txRepo = new StoreDomainRepository(txDb as unknown as DbQueryClient);
  txDb.shouldFailAudit = true;
  await assert.rejects(
    () => txRepo.prepareOrder(userCtx, [{ productId: 'p-1', quantity: 1 }]),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.match((err as Error).message, /AUDIT_PERSISTENCE_FAILURE/);
      return true;
    },
  );
  assert.equal(txDb.orders.length, 0, 'order must be rolled back when audit fails');
  assert.equal(txDb.inventory.get('p-1'), 15, 'inventory reservation must roll back when audit fails');
  txDb.shouldFailAudit = false;
  await txRepo.prepareOrder(userCtx, [{ productId: 'p-1', quantity: 1 }]);
  assert.equal(txDb.orders.length, 1);
  assert.equal(txDb.auditInserts.length, 1);

  // 3e. Migration 0008 index safety: must use CONCURRENTLY and runner must handle non-transactional
  const migrationSource = await readFile(new URL('../src/db/migrations/0008_store_catalog_richness.sql', import.meta.url), 'utf8');
  assert.ok(migrationSource.includes('create unique index concurrently if not exists uq_catalog_products_slug'), 'migration must use CONCURRENTLY for uq_catalog_products_slug');
  assert.ok(migrationSource.includes('create index concurrently if not exists idx_catalog_products_category'), 'migration must use CONCURRENTLY for category index');
  assert.ok(migrationSource.includes('create index concurrently if not exists idx_catalog_products_sport'), 'migration must use CONCURRENTLY for sport index');
  const migrateSource = await readFile(new URL('../src/db/migrate.ts', import.meta.url), 'utf8');
  assert.ok(migrateSource.includes('CONCURRENTLY') && migrateSource.includes('usesConcurrently'), 'migrate runner must detect CONCURRENTLY and skip transaction wrapper');

  // 3f. Package manager pin must be exact x.y.z
  const pkgSource = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const pkg = JSON.parse(pkgSource);
  assert.match(pkg.packageManager, /^npm@\d+\.\d+\.\d+$/, 'packageManager must be pinned to exact npm x.y.z');

  // 4. Public catalog without a configured database is truthfully empty (200),
  // never a crash: operators read the degraded health signal instead.
  delete process.env.DATABASE_URL;
  delete process.env.SQL_HOST;
  const req = { url: '/api/v1/store/products', method: 'GET', headers: {} } as ApiRequest;
  let statusCode = 0;
  let body = '';
  const res = {
    statusCode: 0,
    setHeader() { /* header sink */ },
    end(data?: string) { if (data) body = data; },
  } as unknown as ApiResponse & { statusCode: number };
  const capturing = new Proxy(res, {
    set(target, prop, value) {
      if (prop === 'statusCode') statusCode = value as number;
      return Reflect.set(target, prop, value);
    },
  });
  await storeProductsHandler(req, capturing);
  assert.equal(statusCode, 200);
  const payload = JSON.parse(body) as { ok?: boolean; items?: unknown[] };
  assert.equal(payload.ok, true);
  assert.deepEqual(payload.items, []);

  const fakeReq = (url: string) => ({ url, method: 'POST', headers: {} }) as unknown as ApiRequest;
  assert.equal(resolveRouteKey(fakeReq('/api/v1/store/orders/cancel')), 'store-order-cancel');

  console.log('Store production data tests: PASS');
}

runStoreProductionTests().catch((err) => {
  console.error('FATAL: Store production test failure:', err);
  process.exit(1);
});
