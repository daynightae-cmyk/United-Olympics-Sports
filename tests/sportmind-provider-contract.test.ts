import assert from 'node:assert/strict';
import {
  DeterministicSportsProvider,
  OpenCodeProvider,
  getSportsAiProvider,
  parseSseBuffer,
  extractChatCompletionsDelta,
  extractResponsesDelta,
  classifyHttpError,
  isValidOpenCodeProtocol,
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
    dataAvailability: 'verified',
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
  // 3. GAP 1 REGRESSION: API key present + model missing/empty
  //    → OpenCodeProvider.isConfigured() === false
  //    → deterministic fallback
  //    → fetch is NOT called
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error('fetch should NOT be called when model is missing');
    }) as unknown as typeof globalThis.fetch;

    try {
      process.env.OPENCODE_API_KEY = 'real-looking-key';
      delete process.env.OPENCODE_MODEL;
      process.env.OPENCODE_PROTOCOL = 'chat_completions';

      const p = new OpenCodeProvider();
      assert.equal(p.isConfigured(), false, 'Key present + model missing must mean isConfigured() === false');

      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      assert.equal(fetchCalled, false, 'fetch must NOT be called when model is missing');
      assert.ok(result.some((c) => c.type === 'done'), 'Must yield deterministic fallback');

      // Also verify getSportsAiProvider() returns DeterministicSportsProvider
      const factoryProvider = getSportsAiProvider();
      assert.equal(factoryProvider.name, 'DeterministicSportsProvider');
      console.log('  ✓ GAP 1: Missing model means unconfigured and fetch is NOT called');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_MODEL;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 4. GAP 2 REGRESSION: Explicit Protocol Validation
  //    Accepts only 'chat_completions' | 'responses'.
  //    Missing/invalid protocol → isConfigured() === false, fetch NOT called.
  // -----------------------------------------------------------------------
  {
    assert.equal(isValidOpenCodeProtocol('chat_completions'), true);
    assert.equal(isValidOpenCodeProtocol('responses'), true);
    assert.equal(isValidOpenCodeProtocol('banana'), false);
    assert.equal(isValidOpenCodeProtocol(''), false);
    assert.equal(isValidOpenCodeProtocol(undefined), false);

    const originalFetch = globalThis.fetch;
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error('fetch should NOT be called when protocol is invalid');
    }) as unknown as typeof globalThis.fetch;

    try {
      process.env.OPENCODE_API_KEY = 'valid-key';
      process.env.OPENCODE_MODEL = 'valid-model';

      // 4a. Valid chat_completions
      process.env.OPENCODE_PROTOCOL = 'chat_completions';
      const pChat = new OpenCodeProvider();
      assert.equal(pChat.isConfigured(), true);

      // 4b. Valid responses
      process.env.OPENCODE_PROTOCOL = 'responses';
      const pResp = new OpenCodeProvider();
      assert.equal(pResp.isConfigured(), true);

      // 4c. Missing protocol
      delete process.env.OPENCODE_PROTOCOL;
      const pMissing = new OpenCodeProvider();
      assert.equal(pMissing.isConfigured(), false, 'Missing protocol must mean unconfigured');
      await collectChunks(pMissing.generateStream(COACH_CTX, REQ));
      assert.equal(fetchCalled, false, 'fetch not called when protocol missing');

      // 4d. Invalid protocol (e.g. banana)
      process.env.OPENCODE_PROTOCOL = 'banana';
      const pInvalid = new OpenCodeProvider();
      assert.equal(pInvalid.isConfigured(), false, 'Invalid protocol must mean unconfigured');
      await collectChunks(pInvalid.generateStream(COACH_CTX, REQ));
      assert.equal(fetchCalled, false, 'fetch not called when protocol invalid');

      console.log('  ✓ GAP 2: Explicit protocol validation (chat_completions, responses, invalid rejected)');

    // Direct unit assertions for delta extractors
    assert.equal(extractResponsesDelta({ type: 'response.output_text.delta', delta: 'direct-test' }), 'direct-test');
    assert.equal(extractResponsesDelta({ type: 'response.content_part.delta', part: { text: 'part-test' } }), 'part-test');
    assert.equal(extractResponsesDelta({ type: 'other' }), null);
    assert.equal(extractResponsesDelta(null), null);
    console.log('  ✓ Responses delta extractor direct unit tests');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.OPENCODE_API_KEY;
      delete process.env.OPENCODE_MODEL;
      delete process.env.OPENCODE_PROTOCOL;
    }
  }

  // -----------------------------------------------------------------------
  // 5. GAP 3 REGRESSION: OpenCode Zen Base-Endpoint Truth & No Double Paths
  // -----------------------------------------------------------------------
  {
    // Default documented Zen base
    const pDefault = new OpenCodeProvider({
      apiKey: 'k',
      model: 'm',
      protocol: 'chat_completions',
    });
    assert.equal(pDefault.getEndpointUrl(), 'https://opencode.ai/zen/v1/chat/completions');

    const pDefaultResp = new OpenCodeProvider({
      apiKey: 'k',
      model: 'm',
      protocol: 'responses',
    });
    assert.equal(pDefaultResp.getEndpointUrl(), 'https://opencode.ai/zen/v1/responses');

    // Custom base URL with chat_completions
    const pCustom = new OpenCodeProvider({
      apiKey: 'k',
      model: 'm',
      protocol: 'chat_completions',
      baseUrl: 'https://custom.opencode.ai/v1',
    });
    assert.equal(pCustom.getEndpointUrl(), 'https://custom.opencode.ai/v1/chat/completions');

    // Prevent double path: base already ends with /chat/completions
    const pDoubleChat = new OpenCodeProvider({
      apiKey: 'k',
      model: 'm',
      protocol: 'chat_completions',
      baseUrl: 'https://opencode.ai/zen/v1/chat/completions',
    });
    assert.equal(pDoubleChat.getEndpointUrl(), 'https://opencode.ai/zen/v1/chat/completions');

    // Prevent double path: base already ends with /responses
    const pDoubleResp = new OpenCodeProvider({
      apiKey: 'k',
      model: 'm',
      protocol: 'responses',
      baseUrl: 'https://opencode.ai/zen/v1/responses',
    });
    assert.equal(pDoubleResp.getEndpointUrl(), 'https://opencode.ai/zen/v1/responses');

    // Prevent /v1/v1
    assert.ok(!pDefault.getEndpointUrl().includes('/v1/v1'));
    assert.ok(!pDefaultResp.getEndpointUrl().includes('/v1/v1'));

    console.log('  ✓ GAP 3: Zen canonical base endpoint truth & no double paths');
  }

  // -----------------------------------------------------------------------
  // 6. GAP 4 REGRESSION: Real Server-Side Request Timeout
  //    Fetch/stream genuinely remains pending until the internal timeout fires.
  //    Timeout fires → logs warning → falls back to deterministic.
  //    Caller abort → immediate cancellation.
  //    No timer leak.
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      // Mock fetch that hangs forever until signal aborts
      globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        });
      }) as unknown as typeof globalThis.fetch;

      // 6a. Internal timeout fires (short 50ms timeout)
      const pTimeout = new OpenCodeProvider({
        apiKey: 'test-key',
        model: 'test-model',
        protocol: 'chat_completions',
        timeoutMs: 50,
      });
      assert.equal(pTimeout.isConfigured(), true);

      const startTime = Date.now();
      const result = await collectChunks(pTimeout.generateStream(COACH_CTX, REQ));
      const elapsed = Date.now() - startTime;

      assert.ok(elapsed >= 40, `Elapsed time should reflect timeout (~50ms), got ${elapsed}ms`);
      assert.ok(elapsed < 2000, `Timeout should fire quickly, took ${elapsed}ms`);
      assert.ok(result.some((c) => c.type === 'done'), 'Should fall back to deterministic after timeout');
      assert.ok(result.some((c) => c.type === 'thinking'), 'Should have thinking state');

      // 6b. Caller abort during pending request → immediate cancellation, 0 chunks
      const ac = new AbortController();
      const callerAbortPromise = collectChunks(pTimeout.generateStream(COACH_CTX, REQ, ac.signal));
      ac.abort();
      const abortResult = await callerAbortPromise;
      assert.equal(abortResult.length, 0, 'Caller abort must immediately return 0 chunks with no late output');

      console.log('  ✓ GAP 4: Real request timeout with deterministic fallback & caller abort safety');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // -----------------------------------------------------------------------
  // 7. GAP 5 REGRESSION: CRLF Framing & Line Endings (\r\n\r\n and \n\n)
  // -----------------------------------------------------------------------
  {
    // 7a. CRLF framing (\r\n\r\n)
    const [crlfEvents, crlfRem] = parseSseBuffer(
      'data: {"choices":[{"delta":{"content":"CRLF"}}]}\r\n\r\ndata: [DONE]\r\n\r\n',
    );
    assert.equal(crlfEvents.length, 2);
    assert.equal(crlfRem, '');
    assert.equal(extractChatCompletionsDelta(JSON.parse(crlfEvents[0])), 'CRLF');
    assert.equal(crlfEvents[1].trim(), '[DONE]');

    // 7b. Mixed framing (\n\n and \r\n\r\n)
    const [mixedEvents] = parseSseBuffer(
      'data: {"choices":[{"delta":{"content":"Mixed1"}}]}\n\ndata: {"choices":[{"delta":{"content":"Mixed2"}}]}\r\n\r\n',
    );
    assert.equal(mixedEvents.length, 2);
    assert.equal(extractChatCompletionsDelta(JSON.parse(mixedEvents[0])), 'Mixed1');
    assert.equal(extractChatCompletionsDelta(JSON.parse(mixedEvents[1])), 'Mixed2');

    // 7c. Fragmented CRLF across reads (chunk 1 ends with \r\n\r, chunk 2 starts with \n)
    const [frag1, rem1] = parseSseBuffer('data: {"choices":[{"delta":{"content":"Frag');
    assert.equal(frag1.length, 0);
    const [frag2, rem2] = parseSseBuffer(rem1 + 'ment"}}]}\r\n\r');
    assert.equal(frag2.length, 0);
    const [frag3, rem3] = parseSseBuffer(rem2 + '\ndata: [DONE]\r\n\r\n');
    assert.equal(frag3.length, 2);
    assert.equal(rem3, '');
    assert.equal(extractChatCompletionsDelta(JSON.parse(frag3[0])), 'Fragment');

    console.log('  ✓ GAP 5: CRLF framing, mixed line endings, and fragmented CRLF handling');
  }

  // -----------------------------------------------------------------------
  // 8. Chat Completions exact text reconstruction
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

      const p = new OpenCodeProvider({
        apiKey: 'test-key-not-real',
        model: 'test-model',
        protocol: 'chat_completions',
        baseUrl: 'https://test.example.com/v1',
      });
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
    }
  }

  // -----------------------------------------------------------------------
  // 9. Responses protocol exact text reconstruction
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const sseData = [
        'data: {"type":"response.created","response":{"id":"r1"}}\r\n\r\n',
        'data: {"type":"response.output_text.delta","delta":"Session"}\r\n\r\n',
        'data: {"type":"response.output_text.delta","delta":" ready"}\r\n\r\n',
        'data: {"type":"response.completed"}\r\n\r\ndata: [DONE]\r\n\r\n',
      ];
      globalThis.fetch = mockFetchWithSse(200, sseData) as typeof globalThis.fetch;

      const p = new OpenCodeProvider({
        apiKey: 'test-key-not-real',
        model: 'test-model',
        protocol: 'responses',
        baseUrl: 'https://test.example.com/v1',
      });
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const deltas = result.filter((c) => c.type === 'delta').map((c) => c.delta);
      assert.equal(deltas.join(''), 'Session ready');
      console.log('  ✓ Responses: exact text reconstruction with CRLF');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // -----------------------------------------------------------------------
  // 10. HTTP error status handling (401, 403, 429, 500)
  // -----------------------------------------------------------------------
  for (const status of [401, 403, 429, 500]) {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = mockFetchWithSse(status, []) as typeof globalThis.fetch;

      const p = new OpenCodeProvider({
        apiKey: 'test-key',
        model: 'test-model',
        protocol: 'chat_completions',
      });
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      assert.ok(result.some((c) => c.type === 'done'), `HTTP ${status} should fall back safely`);
      console.log(`  ✓ HTTP ${status}: falls back to deterministic`);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // -----------------------------------------------------------------------
  // 11. Network failure (fetch throws)
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () => {
        throw new Error('Network unreachable');
      }) as unknown as typeof globalThis.fetch;

      const p = new OpenCodeProvider({
        apiKey: 'test-key',
        model: 'test-model',
        protocol: 'chat_completions',
      });
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      assert.ok(result.some((c) => c.type === 'done'), 'Network failure should fall back');
      console.log('  ✓ Network failure: falls back to deterministic');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // -----------------------------------------------------------------------
  // 12. classifyHttpError
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
  // 13. No API secret leakage in stream output
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      const SECRET = 'sk-super-secret-api-key-12345';
      globalThis.fetch = mockFetchWithSse(500, []) as typeof globalThis.fetch;

      const p = new OpenCodeProvider({
        apiKey: SECRET,
        model: 'test-model',
        protocol: 'chat_completions',
      });
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));

      const serialized = JSON.stringify(result);
      assert.ok(
        !serialized.includes(SECRET),
        'API key must NEVER appear in stream output',
      );
      console.log('  ✓ No API secret leakage in output');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // -----------------------------------------------------------------------
  // 14. Empty response body
  // -----------------------------------------------------------------------
  {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = mockFetchWithSse(200, ['data: [DONE]\n\n']) as typeof globalThis.fetch;

      const p = new OpenCodeProvider({
        apiKey: 'test-key',
        model: 'test-model',
        protocol: 'chat_completions',
      });
      const result = await collectChunks(p.generateStream(COACH_CTX, REQ));
      const deltas = result.filter((c) => c.type === 'delta');
      assert.equal(deltas.length, 0, 'No deltas from empty response');
      assert.ok(result.some((c) => c.type === 'done'), 'Should still emit done');
      console.log('  ✓ Empty response: no deltas, clean done');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  console.log('\n=== SportMind provider contract tests: ALL PASSED ===');
}

runProviderContractTests().catch((err) => {
  console.error('FATAL: SportMind provider contract test failure:', err);
  process.exit(1);
});
