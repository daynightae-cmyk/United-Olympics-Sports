import { PaymentDomainRepository } from './repositories/payment-repository.ts';
import { requireAuthorizationContext } from './auth.ts';
import { assertMethod, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

const paymentRepo = new PaymentDomainRepository();

export const paymentIntentHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const intent = await paymentRepo.createPaymentIntent(ctx, {
    idempotencyKey: (body.idempotencyKey as string) || '',
    amountMinor: typeof body.amountMinor === 'number' ? body.amountMinor : 0,
    currency: body.currency as string | undefined,
    playerId: body.playerId as string | undefined,
    subscriptionId: body.subscriptionId as string | undefined,
    provider: body.provider as string | undefined,
  });
  sendJson(res, 201, { ok: true, intent });
};

export const paymentWebhookHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const body = await readJsonBody(req);
  const result = await paymentRepo.processWebhook({
    eventId: (body.eventId as string) || (body.id as string) || '',
    provider: (body.provider as string) || 'stripe',
    eventType: (body.eventType as string) || (body.type as string) || 'unknown',
    payload: (body.payload as Record<string, unknown>) || body,
  });
  sendJson(res, 200, { ok: true, ...result });
};
