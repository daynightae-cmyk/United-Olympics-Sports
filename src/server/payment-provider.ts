import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError, normalizeString } from './http.js';

export type PaymentProviderName = 'stripe';

export interface PaymentProviderConfig {
  provider: PaymentProviderName;
  secretKey: string;
  webhookSecret?: string;
}

export interface RemoteIntentResult {
  providerIntentId: string;
  clientSecret?: string;
  status: string;
}

export interface PaymentClientConfig {
  enabled: boolean;
  provider: 'stripe' | null;
  publishableKey?: string;
  reason?: 'not_configured' | 'incomplete_configuration' | 'unsupported_provider';
}

/**
 * Returns only browser-safe payment configuration. Charging is enabled in the
 * client only when the server secret, webhook secret and Stripe publishable
 * key are all present. No server secret is ever returned.
 */
export function getPaymentClientConfig(): PaymentClientConfig {
  const provider = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  if (!provider) return { enabled: false, provider: null, reason: 'not_configured' };
  if (provider !== 'stripe') return { enabled: false, provider: null, reason: 'unsupported_provider' };

  const secretKey = process.env.PAYMENTS_SECRET_KEY?.trim();
  const webhookSecret = process.env.PAYMENTS_WEBHOOK_SECRET?.trim();
  const publishableKey = process.env.PAYMENTS_PUBLISHABLE_KEY?.trim();
  const validPublishableKey = Boolean(publishableKey && /^pk_(test|live)_/.test(publishableKey));
  if (!secretKey || !webhookSecret || !validPublishableKey) {
    return { enabled: false, provider: 'stripe', reason: 'incomplete_configuration' };
  }
  return { enabled: true, provider: 'stripe', publishableKey };
}

/**
 * Reads provider configuration from server-only environment.
 * Returns null when no provider is contracted — every caller must fail
 * closed (503 EXTERNAL_PROVIDER_REQUIRED), never fake a charge.
 */
export function getPaymentProviderConfig(): PaymentProviderConfig | null {
  const provider = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  if (!provider) return null;
  if (provider !== 'stripe') {
    throw new ApiError(501, 'EXTERNAL_PROVIDER_REQUIRED', `Payment provider '${provider}' is not integrated.`);
  }
  const secretKey = process.env.PAYMENTS_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new ApiError(
      503,
      'EXTERNAL_PROVIDER_REQUIRED',
      'Payment provider is selected but PAYMENTS_SECRET_KEY is not configured.',
    );
  }
  const webhookSecret = process.env.PAYMENTS_WEBHOOK_SECRET?.trim();
  return { provider: 'stripe', secretKey, ...(webhookSecret ? { webhookSecret } : {}) };
}

export function requirePaymentProviderConfig(): PaymentProviderConfig {
  const config = getPaymentProviderConfig();
  if (!config) {
    throw new ApiError(
      503,
      'EXTERNAL_PROVIDER_REQUIRED',
      'Payments require a contracted merchant provider. No amount is charged.',
    );
  }
  return config;
}

export function normalizeStripeIntentStatus(status: unknown): string {
  if (status === 'canceled') return 'cancelled';
  const allowed = new Set([
    'requires_payment_method',
    'requires_confirmation',
    'processing',
    'succeeded',
    'cancelled',
    'failed',
  ]);
  return typeof status === 'string' && allowed.has(status) ? status : 'processing';
}

async function readStripeIntentResponse(response: Response): Promise<RemoteIntentResult> {
  const payload = (await response.json().catch(() => null)) as {
    id?: unknown;
    client_secret?: unknown;
    status?: unknown;
    error?: { message?: unknown };
  } | null;
  if (!response.ok || typeof payload?.id !== 'string') {
    const message = typeof payload?.error?.message === 'string' ? payload.error.message : `Stripe responded ${response.status}`;
    throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', message);
  }
  const result: RemoteIntentResult = {
    providerIntentId: payload.id,
    status: normalizeStripeIntentStatus(payload.status),
  };
  if (typeof payload.client_secret === 'string') result.clientSecret = payload.client_secret;
  return result;
}

/**
 * Creates a PaymentIntent at Stripe (fetch-based, no SDK dependency).
 * Amounts are minor units; the secret key never leaves the server and is
 * never returned. Idempotency-Key makes retries safe.
 */
