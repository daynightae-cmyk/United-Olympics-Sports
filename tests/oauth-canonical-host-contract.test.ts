import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const authClientSource = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const loginSource = await readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8');
const callbackSource = await readFile(new URL('../src/components/auth/AuthCallbackPage.tsx', import.meta.url), 'utf8');

assert.match(authClientSource, /PRODUCTION_AUTH_APEX_HOST = 'unitedolympicsports\.store'/);
assert.match(authClientSource, /PRODUCTION_AUTH_CANONICAL_HOST = 'www\.unitedolympicsports\.store'/);
assert.match(authClientSource, /canonicalAuthPageUrl/);
assert.match(loginSource, /canonicalAuthPageUrl\(window\.location\.href\)/);
assert.match(loginSource, /window\.location\.replace\(canonicalTarget\)/);
assert.match(callbackSource, /canonicalAuthPageUrl\(window\.location\.href\)/);
assert.match(callbackSource, /OAuth callback exchange failed/);
assert.match(callbackSource, /OAuth callback server session failed/);
assert.match(callbackSource, /PKCE_VERIFIER_MISSING/);
assert.equal(callbackSource.includes('access_token'), false, 'callback diagnostics must never expose access tokens');

console.log('oauth-canonical-host-contract: PASS');
