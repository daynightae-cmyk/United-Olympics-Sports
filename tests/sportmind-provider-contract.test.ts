import assert from 'node:assert/strict';
import {
  DeterministicSportsProvider,
  OpenCodeProvider,
  getSportsAiProvider,
} from '../src/server/sportmind/provider.js';
import type { SportMindHydratedContext, SportMindRequest } from '../src/server/sportmind/types.js';

async function runProviderContractTests() {
  console.log('=== RUNNING SPORTMIND PROVIDER CONTRACT TESTS ===');

  const deterministic = new DeterministicSportsProvider();
  assert.equal(deterministic.isConfigured(), true);

  // 1. Coach context generation produces COACH_BOARD module
  const coachCtx: SportMindHydratedContext = {
    role: 'coach',
    userId: 'coach-1',
    recordsSummary: {
      upcomingSessions: 2,
      attendanceRecords: 12,
      hasActiveSubscription: true,
      recentNotesCount: 4,
    },
    evidence: [
      {
        type: 'session',
        description: { en: '2 scheduled sessions', ar: 'حصتان مجدولتان' },
        recordCount: 2,
      },
    ],
    sport: 'Swimming',
  };

  const req: SportMindRequest = {
    message: 'Prepare today session',
    locale: 'en',
  };

  const chunks = [];
  for await (const chunk of deterministic.generateStream(coachCtx, req)) {
    chunks.push(chunk);
  }

  assert.ok(chunks.some((c) => c.type === 'thinking'), 'Should yield thinking state');
  assert.ok(chunks.some((c) => c.type === 'evidence'), 'Should yield evidence items');
  const boardChunk = chunks.find((c) => c.type === 'module' && c.module?.type === 'COACH_BOARD');
  assert.ok(boardChunk?.module?.coachBoard, 'Should yield structured Coach Board');
  assert.ok(boardChunk.module.coachBoard.warmUp.durationMinutes > 0);
  assert.ok(boardChunk.module.coachBoard.mainDrill.durationMinutes > 0);
  assert.ok(boardChunk.module.coachBoard.coolDown.durationMinutes > 0);
  assert.ok(chunks.some((c) => c.type === 'done'), 'Should terminate with done chunk');

  // 2. Cancellation via AbortSignal stops generation
  const controller = new AbortController();
  controller.abort();
  const abortedChunks = [];
  for await (const chunk of deterministic.generateStream(coachCtx, req, controller.signal)) {
    abortedChunks.push(chunk);
  }
  assert.equal(abortedChunks.length, 0, 'Aborted signal must yield 0 chunks');

  // 3. OpenCode provider fallback when unconfigured
  delete process.env.OPENCODE_API_KEY;
  const provider = getSportsAiProvider();
  assert.equal(provider.name, 'DeterministicSportsProvider', 'Unconfigured provider falls back to DeterministicSportsProvider');

  const opencode = new OpenCodeProvider();
  assert.equal(opencode.isConfigured(), false);
  const fallbackChunks = [];
  for await (const chunk of opencode.generateStream(coachCtx, req)) {
    fallbackChunks.push(chunk);
  }
  assert.ok(fallbackChunks.length > 0, 'Unconfigured OpenCode provider should cleanly yield fallback stream');

  console.log('SportMind provider contract tests: PASS');
}

runProviderContractTests().catch((err) => {
  console.error('FATAL: SportMind provider contract test failure:', err);
  process.exit(1);
});
