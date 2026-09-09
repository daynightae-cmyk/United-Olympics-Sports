import assert from 'node:assert/strict';
import { StoreDomainRepository } from '../src/server/repositories/store-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
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
  public orders: any[] = [];

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from catalog_products') && s.includes('left join inventory')) {
      if (s.includes('where p.id = any($1)')) {
        const ids = params?.[0] as string[];
        const filtered = this.products.filter((p) => ids.includes(p.id));
        return { rows: filtered as unknown as T[], rowCount: filtered.length };
      }
      return { rows: this.products as unknown as T[], rowCount: this.products.length };
    }
    if (s.includes('insert into orders')) {
      const [id, orderNumber, custUid, totalMinor, currency, items, shipping] = params as any[];
      const o = { id, orderNumber, custUid, totalMinor, currency, items, shipping };
      this.orders.push(o);
      return { rows: [o as unknown as T], rowCount: 1 };
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

  console.log('Store production data tests: PASS');
}

runStoreProductionTests().catch((err) => {
  console.error('FATAL: Store production test failure:', err);
  process.exit(1);
});
