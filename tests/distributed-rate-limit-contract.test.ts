import assert from 'node:assert/strict';
import {
  DistributedRateLimitStore,
  isSharedStoreConfigured,
} from '../src/server/rate-limiter.ts';

async function runDistributedRateLimitTests() {
  console.log('=== RUNNING DISTRIBUTED RATE LIMIT CONTRACT TESTS ===');

  const store = new DistributedRateLimitStore();

  // 1. Check truthful configuration state
  const isConfigured = isSharedStoreConfigured();
  console.log(`  Distributed shared store configured: ${isConfigured}`);

  // 2. Multi-request consumption
  const key = 'distributed-test-ip:10.0.0.1';
  const r1 = await store.consume(key, 2, 1000);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 1);

  const r2 = await store.consume(key, 2, 1000);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 0);

  const r3 = await store.consume(key, 2, 1000);
  assert.equal(r3.allowed, false);
  assert.ok(r3.retryAfterSeconds >= 1);

  // 3. Reset
  store.reset(key);
  const rAfter = await store.consume(key, 2, 1000);
  assert.equal(rAfter.allowed, true);

  console.log('Distributed rate limit contract tests: PASS');
}

runDistributedRateLimitTests().catch((err) => {
  console.error('FATAL: Distributed rate limit test failure:', err);
  process.exit(1);
});
