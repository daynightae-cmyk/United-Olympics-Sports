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
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.equal(csp.includes('  '), false, 'CSP must not contain doubled spaces');

  // 4. HSTS is opt-in (serverless production enables it explicitly).
  assert.equal(res.headers.get('strict-transport-security'), undefined, 'HSTS must be off by default');
  const hstsRes = new MockResponse();
  applySecurityHeaders(hstsRes, { enableHsts: true });
  assert.equal(
    hstsRes.headers.get('strict-transport-security'),
    'max-age=31536000; includeSubDomains; preload',
    'HSTS must be emitted when enabled',
  );

  // 5. Caller additions extend (never replace) the canonical policy.
  const extended = new MockResponse();
  applySecurityHeaders(extended, {
    cspScriptSrc: ['https://*.firebaseapp.com'],
    cspFrameSrc: ['https://*.firebaseapp.com'],
    cspConnectSrc: ['wss://*.supabase.co'],
  });
  const extendedCsp = extended.headers.get('content-security-policy') ?? '';
  assert.match(extendedCsp, /https:\/\/\*\.firebaseapp\.com/, 'script/frame additions must be present');
  assert.match(extendedCsp, /wss:\/\/\*\.supabase\.co/, 'connect additions must be present');
  assert.match(extendedCsp, /script-src 'self' 'unsafe-inline' https:\/\/apis\.google\.com/, 'base script-src must be preserved');
  assert.match(extendedCsp, /object-src 'none'/, 'base hardening directives must be preserved');

  console.log('Security headers tests: PASS');
}

runSecurityHeadersTests().catch((err) => {
  console.error('FATAL: Security headers test failure:', err);
  process.exit(1);
});