export async function createStripeIntent(
  config: PaymentProviderConfig,
  input: { amountMinor: number; currency: string; idempotencyKey: string; metadata?: Record<string, string> },
  fetchImpl: typeof fetch = fetch,
): Promise<RemoteIntentResult> {
  const params = new URLSearchParams();
  params.set('amount', String(input.amountMinor));
  params.set('currency', input.currency.toLowerCase());
  params.set('automatic_payment_methods[enabled]', 'true');
  params.set('automatic_payment_methods[allow_redirects]', 'never');
  if (input.metadata) {
    for (const [key, value] of Object.entries(input.metadata)) {
      params.set(`metadata[${key}]`, value);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': input.idempotencyKey,
      },
      body: params.toString(),
      signal: controller.signal,
    });
    return await readStripeIntentResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider request failed.');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Reads a Stripe PaymentIntent after an ambiguous cancellation response.
 * This is used to distinguish terminal provider truth (canceled/succeeded)
 * from a resumable intent before restoring a local claim.
 */
export async function retrieveStripeIntent(
  config: PaymentProviderConfig,
  providerIntentId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RemoteIntentResult> {
  const id = normalizeString(providerIntentId, 255);
  if (!id) throw new ApiError(400, 'VALIDATION_ERROR', 'Provider payment intent ID is required.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString('base64')}`,
      },
      signal: controller.signal,
    });
    return await readStripeIntentResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider status lookup failed.');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Cancels a Stripe PaymentIntent before a timed-out local payment claim is
 * released. Local order/inventory state must only be released after this call
 * returns Stripe's terminal canceled state, otherwise a resumable provider
 * intent could still charge a locally cancelled order.
 */
export async function cancelStripeIntent(
  config: PaymentProviderConfig,
  providerIntentId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RemoteIntentResult> {
  const id = normalizeString(providerIntentId, 255);
  if (!id) throw new ApiError(400, 'VALIDATION_ERROR', 'Provider payment intent ID is required.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: '',
      signal: controller.signal,
    });
    const result = await readStripeIntentResponse(response);
    if (result.status !== 'cancelled') {
      throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider did not confirm intent cancellation.');
    }
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider cancellation failed.');
  } finally {
    clearTimeout(timeout);
  }
}

export interface VerifiedStripeEvent {
  eventId: string;
  eventType: string;
  providerIntentId?: string;
  orderId?: string;
  raw: Record<string, unknown>;
}

/**
 * Verifies a Stripe webhook signature (t=`timestamp`,v1=`hmac`) over the RAW
 * request body with replay tolerance. Throws 401 on any mismatch — unsigned
 * webhooks must never mutate payment state.
 */
export function verifyStripeSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  secret: string,
  toleranceSeconds = 300,
  nowMs = Date.now(),
): VerifiedStripeEvent {
  if (!signatureHeader) {
    throw new ApiError(401, 'WEBHOOK_SIGNATURE_INVALID', 'Missing webhook signature.');
  }
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((segment) => {
      const idx = segment.indexOf('=');
      return idx === -1 ? [segment, ''] : [segment.slice(0, idx), segment.slice(idx + 1)];
    }),
  );
  const timestamp = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(timestamp) || !v1) {
    throw new ApiError(401, 'WEBHOOK_SIGNATURE_INVALID', 'Malformed webhook signature.');
  }
  if (Math.abs(nowMs / 1000 - timestamp) > toleranceSeconds) {
    throw new ApiError(401, 'WEBHOOK_SIGNATURE_INVALID', 'Webhook timestamp outside tolerance (replay protection).');
  }
  const signedPayload = `${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
  const a = Buffer.from(v1, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new ApiError(401, 'WEBHOOK_SIGNATURE_INVALID', 'Webhook signature mismatch.');
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Webhook body is not valid JSON.');
  }
  if (typeof event.id !== 'string' || typeof event.type !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Webhook event is missing id/type.');
  }
  const dataObject = (event.data as { object?: Record<string, unknown> } | undefined)?.object;
  const metadata = (dataObject?.metadata as Record<string, unknown> | undefined) ?? {};
  const verified: VerifiedStripeEvent = {
    eventId: event.id,
    eventType: event.type,
    raw: event,
  };
  if (typeof dataObject?.id === 'string') verified.providerIntentId = dataObject.id;
  if (typeof metadata.orderId === 'string') verified.orderId = metadata.orderId;
  return verified;
}
