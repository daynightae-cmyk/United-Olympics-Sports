import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const supabaseSource = await readFile(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8');
const authClientSource = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const authPageSource = await readFile(new URL('../src/components/auth/PortalAuthPage.tsx', import.meta.url), 'utf8');
const loginRouteSource = await readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8');
const setupSource = await readFile(new URL('../src/components/auth/PasskeySetupPage.tsx', import.meta.url), 'utf8');
const routerSource = await readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8');
const policySource = await readFile(new URL('../src/components/auth/portalAuthPolicy.ts', import.meta.url), 'utf8');

assert.match(supabaseSource, /experimental:\s*\{\s*passkey:\s*true/);
assert.match(authClientSource, /supabase\.auth\.signInWithPasskey\(\)/);
assert.match(authClientSource, /supabase\.auth\.registerPasskey\(\)/);
assert.match(authClientSource, /supabase\.auth\.passkey\.list\(\)/);
assert.match(authClientSource, /supabase\.auth\.passkey\.delete\(\{ passkeyId \}\)/);
assert.match(authClientSource, /isUserVerifyingPlatformAuthenticatorAvailable/);

assert.match(authPageSource, /'passkey' \| 'biometric'/);
assert.match(authPageSource, /handleProvider\('passkey'\)/);
assert.match(authPageSource, /handleProvider\('biometric'\)/);
assert.match(authPageSource, /\/auth\/passkeys\?returnTo=/);

assert.match(loginRouteSource, /provider === 'passkey' \|\| provider === 'biometric'/);
assert.match(loginRouteSource, /fetchServerSession\(accessToken\)/);
assert.match(loginRouteSource, /isPlatformAuthenticatorAvailable/);
assert.match(loginRouteSource, /passkey_disabled/);

assert.match(setupSource, /registerSupabasePasskey/);
assert.match(setupSource, /listSupabasePasskeys/);
assert.match(setupSource, /deleteSupabasePasskey/);
assert.match(setupSource, /Your fingerprint, Face ID, Windows Hello PIN/);
assert.equal(setupSource.includes('navigator.credentials.create('), false, 'biometric material must stay behind the WebAuthn/Supabase API');
assert.match(routerSource, /path="\/auth\/passkeys"/);
assert.equal(policySource.includes("'passkey',"), false, 'passkey remains dormant until the external provider is proven end to end');
assert.equal(policySource.includes("'biometric',"), false, 'biometric remains dormant until every portal contract is proven end to end');

console.log('passkey-auth-contract: PASS');
