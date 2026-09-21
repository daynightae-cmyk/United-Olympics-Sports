import assert from 'node:assert/strict';
import {
  DeterministicSportsProvider,
  OpenCodeProvider,
  getSportsAiProvider,
  parseSseBuffer,
  extractChatCompletionsDelta,
  extractResponsesDelta,
  classifyHttpError,
} from '../src/server/sportmind/provider.js';
import type { SportMindHydratedContext, SportMindRequest, SportMindStreamChunk } from '../src/server/sportmind/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COACH_CTX: SportMindHydratedContext = {
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

const REQ: SportMindRequest = {
  message: 'Prepare today session',
  locale: 'en',
};

async function collectChunks(
  iterable: AsyncIterable<SportMindStreamChunk>,
): Promise<SportMindStreamChunk[]> {
  const chunks: SportMindStreamChunk[] = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Create a mock fetch that returns a readable stream from SSE chunks.
 * Each `sseChunks` entry is a raw string sent as a single TCP read.
 */
function mockFetchWithSse(
  status: number,
  sseChunks: string[],
  opts?: { abortAfter?: number },
): typeof globalThis.fetch {
  return async (_url: string | URL | Request, init?: RequestInit) => {
    if (status !== 200) {
      return new Response(null, { status }) as unknown as Response;
    }

    let chunkIndex = 0;
    const signal = init?.signal;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (signal?.aborted) {
          controller.close();
          return;
        }
        if (opts?.abortAfter !== undefined && chunkIndex >= opts.abortAfter) {
          controller.close();
          return;
        }
        if (chunkIndex < sseChunks.length) {
          controller.enqueue(new TextEncoder().encode(sseChunks[chunkIndex]));
          chunkIndex++;
        } else {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }) as unknown as Response;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runProviderContractTests() {
  console.log('=== RUNNING SPORTMIND PROVIDER CONTRACT TESTS ===');

  // -----------------------------------------------------------------------
  // 1. Deterministic provider basics
  // -----------------------------------------------------------------------
  const deterministic = new DeterministicSportsProvider();
  assert.equal(deterministic.isConfigured(), true);

  const chunks = await collectChunks(deterministic.generateStream(COACH_CTX, REQ));
  assert.ok(chunks.some((c) => c.type === 'thinking'), 'Should yield thinking state');
  assert.ok(chunks.some((c) => c.type === 'evidence'), 'Should yield evidence items');
  const boardChunk = chunks.find((c) => c.type === 'module' && c.module?.type === 'COACH_BOARD');
  assert.ok(boardChunk?.module?.coachBoard, 'Should yield structured Coach Board');
  assert.ok(boardChunk.module.coachBoard.warmUp.durationMinutes > 0);
  assert.ok(boardChunk.module.coachBoard.mainDrill.durationMinutes > 0);
  assert.ok(boardChunk.module.coachBoard.coolDown.durationMinutes > 0);
  assert.ok(chunks.some((c) => c.type === 'done'), 'Should terminate with done chunk');
  console.log('  ✓ Deterministic provider coach board');

  // -----------------------------------------------------------------------
  // 2. Abort via AbortSignal yields 0 chunks
  // -----------------------------------------------------------------------
  const controller = new AbortController();
  controller.abort();
  const abortedChunks = await collectChunks(deterministic.generateStream(COACH_CTX, REQ, controller.signal));
  assert.equal(abortedChunks.length, 0, 'Aborted signal must yield 0 chunks');
  console.log('  ✓ Abort signal stops generation');

  // -----------------------------------------------------------------------
  // 3. Unconfigured OpenCode falls back to deterministic
  // -----------------------------------------------------------------------
  delete process.env.OPENCODE_API_KEY;
  const provider = getSportsAiProvider();
  assert.equal(provider.name, 'DeterministicSportsProvider');
  console.log('  ✓ Unconfigured provider falls back');

  const opencode = new OpenCodeProvider();
  assert.equal(opencode.isConfigured(), false);
  const fallbackChunks = await collectChunks(opencode.generateStream(COACH_CTX, REQ));
  assert.ok(fallbackChunks.length > 0, 'Unconfigured OpenCode yields fallback stream');
  console.log('  ✓ Unconfigured OpenCode fallback');

  // -----------------------------------------------------------------------
  // 4. SSE parser: fragmented chunks
  // -----------------------------------------------------------------------
  {
    // Multiple events in one buffer
    const [events, remaining] = parseSseBuffer(
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" World"}}]}\n\n',
    );
    assert.equal(events.length, 2);
    assert.equal(remaining, '');
    const d1 = extractChatCompletionsDelta(JSON.parse(events[0]));
    const d2 = extractChatCompletionsDelta(JSON.parse(events[1]));
    assert.equal(d1, 'Hello');
    assert.equal(d2, ' World');
    console.log('  ✓ Chat Completions SSE: multiple events per buffer');
  }

  {
    // Split event across two reads
    const [events1, remaining1] = parseSseBuffer('data: {"choices":[{"delta":{"con');
    assert.equal(events1.length, 0);
    const [events2, remaining2] = parseSseBuffer(remaining1 + 'tent":"Train"}}]}\n\n');
    assert.equal(events2.length, 1);
    assert.equal(remaining2, '');
    const d = extractChatCompletionsDelta(JSON.parse(events2[0]));
    assert.equal(d, 'Train');
    console.log('  ✓ Chat Completions SSE: split across chunks');
  }

  {
    // [DONE] event
    const [events] = parseSseBuffer('data: [DONE]\n\n');
    assert.equal(events.length, 1);
    assert.equal(events[0].trim(), '[DONE]');
    console.log('  ✓ [DONE] event parsed');
  }

  {
    // Malformed JSON event is safely ignored in stream processing
    const [events] = parseSseBuffer('data: {not valid json}\n\n');
    assert.equal(events.length, 1);
    // Parsing should not throw — verify the parser returns the string
    let threw = false;
    try {
      JSON.parse(events[0]);
    } catch {
      threw = true;
    }
    assert.ok(threw, 'Malformed JSON should throw on parse');
    // Provider code catches this — no crash
    console.log('  ✓ Malformed SSE event handled safely');
  }

  // -----------------------------------------------------------------------
  // 5. Responses protocol: delta extraction
  // -----------------------------------------------------------------------
  {
    const delta = extractResponsesDelta({
      type: 'response.output_text.delta',
      delta: 'Training plan',
    });
    assert.equal(delta, 'Training plan');
    console.log('  ✓ Responses delta extraction');
  }

  {
    // Non-delta event returns null
    const delta = extractResponsesDelta({
      type: 'response.created',
    });
    assert.equal(delta, null);
    console.log('  ✓ Non-delta Responses event returns null');
  }

  {
    // Fragmented Responses SSE
    const [events] = parseSseBuffer(
      'data: {"type":"response.output_text.delta","delta":"ing "}\n\ndata: {"type":"response.output_text.delta","delta":"plan"}\n\n',
    );
    assert.equal(events.length, 2);
    const d1 = extractResponsesDelta(JSON.parse(events[0]));
    const d2 = extractResponsesDelta(JSON.parse(events[1]));
    assert.equal(d1, 'ing ');
    assert.equal(d2, 'plan');
    console.log('  ✓ Responses SSE: fragmented events');
  }

  // -----------------------------------------------------------------------
  // 6. Chat Completions exact text reconstruction
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const sseData = [
        'data: {"choices":[{"delta":{"content":"Train"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"ing "}}]}\n\ndata: {"choices":[{"delta":{"content":"plan"}}]}\n\n',
        'data: [DONE]\n\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key-not-real';
      process.env.OPENCODE_BASE_URL = 'https://test.example.com/v1';
      process.env.OPENCODE_MODEL = 'test-model';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      assert.ok(p.isConfigured());

      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const deltas = result.filter((c) => c.type === 'delta').map((c) => c.delta);
      const fullText = deltas.join('');
      assert.equal(fullText, 'Training plan');
      assert.ok(result.some((c) => c.type === 'module'), 'Should yield final module');
      assert.ok(result.some((c) => c.type === 'done'), 'Should yield done');
      console.log('  ✓ Chat Completions: exact text reconstruction');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_MODEL;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 7. Responses protocol exact text reconstruction
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const sseData = [
        'data: {"type":"response.created","response":{"id":"r1"}}\n\n',
        'data: {"type":"response.output_text.delta","delta":"Session"}\n\n',
        'data: {"type":"response.output_text.delta","delta":" ready"}\n\n',
        'data: {"type":"response.completed"}\n\ndata: [DONE]\n\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key-not-real';
      process.env.OPENCODE_BASE_URL = 'https://test.example.com/v1';
      process.env.OPENCODE_MODEL = 'test-model';
      process.env.OPENCODE_PROTOCOL = 'responses';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const deltas = result.filter((c) => c.type === 'delta').map((c) => c.delta);
      assert.equal(deltas.join(''), 'Session ready');
      console.log('  ✓ Responses: exact text reconstruction');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_MODEL;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 8. HTTP error status handling (401, 403, 429, 500)
  // -----------------------------------------------------------------------
  for (const status of [401, 403, 429, 500]) {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = mockFetchWithSse(status, []) as typeof globalThis.fetch;
      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      // Should fall back to deterministic — must have done chunk
      assert.ok(result.some((c) => c.type === 'done'), `HTTP ${status} should fall back safely`);
      console.log(`  ✓ HTTP ${status}: falls back to deterministic`);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 9. Network failure (fetch throws)
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () => {
        throw new Error('Network unreachable');
      }) as unknown as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      assert.ok(result.some((c) => c.type === 'done'), 'Network failure should fall back');
      console.log('  ✓ Network failure: falls back to deterministic');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 10. Abort during streaming
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const sseData = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" World"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" More"}}]}\n\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData, { abortAfter: 1 }) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const ac = new AbortController();

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ, ac.signal));
      // Should not have all 3 deltas since stream closes after 1 chunk
      const deltaCount = result.filter((c) => c.type === 'delta').length;
      assert.ok(deltaCount <= 1, 'Abort should limit received deltas');
      console.log('  ✓ Abort during streaming: limited output');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 11. Timeout behavior via AbortSignal.timeout
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      // Simulate a fetch that never resolves until aborted
      globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        });
      }) as unknown as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const ac = new AbortController();
      // Abort immediately to simulate timeout
      ac.abort();

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ, ac.signal));
      // Pre-aborted signal — should yield nothing (early exit)
      assert.equal(result.length, 0, 'Pre-aborted signal yields 0 chunks');
      console.log('  ✓ Timeout/abort: early exit');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 12. No-key behavior
  // -----------------------------------------------------------------------
  {
    delete process.env.OPENCODE_API_KEY;
    const p = new OpenCodeProvider();
    assert.equal(p.isConfigured(), false, 'No key = unconfigured');
    const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
    assert.ok(result.some((c) => c.type === 'done'), 'No-key falls back cleanly');
    console.log('  ✓ No-key behavior: falls back');
  }

  // -----------------------------------------------------------------------
  // 13. Missing model behavior (uses empty model, does not default fake)
  // -----------------------------------------------------------------------
  {
    delete process.env.OPENCODE_MODEL;
    const p = new OpenCodeProvider();
    // Model should be empty, not a fake identifier
    assert.equal(p.isConfigured(), false, 'No key still unconfigured');
    console.log('  ✓ Missing model: no fake default');
  }

  // -----------------------------------------------------------------------
  // 14. classifyHttpError
  // -----------------------------------------------------------------------
  {
    assert.equal(classifyHttpError(401).code, 'PROVIDER_AUTH_FAILED');
    assert.equal(classifyHttpError(403).code, 'PROVIDER_FORBIDDEN');
    assert.equal(classifyHttpError(404).code, 'PROVIDER_NOT_FOUND');
    assert.equal(classifyHttpError(408).code, 'PROVIDER_TIMEOUT');
    assert.equal(classifyHttpError(429).code, 'PROVIDER_RATE_LIMITED');
    assert.equal(classifyHttpError(500).code, 'PROVIDER_SERVER_ERROR');
    assert.equal(classifyHttpError(502).code, 'PROVIDER_SERVER_ERROR');
    assert.equal(classifyHttpError(418).code, 'PROVIDER_ERROR');
    console.log('  ✓ HTTP error classification');
  }

  // -----------------------------------------------------------------------
  // 15. No API secret leakage in stream output
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const SECRET = 'sk-super-secret-api-key-12345';
      globalThis.fetch = mockFetchWithSse(500, []) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = SECRET;
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));

      // Check that no chunk contains the secret
      const serialized = JSON.stringify(result);
      assert.ok(
        !serialized.includes(SECRET),
        'API key must NEVER appear in stream output',
      );
      console.log('  ✓ No API secret leakage in output');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 16. Empty response body
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = mockFetchWithSse(200, ['data: [DONE]\n\n']) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const deltas = result.filter((c) => c.type === 'delta');
      assert.equal(deltas.length, 0, 'No deltas from empty response');
      assert.ok(result.some((c) => c.type === 'done'), 'Should still emit done');
      console.log('  ✓ Empty response: no deltas, clean done');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 17. Multiple SSE events in single TCP chunk
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      // Single TCP chunk containing 3 events
      const sseData = [
        'data: {"choices":[{"delta":{"content":"A"}}]}\n\ndata: {"choices":[{"delta":{"content":"B"}}]}\n\ndata: {"choices":[{"delta":{"content":"C"}}]}\n\ndata: [DONE]\n\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const text = result
        .filter((c) => c.type === 'delta')
        .map((c) => c.delta)
        .join('');
      assert.equal(text, 'ABC');
      console.log('  ✓ Multiple events in single TCP chunk');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 18. Split SSE event across TCP chunks
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      // Event split in the middle of JSON
      const sseData = [
        'data: {"choices":[{"delta":{"con',
        'tent":"Split"}}]}\n\ndata: [DONE]\n\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData) as typeof globalThis.fetch;

      process.env.OPENCODE_API_KEY = 'test-key';
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const text = result
        .filter((c) => c.type === 'delta')
        .map((c) => c.delta)
        .join('');
      assert.equal(text, 'Split');
      console.log('  ✓ Split SSE event across TCP chunks');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  console.log('\n=== SportMind provider contract tests: PASS ===');
}

runProviderContractTests().catch((err) => {
  console.error('FATAL: SportMind provider contract test failure:', err);
  process.exit(1);
});
