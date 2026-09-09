import { AdminDomainRepository } from './repositories/admin-repository.ts';
import { requireAuthorizationContext } from './auth.ts';
import { assertMethod, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

const adminRepo = new AdminDomainRepository();

export const adminOrganizationHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const org = await adminRepo.getOrganization(ctx);
  sendJson(res, 200, { ok: true, organization: org });
};

export const adminCountriesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST']);
  const ctx = await requireAuthorizationContext(req);

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createCountry(ctx, body);
    sendJson(res, 201, { ok: true, country: result.item });
    return;
  }

  const list = await adminRepo.listCountries(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminBranchesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST']);
  const ctx = await requireAuthorizationContext(req);

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createBranch(ctx, body);
    sendJson(res, 201, { ok: true, branch: result.item });
    return;
  }

  const list = await adminRepo.listBranches(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminSportsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listSports(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminProgramsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listPrograms(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminGroupsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listGroups(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminPlayersHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST']);
  const ctx = await requireAuthorizationContext(req);

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createPlayer(ctx, body);
    sendJson(res, 201, { ok: true, player: result.item });
    return;
  }

  const list = await adminRepo.listPlayers(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminCoachesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listCoaches(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminParentsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listParents(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminSessionsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listSessions(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminRegistrationsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const list = await adminRepo.listRegistrations(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminPerformanceHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const result = await adminRepo.recordPerformance(ctx, {
    playerId: (body.playerId as string) || '',
    metricKey: (body.metricKey as string) || '',
    score: typeof body.score === 'number' ? body.score : -1,
    sessionId: body.sessionId as string | undefined,
    notes: body.notes as string | undefined,
  });
  sendJson(res, 201, { ok: true, evaluation: result });
};
