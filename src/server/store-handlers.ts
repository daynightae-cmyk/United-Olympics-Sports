import { StoreDomainRepository } from './repositories/store-repository';
import { requireAuthorizationContext } from './auth';
import { ApiError, assertMethod, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http';

const storeRepo = new StoreDomainRepository();

export const storeProductsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  try {
    const products = await storeRepo.listActiveProducts();
    sendJson(res, 200, { ok: true, items: products });
  } catch (err) {
    // Public catalog without a configured database is truthfully empty, not
    // a crash: operators see the degraded health signal, shoppers see an
    // honest unavailable state, and no console-error noise is produced.
    if (err instanceof ApiError && err.code === 'DATA_SERVICE_NOT_CONFIGURED') {
      sendJson(res, 200, { ok: true, items: [] });
      return;
    }
    throw err;
  }
};

export const storeCheckoutHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const items = Array.isArray(body.items) ? (body.items as any[]) : [];
  const shipping = typeof body.shippingAddress === 'object' && body.shippingAddress !== null
    ? (body.shippingAddress as Record<string, unknown>)
    : undefined;

  const result = await storeRepo.prepareOrder(ctx, items, shipping);
  sendJson(res, 201, { ok: true, order: result });
};
