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
import {
  adminAchievementsHandler,
  adminAnnouncementsHandler,
  adminAuditHandler,
  adminBranchesHandler,
  adminCoachesHandler,
  adminCountriesHandler,
  adminEventsHandler,
  adminGroupsHandler,
  adminOrganizationHandler,
  adminParentsHandler,
  adminPerformanceHandler,
  adminPlayersHandler,
  adminProgramsHandler,
  adminRegistrationsHandler,
  adminSessionsHandler,
  adminSportsHandler,
} from './admin-handlers.ts';
import {
  portalCoachScopeHandler,
  portalParentChildrenHandler,
  portalPlayerDataHandler,
} from './portal-handlers.ts';
import { storeCheckoutHandler, storeProductsHandler } from './store-handlers.ts';
import { paymentIntentHandler, paymentWebhookHandler } from './payment-handlers.ts';
import { documentDownloadUrlHandler, documentRegisterHandler } from './document-handlers.ts';
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
  | 'attendance-record'
  | 'admin-organization'
  | 'admin-countries'
  | 'admin-branches'
  | 'admin-sports'
  | 'admin-programs'
  | 'admin-groups'
  | 'admin-players'
  | 'admin-coaches'
  | 'admin-parents'
  | 'admin-sessions'
  | 'admin-registrations'
  | 'admin-performance'
  | 'admin-achievements'
  | 'admin-events'
  | 'admin-announcements'
  | 'admin-audit'
  | 'portal-player-data'
  | 'portal-parent-children'
  | 'portal-coach-scope'
  | 'store-products'
  | 'store-checkout'
  | 'payment-intent'
  | 'payment-webhook'
  | 'document-register'
  | 'document-signed-url';

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
  'admin-organization': adminOrganizationHandler,
  'admin-countries': adminCountriesHandler,
  'admin-branches': adminBranchesHandler,
  'admin-sports': adminSportsHandler,
  'admin-programs': adminProgramsHandler,
  'admin-groups': adminGroupsHandler,
  'admin-players': adminPlayersHandler,
  'admin-coaches': adminCoachesHandler,
  'admin-parents': adminParentsHandler,
  'admin-sessions': adminSessionsHandler,
  'admin-registrations': adminRegistrationsHandler,
  'admin-performance': adminPerformanceHandler,
  'admin-achievements': adminAchievementsHandler,
  'admin-events': adminEventsHandler,
  'admin-announcements': adminAnnouncementsHandler,
  'admin-audit': adminAuditHandler,
  'portal-player-data': portalPlayerDataHandler,
  'portal-parent-children': portalParentChildrenHandler,
  'portal-coach-scope': portalCoachScopeHandler,
  'store-products': storeProductsHandler,
  'store-checkout': storeCheckoutHandler,
  'payment-intent': paymentIntentHandler,
  'payment-webhook': paymentWebhookHandler,
  'document-register': documentRegisterHandler,
  'document-signed-url': documentDownloadUrlHandler,
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
  if (pathname === '/api/v1/admin/organization') return 'admin-organization';
  if (pathname.startsWith('/api/v1/admin/countries')) return 'admin-countries';
  if (pathname.startsWith('/api/v1/admin/branches')) return 'admin-branches';
  if (pathname.startsWith('/api/v1/admin/sports')) return 'admin-sports';
  if (pathname.startsWith('/api/v1/admin/programs')) return 'admin-programs';
  if (pathname.startsWith('/api/v1/admin/groups')) return 'admin-groups';
  if (pathname.startsWith('/api/v1/admin/players')) return 'admin-players';
  if (pathname.startsWith('/api/v1/admin/coaches')) return 'admin-coaches';
  if (pathname.startsWith('/api/v1/admin/parents')) return 'admin-parents';
  if (pathname.startsWith('/api/v1/admin/sessions')) return 'admin-sessions';
  if (pathname.startsWith('/api/v1/admin/registrations')) return 'admin-registrations';
  if (pathname.startsWith('/api/v1/admin/performance')) return 'admin-performance';
  if (pathname.startsWith('/api/v1/admin/achievements')) return 'admin-achievements';
  if (pathname.startsWith('/api/v1/admin/events')) return 'admin-events';
  if (pathname.startsWith('/api/v1/admin/announcements')) return 'admin-announcements';
  if (pathname.startsWith('/api/v1/admin/audit')) return 'admin-audit';
  if (pathname === '/api/v1/portal/player/data') return 'portal-player-data';
  if (pathname === '/api/v1/portal/parent/children') return 'portal-parent-children';
  if (pathname === '/api/v1/portal/coach/scope') return 'portal-coach-scope';
  if (pathname === '/api/v1/store/products') return 'store-products';
  if (pathname === '/api/v1/store/checkout') return 'store-checkout';
  if (pathname === '/api/v1/payments/intent') return 'payment-intent';
  if (pathname === '/api/v1/payments/webhook') return 'payment-webhook';
  if (pathname === '/api/v1/documents/register') return 'document-register';
  if (pathname === '/api/v1/documents/signed-url') return 'document-signed-url';

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
