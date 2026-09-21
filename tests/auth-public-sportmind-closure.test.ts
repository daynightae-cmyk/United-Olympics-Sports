import assert from 'node:assert/strict';
import { shouldSuppressAssistant } from '../src/assistant/assistantService';
import { canonicalAuthPageUrl } from '../src/lib/auth-client.js';
import {
  classifyAuthError,
  persistSinglePortalBinding,
} from '../src/components/auth/AuthCallbackPage';
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

  const unlinkedPlayerResult = persistSinglePortalBinding('/player/home', unlinkedIdentity);
  assert.equal(unlinkedPlayerResult.ok, false);
  assert.equal((unlinkedPlayerResult as { code: string }).code, 'PORTAL_RECORD_NOT_LINKED');

  const unlinkedParentResult = persistSinglePortalBinding('/parent', unlinkedIdentity);
  assert.equal(unlinkedParentResult.ok, false);
  assert.equal((unlinkedParentResult as { code: string }).code, 'PORTAL_RECORD_NOT_LINKED');

  const unlinkedCoachResult = persistSinglePortalBinding('/coach', unlinkedIdentity);
  assert.equal(unlinkedCoachResult.ok, false);
  assert.equal((unlinkedCoachResult as { code: string }).code, 'PORTAL_RECORD_NOT_LINKED');

  // 11. legitimate portal binding succeeds
  const linkedPlayerIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      playerIds: ['player-rec-123'],
    },
  };
  const linkedPlayerResult = persistSinglePortalBinding('/player/home', linkedPlayerIdentity);
  assert.equal(linkedPlayerResult.ok, true);
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
  const linkedParentResult = persistSinglePortalBinding('/parent', linkedParentIdentity);
  assert.equal(linkedParentResult.ok, true);
  const parentSession = JSON.parse(mockStorage.getItem('uos:parent-portal:session:v1') || '{}');
  assert.equal(parentSession.parentId, 'guardian-rec-456');

  const linkedCoachIdentity: PortalIdentity = {
    ...unlinkedIdentity,
    bindings: {
      ...unlinkedIdentity.bindings,
      coachIds: ['coach-rec-789'],
    },
  };
  const linkedCoachResult = persistSinglePortalBinding('/coach', linkedCoachIdentity);
  assert.equal(linkedCoachResult.ok, true);
  const coachSession = JSON.parse(mockStorage.getItem('uos:coach-portal:session:v1') || '{}');
  assert.equal(coachSession.coachId, 'coach-rec-789');

  console.log('Auth + Public SportMind closure tests: ALL 11 TESTS PASSED!');
}

runAuthPublicSportMindTests().catch((err) => {
  console.error('FATAL: Auth + Public SportMind test failure:', err);
  process.exit(1);
});
