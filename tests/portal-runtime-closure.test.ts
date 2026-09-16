import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const files = await Promise.all([
  read('src/portals/player/auth/PlayerLoginPage.tsx'),
  read('src/portals/parent/ParentLoginPage.tsx'),
  read('src/portals/coach/CoachLoginPage.tsx'),
  read('src/portals/player/PlayerSessionContext.tsx'),
  read('src/portals/player/PlayerProtectedRoute.tsx'),
  read('src/portals/parent/useParentPortalGatewayData.ts'),
  read('src/portals/coach/CoachSessionContext.tsx'),
  read('src/portals/coach/CoachProtectedRoute.tsx'),
  read('src/portals/coach/useCoachPortalGatewayData.ts'),
  read('src/lib/portal-data-client.ts'),
  read('src/lib/runtime-timeout.ts'),
  read('src/db/index.ts'),
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
  playerGuard,
  parentData,
  coachContext,
  coachGuard,
  coachData,
  portalClient,
  runtimeTimeout,
  dbIndex,
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
for (const marker of ['production?.payments', 'production?.documents', 'production?.messages', 'production?.relations.sport', 'production?.relations.group', 'production?.relations.coaches']) {
  assert(playerContext.includes(marker), `Player production context missing scoped record mapping: ${marker}`);
}
assert(playerGuard.includes('window.location.reload()'), 'Player session-level runtime retry must reload the session state');

assert(parentData.includes('fetchParentPortalSnapshot'));
assert(parentData.includes('fetchPlayerPortalSnapshot'));
assert.equal(parentData.includes("from '../../admin/data/adminHooks'"), false);
for (const marker of ['scopedPayments(snapshots)', 'family.messages.map', 'scopedRelations(snapshots)', 'snapshot.relations.sport', 'snapshot.relations.group']) {
  assert(parentData.includes(marker), `Parent production context missing scoped mapping: ${marker}`);
}

assert(coachContext.includes('fetchCoachPortalScope'));
assert(coachContext.includes('productionWorkspace'));
assert.equal(coachContext.includes('useCoaches('), false);
assert.equal(coachGuard.includes('usePlayers('), false);
assert(coachGuard.includes('authorizedPlayerIds'));
assert.equal(coachData.includes("from '../../admin/data/adminHooks'"), false, 'Coach workspace must not use admin hooks in production');
assert(coachData.includes('productionWorkspace'), 'Coach workspace must consume the server-scoped production snapshot');
assert(portalClient.includes('assertCoachSessionMatchesServer'), 'Coach client must validate the persisted session against server binding');
assert(portalClient.includes("removeItem(COACH_PRODUCTION_SESSION_KEY)"), 'Coach binding mismatch must clear the stale production session');
for (const marker of ['assignedGroups', 'assignedPlayerIds', 'where p.id = any($1)', 'where s.group_id = any($1)', 'where sender_uid = $1 or recipient_uid = $1']) {
  assert(portalRepo.includes(marker), `Coach portal repository missing scoped marker: ${marker}`);
}
for (const marker of [
  'where player_id = $1',
  "where owner_type = 'player' and owner_id = $1",
  'where recipient_uid = $1',
  'const isPlayerSelf =',
  'playerRow.user_uid === ctx.uid',
  'ctx.bindings.playerIds.includes(playerId)',
]) {
  assert(portalRepo.includes(marker), `Player production repository missing privacy/scope marker: ${marker}`);
}
assert(portalRepo.includes("where sender_uid = $1 or recipient_uid = $1"), 'Portal messages must be identity scoped');
assert(portalRepo.includes('user_uid = $2'), 'Parent/Coach portal records must verify the authenticated uid');

for (const marker of ['StoreAccountBoundary', 'ConnectedAccountPage', 'ConnectedOrdersPage', 'ConnectedOrderDetailPage', 'ConnectedAddressesPage', 'ConnectedNotificationsPage', 'ConnectedWishlistPage', 'ConnectedPaymentMethodsPage', 'ConnectedSettingsPage']) {
  assert(storeApp.includes(marker), `Store account closure missing ${marker}`);
}
assert.equal(/[{,\s]OrderDetailPage[,}\s]/.test(storeApp), false, 'Authenticated order detail must use the account-scoped page, not the static snapshot');
assert.equal(/[{,\s]PaymentMethodsPage[,}\s]/.test(storeApp), false, 'Authenticated payment methods must use the account-scoped page');
assert.equal(/[{,\s]StoreSettingsPage[,}\s]/.test(storeApp), false, 'Authenticated settings must use the account-scoped page');
assert(storeAccountRepo.includes('where customer_uid = $1'), 'Store orders must be scoped by verified customer uid');
assert(storeAccountRepo.includes('[ctx.uid]'), 'Store account query must bind ctx.uid');
assert(dbIndex.includes('statement_timeout: statementTimeout'), 'Production pool must enforce a server-side PostgreSQL statement timeout');
assert(dbIndex.includes('SQL_STATEMENT_TIMEOUT_MS'), 'PostgreSQL statement timeout must be configurable');

assert(runtimeTimeout.includes('BODY_METHODS'), 'Fetch timeout must remain active through response body methods');
assert(runtimeTimeout.includes('fetchJsonWithRuntimeTimeout'), 'Shared JSON fetch timeout helper is required');
assert(runtimeTimeout.includes('controller.abort()'), 'Fetch deadline must cancel the underlying request');

const realQa = workflow.indexOf('Real production portal runtime smoke');
const previewQa = workflow.indexOf('QA production build with explicit preview providers');
assert(realQa >= 0 && previewQa >= 0 && realQa < previewQa, 'Real production QA must run before preview flags');
for (const route of ['/player/login', '/player', '/parent/login', '/parent', '/coach/login', '/coach', '/store/login', '/store/account', '/admin/login']) {
  assert(smoke.includes(`'${route}'`), `Production runtime smoke missing ${route}`);
}
assert(smoke.includes('AbortSignal.timeout(5_000)'), 'Production readiness probe must have a per-request timeout');
assert(smoke.includes('[data-route-loading="true"]'), 'Production QA must detect persistent route loaders');
assert(smoke.includes('runtimeErrors'));
assert(smoke.includes('failedRequests'));
assert(smoke.includes('badResponses'));

console.log('Portal runtime closure contract passed.');