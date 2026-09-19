import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { safeReturnTo } from '../src/lib/auth-routing.ts';
import {
  identityFromFirebaseDecoded,
  identityFromSupabaseUser,
  resolveAuthorization,
  type VerifiedIdentity,
} from '../src/server/auth.ts';

assert.equal(safeReturnTo('/player/home'), '/player/home');
assert.equal(safeReturnTo('/store/orders?status=paid#latest'), '/store/orders?status=paid#latest');
assert.equal(safeReturnTo('https://evil.example'), '/');
assert.equal(safeReturnTo('//evil.example/path'), '/');
assert.equal(safeReturnTo('/\\\\evil.example'), '/');
assert.equal(safeReturnTo('/%5C%5Cevil.example'), '/');
assert.equal(safeReturnTo(' /admin'), '/');
assert.equal(safeReturnTo('/admin\n/evil'), '/');

const firebaseIdentity = identityFromFirebaseDecoded({
  uid: 'firebase-user-1',
  email: 'admin-claim@example.com',
  role: 'admin',
  roles: ['super_admin'],
  admin: true,
  scopes: ['*'],
} as unknown as { uid: string; email?: string | null });
assert.deepEqual(firebaseIdentity, {
  provider: 'firebase',
  subject: 'firebase-user-1',
  uid: 'firebase-user-1',
  email: 'admin-claim@example.com',
});

const supabaseIdentity = identityFromSupabaseUser({
  id: '11111111-2222-3333-4444-555555555555',
  email: 'google-user@example.com',
  app_metadata: { role: 'admin', roles: ['super_admin'] },
  user_metadata: { admin: true, scopes: ['*'] },
} as unknown as { id: string; email?: string | null });
assert.deepEqual(supabaseIdentity, {
  provider: 'supabase',
  subject: '11111111-2222-3333-4444-555555555555',
  uid: 'supabase:11111111-2222-3333-4444-555555555555',
  email: 'google-user@example.com',
});

const dbEnvironment = {
  DATABASE_URL: process.env.DATABASE_URL,
  SQL_HOST: process.env.SQL_HOST,
  SQL_DB_NAME: process.env.SQL_DB_NAME,
  SQL_USER: process.env.SQL_USER,
  SQL_ADMIN_USER: process.env.SQL_ADMIN_USER,
  SQL_PASSWORD: process.env.SQL_PASSWORD,
  SQL_ADMIN_PASSWORD: process.env.SQL_ADMIN_PASSWORD,
};
for (const key of Object.keys(dbEnvironment)) delete process.env[key];

const forgedAuthorization: VerifiedIdentity = {
  ...firebaseIdentity,
  roles: ['admin', 'super_admin'],
  scopes: ['*'],
};
const resolvedWithoutServerData = await resolveAuthorization(forgedAuthorization);
assert.deepEqual(resolvedWithoutServerData.roles, []);
assert.deepEqual(resolvedWithoutServerData.scopes, []);

for (const [key, value] of Object.entries(dbEnvironment)) {
  if (value !== undefined) process.env[key] = value;
}

const serverAuthSource = await readFile(new URL('../src/server/auth.ts', import.meta.url), 'utf8');
for (const forbidden of ['decoded.role', 'decoded.roles', 'decoded.admin', 'decoded.scopes']) {
  assert.equal(serverAuthSource.includes(forbidden), false, `server auth must not authorize from ${forbidden}`);
}

