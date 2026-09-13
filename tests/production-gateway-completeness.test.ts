import assert from 'node:assert/strict';
import {
  getAdminCapability,
  type AdminCapabilityKey,
} from '../src/admin/data/productionCapabilities.ts';
import { productionAdminGateway, AdminGatewayError } from '../src/admin/data/productionAdminGateway.ts';

async function runProductionGatewayCompletenessTests() {
  console.log('=== RUNNING PRODUCTION GATEWAY COMPLETENESS TESTS ===');

  // Test 1: Capabilities Registry Completeness
  const expectedKeys: AdminCapabilityKey[] = [
    'organization',
    'countries',
    'branches',
    'sports',
    'programs',
    'groups',
    'players',
    'coaches',
    'parents',
    'sessions',
    'performance',
    'registrations',
    'subscriptions',
    'payments',
    'reports',
    'content',
    'users',
    'achievements',
    'events',
    'announcements',
    'messages',
    'auditActivity',
  ];

  for (const key of expectedKeys) {
    const cap = getAdminCapability(key);
    assert.ok(cap, `Capability must exist for ${key}`);
    assert.equal(cap.entity, key);
    assert.ok(
      ['LIVE_READ_WRITE', 'LIVE_READ_ONLY', 'DISABLED', 'EXTERNAL_PROVIDER_REQUIRED'].includes(cap.readStatus),
      `Valid readStatus for ${key}`,
    );
    assert.ok(
      ['LIVE_READ_WRITE', 'LIVE_READ_ONLY', 'DISABLED', 'EXTERNAL_PROVIDER_REQUIRED'].includes(cap.writeStatus),
      `Valid writeStatus for ${key}`,
    );
    assert.ok(
      ['LIVE_READ_WRITE', 'LIVE_READ_ONLY', 'DISABLED', 'EXTERNAL_PROVIDER_REQUIRED'].includes(cap.deleteStatus),
      `Valid deleteStatus for ${key}`,
    );
    assert.ok(typeof cap.rationale === 'string' && cap.rationale.length > 10, `Valid rationale for ${key}`);
  }
  console.log(`[PASS] Verified ${expectedKeys.length} production capabilities in registry.`);

  // Test 2: Mode is 'live'
  assert.equal(productionAdminGateway.mode, 'live');

  // Test 3: Disabled operations reject with typed AdminGatewayError (status 405)
  await assert.rejects(
    async () => {
      await productionAdminGateway.deleteCountry('cnt-1');
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 405);
      assert.equal(err.code, 'CAPABILITY_DISABLED');
      return true;
    },
  );

  await assert.rejects(
    async () => {
      await productionAdminGateway.deletePlayer('pl-1');
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 405);
      assert.equal(err.code, 'CAPABILITY_DISABLED');
      return true;
    },
  );

  await assert.rejects(
    async () => {
      await productionAdminGateway.createSport({ name: { en: 'Skiing', ar: 'التزلج' } });
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 405);
      assert.equal(err.code, 'CAPABILITY_DISABLED');
      return true;
    },
  );

  // Test 4: External provider operations reject with typed AdminGatewayError (status 501)
  await assert.rejects(
    async () => {
      await productionAdminGateway.listSubscriptions();
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 501);
      assert.equal(err.code, 'EXTERNAL_PROVIDER_REQUIRED');
      return true;
    },
  );

  await assert.rejects(
    async () => {
      await productionAdminGateway.createPayment({ amount: 100 });
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 501);
      assert.equal(err.code, 'EXTERNAL_PROVIDER_REQUIRED');
      return true;
    },
  );

  await assert.rejects(
    async () => {
      await productionAdminGateway.listMessages();
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 501);
      assert.equal(err.code, 'EXTERNAL_PROVIDER_REQUIRED');
      return true;
    },
  );

  // Test 5: Error propagation proof (Ensuring 401 and 500 are NOT swallowed into empty items/null)
  const originalFetch = globalThis.fetch;

  // 5.1: Verify 401 Unauthorized causes listCountries to throw instead of returning empty array
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  await assert.rejects(
    async () => {
      await productionAdminGateway.listCountries();
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 401);
      assert.equal(err.code, 'UNAUTHORIZED');
      return true;
    },
  );

  // 5.2: Verify 500 Internal Error causes getPlayer to throw instead of returning null
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Database query failed' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  await assert.rejects(
    async () => {
      await productionAdminGateway.getPlayer('pl-123');
    },
    (err: unknown) => {
      assert.ok(err instanceof AdminGatewayError);
      assert.equal(err.status, 500);
      assert.equal(err.code, 'INTERNAL_ERROR');
      return true;
    },
  );

  // 5.3: Verify 404 Not Found returns null truthfully on get* methods
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Player not found' } }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const notFoundPlayer = await productionAdminGateway.getPlayer('pl-nonexistent');
  assert.equal(notFoundPlayer, null, '404 status must truthfully return null');

  // Restore fetch
  globalThis.fetch = originalFetch;

  console.log('[PASS] Verified error bubbling and zero unauthorized null/empty fallbacks.');
  console.log('Production Gateway Completeness Test: PASS');
}

runProductionGatewayCompletenessTests().catch((err) => {
  console.error('FATAL: Production gateway completeness failure:', err);
  process.exit(1);
});
