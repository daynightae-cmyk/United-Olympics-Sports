import assert from 'node:assert/strict';
import { dispatchRoute } from '../src/server/routes.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

class MockResponse implements ApiResponse {
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

async function call(route: string, req: Partial<ApiRequest>): Promise<MockResponse> {
  const res = new MockResponse();
  await dispatchRoute(route, {
    method: req.method || 'GET',
    url: req.url || '/',
    headers: req.headers || {},
    body: req.body,
  }, res);
  return res;
}

const health = await call('health', { method: 'GET' });
assert.equal(health.statusCode, 200);
assert.match(health.headers.get('content-type') || '', /^application\/json/);
assert.equal((health.json() as { ok: boolean }).ok, true);
assert.equal(health.body.includes('SQL_PASSWORD'), false);
assert.equal(health.body.includes('FIREBASE_SERVICE_ACCOUNT_JSON'), false);

const missingSession = await call('auth-session', { method: 'POST' });
assert.equal(missingSession.statusCode, 401);
assert.equal((missingSession.json() as { error: { code: string } }).error.code, 'AUTH_REQUIRED');

const adminDenied = await call('admin-whoami', { method: 'GET' });
assert.equal(adminDenied.statusCode, 401);
assert.equal((adminDenied.json() as { error: { code: string } }).error.code, 'AUTH_REQUIRED');

const invalidEnquiry = await call('public-enquiries', {
  method: 'POST',
  body: { name: 'Test User' },
});
assert.equal(invalidEnquiry.statusCode, 400);
assert.equal((invalidEnquiry.json() as { error: { code: string } }).error.code, 'VALIDATION_ERROR');

const unknown = await call('missing-route', { method: 'GET' });
assert.equal(unknown.statusCode, 404);
assert.equal((unknown.json() as { error: { code: string } }).error.code, 'API_NOT_FOUND');

const wrongMethod = await call('health', { method: 'POST' });
assert.equal(wrongMethod.statusCode, 405);
assert.equal((wrongMethod.json() as { error: { code: string } }).error.code, 'METHOD_NOT_ALLOWED');

console.log('server-contracts: PASS');
