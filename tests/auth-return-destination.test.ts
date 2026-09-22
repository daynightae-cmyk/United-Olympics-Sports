import assert from 'node:assert/strict';
import { safeReturnTo } from '../src/lib/auth-routing.ts';
import {
  consumeAuthReturnTo,
  peekAuthReturnTo,
  recordAuthReturnTo,
  type PortalIdentity,
  type ServerAuthSession,
} from '../src/lib/auth-client.ts';
import {
  loginRouteForDestination,
  portalFromDestination,
} from '../src/components/auth/AuthCallbackPage.tsx';
import {
  portalKindFromDestination,
  readUnlinkedPortalAccess,
  persistLinkedPortalBinding,
  clearUnlinkedPortalAccess,
  clearLinkedPortalSession,
} from '../src/portals/shared/portal-entry-access.ts';

// ============================================================================
// PART 1: safeReturnTo sanitization & loop prevention
// ============================================================================

assert.equal(safeReturnTo('/player/home'), '/player/home');
assert.equal(safeReturnTo('/coach/groups'), '/coach/groups');
assert.equal(safeReturnTo('/parent'), '/parent');
assert.equal(safeReturnTo('/store/orders?status=paid#latest'), '/store/orders?status=paid#latest');
assert.equal(safeReturnTo('/admin'), '/admin');

// External or protocol-relative URLs must fallback to '/'
assert.equal(safeReturnTo('https://evil.example'), '/');
assert.equal(safeReturnTo('http://evil.example'), '/');
assert.equal(safeReturnTo('//evil.example/path'), '/');
assert.equal(safeReturnTo('/\\\\evil.example'), '/');
assert.equal(safeReturnTo('/%5C%5Cevil.example'), '/');
assert.equal(safeReturnTo(' /admin'), '/');
assert.equal(safeReturnTo('/admin\n/evil'), '/');

// Anti-loop protection: internal auth callback URLs must never be return targets
assert.equal(safeReturnTo('/auth/callback'), '/');
assert.equal(safeReturnTo('/auth/callback?code=abc'), '/');
assert.equal(safeReturnTo('/auth/callback/extra'), '/');

// Custom fallback support
assert.equal(safeReturnTo('https://evil.example', '/coach/home'), '/coach/home');

// ============================================================================
// PART 2: Storage persistence & recovery across sessionStorage / localStorage
// ============================================================================

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

const mockSessionStorage = new MockStorage();
const mockLocalStorage = new MockStorage();

