import { dispatchApi } from '../src/server/routes.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  await dispatchApi(req, res);
}
