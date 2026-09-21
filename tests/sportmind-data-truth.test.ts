import assert from 'node:assert/strict';
import {
  resolveRoleFromContext,
  hydrateSportMindContext,
} from '../src/server/sportmind/sportmind-context.js';
import { DeterministicSportsProvider } from '../src/server/sportmind/provider.js';
import type { AuthorizationContext } from '../src/server/authorization-context.js';
import type { ApiRequest } from '../src/server/http.js';
import type { SportMindHydratedContext, SportMindRequest, SportMindStreamChunk } from '../src/server/sportmind/types.js';

async function collectChunks(iterable: AsyncIterable<SportMindStreamChunk>): Promise<SportMindStreamChunk[]> {
  const chunks: SportMindStreamChunk[] = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }
  return chunks;
}

async function runDataTruthTests() {
  console.log('=== RUNNING SPORTMIND DATA TRUTH & ROLE TRUTH TESTS ===');

  // -------------------------------------------------------------------------
  // 1. Role Truth & Anti-Spoofing Tests (resolveRoleFromContext)
  // -------------------------------------------------------------------------

  const publicCtx: AuthorizationContext = {
    uid: 'anon-1',
    provider: 'supabase',
    roles: [],
    scopes: [],
    tenant: { organizationIds: [], countryIds: [], branchIds: [] },
    bindings: {
      playerIds: [],
      guardianIds: [],
      guardianPlayerIds: [],
      coachIds: [],
      coachGroupIds: [],
      coachPlayerIds: [],
    },
  };

  const coachCtx: AuthorizationContext = {
    ...publicCtx,
    uid: 'coach-1',
    roles: ['coach'],
    bindings: { ...publicCtx.bindings, coachIds: ['coach-uuid-1'] },
  };

  const multiRoleCtx: AuthorizationContext = {
    ...publicCtx,
    uid: 'admin-coach-1',
    roles: ['admin', 'coach'],
    bindings: { ...publicCtx.bindings, coachIds: ['coach-uuid-1'] },
  };

  // Test 1.1: Public user cannot spoof admin or coach role via currentRoute
  assert.equal(
    resolveRoleFromContext(publicCtx, '/admin/dashboard'),
    'public',
    'Public user on /admin route must resolve to public (no spoofing)',
  );
  assert.equal(
    resolveRoleFromContext(publicCtx, '/coach/drills'),
    'public',
    'Public user on /coach route must resolve to public',
  );
  assert.equal(
    resolveRoleFromContext(publicCtx, '/player/schedule'),
    'public',
    'Public user on /player route must resolve to public',
  );

  // Test 1.2: Coach cannot spoof admin role by navigating to /admin
  assert.equal(
    resolveRoleFromContext(coachCtx, '/admin/settings'),
    'coach',
    'Coach cannot escalate to admin role via route alone',
  );

  // Test 1.3: Multi-role user route disambiguation
  assert.equal(
    resolveRoleFromContext(multiRoleCtx, '/coach/sessions'),
    'coach',
    'Multi-role user on /coach should resolve to coach role',
  );
  assert.equal(
    resolveRoleFromContext(multiRoleCtx, '/admin/users'),
    'admin',
    'Multi-role user on /admin should resolve to admin role',
  );

  // -------------------------------------------------------------------------
  // 2. Unauthenticated Hydration & Data Boundaries
  // -------------------------------------------------------------------------

  const unauthenticatedReq: ApiRequest = {
    method: 'POST',
    url: '/api/sportmind/stream',
    headers: {},
  };

  const publicRequest: SportMindRequest = {
    message: 'What sports programs do you offer for beginners?',
    currentRoute: '/programs',
    requestedContext: {
      entityType: 'player',
      entityId: 'a0000000-0000-0000-0000-000000000001',
    },
  };

  const hydrated = await hydrateSportMindContext(unauthenticatedReq, publicRequest);

  // Test 2.1: Unauthenticated request resolves to public role with dataAvailability: 'none'
  assert.equal(hydrated.role, 'public', 'Unauthenticated user must be public role');
  assert.equal(hydrated.recordsSummary.dataAvailability, 'none', 'Data availability must be none for public');
  assert.equal(hydrated.recordsSummary.upcomingSessions, null, 'upcomingSessions must be null');
  assert.equal(hydrated.recordsSummary.attendanceRecords, null, 'attendanceRecords must be null');
  assert.equal(hydrated.recordsSummary.hasActiveSubscription, null, 'hasActiveSubscription must be null');
  assert.equal(hydrated.recordsSummary.recentNotesCount, null, 'recentNotesCount must be null');
  assert.equal(hydrated.entity, undefined, 'Public request must never hydrate private player entity');

  // -------------------------------------------------------------------------
  // 3. Provider Data Truth: Verified Zero vs Unavailable vs None
  // -------------------------------------------------------------------------

  const provider = new DeterministicSportsProvider();

  // Test 3.1: Verified Zero — player actually has 0 scheduled sessions
  const verifiedZeroCtx: SportMindHydratedContext = {
    role: 'player',
    userId: 'player-1',
    recordsSummary: {
      upcomingSessions: 0,
      attendanceRecords: 0,
      hasActiveSubscription: true,
      recentNotesCount: 0,
      dataAvailability: 'verified',
    },
    evidence: [],
  };

  const zeroChunks = await collectChunks(provider.generateStream(verifiedZeroCtx, { message: 'Schedule updates' }));
  const zeroInsight = zeroChunks.find((c) => c.type === 'module' && c.module?.type === 'INSIGHT')?.module;
  assert.ok(zeroInsight, 'Must yield INSIGHT module');
  assert.ok(
    zeroInsight.body?.en.includes('No upcoming sessions are currently scheduled on your calendar'),
    'Verified zero must accurately state no upcoming sessions scheduled',
  );
  assert.equal(
    zeroInsight.confidenceLabel?.en,
    'Based on Verified Portal Records',
    'Verified zero must carry verified confidence label',
  );

  // Test 3.2: Unavailable Data — system could not retrieve records
  const unavailableCtx: SportMindHydratedContext = {
    role: 'player',
    userId: 'player-2',
    recordsSummary: {
      upcomingSessions: null,
      attendanceRecords: null,
      hasActiveSubscription: null,
      recentNotesCount: null,
      dataAvailability: 'unavailable',
    },
    evidence: [],
  };

  const unavailableChunks = await collectChunks(
    provider.generateStream(unavailableCtx, { message: 'What is my schedule?' }),
  );
  const unavailInsight = unavailableChunks.find((c) => c.type === 'module' && c.module?.type === 'INSIGHT')?.module;
  assert.ok(unavailInsight, 'Must yield INSIGHT module');
  assert.ok(
    unavailInsight.body?.en.includes('temporarily unavailable'),
    'Unavailable data must inform user that data is temporarily unavailable',
  );
  assert.equal(
    unavailInsight.confidenceLabel?.en,
    'Unverified / Needs Data',
    'Unavailable data must carry unverified confidence label',
  );

  const syncModule = unavailableChunks.find(
    (c) => c.type === 'module' && c.module?.id === 'needs-data-sync',
  )?.module;
  assert.ok(syncModule, 'Must yield NEEDS_DATA module for synchronization notice');

  // Test 3.3: Parent without selected child — must NOT claim "0 upcoming sessions confirmed"
  const parentNoChildCtx: SportMindHydratedContext = {
    role: 'parent',
    userId: 'parent-1',
    recordsSummary: {
      upcomingSessions: null,
      attendanceRecords: null,
      hasActiveSubscription: null,
      recentNotesCount: null,
      dataAvailability: 'none',
    },
    evidence: [],
  };

  const parentChunks = await collectChunks(
    provider.generateStream(parentNoChildCtx, { message: 'Show child schedule' }),
  );
  const parentInsight = parentChunks.find((c) => c.type === 'module' && c.module?.type === 'INSIGHT')?.module;
  assert.ok(parentInsight, 'Must yield parent INSIGHT module');
  assert.ok(
    parentInsight.body?.en.includes('Select a child profile in the Parent Portal'),
    'Parent without child must prompt to select a profile, NOT claim 0 confirmed sessions',
  );
  assert.ok(
    !parentInsight.body?.en.includes('0 upcoming sessions are confirmed'),
    'Must NOT mislead with 0 confirmed sessions when child is unselected',
  );

  console.log('SportMind data truth & role truth tests: PASS');
}

runDataTruthTests().catch((err) => {
  console.error('SportMind data truth test FAILED:', err);
  process.exit(1);
});
