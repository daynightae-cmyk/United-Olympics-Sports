import { DocumentDomainRepository } from './repositories/document-repository.ts';
import { requireAuthorizationContext } from './auth.ts';
import { assertMethod, readJsonBody, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

const docRepo = new DocumentDomainRepository();

export const documentRegisterHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const doc = await docRepo.registerDocument(ctx, {
    ownerType: (body.ownerType as 'player' | 'coach' | 'branch') || 'player',
    ownerId: (body.ownerId as string) || '',
    filename: (body.filename as string) || '',
    mimeType: (body.mimeType as string) || 'application/pdf',
  });
  sendJson(res, 201, { ok: true, document: doc });
};

export const documentSignedUrlHandler = async (req: ApiRequest, res: ApiResponse): Promise<void> => {
  assertMethod(req, ['POST']);
  const ctx = await requireAuthorizationContext(req);
  const body = await readJsonBody(req);
  const result = await docRepo.generateSignedDownloadUrl(ctx, (body.documentId as string) || '');
  sendJson(res, 200, { ok: true, ...result });
};

export const documentDownloadUrlHandler = documentSignedUrlHandler;
