import assert from 'node:assert/strict';
import type {
  SportMindModule,
  SportMindStreamChunk,
} from '../src/server/sportmind/types.js';

// ---------------------------------------------------------------------------
// Streaming Lifecycle State Machine Simulation
// Mirrors the exact state machine and reader logic in SportMindArena.tsx
// ---------------------------------------------------------------------------

interface MessageEntry {
  id: string;
  sender: 'user' | 'sportmind';
  text?: string;
  modules?: SportMindModule[];
  timestamp: string;
}

class SportMindStreamingSession {
  state: 'idle' | 'thinking' | 'streaming' | 'complete' | 'error' = 'idle';
  thinkingText: { en: string; ar: string } | null = null;
  streamingDelta = '';
  messages: MessageEntry[] = [];
  abortController: AbortController | null = null;
  isMounted = true;
  isAborted = false;
  private streamingText = '';

  constructor() {
    this.isMounted = true;
    this.isAborted = false;
  }

  startRequest(prompt: string) {
    const userMsg: MessageEntry = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: '12:00 PM',
    };
    this.messages.push(userMsg);
    this.streamingDelta = '';
    this.streamingText = '';
    this.state = 'thinking';
    this.isAborted = false;
    this.thinkingText = {
      en: 'Analyzing sports context and session parameters…',
      ar: 'تحليل السياق الرياضي وبيانات الحصة…',
    };
    this.abortController = new AbortController();
  }

  processChunk(chunk: SportMindStreamChunk, accumulatedModules: SportMindModule[]) {
    if (!this.isMounted || this.isAborted || this.abortController?.signal.aborted) return;

    if (chunk.type === 'thinking' && chunk.thinkingState) {
      this.thinkingText = chunk.thinkingState;
    } else if (chunk.type === 'delta' && chunk.delta) {
      this.streamingText += chunk.delta;
      this.streamingDelta = this.streamingText;
      this.state = 'streaming';
      this.thinkingText = null;
    } else if (chunk.type === 'module' && chunk.module) {
      accumulatedModules.push(chunk.module);
    } else if (chunk.type === 'done') {
      this.state = 'complete';
      this.thinkingText = null;
    } else if (chunk.type === 'error') {
      this.state = 'error';
      this.thinkingText = null;
      this.streamingDelta = '';
    }
  }

  finalize(accumulatedModules: SportMindModule[]) {
    if (!this.isMounted || this.isAborted || this.abortController?.signal.aborted) return;

    this.streamingDelta = '';
    if (accumulatedModules.length > 0) {
      const assistantMsg: MessageEntry = {
        id: `sm-${Date.now()}`,
        sender: 'sportmind',
        modules: [...accumulatedModules],
        timestamp: '12:01 PM',
      };
      this.messages.push(assistantMsg);
    } else if (this.streamingText.trim()) {
      const assistantMsg: MessageEntry = {
        id: `sm-${Date.now()}`,
        sender: 'sportmind',
        text: this.streamingText.trim(),
        timestamp: '12:01 PM',
      };
      this.messages.push(assistantMsg);
    }
    this.streamingText = '';
    this.state = 'complete';
    this.thinkingText = null;
  }

  stopGeneration() {
    this.isAborted = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.streamingText.trim()) {
      const partialMsg: MessageEntry = {
        id: `sm-${Date.now()}`,
        sender: 'sportmind',
        text: this.streamingText.trim(),
        timestamp: '12:01 PM',
      };
      this.messages.push(partialMsg);
    }
    this.streamingDelta = '';
    this.streamingText = '';
    this.state = 'idle';
    this.thinkingText = null;
  }

  unmount() {
    this.isMounted = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runStreamingLifecycleTests() {
  console.log('=== RUNNING SPORTMIND FRONTEND STREAMING LIFECYCLE TESTS ===');

  // 1. First delta becomes visible before done
  {
    const session = new SportMindStreamingSession();
    session.startRequest('How should I prepare?');
    assert.equal(session.state, 'thinking');
    assert.equal(session.streamingDelta, '');

    const modules: SportMindModule[] = [];
    // First delta arrives
    session.processChunk({ type: 'delta', delta: 'Train' }, modules);
    assert.equal(session.state, 'streaming');
    assert.equal(session.streamingDelta, 'Train', 'First delta must be visible before done');
    assert.equal(session.thinkingText, null, 'Thinking bar cleared when delta arrives');
    console.log('  ✓ 1. First delta becomes visible before done');
  }

  // 2. Subsequent deltas append correctly
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Tell me about drills');
    const modules: SportMindModule[] = [];

    session.processChunk({ type: 'delta', delta: 'Train' }, modules);
    assert.equal(session.streamingDelta, 'Train');

    session.processChunk({ type: 'delta', delta: 'ing ' }, modules);
    assert.equal(session.streamingDelta, 'Training ');

    session.processChunk({ type: 'delta', delta: 'plan' }, modules);
    assert.equal(session.streamingDelta, 'Training plan', 'Subsequent deltas must append in order');
    console.log('  ✓ 2. Subsequent deltas append correctly');
  }

  // 3. Final response appears once & no duplicate output (module replaces deltas)
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Session plan');
    const modules: SportMindModule[] = [];

    // Stream deltas first
    session.processChunk({ type: 'delta', delta: 'Preparing ' }, modules);
    session.processChunk({ type: 'delta', delta: 'plan...' }, modules);
    assert.equal(session.streamingDelta, 'Preparing plan...');

    // Final structured module arrives
    const coachBoardMod: SportMindModule = {
      id: 'cb-1',
      type: 'COACH_BOARD',
      title: { en: 'Session Plan', ar: 'خطة الحصة' },
    };
    session.processChunk({ type: 'module', module: coachBoardMod }, modules);

    // Done event
    session.processChunk({ type: 'done' }, modules);
    session.finalize(modules);

    assert.equal(session.streamingDelta, '', 'streamingDelta must be cleared on finalization');
    assert.equal(session.state, 'complete');

    // Exactly 2 messages total: 1 user, 1 sportmind
    assert.equal(session.messages.length, 2, 'Must have exactly 2 messages (user + sportmind)');
    const assistantMsg = session.messages.find((m) => m.sender === 'sportmind');
    assert.ok(assistantMsg, 'Assistant message must exist');
    assert.equal(assistantMsg.modules?.length, 1, 'Final module must be present');
    assert.equal(assistantMsg.text, undefined, 'Text must not duplicate alongside structured module');
    console.log('  ✓ 3. Final response appears once, no duplicate output');
  }

  // 4. Text-only stream finalization (no module, deltas become final text)
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Simple question');
    const modules: SportMindModule[] = [];

    session.processChunk({ type: 'delta', delta: 'Direct answer' }, modules);
    session.processChunk({ type: 'done' }, modules);
    session.finalize(modules);

    assert.equal(session.streamingDelta, '');
    const assistantMsg = session.messages.find((m) => m.sender === 'sportmind');
    assert.ok(assistantMsg);
    assert.equal(assistantMsg.text, 'Direct answer');
    console.log('  ✓ 4. Text-only stream finalizes into single message');
  }

  // 5. Stop aborts stream immediately
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Stop test');
    const modules: SportMindModule[] = [];

    session.processChunk({ type: 'delta', delta: 'Partial text...' }, modules);
    assert.equal(session.state, 'streaming');

    // User presses Stop
    session.stopGeneration();
    assert.equal(session.state, 'idle', 'State returns to idle on stop');
    assert.equal(session.thinkingText, null, 'Thinking text cleared');
    assert.equal(session.streamingDelta, '', 'streamingDelta cleared');

    // Verify partial text was captured
    const partialMsg = session.messages.find((m) => m.sender === 'sportmind');
    assert.ok(partialMsg, 'Partial text preserved');
    assert.equal(partialMsg.text, 'Partial text...');

    // Late chunk arriving after abort is ignored
    session.processChunk({ type: 'delta', delta: 'SHOULD NOT APPEAR' }, modules);
    session.finalize(modules);
    assert.equal(session.messages.filter((m) => m.sender === 'sportmind').length, 1, 'No late chunks injected after abort');
    console.log('  ✓ 5. Stop aborts stream and prevents zombie generation');
  }

  // 6. Route / unmount safety: abort controller cancels, no state update after unmount
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Unmount test');
    const modules: SportMindModule[] = [];

    session.processChunk({ type: 'delta', delta: 'Before unmount' }, modules);
    assert.equal(session.isMounted, true);

    // Component unmounts (e.g. user navigates away)
    session.unmount();
    assert.equal(session.isMounted, false);
    assert.equal(session.abortController, null, 'AbortController cleaned up on unmount');

    // Late chunks arriving after unmount do not update state
    session.processChunk({ type: 'delta', delta: 'After unmount' }, modules);
    session.finalize(modules);
    assert.equal(session.messages.filter((m) => m.sender === 'sportmind').length, 0, 'No state updates after unmount');
    console.log('  ✓ 6. Route/unmount safety: abort and cleanup with no late state updates');
  }

  // 7. Error state recovers gracefully
  {
    const session = new SportMindStreamingSession();
    session.startRequest('Error test');
    const modules: SportMindModule[] = [];

    session.processChunk({ type: 'error', error: { code: 'FAIL', message: 'Err' } }, modules);
    assert.equal(session.state, 'error', 'Transitions to error state');
    assert.equal(session.thinkingText, null, 'Thinking bar cleared on error');
    assert.equal(session.streamingDelta, '', 'streamingDelta cleared on error');
    console.log('  ✓ 7. Error state recovers cleanly');
  }

  console.log('\n=== SPORTMIND FRONTEND STREAMING TESTS: ALL PASSED ===');
}

runStreamingLifecycleTests().catch((err) => {
  console.error('FATAL: SportMind streaming test failure:', err);
  process.exit(1);
});
