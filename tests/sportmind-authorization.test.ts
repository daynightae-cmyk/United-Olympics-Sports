import assert from 'node:assert/strict';
import { hydrateSportMindContext } from '../src/server/sportmind/sportmind-context.js';
import type { ApiRequest } from '../src/server/http.js';
import type { SportMindRequest } from '../src/server/sportmind/types.js';

async function runAuthorizationTests() {
  console.log('=== RUNNING SPORTMIND AUTHORIZATION TESTS ===');

  // 1. Unauthenticated request in test environment falls back to safe preview identity based on route
  const coachReq: ApiRequest = {
    method: 'POST',
    url: '/api/v1/sportmind',
    headers: {},
  };

  const coachInput: SportMindRequest = {
    message: 'Prepare session plan',
    currentRoute: '/coach/schedule',
  };

  const coachCtx = await hydrateSportMindContext(coachReq, coachInput);
  assert.equal(coachCtx.role, 'coach', 'Route /coach/* should resolve to coach role in preview mode');
  assert.equal(coachCtx.userId, 'preview-coach-1');
  assert.equal(coachCtx.isMedicalInquiry, false);
  assert.ok(coachCtx.evidence.length > 0, 'Should include authorized evidence items');

  // 2. Player route resolves to player role
  const playerInput: SportMindRequest = {
    message: 'What is my schedule?',
    currentRoute: '/player/home',
  };
  const playerCtx = await hydrateSportMindContext(coachReq, playerInput);
  assert.equal(playerCtx.role, 'player', 'Route /player/* should resolve to player role');
  assert.equal(playerCtx.userId, 'preview-athlete-1');

  // 3. Admin route resolves to admin role
  const adminInput: SportMindRequest = {
    message: 'Summarize operations',
    currentRoute: '/admin/dashboard',
  };
  const adminCtx = await hydrateSportMindContext(coachReq, adminInput);
  assert.equal(adminCtx.role, 'admin', 'Route /admin/* should resolve to admin role');
  assert.equal(adminCtx.userId, 'preview-admin');

  // 4. Requesting an invalid / unauthorized UUID player does not leak data
  const invalidPlayerInput: SportMindRequest = {
    message: 'Show player details',
    currentRoute: '/player/home',
    requestedContext: {
      entityType: 'player',
      entityId: '00000000-0000-0000-0000-000000000000',
    },
  };
  const guardedCtx = await hydrateSportMindContext(coachReq, invalidPlayerInput);
  assert.equal(guardedCtx.entity, undefined, 'Unauthorized entity must not be hydrated');

  console.log('SportMind authorization tests: PASS');
}

runAuthorizationTests().catch((err) => {
  console.error('FATAL: SportMind authorization test failure:', err);
  process.exit(1);
});
