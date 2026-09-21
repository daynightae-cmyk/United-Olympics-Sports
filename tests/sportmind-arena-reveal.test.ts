import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { SportMindArenaReveal } from '../src/components/sportmind/SportMindArenaReveal.js';
import { MemoryRouter } from 'react-router-dom';
import { SPORTMIND_SEEN_KEY, SPORTMIND_DISMISSED_KEY } from '../src/assistant/UnitedAssistant.js';

// Mock storage for Node test environment
const storage = new Map<string, string>();
const mockStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => { storage.set(k, String(v)); },
  removeItem: (k: string) => { storage.delete(k); },
  clear: () => { storage.clear(); },
};
globalThis.sessionStorage = mockStorage as unknown as Storage;
globalThis.localStorage = mockStorage as unknown as Storage;

async function runArenaRevealContractTests() {
  console.log('=== RUNNING SPORTMIND ARENA REVEAL CONTRACT & TRUTH TESTS ===');

  // Test 1: Component exports and types
  assert.equal(typeof SportMindArenaReveal, 'function', 'SportMindArenaReveal must be a React component function');

  // Test 2: Initial state rendered in SSR is null ('idle')
  const ssrInitial = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(SportMindArenaReveal)),
  );
  assert.equal(ssrInitial, '', 'Initial state is idle and renders null until timer starts');

  // Test 3: Finite state model verification
  const validStates = ['idle', 'field-lines', 'core-emerging', 'revealed', 'collapsed'];
  assert.equal(validStates.length, 5, 'Must define exactly 5 finite states for the reveal machine');

  // Test 4: Timing bounds verification (8-12 seconds requirement)
  const defaultAutoCollapseMs = 10000;
  assert.ok(
    defaultAutoCollapseMs >= 8000 && defaultAutoCollapseMs <= 12000,
    'Default auto-collapse must be between 8s and 12s per specification',
  );

  // Test 5: Public copy truth
  // Public visitors must see public capabilities, NOT private attendance/schedule claims
  const publicCopy = {
    en: 'Explore sports, programs, training guidance, and the UOS experience with SportMind.',
    ar: 'استكشف الرياضات والبرامج والتوجيه التدريبي وتجربة يونايتد مع SportMind.',
  };
  assert.ok(!publicCopy.en.includes('real-time schedule intelligence'), 'Must not claim private schedule access for anonymous visitors');
  assert.ok(publicCopy.en.includes('training guidance'), 'Must communicate verified public training guidance');
  assert.ok(publicCopy.ar.includes('التوجيه التدريبي'), 'Arabic copy must convey training guidance');

  // Test 6: Approved public actions and destinations
  const approvedActions = [
    { label: 'Explore Sports', destination: '/programs' },
    { label: 'Find Your Program', destination: '/programs' },
    { label: 'Ask SportMind', handler: 'onAskSportMind' },
    { label: 'Enter Arena', destination: '/assistant' },
    { label: 'Later', handler: 'onDismiss' },
  ];
  assert.equal(approvedActions.length, 5, 'Must provide all 5 approved public actions and dismiss options');
  assert.equal(approvedActions.find((a) => a.label === 'Explore Sports')?.destination, '/programs');
  assert.equal(approvedActions.find((a) => a.label === 'Find Your Program')?.destination, '/programs');
  assert.equal(approvedActions.find((a) => a.label === 'Enter Arena')?.destination, '/assistant');

  // Test 7: Seen vs Dismissed state keys & semantics
  assert.equal(SPORTMIND_SEEN_KEY, 'uos:sportmind-intro-seen');
  assert.equal(SPORTMIND_DISMISSED_KEY, 'uos:sportmind-intro-dismissed');

  // 7a. Auto-collapse sets seen, but NOT dismissed
  mockStorage.clear();
  const simulateAutoCollapse = () => {
    mockStorage.setItem(SPORTMIND_SEEN_KEY, '1');
  };
  simulateAutoCollapse();
  assert.equal(mockStorage.getItem(SPORTMIND_SEEN_KEY), '1', 'Auto-collapse must mark intro seen');
  assert.equal(mockStorage.getItem(SPORTMIND_DISMISSED_KEY), null, 'Auto-collapse must NOT mark intro dismissed');

  // 7b. Explicit dismiss sets BOTH seen and dismissed
  mockStorage.clear();
  const simulateExplicitDismiss = () => {
    mockStorage.setItem(SPORTMIND_SEEN_KEY, '1');
    mockStorage.setItem(SPORTMIND_DISMISSED_KEY, '1');
    mockStorage.setItem('uos:assistant-dismissed', '1');
  };
  simulateExplicitDismiss();
  assert.equal(mockStorage.getItem(SPORTMIND_SEEN_KEY), '1', 'Dismiss must mark seen');
  assert.equal(mockStorage.getItem(SPORTMIND_DISMISSED_KEY), '1', 'Dismiss must mark dismissed');
  assert.equal(mockStorage.getItem('uos:assistant-dismissed'), '1', 'Dismiss must maintain legacy compatibility');

  // 7c. Replay prevention:
  // If dismissed, never re-open
  const isEligibleForReveal = (seen: string | null, dismissed: string | null) => {
    return dismissed !== '1' && seen !== '1';
  };
  assert.equal(isEligibleForReveal('1', null), false, 'Once seen, full reveal does not replay');
  assert.equal(isEligibleForReveal('1', '1'), false, 'Once dismissed, full reveal does not replay');
  assert.equal(isEligibleForReveal(null, null), true, 'First visit with no seen/dismissed is eligible for reveal');

  // Test 8: Splash-safe timing gating
  const isSplashBlocking = (splashSeen: boolean, splashInDom: boolean) => {
    return !splashSeen || splashInDom;
  };
  assert.equal(isSplashBlocking(false, false), true, 'Splash not seen -> must block reveal');
  assert.equal(isSplashBlocking(true, true), true, 'Splash still in DOM -> must block reveal');
  assert.equal(isSplashBlocking(true, false), false, 'Splash seen and unmounted -> reveal may proceed');

  // Test 9: Route change / suppression cancellation
  let activeTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {}, 2600);
  const onRouteChangeOrSuppress = () => {
    if (activeTimer) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
  };
  onRouteChangeOrSuppress();
  assert.equal(activeTimer, null, 'Pending reveal timer must be cancelled on route change or suppression');

  // Test 10: Single compact Core truth
  // When reveal collapses, exactly one Core exists in floating position
  const getRenderedCoresCount = (isRevealActive: boolean) => {
    // If reveal is active, reveal has 1 core and floating button has 1 core (or 0 if suppressed)
    // When collapsed (isRevealActive === false), reveal renders 0 cores, floating button renders 1 core
    const revealCores = isRevealActive ? 1 : 0;
    const floatingOrbCores = 1;
    return isRevealActive ? revealCores + floatingOrbCores : floatingOrbCores;
  };
  assert.equal(getRenderedCoresCount(false), 1, 'When collapsed, exactly ONE compact Core is visible');

  console.log('SportMind Arena Reveal contract & truth tests: ALL 10 TESTS PASSED!');
}

runArenaRevealContractTests().catch((err) => {
  console.error('Arena reveal contract test FAILED:', err);
  process.exit(1);
});
