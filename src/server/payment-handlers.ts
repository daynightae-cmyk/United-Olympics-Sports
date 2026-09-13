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

const paymentRepo = new PaymentDomainRepository();

export const paymentIntentHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const orderId = normalizeString(body.orderId, 64);

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
    const amountMinor = typeof body.amountMinor === 'number' ? body.amountMinor : 0;
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Amount must be a positive integer in minor units.');
    }
    const currency = normalizeString(body.currency, 3)?.toUpperCase() || 'AED';
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
    amountMinor: typeof body.amountMinor === 'number' ? body.amountMinor : 0,
    currency: body.currency as string | undefined,
    playerId: body.playerId as string | undefined,
    subscriptionId: body.subscriptionId as string | undefined,
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
