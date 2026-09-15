import { PaymentDomainRepository } from './repositories/payment-repository';
import { requireAuthorizationContext } from './auth';
import {
  createStripeIntent,
  getPaymentProviderConfig,
  verifyStripeSignature,
} from './payment-provider';
import {
  ApiError,
  assertMethod,
  getHeader,
  normalizeString,
  readJsonBody,
  readRawBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './http';
import { applyRateLimitHeaders, defaultRateLimiter, getClientIp } from './rate-limiter';

const paymentRepo = new PaymentDomainRepository();

const ADMIN_ROLES = ['super_admin', 'admin', 'owner', 'administrator'];

export type PayableBody = {
  orderId?: unknown;
  subscriptionId?: unknown;
  amountMinor?: unknown;
  currency?: unknown;
};

export type ResolvedPayable = {
  amountMinor: number;
  currency: string;
  orderId?: string;
  subscriptionId?: string;
};

/**
 * Resolves the server-authoritative payable amount for a payment intent.
 * Pure business rule (unit-tested): orders and priced subscriptions always
 * win over any client-supplied amount; mismatches are rejected, never
 * silently corrected.
 */
export async function resolvePayableAmount(
  ctx: { uid: string; roles: string[]; bindings: { playerIds: string[]; guardianPlayerIds: string[] } },
  body: PayableBody,
  repo: Pick<PaymentDomainRepository, 'getOrderForPayment' | 'getSubscriptionForPayment'> = paymentRepo,
): Promise<ResolvedPayable> {
  const orderId = normalizeString(body.orderId, 64);
  const subscriptionId = normalizeString(body.subscriptionId, 64);

  if (orderId) {
    const order = await repo.getOrderForPayment(orderId);
    const isOwner = order.customerUid === ctx.uid;
    const isAdmin = ctx.roles.some((role) => ADMIN_ROLES.includes(role));
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'ORDER_ACCESS_DENIED', 'This order belongs to another customer.');
    }
    if (order.status !== 'pending') {
      throw new ApiError(409, 'ORDER_NOT_PAYABLE', 'Only pending orders can be paid.');
    }
    if (typeof body.amountMinor === 'number' && body.amountMinor !== order.totalMinor) {
      throw new ApiError(422, 'AMOUNT_MISMATCH', 'Payable amount is set by the order and cannot be overridden.');
    }
    const clientCurrency = normalizeString(body.currency, 3)?.toUpperCase();
    if (clientCurrency && clientCurrency !== order.currency) {
      throw new ApiError(422, 'CURRENCY_MISMATCH', 'Payable currency is set by the order and cannot be overridden.');
    }
    return { amountMinor: order.totalMinor, currency: order.currency, orderId };
  }

  if (subscriptionId) {
    const subscription = await repo.getSubscriptionForPayment(subscriptionId);
    const payerPlayerIds = new Set([...ctx.bindings.playerIds, ...ctx.bindings.guardianPlayerIds]);
    const isRelated = (subscription.playerId !== null && payerPlayerIds.has(subscription.playerId))
      || ctx.roles.some((role) => ADMIN_ROLES.includes(role));
    if (!isRelated) {
      throw new ApiError(403, 'SUBSCRIPTION_ACCESS_DENIED', 'This subscription belongs to another family.');
    }
    if (subscription.amountMinor !== null && subscription.amountMinor > 0) {
      if (typeof body.amountMinor === 'number' && body.amountMinor !== subscription.amountMinor) {
        throw new ApiError(422, 'AMOUNT_MISMATCH', 'Payable amount is set by the subscription and cannot be overridden.');
      }
      return { amountMinor: subscription.amountMinor, currency: subscription.currency, subscriptionId };
    }
  }

  const amountMinor = typeof body.amountMinor === 'number' ? body.amountMinor : 0;
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Amount must be a positive integer in minor units.');
  }
  const currency = normalizeString(body.currency, 3)?.toUpperCase() || 'AED';
  return { amountMinor, currency, ...(subscriptionId ? { subscriptionId } : {}) };
}

