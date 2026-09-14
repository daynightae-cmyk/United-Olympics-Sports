import assert from 'node:assert/strict';
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
