import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clientShowcaseMode, isCanonicalProductionHost, resolveClientShowcaseMode } from '../src/lib/preview-guard';

console.log('--- RUNNING PRODUCTION PREVIEW ISOLATION TEST ---');

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

// 1. Canonical production hosts are blocked (exact match, no substring tricks).
for (const host of [
  'unitedolympicsports.store',
  'www.unitedolympicsports.store',
  'unitedolympicssports.com',
  'www.unitedolympicssports.com',
  'UNITEDOLYMPICSPORTS.STORE',
  '  unitedolympicsports.store  ',
]) {
  assert.equal(isCanonicalProductionHost(host), true, `${host} must be treated as production`);
}

// 2. QA/local hosts stay enabled for the explicit preview-QA layer.
for (const host of [
  'localhost',
  '127.0.0.1',
  'localhost:4173',
  '联合奥运会.store',
  'unitedolympicsports.store.evil.com',
  'evil-unitedolympicsports.store',
  'notunitedolympicsports.store',
  'preview-unitedolympicsports.store',
  'myapp.vercel.app',
  '',
]) {
  // Note: 'localhost:4173' includes a port and therefore does NOT match the
  // canonical list; window.location.hostname never carries a port, so this
  // documents exact-match semantics (hostname-only input in production).
  const expected = false;
  assert.equal(isCanonicalProductionHost(host), expected, `${host || '(empty)'} must not match canonical production hosts`);
}


// 3. Client Showcase is explicit opt-in only. Canonical production host status
// must never imply synthetic preview data when the deployment flag is unset.
assert.equal(resolveClientShowcaseMode(undefined), false, 'unset showcase flag must default to false');
assert.equal(resolveClientShowcaseMode(''), false, 'empty showcase flag must default to false');
assert.equal(resolveClientShowcaseMode('false'), false, 'explicit false must stay false');
assert.equal(resolveClientShowcaseMode('0'), false, 'explicit zero must stay false');
assert.equal(resolveClientShowcaseMode('true'), true, 'explicit true must enable temporary showcase');
assert.equal(resolveClientShowcaseMode('1'), true, 'explicit one must enable temporary showcase');
assert.equal(resolveClientShowcaseMode('yes'), true, 'explicit yes must enable temporary showcase');
assert.equal(
  isCanonicalProductionHost('unitedolympicsports.store') && resolveClientShowcaseMode(undefined),
  false,
  'canonical production + unset showcase must not activate synthetic preview',
);
assert.equal(
  isCanonicalProductionHost('unitedolympicsports.store') && resolveClientShowcaseMode('true'),
  true,
  'canonical production may enter showcase only when explicitly opted in',
);

// 4. Every client gate that consults a preview/demo flag must route through
// the shared preview-guard, so a misconfigured VITE_UOS_* flag in the
// deployment environment can never enable preview data, preview auth bypass,
// demo routes, or demo links on canonical production hosts — while the
// explicit preview-QA layer (flags + non-production host) keeps working.
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
    source.includes('previewModeAllowed'),
    `${label} (${path}) must gate preview/demo flags through previewModeAllowed`,
  );
  assert(
    source.includes('preview-guard'),
    `${label} (${path}) must import the shared preview-guard`,
  );
}

// 5. The guard itself: production hosts blocked regardless of flags,
// development/flag builds allowed elsewhere.
const guard = await read('src/lib/preview-guard.ts');
assert(guard.includes('unitedolympicsports.store'), 'Guard must list the canonical production domain');
assert(guard.includes('isCanonicalProductionHost'), 'Guard must expose host matching');
assert(guard.includes('import.meta.env.DEV'), 'Guard must preserve dev-mode behavior');

// 6. Fail-closed defaults: production data providers must resolve to live
// gateways unless explicitly overridden, never to preview fixtures.
const adminProvider = await read('src/admin/data/AdminDataProvider.tsx');
assert(
  adminProvider.includes("return previewEnabled ? 'preview' : 'live'"),
  'AdminDataProvider must default to live mode without preview allowance',
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

// 7. Benchmark showcase stays DEV-only and is never reachable in any deployed build.
const appRouter = await read('src/app/AppRouter.tsx');
assert(
  appRouter.includes('import.meta.env.DEV === true'),
  'Benchmark route must remain strictly DEV-only',
);

// 7. Showcase entry point itself defaults closed outside Vite and never
// consults the hostname: node-safe, case-insensitive, explicit opt-in only.
assert.equal(resolveClientShowcaseMode('TRUE'), true, 'flag parsing is case-insensitive');
assert.equal(clientShowcaseMode(), false, 'showcase defaults to false without an explicit flag');
assert.equal(
  guard.includes('return isCanonicalProductionHost();'),
  false,
  'showcase must not fall back to the canonical production hostname',
);

console.log('PASS: Production preview isolation + explicit showcase opt-in verified across 10 client gates.');
