import { PortalDomainRepository } from './repositories/portal-repository.js';
import { requireAuthorizationContext } from './auth.js';
import { assertMethod, sendJson, type ApiRequest, type ApiResponse } from './http.js';

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
  const data = await portalRepo.getParentPortalData(ctx);
  sendJson(res, 200, { ok: true, ...data });
};

export const portalCoachScopeHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const scope = await portalRepo.getCoachScopeData(ctx);
  sendJson(res, 200, { ok: true, ...scope });
};