const callbackSource = await readFile(new URL('../src/components/auth/AuthCallbackPage.tsx', import.meta.url), 'utf8');
const routerSource = await readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8');
const serverRoutesSource = await readFile(new URL('../src/server/routes.ts', import.meta.url), 'utf8');
const portalBindingsSource = await readFile(new URL('../src/server/portal-bindings.ts', import.meta.url), 'utf8');
const adminGateSource = await readFile(new URL('../src/portals/admin/AdminAccessGate.tsx', import.meta.url), 'utf8');
const supabaseClientSource = await readFile(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8');
const authClientSource = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const playerGatewaySource = await readFile(new URL('../src/portals/player/auth/PlayerAuthGateway.ts', import.meta.url), 'utf8');
const playerProtectedSource = await readFile(new URL('../src/portals/player/PlayerProtectedRoute.tsx', import.meta.url), 'utf8');
const parentLoginSource = await readFile(new URL('../src/portals/parent/ParentLoginPage.tsx', import.meta.url), 'utf8');
const parentRouterSource = await readFile(new URL('../src/portals/ParentPortalRouter.tsx', import.meta.url), 'utf8');
const coachLoginSource = await readFile(new URL('../src/portals/coach/CoachLoginPage.tsx', import.meta.url), 'utf8');
const coachProtectedSource = await readFile(new URL('../src/portals/coach/CoachProtectedRoute.tsx', import.meta.url), 'utf8');
const coachContextSource = await readFile(new URL('../src/portals/coach/CoachSessionContext.tsx', import.meta.url), 'utf8');
const playerLoginSource = await readFile(new URL('../src/portals/player/auth/PlayerLoginPage.tsx', import.meta.url), 'utf8');

assert.match(routerSource, /path="\/auth\/callback"/);
assert.match(callbackSource, /exchangeSupabaseAuthCode/);
assert.match(callbackSource, /fetchPortalIdentity/);
assert.match(adminGateSource, /route=admin-whoami/);
assert.match(serverRoutesSource, /portal-whoami/);
assert.match(portalBindingsSource, /players[\s\S]*user_uid = \$1/);
assert.match(portalBindingsSource, /guardians[\s\S]*user_uid = \$1/);
assert.match(portalBindingsSource, /coaches[\s\S]*user_uid = \$1/);
assert.match(portalBindingsSource, /player_guardians[\s\S]*pg\.active = true/);
assert.equal(/where[\s\S]{0,120}email\s*=\s*\$1/i.test(portalBindingsSource), false, 'portal bindings must not guess identity from email');
assert.match(playerGatewaySource, /fetchPortalIdentity/);
assert.match(parentLoginSource, /fetchPortalIdentity/);
assert.match(coachLoginSource, /fetchPortalIdentity/);
assert.match(authClientSource, /fetchJsonWithRuntimeTimeout/, 'production identity JSON calls must remain bounded through response-body consumption');

function assertContiguousMountRevalidation(name: string, source: string, clearFn: string): void {
  const mountEffect = source.match(/useEffect\(\(\) => \{[\s\S]*?getAccessToken\(\)[\s\S]*?fetchPortalIdentity[\s\S]*?return \(\) => \{[\s\S]*?\}, \[navigate\]\)/);
  assert.ok(mountEffect, `${name} must contain a single mount effect that orders getAccessToken → fetchPortalIdentity → fail-closed cleanup`);
  const block = mountEffect[0];
  const tokenIdx = block.indexOf('getAccessToken');
  const identityIdx = block.indexOf('fetchPortalIdentity');
  const clearIdx = block.indexOf(clearFn);
  assert.ok(tokenIdx !== -1 && identityIdx !== -1 && clearIdx !== -1, `${name} mount effect must contain getAccessToken, fetchPortalIdentity, and ${clearFn}`);
  assert.ok(tokenIdx < identityIdx && identityIdx < clearIdx, `${name} mount effect must order getAccessToken → fetchPortalIdentity → ${clearFn} in the same control flow`);
  assert.ok(/}, \[navigate\]\)/.test(block), `${name} mount revalidation must be a mount effect with [navigate] deps`);
}
assertContiguousMountRevalidation('parent login', parentLoginSource, 'clearParentSession');
assertContiguousMountRevalidation('coach login', coachLoginSource, 'clearCoachProductionSession');
assertContiguousMountRevalidation('player login', playerLoginSource, 'clearPlayerProductionSession');
assert.match(parentLoginSource, /readParentSession/, 'parent login must read the persisted production session');
assert.match(parentLoginSource, /clearParentSession/, 'parent login must clear stale or mismatched bindings');
assert.match(parentLoginSource, /startParentProduction/, 'parent login must refresh scope before redirecting a valid session');
assert.match(coachLoginSource, /uos:coach-portal:session:v1/, 'coach login must revalidate the persisted production session key');
assert.match(playerLoginSource, /uos:player-portal:session/, 'player login must revalidate the persisted production session key');

for (const [name, source] of [
  ['player protected route', playerProtectedSource],
  ['parent protected route', parentRouterSource],
] as const) {
  assert.match(source, /fetchPortalIdentity/, `${name} must revalidate persisted production sessions`);
  assert.match(source, /VITE_UOS_ADMIN_PREVIEW/, `${name} must not trust preview sessions in an ordinary production build`);
}

assert.match(coachContextSource, /fetchCoachPortalScope/, 'coach production session must be revalidated by the authenticated scoped endpoint');
assert.match(coachContextSource, /mode !== 'preview'/, 'coach preview sessions must be rejected outside the preview data provider');
assert.match(coachContextSource, /uos:coach-portal:session:v1/, 'coach scoped revalidation must be anchored to the persisted production session');
assert.equal(coachProtectedSource.includes('usePlayers('), false, 'coach protected route must not enumerate global player data');
assert.match(coachProtectedSource, /authorizedPlayerIds/, 'coach protected route must enforce server-issued player scope');

assert.match(supabaseClientSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.equal(`${supabaseClientSource}\n${authClientSource}`.includes('service_role'), false);

console.log('auth-contracts: PASS');
