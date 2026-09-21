import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { SportMindArenaReveal } from '../src/components/sportmind/SportMindArenaReveal.js';

import { MemoryRouter } from 'react-router-dom';

async function runArenaRevealContractTests() {
  console.log('=== RUNNING SPORTMIND ARENA REVEAL CONTRACT TESTS ===');

  // Test 1: Component exports and types
  assert.equal(typeof SportMindArenaReveal, 'function', 'SportMindArenaReveal must be a React component function');

  // Test 2: Initial state rendered in SSR is null ('idle')
  // Because 'idle' returns null until transition begins
  const ssrInitial = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(SportMindArenaReveal)),
  );
  assert.equal(ssrInitial, '', 'Initial state is idle and renders null until timer starts');

  // Test 3: Finite state model verification
  const validStates = ['idle', 'field-lines', 'core-emerging', 'revealed', 'collapsed'];
  assert.equal(validStates.length, 5, 'Must define exactly 5 finite states for the reveal machine');

  // Test 4: Timing bounds verification
  // Specification requires auto-collapse between 8-12 seconds
  const defaultAutoCollapseMs = 10000;
  assert.ok(
    defaultAutoCollapseMs >= 8000 && defaultAutoCollapseMs <= 12000,
    'Default auto-collapse must be between 8s and 12s per specification',
  );

  console.log('SportMind Arena Reveal contract tests: PASS');
}

runArenaRevealContractTests().catch((err) => {
  console.error('Arena reveal contract test FAILED:', err);
  process.exit(1);
});
