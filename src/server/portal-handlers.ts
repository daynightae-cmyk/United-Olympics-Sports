import { PortalDomainRepository } from './repositories/portal-repository.ts';
import { requireAuthorizationContext } from './auth.ts';
import { assertMethod, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

const portalRepo = new PortalDomainRepository();

export const portalPlayerDataHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const rawUrl = req.url || '/';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const playerId = urlObj.searchParams.get('playerId') || ctx.bindings.playerIds[0];

  const data = await portalRepo.getPlayerData(ctx, playerId);
  sendJson(res, 200, { ok: true, ...data });
};

export const portalParentChildrenHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const children = await portalRepo.getParentChildren(ctx);
  sendJson(res, 200, { ok: true, children });
};

export const portalCoachScopeHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const scope = await portalRepo.getCoachScopeData(ctx);
  sendJson(res, 200, { ok: true, ...scope });
};