export const paymentIntentHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const clientIp = getClientIp(req);
  const userLimit = await defaultRateLimiter.consume(`payment-intent:${ctx.uid}`, 10, 10 * 60_000);
  if (!userLimit.allowed) {
    applyRateLimitHeaders(res, userLimit);
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many payment attempts. Please retry later.', {
      retryAfter: userLimit.retryAfterSeconds,
    });
  }
  const ipLimit = await defaultRateLimiter.consume(`payment-intent-ip:${clientIp}`, 30, 10 * 60_000);
  if (!ipLimit.allowed) {
    applyRateLimitHeaders(res, ipLimit);
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many payment attempts from your network. Please retry later.', {
      retryAfter: ipLimit.retryAfterSeconds,
    });
  }
  applyRateLimitHeaders(res, userLimit);
  const body = await readJsonBody(req);

  // Server-authoritative payable amount: the browser must never set the
  // chargeable total for an order or a priced subscription. Client-supplied
  // amounts are accepted only for the generic ledger path (no order or
  // priced subscription attached) and are still validated as positive ints.
  const payable = await resolvePayableAmount(ctx, body as PayableBody);
  const { amountMinor, currency } = payable;
  const orderId = payable.orderId;
  const subscriptionId = payable.subscriptionId;

  // Charge path: requires a contracted provider; otherwise fail closed.
  const charge = body.charge === true;
  let remote: { providerIntentId?: string; clientSecret?: string; status?: string } = {};
  if (charge) {
    const config = getPaymentProviderConfig();
    if (!config) {
      throw new ApiError(
        503,
        'EXTERNAL_PROVIDER_REQUIRED',
        'Charging requires a contracted payment provider. No amount was charged.',
      );
    }
    const idempotencyKey = normalizeString(body.idempotencyKey, 128);
    if (!idempotencyKey) throw new ApiError(400, 'VALIDATION_ERROR', 'Idempotency key is required.');
    remote = await createStripeIntent(config, {
      amountMinor,
      currency,
      idempotencyKey,
      ...(orderId ? { metadata: { orderId } } : {}),
    });
  }

  const intent = await paymentRepo.createPaymentIntent(ctx, {
    idempotencyKey: (body.idempotencyKey as string) || '',
    amountMinor,
    currency,
    playerId: body.playerId as string | undefined,
    ...(subscriptionId ? { subscriptionId } : {}),
    provider: body.provider as string | undefined,
    ...(orderId ? { orderId } : {}),
    ...(remote.providerIntentId ? { providerIntentId: remote.providerIntentId } : {}),
    ...(remote.clientSecret ? { clientSecret: remote.clientSecret } : {}),
    ...(remote.status ? { remoteStatus: remote.status } : {}),
  });
  sendJson(res, 201, { ok: true, intent });
};

export const paymentWebhookHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const config = getPaymentProviderConfig();

  // Without a webhook secret, unsigned webhooks must never mutate state.
  if (!config?.webhookSecret) {
    throw new ApiError(
      503,
      'EXTERNAL_PROVIDER_REQUIRED',
      'Webhook ingestion requires a configured provider secret. Event ignored.',
    );
  }

  const raw = await readRawBody(req);
  if (!raw.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Empty webhook body.');
  const verified = verifyStripeSignature(raw, getHeader(req, 'stripe-signature'), config.webhookSecret);

  const result = await paymentRepo.processWebhook({
    eventId: verified.eventId,
    provider: 'stripe',
    eventType: verified.eventType,
    payload: verified.raw,
  });
  const reconciled = await paymentRepo.reconcileProviderEvent({
    provider: 'stripe',
    eventType: verified.eventType,
    ...(verified.providerIntentId ? { providerIntentId: verified.providerIntentId } : {}),
    ...(verified.orderId ? { orderId: verified.orderId } : {}),
  });
  sendJson(res, 200, { ok: true, ...result, ...reconciled });
};
