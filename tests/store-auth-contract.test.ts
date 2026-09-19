import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isStoreAuthPath, resolveStorePostSignInDestination } from '../src/lib/store-auth-routing.ts';
import { RuntimeTimeoutError, withRuntimeTimeoutGuarded } from '../src/lib/runtime-timeout.ts';

const authClient = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const loginRoute = await readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8');
const authPage = await readFile(new URL('../src/components/auth/PortalAuthPage.tsx', import.meta.url), 'utf8');
const appRouter = await readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8');
const storeLoginCss = await readFile(new URL('../src/styles/store-login-reference.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');

assert.ok(authClient.includes('supabase.auth.signInWithPassword'), 'store email/password must use Supabase password auth');
assert.ok(loginRoute.includes("onCredentials={portal === 'store' ? handleCredentials : undefined}"), 'store login must wire real credential handler');
assert.ok(loginRoute.includes('fetchServerSession(accessToken)'), 'credential sign-in must establish the server session');
assert.ok(loginRoute.includes('resolveStorePostSignInDestination'), 'store login must honor the protected return destination');
assert.ok(authClient.includes('withRuntimeTimeoutGuarded'), 'password sign-in must guard against late success after timeout');
assert.ok(authClient.includes("signOut({ scope: 'local' })"), 'late password success must clear the stray local session');
assert.ok(appRouter.includes('isStoreAuthPath(pathname)'), 'store login must be identifiable as an auth route');
assert.ok(appRouter.includes('!isStoreAuthRoute'), 'store login must not mount internal assistant/update overlays');
assert.ok(authPage.includes(`portal !== 'store' && <button type="button" onClick={() => handleProvider('phone')}`), 'unconfigured phone provider must be hidden from store login');
assert.ok(authPage.includes(`portal !== 'store' && <button type="button" onClick={() => handleProvider('apple')}`), 'unconfigured Apple provider must be hidden from store login');
assert.ok(authPage.includes(`portal !== 'store' && <nav className="portal-auth-switcher"`), 'cross-portal switcher must stay off the retail login');
assert.ok(storeLoginCss.includes(".portal-auth[data-portal='store']"), 'store login must have isolated retail visual authority');
assert.ok(main.includes("import './styles/store-login-reference.css';"), 'store login visual authority must load globally');

// Executable behavior: store auth route identity stays trailing-slash safe.
assert.equal(isStoreAuthPath('/store/login'), true, '/store/login is the store auth route');
assert.equal(isStoreAuthPath('/store/login/'), true, '/store/login/ must also suppress overlays');
assert.equal(isStoreAuthPath('/store'), false, 'store home is not an auth route');
assert.equal(isStoreAuthPath('/store/shop'), false, 'store shop is not an auth route');
assert.equal(isStoreAuthPath('/store/login/help'), false, 'nested login path is not the auth route');
assert.equal(isStoreAuthPath('/admin/login'), false, 'admin login is not the store auth route');

// Executable behavior: post-sign-in redirect honors protected account
// destinations and falls back safely for everything else.
assert.equal(resolveStorePostSignInDestination('/store/account'), '/store/account', 'account destination preserved');
assert.equal(resolveStorePostSignInDestination('/store/orders'), '/store/orders', 'orders destination preserved');
assert.equal(resolveStorePostSignInDestination('/store/wishlist'), '/store/wishlist', 'wishlist destination preserved');
assert.equal(resolveStorePostSignInDestination('/store/addresses'), '/store/addresses', 'addresses destination preserved');
assert.equal(resolveStorePostSignInDestination('/store/order/abc123'), '/store/order/abc123', 'order detail destination preserved');
assert.equal(resolveStorePostSignInDestination('/store/cart'), '/store/account', 'public cart must not become a redirect target');
assert.equal(resolveStorePostSignInDestination('/store/checkout'), '/store/account', 'public checkout must not become a redirect target');
assert.equal(resolveStorePostSignInDestination('/store'), '/store/account', 'store home must not become a redirect target');
assert.equal(resolveStorePostSignInDestination('https://evil.example/store/orders'), '/store/account', 'external URL must fall back');
assert.equal(resolveStorePostSignInDestination('//evil.example/store/orders'), '/store/account', 'protocol-relative URL must fall back');
assert.equal(resolveStorePostSignInDestination('/store/order/'), '/store/account', 'order route without id must fall back');
assert.equal(resolveStorePostSignInDestination('/store/orders?status=paid'), '/store/account', 'query-suffixed value must fall back');
assert.equal(resolveStorePostSignInDestination(undefined), '/store/account', 'missing destination must fall back');
assert.equal(resolveStorePostSignInDestination(null), '/store/account', 'null destination must fall back');
assert.equal(resolveStorePostSignInDestination({ from: '/store/orders' }), '/store/account', 'non-string destination must fall back');

// Executable behavior: timeout guard keeps working promises intact,
// rejects on deadline, and reports late settlements for cleanup.
{
  let lateCalls = 0;
  const value = await withRuntimeTimeoutGuarded('store-auth-fast', Promise.resolve('token'), 1000, () => { lateCalls += 1; });
  assert.equal(value, 'token', 'on-time success must resolve with the value');
  assert.equal(lateCalls, 0, 'on-time success must not trigger late cleanup');
}
{
  await assert.rejects(
    withRuntimeTimeoutGuarded('store-auth-hung', new Promise(() => {}), 20),
    (error: unknown) => error instanceof RuntimeTimeoutError,
    'a hung request must reject with RuntimeTimeoutError',
  );
}
{
  let reported: unknown = null;
  const deferred = new Promise<string>((resolve) => setTimeout(() => resolve('late-token'), 60));
  await assert.rejects(
    withRuntimeTimeoutGuarded('store-auth-late', deferred, 20, (result) => { reported = result; }),
    (error: unknown) => error instanceof RuntimeTimeoutError,
    'a late success must still reject with RuntimeTimeoutError',
  );
  await deferred;
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(reported, { status: 'fulfilled', value: 'late-token' }, 'late success must be reported for session cleanup');
}
{
  let reported: unknown = null;
  const deferred = new Promise<string>((_, reject) => setTimeout(() => reject(new Error('late-boom')), 60));
  await assert.rejects(
    withRuntimeTimeoutGuarded('store-auth-late-failure', deferred, 20, (result) => { reported = result; }),
    (error: unknown) => error instanceof RuntimeTimeoutError,
    'a late failure must still reject with RuntimeTimeoutError',
  );
  await deferred.catch(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(
    typeof reported === 'object' && reported !== null && 'status' in reported
      ? (reported as { status: string }).status
      : null,
    'rejected',
    'late failure must be reported without throwing',
  );
}

console.log('Store auth contract: PASS');
