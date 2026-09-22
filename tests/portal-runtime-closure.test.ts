import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InlineActionLoader, RouteLoadingExperience, UosSectionSkeleton } from '../src/components/loading/UosLoadingSystem';
import { UiSettingsProvider } from '../src/ui/theme/UiSettingsProvider';

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
  read('src/components/loading/UosLoadingSystem.tsx'),
  read('src/components/portal/PortalRouteState.tsx'),
  read('src/styles/uos-loading-system.css'),
  read('src/app/AppRouter.tsx'),
  read('src/portals/admin/AdminAccessGate.tsx'),
  read('src/portals/PlayerPortalRouter.tsx'),
  read('src/portals/ParentPortalRouter.tsx'),
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
  loadingSystem,
  portalRouteState,
  loadingStyles,
  appRouter,
  adminAccessGate,
  playerRouter,
  parentRouter,
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

// UOS FIELD PULSE — route, section, and action loading hierarchy.
const withUiSettings = (child: ReactElement) =>
  renderToStaticMarkup(createElement(UiSettingsProvider, null, child));
for (const [portal, english, arabic] of [
  ['player', 'Preparing your athlete workspace', 'جارِ تجهيز مساحة اللاعب'],
  ['parent', 'Preparing your family sports workspace', 'جارِ تجهيز مساحة الأسرة الرياضية'],
  ['coach', 'Preparing your training workspace', 'جارِ تجهيز مساحة التدريب'],
  ['admin', 'Preparing the operations command center', 'جارِ تجهيز مركز العمليات'],
] as const) {
  const markup = withUiSettings(createElement(RouteLoadingExperience, { portal }));
  assert(markup.includes('data-loading-system="uos-field-pulse"'), `${portal} route loader must render the canonical Field Pulse system`);
  assert(markup.includes('data-loading-level="route"'), `${portal} route loader must declare route-level loading`);
  assert(markup.includes('aria-live="polite"') && markup.includes('aria-busy="true"'), `${portal} route loader must expose stable progress semantics`);
  assert(markup.includes(english) && markup.includes(arabic), `${portal} route loader must render contextual bilingual copy`);
  assert.equal(/player-demo|coach-preview|parent-preview|athlete name/i.test(markup), false, `${portal} loading must not expose private records`);
}
const sectionMarkup = withUiSettings(createElement(UosSectionSkeleton, { kind: 'table', rows: 4 }));
assert(sectionMarkup.includes('data-loading-level="section"'), 'Section skeleton must declare section-level loading');
assert.equal((sectionMarkup.match(/uos-section-skeleton__item/g) ?? []).length, 4, 'Section skeleton must preserve the requested table row geometry');
const actionMarkup = withUiSettings(createElement(InlineActionLoader));
assert(actionMarkup.includes('data-loading-level="action"'), 'Inline loader must declare action-level loading');

for (const marker of ['player:', 'parent:', 'coach:', 'admin:', 'generic:', 'UosFieldPulse', 'UosSectionSkeleton', 'InlineActionLoader']) {
  assert(loadingSystem.includes(marker), `Canonical loading system missing ${marker}`);
}
assert.equal(loadingSystem.includes('LoaderCircle'), false, 'Canonical loader must not fall back to a generic loading wheel');
assert(portalRouteState.includes('RouteLoadingExperience'), 'Shared portal loading must delegate to the canonical loading experience');
assert(appRouter.includes('!isLoginRoute'), 'Top-level portal loading must explicitly preserve the Auth/Login visual boundary');
assert(adminAccessGate.includes('PortalRouteLoader portal="admin"'), 'Admin access initialization must use the operations loader');
assert(playerRouter.includes('PortalRouteLoader portal="player" contained'), 'Player lazy modules must use a contained athlete loader');
assert(parentRouter.includes('PortalRouteLoader portal="parent" contained'), 'Parent lazy modules must use a contained family loader');
assert(loadingStyles.includes('@media (prefers-reduced-motion: reduce)'), 'Loading motion must honor the OS reduced-motion preference');
assert(loadingStyles.includes("html[data-motion='reduced']"), 'Loading motion must honor the product reduced-motion setting');
assert(loadingStyles.includes("[dir='rtl'] .uos-loading-stage__telemetry"), 'RTL loading telemetry must have an intentional structure');
assert(loadingStyles.includes('env(safe-area-inset-top'), 'Mobile loader must be safe-area aware');
assert(playerGuard.includes('if (error || validationError)') && playerGuard.includes('PortalRuntimeError'), 'Player failure must transition to a terminal error instead of loading forever');
assert(playerGuard.includes('return <>{children}</>'), 'Player loading must transition to resolved route content');
assert(portalRouteState.includes('data-route-terminal="error"'), 'Shared loader failures must expose a terminal error state');

console.log('Portal runtime closure contract passed.');
