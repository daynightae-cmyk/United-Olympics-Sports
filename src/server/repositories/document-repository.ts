import { randomUUID, createHmac } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import { assertCanManagePlayer } from '../authorization-context.ts';
import { recordAudit } from '../audit.ts';
import { ApiError, normalizeString, isUuid } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';

export interface DocumentRecord {
  id: string;
  ownerType: 'player' | 'coach' | 'branch';
  ownerId: string;
  storageKey: string;
  mimeType: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: string;
}

export class DocumentDomainRepository {
  private clientOverride?: DbQueryClient;
  private signingSecret: string;

  constructor(clientOverride?: DbQueryClient, signingSecret = 'uos-internal-document-signing-key') {
    this.clientOverride = clientOverride;
    this.signingSecret = signingSecret;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  // --- REGISTER DOCUMENT ---
  async registerDocument(
    ctx: AuthorizationContext,
    input: {
      ownerType: 'player' | 'coach' | 'branch';
      ownerId: string;
      filename: string;
      mimeType: string;
    },
  ): Promise<DocumentRecord> {
    const ownerId = normalizeString(input.ownerId, 64);
    const filename = normalizeString(input.filename, 255);
    const mimeType = normalizeString(input.mimeType, 100) || 'application/octet-stream';

    if (!ownerId || !isUuid(ownerId) || !filename) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'A valid ownerId and filename are required.');
    }

    // Ownership and tenant authorization
    if (input.ownerType === 'player') {
      assertCanManagePlayer(ctx, ownerId);
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `docs/${input.ownerType}/${ownerId}/${Date.now()}-${safeFilename}`;
    const id = randomUUID();

    await this.db.query(
      `insert into documents (id, owner_type, owner_id, storage_key, mime_type, status, created_at, updated_at)
       values ($1, $2, $3, $4, $5, 'active', now(), now())`,
      [id, input.ownerType, ownerId, storageKey, mimeType],
    );

    await recordAudit(ctx, {
      action: 'document.register',
      entityType: 'document',
      entityId: id,
      metadata: { ownerType: input.ownerType, ownerId, storageKey, mimeType },
    });

    return {
      id,
      ownerType: input.ownerType,
      ownerId,
      storageKey,
      mimeType,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  // --- GENERATE SIGNED DOWNLOAD URL ---
  async generateSignedDownloadUrl(
    ctx: AuthorizationContext,
    documentId: string,
    expiresInSeconds = 900,
  ): Promise<SignedUrlResult> {
    if (!documentId || !isUuid(documentId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Valid documentId is required.');
    }

    const res = await this.db.query<{
      id: string;
      owner_type: 'player' | 'coach' | 'branch';
      owner_id: string;
      storage_key: string;
      status: string;
    }>('select id, owner_type, owner_id, storage_key, status from documents where id = $1', [documentId]);

    if (!res.rows.length) {
      throw new ApiError(404, 'DOCUMENT_NOT_FOUND', 'Document not found.');
    }

    const doc = res.rows[0];
    if (doc.status !== 'active') {
      throw new ApiError(403, 'DOCUMENT_ARCHIVED', 'This document is archived.');
    }

    if (doc.owner_type === 'player') {
      assertCanManagePlayer(ctx, doc.owner_id);
    }

    const expiresAtTimestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const expiresAt = new Date(expiresAtTimestamp * 1000).toISOString();

    const signature = createHmac('sha256', this.signingSecret)
      .update(`${doc.storage_key}:${expiresAtTimestamp}:${ctx.uid}`)
      .digest('hex');

    const url = `/api/v1/documents/download?key=${encodeURIComponent(doc.storage_key)}&exp=${expiresAtTimestamp}&sig=${signature}`;

    return { url, expiresAt };
  }
}
