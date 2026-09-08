import {
  adminWhoAmIHandler,
  catalogHandler,
  healthHandler,
  publicEnquiriesHandler,
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
  | 'catalog';

const handlers: Record<RouteKey, RouteHandler> = {
  health: healthHandler,
  'auth-session': sessionHandler,
  'auth-revoke': revokeHandler,
  'admin-whoami': adminWhoAmIHandler,
  'portal-whoami': portalWhoAmIHandler,
  'public-enquiries': publicEnquiriesHandler,
  'sport-request': sportRequestHandler,
  catalog: catalogHandler,
};

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
