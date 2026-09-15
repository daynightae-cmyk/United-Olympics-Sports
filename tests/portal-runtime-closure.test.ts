import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const files = await Promise.all([
  read('src/portals/player/auth/PlayerLoginPage.tsx'),
  read('src/portals/parent/ParentLoginPage.tsx'),
  read('src/portals/coach/CoachLoginPage.tsx'),
  read('src/portals/player/PlayerSessionContext.tsx'),
  read('src/portals/parent/useParentPortalGatewayData.ts'),
  read('src/portals/coach/CoachSessionContext.tsx'),
  read('src/portals/coach/CoachProtectedRoute.tsx'),
  read('src/portals/coach/useCoachPortalGatewayData.ts'),
  read('src/server/repositories/portal-repository.ts'),
  read('src/store/StoreApp.tsx'),
  read('src/server/repositories/store-account-repository.ts'),
  read('.github/workflows/verify.yml'),
  read('qa/production-runtime-smoke.mjs'),
]);

const [
  playerLogin,
  parentLogin,
  coachLogin,
  playerContext,
  parentData,
  coachContext,
  coachGuard,
  coachData,
  portalRepo,
  storeApp,
  storeAccountRepo,
  workflow,
  smoke,
] = files;

for (const [name, source, forbidden] of [
  ['player login', playerLogin, ['PlayerSessionProvider', 'usePlayerSession', 'adminHooks']],
  ['parent login', parentLogin, ['useParents(', 'adminHooks']],
  ['coach login', coachLogin, ['CoachSessionProvider', 'useCoachSession', 'useCoaches(', 'adminHooks']],
] as const) {
  for (const marker of forbidden) assert.equal(source.includes(marker), false, `${name} heavy dependency: ${marker}`);
  assert(source.includes('VITE_UOS_PORTAL_DEMO'), `${name} must use the explicit safe demo flag`);
}

assert(playerContext.includes('fetchPlayerPortalSnapshot'));
assert.equal(playerContext.includes("from '../../admin/data/adminHooks'"), false);
assert(parentData.includes('fetchParentPortalSnapshot'));
assert(parentData.includes('fetchPlayerPortalSnapshot'));
assert.equal(parentData.includes("from '../../admin/data/adminHooks'"), false);
assert(coachContext.includes('fetchCoachPortalScope'));
assert(coachContext.includes('productionWorkspace'));
assert.equal(coachContext.includes('useCoaches('), false);
assert.equal(coachGuard.includes('usePlayers('), false);
assert(coachGuard.includes('authorizedPlayerIds'));
assert.equal(coachData.includes("from '../../admin/data/adminHooks'"), false, 'Coach workspace must not use admin hooks in production');
assert(coachData.includes('productionWorkspace'), 'Coach workspace must consume the server-scoped production snapshot');
for (const marker of ['assignedGroups', 'assignedPlayerIds', 'where p.id = any($1)', 'where s.group_id = any($1)', 'where sender_uid = $1 or recipient_uid = $1']) {
  assert(portalRepo.includes(marker), `Coach portal repository missing scoped marker: ${marker}`);
}

for (const marker of ['StoreAccountBoundary', 'ConnectedAccountPage', 'ConnectedOrdersPage', 'ConnectedAddressesPage', 'ConnectedNotificationsPage', 'ConnectedWishlistPage']) {
  assert(storeApp.includes(marker), `Store account closure missing ${marker}`);
}
assert(storeAccountRepo.includes('where customer_uid = $1'), 'Store orders must be scoped by verified customer uid');
assert(storeAccountRepo.includes('[ctx.uid]'), 'Store account query must bind ctx.uid');

const realQa = workflow.indexOf('Real production portal runtime smoke');
const previewQa = workflow.indexOf('QA production build with explicit preview providers');
assert(realQa >= 0 && previewQa >= 0 && realQa < previewQa, 'Real production QA must run before preview flags');
for (const route of ['/player/login', '/player', '/parent/login', '/parent', '/coach/login', '/coach', '/store/login', '/store/account', '/admin/login']) {
  assert(smoke.includes(`'${route}'`), `Production runtime smoke missing ${route}`);
}
assert(smoke.includes('[data-route-loading="true"]'), 'Production QA must detect persistent route loaders');
assert(smoke.includes('runtimeErrors'));
assert(smoke.includes('failedRequests'));
assert(smoke.includes('badResponses'));

console.log('Portal runtime closure contract passed.');