import assert from 'node:assert/strict';
import { applySecurityHeaders } from '../src/server/security-headers.ts';
import type { ApiResponse } from '../src/server/http.ts';

class MockResponse implements ApiResponse {
  statusCode = 200;
  headers = new Map<string, string>();
  body?: string;

  setHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  end(body?: string): void {
    this.body = body;
  }
}

async function runSecurityHeadersTests() {
  console.log('=== RUNNING SECURITY HEADERS TESTS ===');

  const res = new MockResponse();
  applySecurityHeaders(res);

  // 1. Clickjacking & sniffing
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');

  // 2. Referrer & Permissions
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(res.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()');

  // 3. CSP
  const csp = res.headers.get('content-security-policy');
  assert.ok(csp);
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src 'self' https:\/\/\*\.supabase\.co/);

  console.log('Security headers tests: PASS');
}

runSecurityHeadersTests().catch((err) => {
  console.error('FATAL: Security headers test failure:', err);
  process.exit(1);
});
