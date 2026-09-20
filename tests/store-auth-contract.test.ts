import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isStoreAuthPath, resolvePortalPostSignInDestination, resolveStorePostSignInDestination } from '../src/lib/store-auth-routing.ts';
import { RuntimeTimeoutError, withRuntimeTimeoutGuarded } from '../src/lib/runtime-timeout.ts';
import { createAsyncExclusiveRunner, shouldClearLateSession } from '../src/lib/late-session-guard.ts';

const authClient = await readFile(new URL('../src/lib/auth-client.ts', import.meta.url), 'utf8');
const loginRoute = await readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8');
const authPage = await readFile(new URL('../src/components/auth/PortalAuthPage.tsx', import.meta.url), 'utf8');
const appRouter = await readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8');
const storeLoginCss = await readFile(new URL('../src/styles/store-login-reference.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const providerPolicy = await readFile(new URL('../src/components/auth/portalAuthPolicy.ts', import.meta.url), 'utf8');

assert.ok(authClient.includes('supabase.auth.signInWithPassword'), 'existing Supabase password capability must remain available to authenticated account workflows');
assert.equal(loginRoute.includes('onCredentials='), false, 'store login must use the same public provider policy as every portal');
assert.ok(loginRoute.includes('fetchServerSession(accessToken)'), 'session-establishing provider flows must establish the server session');
assert.ok(loginRoute.includes('resolveStorePostSignInDestination'), 'store login must honor the protected return destination');
assert.ok(authClient.includes('withRuntimeTimeoutGuarded'), 'password sign-in must guard against late success after timeout');
assert.ok(authClient.includes("signOut({ scope: 'local' })"), 'late password success must clear the stray local session');
assert.ok(authClient.includes('shouldClearLateSession'), 'late cleanup must not clear a session created by a newer attempt');
assert.ok(appRouter.includes('(admin|player|parent|coach|store)'), 'all portal login routes must share one overlay boundary');
assert.ok(appRouter.includes('!isPortalAuthRoute'), 'store login must not mount internal assistant/update overlays');
assert.match(providerPolicy, /'google'/, 'Google must be the shared production provider');
assert.equal(providerPolicy.includes("'passkey',"), false, 'unverified passkey must not be exposed by production policy');
assert.equal(providerPolicy.includes("'biometric',"), false, 'unverified biometric must not be exposed by production policy');
assert.equal(providerPolicy.includes("'apple',"), false, 'Apple must not be exposed inconsistently');
assert.equal(providerPolicy.includes("'phone',"), false, 'Phone must not be exposed inconsistently');
assert.ok(authPage.includes('<nav className="portal-auth-switcher"'), 'every portal must expose the shared portal destination switcher');
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

// Executable behavior: portal sign-in preserves guarded deep links within
// the same portal and falls back safely for everything else.
assert.equal(resolvePortalPostSignInDestination('coach', '/coach/schedule', '/coach/home'), '/coach/schedule', 'coach deep link preserved');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach/players/p1', '/coach/home'), '/coach/players/p1', 'coach detail preserved');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach', '/coach/home'), '/coach', 'coach root preserved');
assert.equal(resolvePortalPostSignInDestination('parent', '/parent/payments', '/parent'), '/parent/payments', 'parent deep link preserved');
assert.equal(resolvePortalPostSignInDestination('player', '/player/schedule', '/player/home'), '/player/schedule', 'player deep link preserved');
assert.equal(resolvePortalPostSignInDestination('admin', '/admin/users', '/admin'), '/admin/users', 'admin deep link preserved');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach/login', '/coach/home'), '/coach/home', 'login route must not become a target');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach/login/', '/coach/home'), '/coach/home', 'login slash variant must not become a target');
assert.equal(resolvePortalPostSignInDestination('coach', '/player/home', '/coach/home'), '/coach/home', 'cross-portal path must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', '/store/orders', '/coach/home'), '/coach/home', 'store path must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', 'https://evil.example/coach/schedule', '/coach/home'), '/coach/home', 'external URL must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', '//evil.example/coach/schedule', '/coach/home'), '/coach/home', 'protocol-relative URL must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach2/schedule', '/coach/home'), '/coach/home', 'prefix-sibling path must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', '/coach//schedule', '/coach/home'), '/coach/home', 'doubled slash must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', undefined, '/coach/home'), '/coach/home', 'missing destination must fall back');
assert.equal(resolvePortalPostSignInDestination('coach', null, '/coach/home'), '/coach/home', 'null destination must fall back');

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

// Executable behavior: a late password response may clear only its own stray
// session, never a session created by a newer attempt (retry, passkey, OAuth).
assert.equal(shouldClearLateSession(3, 3, 'late-token', 'late-token'), true, 'own stray session must be cleared');
assert.equal(shouldClearLateSession(3, 4, 'late-token', 'late-token'), false, 'retry attempt owns the current session');
assert.equal(shouldClearLateSession(3, 3, 'late-token', 'retry-token'), false, 'newer session token must be preserved');
assert.equal(shouldClearLateSession(3, 3, 'late-token', null), false, 'missing current session must not sign out');
assert.equal(shouldClearLateSession(3, 3, null, 'late-token'), false, 'missing late token must not sign out');
assert.equal(shouldClearLateSession(3, 3, '', ''), false, 'empty tokens must not sign out');

// Executable behavior: Supabase session mutation critical section is FIFO and
// prevents a late cleanup from interleaving with a newer session write.
{
  const runExclusive = createAsyncExclusiveRunner();
  const order: string[] = [];
  let releaseFirst!: () => void;
  const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });

  const first = runExclusive(async () => {
    order.push('first:start');
    await firstGate;
    order.push('first:end');
  });
  const second = runExclusive(async () => {
    order.push('second');
  });

  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(order, ['first:start'], 'second session mutation must wait for the active owner');
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(order, ['first:start', 'first:end', 'second'], 'session mutations must remain FIFO');
}
{
  const runExclusive = createAsyncExclusiveRunner();
  let currentToken: string | null = 'initial';
  let releaseLate!: () => void;
  const lateGate = new Promise<void>((resolve) => { releaseLate = resolve; });

  const lateAttempt = runExclusive(async () => {
    await lateGate;
    currentToken = 'late-token';
  });
  const newerAttempt = runExclusive(async () => {
    currentToken = 'newer-token';
  });

  releaseLate();
  await lateAttempt;
  await newerAttempt;

  await runExclusive(async () => {
    if (shouldClearLateSession(3, 4, 'late-token', currentToken)) currentToken = null;
  });

  assert.equal(currentToken, 'newer-token', 'late cleanup must preserve a newer serialized session');
}

console.log('Store auth contract: PASS');