Object.defineProperty(globalThis, 'sessionStorage', { value: mockSessionStorage, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

// Record sets both storage targets
recordAuthReturnTo('/coach/groups');
assert.equal(mockSessionStorage.getItem('uos:auth:return-to'), '/coach/groups');
assert.equal(mockLocalStorage.getItem('uos:auth:return-to'), '/coach/groups');

// Peek recovers from sessionStorage when available
assert.equal(peekAuthReturnTo('/'), '/coach/groups');

// If sessionStorage is lost (e.g. cross-origin or private tab), recovers from localStorage
mockSessionStorage.clear();
assert.equal(peekAuthReturnTo('/'), '/coach/groups');

// URL search params take highest precedence
const paramsWithReturnTo = new URLSearchParams('returnTo=/player/home');
assert.equal(peekAuthReturnTo('/', paramsWithReturnTo), '/player/home');

const paramsWithNext = new URLSearchParams('next=/parent');
assert.equal(peekAuthReturnTo('/', paramsWithNext), '/parent');

const paramsWithFrom = new URLSearchParams('from=/store/orders');
assert.equal(peekAuthReturnTo('/', paramsWithFrom), '/store/orders');

// Malicious URL parameter falls through to stored value or fallback
const paramsWithEvil = new URLSearchParams('returnTo=https://evil.com');
assert.equal(peekAuthReturnTo('/', paramsWithEvil), '/coach/groups');

// Consume returns destination and clears BOTH storages
const consumed = consumeAuthReturnTo('/');
assert.equal(consumed, '/coach/groups');
assert.equal(mockSessionStorage.getItem('uos:auth:return-to'), null);
assert.equal(mockLocalStorage.getItem('uos:auth:return-to'), null);

// Subsequent peek falls back to default
assert.equal(peekAuthReturnTo('/'), '/');

// ============================================================================
// PART 3: Portal Destination & Route Classification
// ============================================================================

assert.equal(portalFromDestination('/coach/groups'), 'coach');
assert.equal(portalFromDestination('/player/home'), 'player');
assert.equal(portalFromDestination('/parent'), 'parent');
assert.equal(portalFromDestination('/store/account'), 'store');
assert.equal(portalFromDestination('/admin/users'), 'admin');

// CRITICAL: Root ('/') or missing destination must resolve to 'neutral', NEVER 'admin'
assert.equal(portalFromDestination('/'), 'neutral');
assert.equal(portalFromDestination(''), 'neutral');
assert.equal(portalFromDestination('/about'), 'neutral');

// Login routes
assert.equal(loginRouteForDestination('/coach/groups'), '/coach/login');
assert.equal(loginRouteForDestination('/player/home'), '/player/login');
assert.equal(loginRouteForDestination('/parent'), '/parent/login');
assert.equal(loginRouteForDestination('/store/orders'), '/store/login');
assert.equal(loginRouteForDestination('/admin'), '/admin/login');
// CRITICAL: Root ('/') must resolve to '/', NEVER '/admin/login'
assert.equal(loginRouteForDestination('/'), '/');

// Open portal kinds
assert.equal(portalKindFromDestination('/coach/groups'), 'coach');
assert.equal(portalKindFromDestination('/player/schedule'), 'player');
assert.equal(portalKindFromDestination('/parent'), 'parent');
assert.equal(portalKindFromDestination('/store/account'), null);
assert.equal(portalKindFromDestination('/admin'), null);
assert.equal(portalKindFromDestination('/'), null);

// ============================================================================
// PART 4: Open Portal Entry Policy & Safe Unlinked Access
// ============================================================================

// Clean portal state
clearUnlinkedPortalAccess('coach');
clearLinkedPortalSession('coach');

const unboundIdentity: PortalIdentity = {
  identity: { uid: 'supabase:user-unbound-123', provider: 'supabase', email: 'unbound@example.com' },
  roles: [],
  scopes: [],
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// When an unbound user visits an open portal (/coach/groups), persistLinkedPortalBinding
// must safely mark unlinked access and NOT throw or require admin role
const coachBindingResult = persistLinkedPortalBinding('/coach/groups', unboundIdentity);
assert.equal(coachBindingResult.linked, false);
assert.equal(coachBindingResult.reason, 'not-linked');

// Unlinked access marker is now readable for the coach portal
const coachUnlinked = readUnlinkedPortalAccess('coach');
assert.notEqual(coachUnlinked, null);
assert.equal(coachUnlinked?.portal, 'coach');
assert.equal(coachUnlinked?.reason, 'not-linked');
assert.equal(coachUnlinked?.provider, 'supabase');

// Same for player portal
clearUnlinkedPortalAccess('player');
clearLinkedPortalSession('player');
const playerBindingResult = persistLinkedPortalBinding('/player/home', unboundIdentity);
assert.equal(playerBindingResult.linked, false);
assert.equal(playerBindingResult.reason, 'not-linked');
const playerUnlinked = readUnlinkedPortalAccess('player');
assert.notEqual(playerUnlinked, null);
assert.equal(playerUnlinked?.portal, 'player');

// Same for parent portal
clearUnlinkedPortalAccess('parent');
clearLinkedPortalSession('parent');
const parentBindingResult = persistLinkedPortalBinding('/parent', unboundIdentity);
assert.equal(parentBindingResult.linked, false);
assert.equal(parentBindingResult.reason, 'not-linked');
const parentUnlinked = readUnlinkedPortalAccess('parent');
assert.notEqual(parentUnlinked, null);
assert.equal(parentUnlinked?.portal, 'parent');

// ============================================================================
// PART 5: Bound Portal Linking
// ============================================================================

const boundCoachIdentity: PortalIdentity = {
  identity: { uid: 'supabase:coach-1', provider: 'supabase', email: 'coach@example.com' },
  roles: [],
  scopes: [],
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-record-456'],
    coachGroupIds: ['group-1'],
    coachPlayerIds: ['player-1'],
  },
};

const boundResult = persistLinkedPortalBinding('/coach/groups', boundCoachIdentity);
assert.equal(boundResult.linked, true);
assert.equal((boundResult as { linked: true; recordId: string }).recordId, 'coach-record-456');

// Coach production session is now in localStorage
const storedCoachSession = mockLocalStorage.getItem('uos:coach-portal:session:v1');
assert.notEqual(storedCoachSession, null);
assert.match(storedCoachSession!, /coach-record-456/);

// ============================================================================
// PART 6: Admin Gate Strictness
// ============================================================================

function hasAdminAccess(session: ServerAuthSession): boolean {
  return session.roles.some((role) => ['super_admin', 'admin', 'owner', 'administrator'].includes(role));
}

const nonAdminSession: ServerAuthSession = {
  uid: 'supabase:user-regular',
  provider: 'supabase',
  email: 'user@example.com',
  roles: [],
  scopes: [],
};

const adminSession: ServerAuthSession = {
  uid: 'supabase:user-admin',
  provider: 'supabase',
  email: 'admin@example.com',
  roles: ['admin'],
  scopes: ['*'],
};

assert.equal(hasAdminAccess(nonAdminSession), false);
assert.equal(hasAdminAccess(adminSession), true);

console.log('auth-return-destination.test: ALL TESTS PASSED');
