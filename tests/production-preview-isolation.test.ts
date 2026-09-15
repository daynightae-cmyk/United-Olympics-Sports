import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

console.log('--- RUNNING PRODUCTION PREVIEW ISOLATION TEST ---');

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// Every client gate that consults a preview/demo flag must short-circuit on
// production builds first, so a misconfigured VITE_UOS_* flag in the
// deployment environment can never enable preview data, preview auth bypass,
// demo routes, or demo links in production.
const prodStrictGates: Array<[string, string]> = [
  ['src/portals/admin/AdminAccessGate.tsx', 'AdminAccessGate'],
  ['src/admin/data/AdminDataProvider.tsx', 'AdminDataProvider'],
  ['src/store/data/StoreDataProvider.tsx', 'StoreDataProvider'],
  ['src/app/AppRouter.tsx', 'AppRouter demo gate'],
  ['src/portals/player/PlayerProtectedRoute.tsx', 'PlayerProtectedRoute'],
  ['src/portals/ParentPortalRouter.tsx', 'ParentProtectedRoute'],
  ['src/portals/player/auth/PlayerLoginPage.tsx', 'PlayerLoginPage demo link'],
  ['src/portals/parent/ParentLoginPage.tsx', 'ParentLoginPage demo link'],
  ['src/portals/coach/CoachLoginPage.tsx', 'CoachLoginPage demo link'],
  ['src/pages/demo/PortalDemoPage.tsx', 'PortalDemoPage'],
];

for (const [path, label] of prodStrictGates) {
  const source = await read(path);
  assert(
    source.includes('!import.meta.env.PROD'),
    `${label} (${path}) must short-circuit preview/demo flags on production builds`,
  );
}

// Fail-closed defaults: production data providers must resolve to live
// gateways unless explicitly overridden, never to preview fixtures.
const adminProvider = await read('src/admin/data/AdminDataProvider.tsx');
assert(
  adminProvider.includes("return previewEnabled ? 'preview' : 'live'"),
  'AdminDataProvider must default to live mode on production builds',
);

const storeProvider = await read('src/store/data/StoreDataProvider.tsx');
assert(
  storeProvider.includes('productionStoreGateway'),
  'StoreDataProvider must resolve the live server catalog by default',
);
assert.equal(
  storeProvider.includes('previewStoreGateway') && !storeProvider.includes('previewEnabled'),
  false,
  'StoreDataProvider must only select the preview gateway behind the preview flag',
);

// Benchmark showcase stays DEV-only and is never reachable in any deployed build.
const appRouter = await read('src/app/AppRouter.tsx');
assert(
  appRouter.includes('import.meta.env.DEV === true'),
  'Benchmark route must remain strictly DEV-only',
);

console.log('PASS: Production preview isolation verified across 10 client gates.');
