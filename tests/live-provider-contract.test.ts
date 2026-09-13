import assert from 'node:assert/strict';

// Live-provider contract: pins the production gateway <-> server API wiring
// (routes, methods, payload shapes) with an isolated stubbed transport.
// No real customer data is touched; no network leaves the process.

async function runLiveProviderContractTests() {
  console.log('=== RUNNING LIVE PROVIDER CONTRACT TESTS ===');

  const { resolveRouteKey } = await import('../src/server/routes.ts');
  const fakeReq = (url: string) => ({ url, method: 'GET', headers: {} }) as never;

  // 1. New bootstrap route resolves through the canonical dispatcher
  assert.equal(
    resolveRouteKey(fakeReq('/api/v1/admin/organization/bootstrap')),
    'admin-organization-bootstrap',
  );
  assert.equal(resolveRouteKey(fakeReq('/api/v1/admin/organization')), 'admin-organization');
  assert.equal(resolveRouteKey(fakeReq('/api/v1/store/products')), 'store-products');
  assert.equal(resolveRouteKey(fakeReq('/api/v1/store/checkout')), 'store-checkout');
  assert.equal(resolveRouteKey(fakeReq('/public/enquiries')), 'public-enquiries');

  // 2. Production store gateway maps the server catalog shape truthfully
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const stubFetch = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url === '/api/v1/store/products') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          items: [
            { id: 'p-live-1', sku: 'UOS-LIVE-1', name: 'Live Kit', nameAr: 'طقم حي', priceMinor: 19900, currency: 'AED', availableQuantity: 4, status: 'active' },
            { id: 'p-live-2', sku: 'UOS-LIVE-2', name: 'Sold Out', nameAr: null, priceMinor: 5000, currency: 'AED', availableQuantity: 0, status: 'active' },
          ],
        }),
      };
    }
    if (url === '/api/v1/admin/organization/bootstrap') {
      const body = JSON.parse(String((init?.body as string) ?? '{}'));
      assert.equal(init?.method, 'POST');
      assert.equal(body.name, 'United Olympics Sports');
      return { ok: true, status: 201, json: async () => ({ ok: true, organization: { id: 'org-live-1', name: { en: body.name, ar: body.nameAr } } }) };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  const originalFetch = globalThis.fetch;
  (globalThis as { fetch: typeof fetch }).fetch = stubFetch as unknown as typeof fetch;
  try {
    const { productionStoreGateway } = await import('../src/store/data/productionStoreGateway.ts');
    assert.equal(productionStoreGateway.mode, 'production');
    const catalog = await productionStoreGateway.loadCatalog();
    assert.equal(catalog.products.length, 2);
    assert.equal(catalog.products[0].price, 199);
    assert.equal(catalog.products[0].currency, 'AED');
    assert.equal(catalog.products[0].availability, 'available');
    assert.equal(catalog.products[0].name.ar, 'طقم حي');
    assert.equal(catalog.products[1].availability, 'unavailable');

    // 3. Production admin gateway bootstraps through the live endpoint
    const { productionAdminGateway } = await import('../src/admin/data/productionAdminGateway.ts');
    const created = await productionAdminGateway.bootstrapOrganization({ name: 'United Olympics Sports', nameAr: 'يونايتد أوليمبيكس سبورت' });
    assert.equal(created.item.id, 'org-live-1');
    assert.ok(calls.some((c) => c.url === '/api/v1/admin/organization/bootstrap'));

    // 4. Production gateway surfaces transport failures as errors (never preview fallback)
    (globalThis as { fetch: typeof fetch }).fetch = (async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch;
    await assert.rejects(async () => {
      await productionStoreGateway.loadCatalog();
    }, /Production catalog request failed/);
  } finally {
    (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
  }

  console.log('Live provider contract tests: PASS');
}

runLiveProviderContractTests().catch((err) => {
  console.error('FATAL: Live provider contract test failure:', err);
  process.exit(1);
});
