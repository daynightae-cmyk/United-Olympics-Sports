import { dispatchApi } from '../src/server/routes.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';
import { applySecurityHeaders } from '../src/server/security-headers.ts';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  applySecurityHeaders(res);
  await dispatchApi(req, res);
}
