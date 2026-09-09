import assert from 'node:assert/strict';
import {
  RateLimiter,
  MemoryRateLimitStore,
  getClientIp,
  validateHoneypot,
} from '../src/server/rate-limiter.ts';
import { ApiError, type ApiRequest } from '../src/server/http.ts';

async function runSecurityControlsTests() {
  console.log('=== RUNNING PHASE 15: SECURITY CONTROLS & ABUSE PREVENTION TESTS ===\n');

  // Test 1: Honeypot Detection
  {
    console.log('Test 1: Honeypot anti-spam filtering');
    assert.equal(validateHoneypot({ name: 'John Doe', email: 'john@example.com' }), true);
    assert.equal(validateHoneypot({ name: 'Bot', email: 'bot@spam.com', website: 'https://spam.xyz' }), false);
    assert.equal(validateHoneypot({ name: 'Bot2', email: 'bot2@spam.com', hp: 'hidden_val' }), false);
    assert.equal(validateHoneypot({ name: 'Clean', email: 'clean@example.com', website: '' }), true);
    console.log('  -> PASS: Honeypot accurately catches automated form submissions.');
  }

  // Test 2: Client IP Resolution
  {
    console.log('Test 2: Safe client IP extraction with header precedence');

    const reqCloudflare: ApiRequest = {
      headers: {
        'cf-connecting-ip': '203.0.113.195',
        'x-forwarded-for': '198.51.100.1, 192.0.2.1',
      },
    };
    assert.equal(getClientIp(reqCloudflare), '203.0.113.195');

    const reqRealIp: ApiRequest = {
      headers: {
        'x-real-ip': '198.51.100.42',
      },
    };
    assert.equal(getClientIp(reqRealIp), '198.51.100.42');

    const reqForwarded: ApiRequest = {
      headers: {
        'x-forwarded-for': '192.0.2.55, 10.0.0.1',
      },
    };
    assert.equal(getClientIp(reqForwarded), '192.0.2.55');

    const reqFallback: ApiRequest = {
      headers: {},
    };
    assert.equal(getClientIp(reqFallback), '127.0.0.1');

    console.log('  -> PASS: Client IP correctly extracted across reverse proxies.');
  }

  // Test 3: Sliding Window Rate Limiting
  {
    console.log('Test 3: Sliding window rate limiting under load');
    const store = new MemoryRateLimitStore();
    const limiter = new RateLimiter(store);
    const key = 'test-client-ip:127.0.0.1';
    const limit = 3;
    const windowMs = 1000; // 1 second

    // 1st request
    const r1 = await limiter.consume(key, limit, windowMs);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 2);

    // 2nd request
    const r2 = await limiter.consume(key, limit, windowMs);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 1);

    // 3rd request (hits limit)
    const r3 = await limiter.consume(key, limit, windowMs);
    assert.equal(r3.allowed, true);
    assert.equal(r3.remaining, 0);

    // 4th request (rejected)
    const r4 = await limiter.consume(key, limit, windowMs);
    assert.equal(r4.allowed, false);
    assert.equal(r4.remaining, 0);
    assert.ok(r4.retryAfterSeconds >= 1);

    // Test assertAllowed throws ApiError 429
    await assert.rejects(
      async () => {
        await limiter.assertAllowed(key, limit, windowMs, 'enquiry submission');
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 429);
        assert.equal(err.code, 'RATE_LIMIT_EXCEEDED');
        return true;
      },
    );

    console.log('  -> PASS: Sliding window blocks burst abuse with 429 and Retry-After.');
  }

  // Test 4: Rate Limiter Reset and Expiry
  {
    console.log('Test 4: Rate limit resets after window expiry or manual reset');
    const store = new MemoryRateLimitStore();
    const limiter = new RateLimiter(store);
    const key = 'test-client-reset';

    await limiter.consume(key, 1, 50);
    const blocked = await limiter.consume(key, 1, 50);
    assert.equal(blocked.allowed, false);

    store.reset(key);
    const afterReset = await limiter.consume(key, 1, 50);
    assert.equal(afterReset.allowed, true);
    console.log('  -> PASS: Rate limit store handles resets cleanly.');
  }

  console.log('\n>>> ALL PHASE 15 SECURITY CONTROLS TESTS PASSED SUCCESSFULLY! <<<\n');
}

runSecurityControlsTests().catch((err) => {
  console.error('FATAL: Security controls test failure:', err);
  process.exit(1);
});
