import { dispatchApi } from '../src/server/routes';
import type { ApiRequest, ApiResponse } from '../src/server/http';
import { applySecurityHeaders } from '../src/server/security-headers';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  applySecurityHeaders(res);
  await dispatchApi(req, res);
}
