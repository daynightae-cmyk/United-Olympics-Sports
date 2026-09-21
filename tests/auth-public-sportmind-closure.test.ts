import assert from 'node:assert/strict';
import { shouldSuppressAssistant } from '../src/assistant/assistantService';
import { canonicalAuthPageUrl } from '../src/lib/auth-client.js';
import { classifyAuthError } from '../src/components/auth/AuthCallbackPage';
import {
  bindingStateForPortal,
  persistLinkedPortalBinding,
  readUnlinkedPortalAccess,
} from '../src/portals/shared/portal-entry-access.js';
import { identityFromSupabaseUser } from '../src/server/auth.js';
import type { PortalIdentity } from '../src/lib/auth-client.js';

// Mock localStorage and sessionStorage for Node environment
const storage = new Map<string, string>();
const mockStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, String(value)); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
};
globalThis.localStorage = mockStorage as unknown as Storage;
globalThis.sessionStorage = mockStorage as unknown as Storage;

async function runAuthPublicSportMindTests() {
  console.log('=== RUNNING AUTH + PUBLIC SPORTMIND CLOSURE TESTS ===');

  // 1. public `/` mounts UnitedAssistant
  const publicRoutes = ['/', '/sports', '/sports/swimming', '/programs', '/coaches', '/contact', '/about'];
  for (const route of publicRoutes) {
    assert.equal(
      shouldSuppressAssistant(route),
      false,
      `Public route "${route}" must mount UnitedAssistant`,
    );
  }

  // 2. auth/login routes suppress assistant
  const authRoutes = [
    '/admin/login',
    '/player/login',
    '/parent/login',
    '/coach/login',
    '/store/login',
    '/auth/callback',
    '/auth/passkeys',
    '/player/phone',
    '/player/otp',
  ];
  for (const route of authRoutes) {
    assert.equal(
      shouldSuppressAssistant(route),
      true,
      `Auth/login route "${route}" must suppress UnitedAssistant`,
    );
  }

  // 3. `/assistant` does not duplicate floating assistant
  assert.equal(shouldSuppressAssistant('/assistant'), true, '/assistant must suppress floating assistant');
  assert.equal(shouldSuppressAssistant('/sportmind'), true, '/sportmind must suppress floating assistant');

  // 4. public invitation session dismissal works
  mockStorage.clear();
  assert.equal(mockStorage.getItem('uos:assistant-dismissed'), null);
  mockStorage.setItem('uos:assistant-dismissed', '1');
  assert.equal(mockStorage.getItem('uos:assistant-dismissed'), '1');

  // 5. OAuth same-origin/canonical-host behavior
  const apexUrl = 'https://unitedolympicsports.store/admin/login';
  const canonicalUrl = canonicalAuthPageUrl(apexUrl);
  assert.equal(
    canonicalUrl,
    'https://www.unitedolympicsports.store/admin/login',
    'Apex host must resolve to canonical www host',
  );

  const wwwUrl = 'https://www.unitedolympicsports.store/admin/login';
  assert.equal(canonicalAuthPageUrl(wwwUrl), null, 'Canonical host must not redirect');

  // 6. server session accepts valid Supabase identity
  const user = { id: '00000000-1111-2222-3333-444444444444', email: 'athlete@example.com' };
  const providerIdentity = identityFromSupabaseUser(user);
  assert.equal(providerIdentity.provider, 'supabase');
  assert.equal(providerIdentity.subject, user.id);
  assert.equal(providerIdentity.uid, `supabase:${user.id}`);
  assert.equal(providerIdentity.email, user.email);

  // 7. invalid token fails safely
  assert.equal(classifyAuthError(new Error('AUTH_INVALID')), 'AUTH_INVALID');

  // 8. authorization unavailable has distinct result
  assert.equal(classifyAuthError(new Error('AUTHORIZATION_UNAVAILABLE')), 'AUTHORIZATION_UNAVAILABLE');

  // 9. portal binding unavailable has distinct result
  assert.equal(classifyAuthError(new Error('PORTAL_BINDING_UNAVAILABLE')), 'PORTAL_BINDING_UNAVAILABLE');

  // 10. unlinked portal account has distinct result
  assert.equal(classifyAuthError(new Error('PORTAL_RECORD_NOT_LINKED')), 'PORTAL_RECORD_NOT_LINKED');

  const unlinkedIdentity: PortalIdentity = {
    identity: { uid: `supabase:${user.id}`, provider: 'supabase', email: user.email },
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

  const unlinkedPlayerResult = persistLinkedPortalBinding('/player/home', unlinkedIdentity);
  assert.equal(unlinkedPlayerResult.linked, false);
  assert.equal(readUnlinkedPortalAccess('player')?.reason, 'not-linked');
  assert.equal(mockStorage.getItem('uos:player-portal:session'), null);

  const unlinkedParentResult = persistLinkedPortalBinding('/parent', unlinkedIdentity);
  assert.equal(unlinkedParentResult.linked, false);
  assert.equal(readUnlinkedPortalAccess('parent')?.reason, 'not-linked');
  assert.equal(mockStorage.getItem('uos:parent-portal:session:v1'), null);

  const unlinkedCoachResult = persistLinkedPortalBinding('/coach', unlinkedIdentity);
  assert.equal(unlinkedCoachResult.linked, false);
  assert.equal(readUnlinkedPortalAccess('coach')?.reason, 'not-linked');
  assert.equal(mockStorage.getItem('uos:coach-portal:session:v1'), null);

  const ambiguousPlayerIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      playerIds: ['player-a', 'player-b'],
    },
  };
  assert.deepEqual(bindingStateForPortal('player', ambiguousPlayerIdentity), {
    linked: false,
    portal: 'player',
    reason: 'ambiguous',
  });

  // 11. legitimate portal binding succeeds and clears unlinked shell state
  const linkedPlayerIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      playerIds: ['player-rec-123'],
    },
  };
  const linkedPlayerResult = persistLinkedPortalBinding('/player/home', linkedPlayerIdentity);
  assert.equal(linkedPlayerResult.linked, true);
  assert.equal(readUnlinkedPortalAccess('player'), null);
  assert.equal(mockStorage.getItem('uos:player-portal:auth'), 'true');
  assert.equal(mockStorage.getItem('uos:player-portal:active-id'), 'player-rec-123');

  const linkedParentIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      guardianIds: ['guardian-rec-456'],
      guardianPlayerIds: ['player-rec-123'],
    },
  };
  const linkedParentResult = persistLinkedPortalBinding('/parent', linkedParentIdentity);
  assert.equal(linkedParentResult.linked, true);
  assert.equal(readUnlinkedPortalAccess('parent'), null);
  const parentSession = JSON.parse(mockStorage.getItem('uos:parent-portal:session:v1') || '{}');
  assert.equal(parentSession.parentId, 'guardian-rec-456');

  const linkedCoachIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      coachIds: ['coach-rec-789'],
    },
  };
  const linkedCoachResult = persistLinkedPortalBinding('/coach', linkedCoachIdentity);
  assert.equal(linkedCoachResult.linked, true);
  assert.equal(readUnlinkedPortalAccess('coach'), null);
  const coachSession = JSON.parse(mockStorage.getItem('uos:coach-portal:session:v1') || '{}');
  assert.equal(coachSession.coachId, 'coach-rec-789');

  console.log('Auth + Public SportMind closure tests: open Google portal-entry contract PASS');
}

runAuthPublicSportMindTests().catch((err) => {
  console.error('FATAL: Auth + Public SportMind test failure:', err);
  process.exit(1);
});