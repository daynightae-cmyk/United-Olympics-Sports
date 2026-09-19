import { dispatchApi } from '../src/server/routes';
import type { ApiRequest, ApiResponse } from '../src/server/http';
import { applySecurityHeaders } from '../src/server/security-headers';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  // Vercel serves this handler over HTTPS: enable HSTS alongside the
  // canonical policy so serverless API responses match the standalone server.
  applySecurityHeaders(res, { enableHsts: true });
  await dispatchApi(req, res);
}
