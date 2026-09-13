import { AdminDomainRepository } from './repositories/admin-repository.ts';
import { requireAuthorizationContext, requireIdentity } from './auth.ts';
import { assertMethod, readJsonBody, sendJson, ApiError, type ApiRequest, type ApiResponse } from './http.ts';

const adminRepo = new AdminDomainRepository();

function extractSubId(url: string | undefined, basePath: string): string | null {
  if (!url) return null;
  const pathname = new URL(url, 'http://localhost').pathname.replace(/\/+$/, '');
  if (pathname.startsWith(basePath + '/')) {
    const sub = pathname.slice(basePath.length + 1).split('/')[0];
    return sub || null;
  }
  return null;
}

export const adminOrganizationHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const org = await adminRepo.getOrganization(ctx);
  sendJson(res, 200, { ok: true, organization: org });
};

export const adminOrganizationBootstrapHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const identity = await requireIdentity(req);
  const body = await readJsonBody(req);
  const organization = await adminRepo.bootstrapOrganization(
    { uid: identity.uid, provider: identity.provider, ...(identity.email ? { email: identity.email } : {}) },
    { name: String(body.name ?? ''), ...(body.nameAr ? { nameAr: String(body.nameAr) } : {}) },
  );
  sendJson(res, 201, { ok: true, organization });
};

export const adminCountriesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST', 'PUT']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/countries');

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createCountry(ctx, body);
    sendJson(res, 201, { ok: true, country: result.item });
    return;
  }

  if (req.method === 'PUT') {
    if (!id) throw new ApiError(400, 'ID_REQUIRED', 'Country ID is required for update.');
    const body = await readJsonBody(req);
    const result = await adminRepo.updateCountry(ctx, id, body);
    sendJson(res, 200, { ok: true, country: result.item });
    return;
  }

  if (id) {
    const country = await adminRepo.getCountry(ctx, id);
    if (!country) throw new ApiError(404, 'NOT_FOUND', 'Country not found.');
    sendJson(res, 200, { ok: true, country });
    return;
  }

  const list = await adminRepo.listCountries(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminBranchesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST', 'PUT']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/branches');

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createBranch(ctx, body);
    sendJson(res, 201, { ok: true, branch: result.item });
    return;
  }

  if (req.method === 'PUT') {
    if (!id) throw new ApiError(400, 'ID_REQUIRED', 'Branch ID is required for update.');
    const body = await readJsonBody(req);
    const result = await adminRepo.updateBranch(ctx, id, body);
    sendJson(res, 200, { ok: true, branch: result.item });
    return;
  }

  if (id) {
    const branch = await adminRepo.getBranch(ctx, id);
    if (!branch) throw new ApiError(404, 'NOT_FOUND', 'Branch not found.');
    sendJson(res, 200, { ok: true, branch });
    return;
  }

  const list = await adminRepo.listBranches(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminSportsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/sports');

  if (id) {
    const sport = await adminRepo.getSport(ctx, id);
    if (!sport) throw new ApiError(404, 'NOT_FOUND', 'Sport not found.');
    sendJson(res, 200, { ok: true, sport });
    return;
  }

  const list = await adminRepo.listSports(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminProgramsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/programs');

  if (id) {
    const program = await adminRepo.getProgram(ctx, id);
    if (!program) throw new ApiError(404, 'NOT_FOUND', 'Program not found.');
    sendJson(res, 200, { ok: true, program });
    return;
  }

  const list = await adminRepo.listPrograms(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminGroupsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/groups');

  if (id) {
    const group = await adminRepo.getGroup(ctx, id);
    if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found.');
    sendJson(res, 200, { ok: true, group });
    return;
  }

  const list = await adminRepo.listGroups(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminPlayersHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET', 'POST', 'PUT']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/players');

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const result = await adminRepo.createPlayer(ctx, body);
    sendJson(res, 201, { ok: true, player: result.item });
    return;
  }

  if (req.method === 'PUT') {
    if (!id) throw new ApiError(400, 'ID_REQUIRED', 'Player ID is required for update.');
    const body = await readJsonBody(req);
    const result = await adminRepo.updatePlayer(ctx, id, body);
    sendJson(res, 200, { ok: true, player: result.item });
    return;
  }

  if (id) {
    const player = await adminRepo.getPlayer(ctx, id);
    if (!player) throw new ApiError(404, 'NOT_FOUND', 'Player not found.');
    sendJson(res, 200, { ok: true, player });
    return;
  }

  const list = await adminRepo.listPlayers(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminCoachesHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/coaches');

  if (id) {
    const coach = await adminRepo.getCoach(ctx, id);
    if (!coach) throw new ApiError(404, 'NOT_FOUND', 'Coach not found.');
    sendJson(res, 200, { ok: true, coach });
    return;
  }

  const list = await adminRepo.listCoaches(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminParentsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/parents');

  if (id) {
    const parent = await adminRepo.getParent(ctx, id);
    if (!parent) throw new ApiError(404, 'NOT_FOUND', 'Parent not found.');
    sendJson(res, 200, { ok: true, parent });
    return;
  }

  const list = await adminRepo.listParents(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminSessionsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/sessions');

  if (id) {
    const session = await adminRepo.getSession(ctx, id);
    if (!session) throw new ApiError(404, 'NOT_FOUND', 'Session not found.');
    sendJson(res, 200, { ok: true, session });
    return;
  }

  const list = await adminRepo.listSessions(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminRegistrationsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/registrations');

  if (id) {
    const registration = await adminRepo.getRegistration(ctx, id);
    if (!registration) throw new ApiError(404, 'NOT_FOUND', 'Registration not found.');
    sendJson(res, 200, { ok: true, registration });
    return;
  }

  const list = await adminRepo.listRegistrations(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminAchievementsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/achievements');

  if (id) {
    const achievement = await adminRepo.getAchievement(ctx, id);
    if (!achievement) throw new ApiError(404, 'NOT_FOUND', 'Achievement not found.');
    sendJson(res, 200, { ok: true, achievement });
    return;
  }

  const list = await adminRepo.listAchievements(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminEventsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/events');

  if (id) {
    const event = await adminRepo.getEvent(ctx, id);
    if (!event) throw new ApiError(404, 'NOT_FOUND', 'Event not found.');
    sendJson(res, 200, { ok: true, event });
    return;
  }

  const list = await adminRepo.listEvents(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminAnnouncementsHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/announcements');

  if (id) {
    const announcement = await adminRepo.getAnnouncement(ctx, id);
    if (!announcement) throw new ApiError(404, 'NOT_FOUND', 'Announcement not found.');
    sendJson(res, 200, { ok: true, announcement });
    return;
  }

  const list = await adminRepo.listAnnouncements(ctx);
  sendJson(res, 200, { ok: true, ...list });
};

export const adminAuditHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['GET']);
  const ctx = await requireAuthorizationContext(req);
  const id = extractSubId(req.url, '/api/v1/admin/audit');

  if (id) {
    const auditActivity = await adminRepo.getAuditActivity(ctx, id);
    if (!auditActivity) throw new ApiError(404, 'NOT_FOUND', 'Audit activity not found.');
    sendJson(res, 200, { ok: true, auditActivity });
    return;
  }

  const list = await adminRepo.listAuditActivity(ctx);
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
