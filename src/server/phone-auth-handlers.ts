import { normalizePhoneNumber } from './identity-strategy.js';
import { recordAudit } from './audit.js';
import type { AuthorizationContext } from './authorization-context.js';
import {
  ApiError,
  assertMethod,
  normalizeString,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './http.js';
import {
  applyRateLimitHeaders,
  defaultRateLimiter,
  getClientIp,
  validateHoneypot,
} from './rate-limiter.js';

const DEFAULT_SUPABASE_URL = 'https://olmbezzzqavgjwydlfey.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

function supabasePublicConfig(): { url: string; publishableKey: string } {
  return {
    url: process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL,
    publishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  };
}

function maskPhone(e164: string): string {
  if (e164.length <= 5) return '***';
  return `${e164.slice(0, 5)}******${e164.slice(-2)}`;
}

function auditCtx(uid: string): AuthorizationContext {
  return {
    uid,
    provider: 'supabase',
    roles: [],
    scopes: [],
    tenant: { organizationIds: [], countryIds: [], branchIds: [] },
    bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
  };
}

async function callSupabaseAuth(
  path: string,
  body: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; payload: Record<string, unknown> | null }> {
  const { url, publishableKey } = supabasePublicConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(`${url.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: response.status, payload };
  } catch {
    throw new ApiError(502, 'AUTH_PROVIDER_ERROR', 'Authentication provider request failed.');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * POST /api/v1/auth/phone/request { phone, website? }
 * Policy: honeypot, E.164 normalization, 3 requests / 10 min / phone,
 * 10 / 10 min / IP. Proxies Supabase Auth SMS OTP (no service key needed).
 * When the Supabase project has no SMS provider, Supabase answers 422/500
 * and we surface AUTH_PROVIDER_UNCONFIGURED — never a fake success.
 */
export const phoneOtpRequestHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const body = await readJsonBody(req);
  if (!validateHoneypot(body)) {
    throw new ApiError(400, 'SPAM_DETECTED', 'Enquiry submission failed verification.');
  }

  const phone = normalizePhoneNumber(normalizeString(body.phone, 40) || '');
  if (!phone) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid phone number in international format is required.');
  }

  const clientIp = getClientIp(req);
  const phoneLimit = await defaultRateLimiter.consume(`phone-otp-request:${phone}`, 3, 10 * 60_000);
  applyRateLimitHeaders(res, phoneLimit);
  if (!phoneLimit.allowed) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many code requests for this number. Please retry later.', {
      retryAfter: phoneLimit.retryAfterSeconds,
    });
  }
  const ipLimit = await defaultRateLimiter.consume(`phone-otp-request-ip:${clientIp}`, 10, 10 * 60_000);
  if (!ipLimit.allowed) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many code requests from your network. Please retry later.', {
      retryAfter: ipLimit.retryAfterSeconds,
    });
  }

  const { status, payload } = await callSupabaseAuth('/auth/v1/otp', { phone, channel: 'sms' });
  if (status === 429) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Provider rate limit reached. Please retry later.');
  }
  if (status === 422) {
    const message = typeof payload?.msg === 'string' ? payload.msg : typeof payload?.message === 'string' ? payload.message : '';
    if (/sms|phone|provider|twilio|message/i.test(message)) {
      throw new ApiError(503, 'AUTH_PROVIDER_UNCONFIGURED', 'SMS delivery is not enabled on the authentication project.');
    }
    throw new ApiError(400, 'VALIDATION_ERROR', 'This phone number cannot receive verification codes.');
  }
  if (status < 200 || status >= 300) {
    throw new ApiError(502, 'AUTH_PROVIDER_ERROR', 'Verification code could not be sent right now.');
  }

  await recordAudit(auditCtx(`phone:${phone}`), {
    action: 'auth.phone.request',
    entityType: 'phone_challenge',
    entityId: maskPhone(phone),
    metadata: {},
  }).catch(() => undefined);

  sendJson(res, 200, { ok: true, maskedPhone: maskPhone(phone) });
};

/**
 * POST /api/v1/auth/phone/verify { phone, code }
 * Policy: 5 attempts / 10 min / phone. Returns the Supabase session on
 * success; the client establishes it and must still pass portal binding
 * lookup (OTP alone never grants portal access).
 */
export const phoneOtpVerifyHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const body = await readJsonBody(req);

  const phone = normalizePhoneNumber(normalizeString(body.phone, 40) || '');
  const code = normalizeString(body.code, 16)?.replace(/\D/g, '');
  if (!phone || !code || code.length < 4) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Phone number and verification code are required.');
  }

  const attemptLimit = await defaultRateLimiter.consume(`phone-otp-verify:${phone}`, 5, 10 * 60_000);
  applyRateLimitHeaders(res, attemptLimit);
  if (!attemptLimit.allowed) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many incorrect attempts. Request a new code later.', {
      retryAfter: attemptLimit.retryAfterSeconds,
    });
  }

  const { status, payload } = await callSupabaseAuth('/auth/v1/verify', { phone, token: code, type: 'sms' });
  if (status === 429) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Provider rate limit reached. Please retry later.');
  }
  if (status < 200 || status >= 300 || typeof payload?.access_token !== 'string') {
    throw new ApiError(401, 'OTP_INVALID', 'Verification code is invalid or expired.');
  }

  const user = (payload.user as { id?: unknown; phone?: unknown } | undefined) ?? {};
  await recordAudit(auditCtx(`phone:${phone}`), {
    action: 'auth.phone.verify',
    entityType: 'phone_challenge',
    entityId: maskPhone(phone),
    metadata: {},
  }).catch(() => undefined);

  sendJson(res, 200, {
    ok: true,
    session: { access_token: payload.access_token, refresh_token: payload.refresh_token ?? null },
    user: {
      ...(typeof user.id === 'string' ? { id: user.id } : {}),
      ...(typeof user.phone === 'string' ? { phone: user.phone } : { phone }),
    },
  });
};
