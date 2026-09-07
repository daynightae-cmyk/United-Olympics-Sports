import { dispatchRoute } from '../src/server/routes.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const rawRoute = req.query?.route;
  const queryRoute = Array.isArray(rawRoute) ? rawRoute[0] : rawRoute;
  const parsed = new URL(req.url || '/', 'http://localhost');
  const route = queryRoute || parsed.searchParams.get('route') || 'unknown';
  await dispatchRoute(route, req, res);
}
