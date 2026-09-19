import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { applySecurityHeaders } from '../src/server/security-headers.ts';
import { createApp } from '../server.ts';
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

  // 6. Standalone server wiring fails closed: unknown/unset NODE_ENV keeps
  // production-safe defaults, while 'unsafe-eval' follows Vite dev
  // middleware (never the environment name alone).
  const savedNodeEnv = process.env.NODE_ENV;
  async function fetchDocumentHeaders(nodeEnv: string | undefined, enableVite: boolean): Promise<Headers> {
    if (nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = nodeEnv;
    const app = await createApp({ enableVite });
    const server = await new Promise<import('node:http').Server>((resolve) => {
      const started = app.listen(0, '127.0.0.1', () => resolve(started));
    });
    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/store`);
      return response.headers;
    } finally {
      if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = savedNodeEnv;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  const prodHeaders = await fetchDocumentHeaders('production', false);
  assert.ok(prodHeaders.get('strict-transport-security'), 'production must emit HSTS');
  assert.equal(prodHeaders.get('content-security-policy')?.includes("'unsafe-eval'"), false, 'production must not allow unsafe-eval');

  const unsetHeaders = await fetchDocumentHeaders(undefined, false);
  assert.ok(unsetHeaders.get('strict-transport-security'), 'unset NODE_ENV must keep HSTS (fail closed)');
  assert.equal(unsetHeaders.get('content-security-policy')?.includes("'unsafe-eval'"), false, 'unset NODE_ENV without Vite must not allow unsafe-eval');

  const devHeaders = await fetchDocumentHeaders('development', false);
  assert.equal(devHeaders.get('strict-transport-security'), null, 'development must not emit HSTS');

  const viteHeaders = await fetchDocumentHeaders('development', true);
  assert.equal(viteHeaders.get('content-security-policy')?.includes("'unsafe-eval'"), true, 'Vite dev middleware must keep unsafe-eval for the dev loop');

  console.log('Security headers tests: PASS');
}

runSecurityHeadersTests().then(() => {
  // The Vite-boot case leaves HMR/watch handles open by design; exit
  // explicitly so the suite cannot hang. Failures exit non-zero via catch.
  process.exit(0);
}).catch((err) => {
  console.error('FATAL: Security headers test failure:', err);
  process.exit(1);
});
