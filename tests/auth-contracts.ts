import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  identityFromFirebaseDecoded,
  identityFromSupabaseUser,
  resolveAuthorization,
  type VerifiedIdentity,
} from '../src/server/auth.ts';

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
const parentLoginSource = await readFile(new URL('../src/portals/parent/ParentLoginPage.tsx', import.meta.url), 'utf8');
const coachLoginSource = await readFile(new URL('../src/portals/coach/CoachLoginPage.tsx', import.meta.url), 'utf8');

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
assert.match(supabaseClientSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.equal(`${supabaseClientSource}\n${authClientSource}`.includes('service_role'), false);

console.log('auth-contracts: PASS');
