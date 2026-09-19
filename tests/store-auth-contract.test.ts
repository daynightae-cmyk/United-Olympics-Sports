import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const authClient = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const loginRoute = await readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8');
const authPage = await readFile(new URL('../src/components/auth/PortalAuthPage.tsx', import.meta.url), 'utf8');
const appRouter = await readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8');
const storeLoginCss = await readFile(new URL('../src/styles/store-login-reference.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');

assert.ok(authClient.includes('supabase.auth.signInWithPassword'), 'store email/password must use Supabase password auth');
assert.ok(loginRoute.includes("onCredentials={portal === 'store' ? handleCredentials : undefined}"), 'store login must wire real credential handler');
assert.ok(loginRoute.includes('fetchServerSession(accessToken)'), 'credential sign-in must establish the server session');
assert.ok(appRouter.includes("pathname === '/store/login'"), 'store login must be identifiable as an auth route');
assert.ok(appRouter.includes('!isStoreAuthRoute'), 'store login must not mount internal assistant/update overlays');
assert.ok(authPage.includes(`portal !== 'store' && <button type="button" onClick={() => handleProvider('phone')}`), 'unconfigured phone provider must be hidden from store login');
assert.ok(authPage.includes(`portal !== 'store' && <button type="button" onClick={() => handleProvider('apple')}`), 'unconfigured Apple provider must be hidden from store login');
assert.ok(authPage.includes(`portal !== 'store' && <nav className="portal-auth-switcher"`), 'cross-portal switcher must stay off the retail login');
assert.ok(storeLoginCss.includes(".portal-auth[data-portal='store']"), 'store login must have isolated retail visual authority');
assert.ok(main.includes("import './styles/store-login-reference.css';"), 'store login visual authority must load globally');

console.log('Store auth contract: PASS');
