import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../db/index.ts';
import type { AuthorizationContext } from './authorization-context.ts';

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorRoles: string[];
  organizationId?: string;
  countryId?: string;
  branchId?: string;
  action: string;
  entityType: string;
  entityId: string;
  correlationId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const SENSITIVE_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'password',
  'secret',
  'otp',
  'authorization',
  'credentials',
]);

export function redactSensitiveMetadata(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = redactSensitiveMetadata(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export async function recordAudit(
  ctx: AuthorizationContext,
  entry: {
    action: string;
    entityType: string;
    entityId: string;
    organizationId?: string;
    countryId?: string;
    branchId?: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<AuditLogEntry> {
  const id = randomUUID();
  const correlationId = entry.correlationId || randomUUID();
  const createdAt = new Date().toISOString();
  const cleanMetadata = redactSensitiveMetadata(entry.metadata || {});

  const auditRecord: AuditLogEntry = {
    id,
    actorUid: ctx.uid,
    actorRoles: ctx.roles,
    organizationId: entry.organizationId || ctx.tenant.organizationIds[0],
    countryId: entry.countryId || ctx.tenant.countryIds[0],
    branchId: entry.branchId || ctx.tenant.branchIds[0],
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    correlationId,
    metadata: cleanMetadata,
    createdAt,
  };

  if (databaseConfigured()) {
    try {
      const pool = getPool();
      await pool.query(
        `insert into audit_logs (id, actor_uid, action, entity_type, entity_id, metadata, created_at)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          auditRecord.id,
          auditRecord.actorUid,
          auditRecord.action,
          auditRecord.entityType,
          auditRecord.entityId,
          JSON.stringify({
            ...auditRecord.metadata,
            actorRoles: auditRecord.actorRoles,
            organizationId: auditRecord.organizationId,
            countryId: auditRecord.countryId,
            branchId: auditRecord.branchId,
            correlationId: auditRecord.correlationId,
          }),
          auditRecord.createdAt,
        ],
      );
    } catch (err) {
      console.error('[AUDIT] Failed to persist audit log to database:', err);
    }
  }

  return auditRecord;
}
