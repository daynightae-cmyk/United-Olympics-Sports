import { StoreDomainRepository } from './repositories/store-repository';
import { StoreAccountRepository } from './repositories/store-account-repository';
import { requireAuthorizationContext } from './auth';
import { ApiError, assertMethod, normalizeString, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http';
import { expireAbandonedOrderPaymentClaim } from './order-payment-claim';
import { applyRateLimitHeaders, defaultRateLimiter, getClientIp } from './rate-limiter';

async function enforceCommerceRateLimit(req: ApiRequest, res: ApiResponse, scope: string, uid: string): Promise<void> {
  const clientIp = getClientIp(req);
  const userLimit = await defaultRateLimiter.consume(`store-${scope}:${uid}`, 10, 10 * 60_000);
  if (!userLimit.allowed) {
    applyRateLimitHeaders(res, userLimit);
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please retry later.', {
      retryAfter: userLimit.retryAfterSeconds,
    });
  }
  const ipLimit = await defaultRateLimiter.consume(`store-${scope}-ip:${clientIp}`, 30, 10 * 60_000);
  if (!ipLimit.allowed) {
    applyRateLimitHeaders(res, ipLimit);
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests from your network. Please retry later.', {
      retryAfter: ipLimit.retryAfterSeconds,
    });
  }
  applyRateLimitHeaders(res, userLimit);
}

const storeRepo = new StoreDomainRepository();
const storeAccountRepo = new StoreAccountRepository();

export const storeProductsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  try {
    const products = await storeRepo.listActiveProducts();
    sendJson(res, 200, { ok: true, items: products });
  } catch (err) {
    if (err instanceof ApiError && err.code === 'DATA_SERVICE_NOT_CONFIGURED') {
      sendJson(res, 200, { ok: true, items: [] });
      return;
    }
    throw err;
  }
};

export const storeAccountHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  await enforceCommerceRateLimit(req, res, 'account', ctx.uid);
  const account = await storeAccountRepo.getAccount(ctx);
  sendJson(res, 200, { ok: true, account });
};

export const storeCheckoutHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  await enforceCommerceRateLimit(req, res, 'checkout', ctx.uid);
  const body = await readJsonBody(req);
  const items = Array.isArray(body.items) ? (body.items as any[]) : [];
  const shipping = typeof body.shippingAddress === 'object' && body.shippingAddress !== null
    ? (body.shippingAddress as Record<string, unknown>)
    : undefined;

  const result = await storeRepo.prepareOrder(ctx, items, shipping);
  sendJson(res, 201, { ok: true, order: result });
};

export const storeOrderCancelHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  await enforceCommerceRateLimit(req, res, 'order-cancel', ctx.uid);
  const body = await readJsonBody(req);
  const orderId = normalizeString(body.orderId, 64);
  if (!orderId) throw new ApiError(400, 'VALIDATION_ERROR', 'orderId is required.');

  const expired = await expireAbandonedOrderPaymentClaim(ctx, orderId);
  if (expired.orderCancelled) {
    sendJson(res, 200, {
      ok: true,
      order: { orderId, status: 'cancelled', expiredPaymentClaim: true },
    });
    return;
  }

  const result = await storeRepo.cancelOrder(ctx, orderId);
  sendJson(res, 200, { ok: true, order: result });
};
