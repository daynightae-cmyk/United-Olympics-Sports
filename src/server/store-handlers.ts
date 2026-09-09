import { StoreDomainRepository } from './repositories/store-repository.ts';
import { requireAuthorizationContext } from './auth.ts';
import { assertMethod, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

const storeRepo = new StoreDomainRepository();

export const storeProductsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const products = await storeRepo.listActiveProducts();
  sendJson(res, 200, { ok: true, items: products });
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
