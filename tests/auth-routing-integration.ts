import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server.ts';
import apiHandler from '../api/index.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

process.env.NODE_ENV = 'test';

// ============================================================================
// PART 1: Express Runtime Integration Tests
// ============================================================================

const app = await createApp({ enableVite: false });
const server = http.createServer(app);

await new Promise<void>((resolve) => {
  server.listen(0, '127.0.0.1', () => resolve());
});

const address = server.address();
assert(address && typeof address === 'object', 'Server must have valid address');
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  // Test 1: GET /api?route=health (Express query routing)
  const queryHealth = await fetch(`${baseUrl}/api?route=health`);
  assert.equal(queryHealth.status, 200);
  assert.match(queryHealth.headers.get('content-type') || '', /^application\/json/);
  const queryHealthJson = await queryHealth.json() as { ok: boolean; service: string };
  assert.equal(queryHealthJson.ok, true);
  assert.equal(queryHealthJson.service, 'united-olympics-sports');

  // Test 2: GET /api/v1/health (Express path routing)
  const pathHealth = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(pathHealth.status, 200);
  assert.match(pathHealth.headers.get('content-type') || '', /^application\/json/);
  const pathHealthJson = await pathHealth.json() as { ok: boolean };
  assert.equal(pathHealthJson.ok, true);

  // Test 3: POST /api?route=auth-session (Express query routing - CONFIRMED P0 BUG FIX)
  // Must return 401 JSON, NEVER fall through to index.html!
  const queryAuthSession = await fetch(`${baseUrl}/api?route=auth-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(queryAuthSession.status, 401);
  assert.match(queryAuthSession.headers.get('content-type') || '', /^application\/json/);
  const queryAuthSessionJson = await queryAuthSession.json() as { error: { code: string } };
  assert.equal(queryAuthSessionJson.error.code, 'AUTH_REQUIRED');

  // Test 4: GET /api?route=auth-session (Wrong method - must return 405 JSON, not index.html)
  const queryAuthSessionGet = await fetch(`${baseUrl}/api?route=auth-session`);
  assert.equal(queryAuthSessionGet.status, 405);
  assert.match(queryAuthSessionGet.headers.get('content-type') || '', /^application\/json/);
  const queryAuthSessionGetJson = await queryAuthSessionGet.json() as { error: { code: string } };
  assert.equal(queryAuthSessionGetJson.error.code, 'METHOD_NOT_ALLOWED');

  // Test 5: POST /auth/session (Express path routing parity)
  const pathAuthSession = await fetch(`${baseUrl}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(pathAuthSession.status, 401);
  assert.match(pathAuthSession.headers.get('content-type') || '', /^application\/json/);
  const pathAuthSessionJson = await pathAuthSession.json() as { error: { code: string } };
  assert.equal(pathAuthSessionJson.error.code, 'AUTH_REQUIRED');

  // Test 6: GET /api?route=portal-whoami (Express query routing - CONFIRMED P0 BUG FIX)
  // Must return 401 JSON, NEVER fall through to index.html!
  const queryPortalWhoAmI = await fetch(`${baseUrl}/api?route=portal-whoami`);
  assert.equal(queryPortalWhoAmI.status, 401);
  assert.match(queryPortalWhoAmI.headers.get('content-type') || '', /^application\/json/);
  const queryPortalWhoAmIJson = await queryPortalWhoAmI.json() as { error: { code: string } };
  assert.equal(queryPortalWhoAmIJson.error.code, 'AUTH_REQUIRED');

  // Test 7: GET /api/v1/portal/whoami (Express path routing parity)
  const pathPortalWhoAmI = await fetch(`${baseUrl}/api/v1/portal/whoami`);
  assert.equal(pathPortalWhoAmI.status, 401);
  assert.match(pathPortalWhoAmI.headers.get('content-type') || '', /^application\/json/);
  const pathPortalWhoAmIJson = await pathPortalWhoAmI.json() as { error: { code: string } };
  assert.equal(pathPortalWhoAmIJson.error.code, 'AUTH_REQUIRED');

  // Test 8: GET /api/v1/admin/whoami (Express admin whoami)
  const adminWhoAmI = await fetch(`${baseUrl}/api/v1/admin/whoami`);
  assert.equal(adminWhoAmI.status, 401);
  assert.match(adminWhoAmI.headers.get('content-type') || '', /^application\/json/);
  const adminWhoAmIJson = await adminWhoAmI.json() as { error: { code: string } };
  assert.equal(adminWhoAmIJson.error.code, 'AUTH_REQUIRED');

  // Test 9: Unknown API route must return 404 JSON, NOT index.html
  const unknownApi = await fetch(`${baseUrl}/api?route=nonexistent-endpoint`);
  assert.equal(unknownApi.status, 404);
  assert.match(unknownApi.headers.get('content-type') || '', /^application\/json/);
  const unknownApiJson = await unknownApi.json() as { error: { code: string } };
  assert.equal(unknownApiJson.error.code, 'API_NOT_FOUND');

  // Test 10: Security Headers (Section 22)
  assert.equal(queryHealth.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(queryHealth.headers.get('x-frame-options'), 'DENY');
  assert.match(queryHealth.headers.get('referrer-policy') || '', /strict-origin/);
  assert.match(queryHealth.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);

  console.log('Express integration routing tests: PASS');
} finally {
  server.close();
}

// ============================================================================
// PART 2: Serverless Adapter Contract Tests (Vercel Parity)
// ============================================================================

class MockVercelResponse implements ApiResponse {
  statusCode = 200;
  headers = new Map<string, string>();
  body = '';

  setHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  end(body = ''): void {
    this.body = body;
  }

  json(): unknown {
    return this.body ? JSON.parse(this.body) : undefined;
  }
}

async function callVercel(
  url: string,
  method = 'GET',
  query?: Record<string, string>,
  body?: unknown,
): Promise<MockVercelResponse> {
  const res = new MockVercelResponse();
  const req: ApiRequest & { query?: Record<string, string> } = {
    method,
    url,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    query,
    body,
  };
  await apiHandler(req, res);
  return res;
}

// Vercel Test 1: GET /api?route=health via serverless adapter
const vercelHealth = await callVercel('/api?route=health', 'GET', { route: 'health' });
assert.equal(vercelHealth.statusCode, 200);
assert.match(vercelHealth.headers.get('content-type') || '', /^application\/json/);
assert.equal((vercelHealth.json() as { ok: boolean }).ok, true);

// Vercel Test 2: POST /api?route=auth-session via serverless adapter
const vercelAuthSession = await callVercel('/api?route=auth-session', 'POST', { route: 'auth-session' }, {});
assert.equal(vercelAuthSession.statusCode, 401);
assert.match(vercelAuthSession.headers.get('content-type') || '', /^application\/json/);
assert.equal((vercelAuthSession.json() as { error: { code: string } }).error.code, 'AUTH_REQUIRED');

// Vercel Test 3: GET /api?route=portal-whoami via serverless adapter
const vercelPortalWhoAmI = await callVercel('/api?route=portal-whoami', 'GET', { route: 'portal-whoami' });
assert.equal(vercelPortalWhoAmI.statusCode, 401);
assert.match(vercelPortalWhoAmI.headers.get('content-type') || '', /^application\/json/);
assert.equal((vercelPortalWhoAmI.json() as { error: { code: string } }).error.code, 'AUTH_REQUIRED');

// Vercel Test 4: Path routing through serverless adapter rewrite
const vercelPathAuth = await callVercel('/auth/session', 'POST', undefined, {});
assert.equal(vercelPathAuth.statusCode, 401);
assert.match(vercelPathAuth.headers.get('content-type') || '', /^application\/json/);
assert.equal((vercelPathAuth.json() as { error: { code: string } }).error.code, 'AUTH_REQUIRED');

// Vercel Test 5: Unknown route through serverless adapter
const vercelUnknown = await callVercel('/api?route=unknown', 'GET', { route: 'unknown' });
assert.equal(vercelUnknown.statusCode, 404);
assert.match(vercelUnknown.headers.get('content-type') || '', /^application\/json/);
assert.equal((vercelUnknown.json() as { error: { code: string } }).error.code, 'API_NOT_FOUND');

console.log('Serverless adapter contract tests: PASS');
console.log('P0 LOCAL AUTH ROUTING CLOSURE: PASS');
