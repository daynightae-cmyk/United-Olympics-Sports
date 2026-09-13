import assert from 'node:assert/strict';
import { phoneOtpRequestHandler, phoneOtpVerifyHandler } from '../src/server/phone-auth-handlers.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

delete process.env.DATABASE_URL;
delete process.env.SQL_HOST;

async function mockCall(handler: (req: ApiRequest, res: ApiResponse) => Promise<void>, body: Record<string, unknown>) {
  let statusCode = 200;
  let text = '';
  const req = { url: '/api/v1/auth/phone/x', method: 'POST', headers: {}, body } as ApiRequest;
  const res = {
    statusCode: 200,
    setHeader() { /* sink */ },
    end(data?: string) { if (data) text = data; },
  } as unknown as ApiResponse;
  const capturing = new Proxy(res, {
    set(target, prop, value) {
      if (prop === 'statusCode') statusCode = value as number;
      return Reflect.set(target, prop, value);
    },
  });
  try {
    await handler(req, capturing);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const code = (error as { code?: string }).code ?? 'INTERNAL_ERROR';
    const message = error instanceof Error ? error.message : 'Request failed.';
    statusCode = status;
    text = JSON.stringify({ ok: false, error: { code, message } });
  }
  return { statusCode, payload: JSON.parse(text || '{}') as Record<string, any> };
}

function stubSupabase(handler: (url: string, body: Record<string, unknown>) => { status: number; payload: unknown }) {
  const original = globalThis.fetch;
  (globalThis as { fetch: typeof fetch }).fetch = (async (url: string, init?: RequestInit) => ({
    ok: false,
    status: 200,
    json: async () => handler(url, JSON.parse(String(init?.body ?? '{}'))).payload,
  })) as unknown as typeof fetch;
  // Wrap status properly
  (globalThis as { fetch: typeof fetch }).fetch = (async (url: string, init?: RequestInit) => {
    const out = handler(url, JSON.parse(String(init?.body ?? '{}')));
    return { ok: out.status >= 200 && out.status < 300, status: out.status, json: async () => out.payload };
  }) as unknown as typeof fetch;
  return () => {
    (globalThis as { fetch: typeof fetch }).fetch = original;
  };
}

async function runPhoneAuthTests() {
  console.log('=== RUNNING PHONE OTP TESTS ===');

  // 1. Invalid phone rejected
  {
    const restore = stubSupabase(() => ({ status: 200, payload: {} }));
    try {
      const out = await mockCall(phoneOtpRequestHandler, { phone: 'abc' });
      assert.equal(out.statusCode, 400);
    } finally {
      restore();
    }
  }

  // 2. Honeypot fails closed
  {
    const restore = stubSupabase(() => ({ status: 200, payload: {} }));
    try {
      const out = await mockCall(phoneOtpRequestHandler, { phone: '+971501234567', website: 'bot' });
      assert.equal(out.statusCode, 400);
      assert.equal(out.payload?.error?.code, 'SPAM_DETECTED');
    } finally {
      restore();
    }
  }

  // 3. Request success masks the phone, never echoes it
  {
    const seen: Array<Record<string, unknown>> = [];
    const restore = stubSupabase((url, body) => {
      assert.ok(url.endsWith('/auth/v1/otp'));
      seen.push(body);
      return { status: 200, payload: {} };
    });
    try {
      const out = await mockCall(phoneOtpRequestHandler, { phone: '+971 50 123 4567' });
      assert.equal(out.statusCode, 200);
      assert.equal(out.payload?.ok, true);
      assert.ok(String(out.payload?.maskedPhone).includes('***'));
      assert.ok(!JSON.stringify(out.payload).includes('501234567'));
      assert.equal(seen[0].phone, '+971501234567');
      assert.equal(seen[0].channel, 'sms');
    } finally {
      restore();
    }
  }

  // 4. Provider without SMS maps to truthful 503 (never fake success)
  {
    const restore = stubSupabase(() => ({ status: 422, payload: { msg: 'SMS provider not configured' } }));
    try {
      const out = await mockCall(phoneOtpRequestHandler, { phone: '+971501234568' });
      assert.equal(out.statusCode, 503);
      assert.equal(out.payload?.error?.code, 'AUTH_PROVIDER_UNCONFIGURED');
    } finally {
      restore();
    }
  }

  // 5. Request rate limit: 4th attempt for the same number is rejected
  {
    const restore = stubSupabase(() => ({ status: 200, payload: {} }));
    try {
      const phone = '+971501234569';
      for (let i = 0; i < 3; i += 1) {
        const out = await mockCall(phoneOtpRequestHandler, { phone });
        assert.equal(out.statusCode, 200);
      }
      const limited = await mockCall(phoneOtpRequestHandler, { phone });
      assert.equal(limited.statusCode, 429);
    } finally {
      restore();
    }
  }

  // 6. Verify success passes the session through without secrets
  {
    const restore = stubSupabase((url, body) => {
      assert.ok(url.endsWith('/auth/v1/verify'));
      assert.equal(body.type, 'sms');
      return {
        status: 200,
        payload: { access_token: 'tok_abc', refresh_token: 'ref_abc', user: { id: 'user-1', phone: '+971501234570' } },
      };
    });
    try {
      const out = await mockCall(phoneOtpVerifyHandler, { phone: '+971501234570', code: '123456' });
      assert.equal(out.statusCode, 200);
      assert.equal(out.payload?.session?.access_token, 'tok_abc');
      assert.equal(out.payload?.user?.id, 'user-1');
    } finally {
      restore();
    }
  }

  // 7. Wrong code normalizes to generic 401 (no oracle)
  {
    const restore = stubSupabase(() => ({ status: 400, payload: { msg: 'Token has expired or is invalid' } }));
    try {
      const out = await mockCall(phoneOtpVerifyHandler, { phone: '+971501234571', code: '000000' });
      assert.equal(out.statusCode, 401);
      assert.equal(out.payload?.error?.code, 'OTP_INVALID');
    } finally {
      restore();
    }
  }

  // 8. Verify attempts throttled after 5 tries
  {
    const restore = stubSupabase(() => ({ status: 400, payload: { msg: 'invalid' } }));
    try {
      const phone = '+971501234572';
      for (let i = 0; i < 5; i += 1) {
        const out = await mockCall(phoneOtpVerifyHandler, { phone, code: '000000' });
        assert.equal(out.statusCode, 401);
      }
      const limited = await mockCall(phoneOtpVerifyHandler, { phone, code: '000000' });
      assert.equal(limited.statusCode, 429);
    } finally {
      restore();
    }
  }

  console.log('Phone OTP tests: PASS');
}

runPhoneAuthTests().catch((err) => {
  console.error('FATAL: Phone OTP test failure:', err);
  process.exit(1);
});
