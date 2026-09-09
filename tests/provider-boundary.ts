import assert from 'node:assert/strict';
import { unavailableAdminGateway } from '../src/admin/data/unavailableAdminGateway.ts';
import { previewAdminGateway } from '../src/admin/data/previewAdminGateway.ts';
import { unavailableStoreGateway } from '../src/store/data/unavailableStoreGateway.ts';


// Test 1: In live production mode, admin gateway MUST NOT return mock fixtures
assert.equal(unavailableAdminGateway.mode, 'live');

await assert.rejects(
  async () => unavailableAdminGateway.listPlayers({ page: 1, pageSize: 10 }),
  (err: unknown) => err instanceof Error && err.message.includes('not connected yet'),
  'Live admin gateway must refuse to serve fake player data',
);

await assert.rejects(
  async () => unavailableAdminGateway.listBranches({ page: 1, pageSize: 10 }),
  (err: unknown) => err instanceof Error && err.message.includes('not connected yet'),
  'Live admin gateway must refuse to serve fake branch data',
);

await assert.rejects(
  async () => unavailableAdminGateway.listPayments({ page: 1, pageSize: 10 }),
  (err: unknown) => err instanceof Error && err.message.includes('not connected yet'),
  'Live admin gateway must refuse to fabricate financial records',
);

// Test 2: In preview mode, previewAdminGateway is explicitly isolated
assert.equal(previewAdminGateway.mode, 'preview');
const previewPlayers = await previewAdminGateway.listPlayers({ page: 1, pageSize: 5 });
assert.equal(previewPlayers.items.length > 0, true);

// Test 3: In live store mode, unavailableStoreGateway MUST NOT return preview products
assert.equal(unavailableStoreGateway.mode, 'unavailable');
const liveCatalog = await unavailableStoreGateway.loadCatalog();
assert.deepEqual(liveCatalog.products, [], 'Live store gateway without backend connection must return empty product list, never mock fixtures');


console.log('Provider boundary tests: PASS');
console.log('P0 PREVIEW VS PRODUCTION PROVIDER BOUNDARY: PASS');

