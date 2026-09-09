import {
  adminWhoAmIHandler,
  catalogHandler,
  healthHandler,
  publicEnquiriesHandler,
  recordAttendanceHandler,
  revokeHandler,
  sessionHandler,
  sportRequestHandler,
  type RouteHandler,
} from './handlers.ts';
import { portalWhoAmIHandler } from './portal-bindings.ts';
import { ApiError, sendError, type ApiRequest, type ApiResponse } from './http.ts';

export type RouteKey =
  | 'health'
  | 'auth-session'
  | 'auth-revoke'
  | 'admin-whoami'
  | 'portal-whoami'
  | 'public-enquiries'
  | 'sport-request'
  | 'catalog'
  | 'attendance-record';

const handlers: Record<RouteKey, RouteHandler> = {
  health: healthHandler,
  'auth-session': sessionHandler,
  'auth-revoke': revokeHandler,
  'admin-whoami': adminWhoAmIHandler,
  'portal-whoami': portalWhoAmIHandler,
  'public-enquiries': publicEnquiriesHandler,
  'sport-request': sportRequestHandler,
  catalog: catalogHandler,
  'attendance-record': recordAttendanceHandler,
};

export function resolveRouteKey(req: ApiRequest): RouteKey | null {
  const rawUrl = req.url || '/';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const queryParam = (req as unknown as { query?: Record<string, string | string[] | undefined> }).query?.route || urlObj.searchParams.get('route');
  const routeParam = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  if (routeParam && routeParam in handlers) {
    return routeParam as RouteKey;
  }

  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/api/v1/health' || pathname === '/health') return 'health';
  if (pathname === '/auth/session' || pathname === '/api/v1/auth/session') return 'auth-session';
  if (pathname === '/auth/revoke' || pathname === '/api/v1/auth/revoke') return 'auth-revoke';
  if (pathname === '/api/v1/admin/whoami' || pathname === '/admin/whoami') return 'admin-whoami';
  if (pathname === '/api/v1/portal/whoami' || pathname === '/portal/whoami') return 'portal-whoami';
  if (pathname === '/public/enquiries' || pathname === '/api/v1/public/enquiries') return 'public-enquiries';
  if (pathname === '/api/v1/requests/sports') return 'sport-request';
  if (pathname === '/api/v1/catalog' || pathname === '/catalog') return 'catalog';
  if (pathname === '/api/v1/attendance' || pathname === '/attendance') return 'attendance-record';

  return null;
}

export async function dispatchRoute(route: string, req: ApiRequest, res: ApiResponse): Promise<void> {
  const handler = handlers[route as RouteKey];
  if (!handler) {
    sendError(res, 404, 'API_NOT_FOUND', 'API route not found.');
    return;
  }

  try {
    await handler(req, res);
  } catch (error) {
    if (error instanceof ApiError) {
      sendError(res, error.status, error.code, error.message, error.details);
      return;
    }
    console.error('Unhandled API error:', error);
    sendError(res, 500, 'INTERNAL_ERROR', 'The request could not be completed.');
  }
}

export async function dispatchApi(req: ApiRequest, res: ApiResponse): Promise<void> {
  const routeKey = resolveRouteKey(req);
  if (!routeKey) {
    sendError(res, 404, 'API_NOT_FOUND', 'API route not found.');
    return;
  }
  await dispatchRoute(routeKey, req, res);
}
