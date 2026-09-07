import { adminAuth } from '../lib/firebase-admin.ts';
import { getPool, databaseConfigured } from '../db/index.ts';
import { ApiError, getHeader, type ApiRequest } from './http.ts';

export interface VerifiedIdentity {
  uid: string;
  email?: string;
  roles: string[];
  scopes: string[];
}

function claimStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string');
  return [];
}

export async function verifyBearerIdentity(req: ApiRequest): Promise<VerifiedIdentity> {
  const authorization = getHeader(req, 'authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'A valid sign-in token is required.');
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) throw new ApiError(401, 'AUTH_REQUIRED', 'A valid sign-in token is required.');

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const roles = new Set<string>([
      ...claimStrings(decoded.role),
      ...claimStrings(decoded.roles),
      ...(decoded.admin === true ? ['admin'] : []),
    ]);
    const scopes = new Set<string>(claimStrings(decoded.scopes));

    return {
      uid: decoded.uid,
      ...(decoded.email ? { email: decoded.email } : {}),
      roles: [...roles],
      scopes: [...scopes],
    };
  } catch {
    throw new ApiError(401, 'AUTH_INVALID', 'The sign-in token is invalid or expired.');
  }
}

export async function resolveAuthorization(identity: VerifiedIdentity): Promise<VerifiedIdentity> {
  if (!databaseConfigured()) return identity;

  try {
    const pool = getPool();
    const [roleResult, scopeResult] = await Promise.all([
      pool.query<{ role: string }>('select role from app_user_roles where uid = $1 and active = true', [identity.uid]),
      pool.query<{ scope: string }>('select scope from app_user_scopes where uid = $1 and active = true', [identity.uid]),
    ]);

    return {
      ...identity,
      roles: [...new Set([...identity.roles, ...roleResult.rows.map((row) => row.role)])],
      scopes: [...new Set([...identity.scopes, ...scopeResult.rows.map((row) => row.scope)])],
    };
  } catch {
    throw new ApiError(503, 'AUTHORIZATION_UNAVAILABLE', 'Authorization data is temporarily unavailable.');
  }
}

export async function requireIdentity(req: ApiRequest): Promise<VerifiedIdentity> {
  return resolveAuthorization(await verifyBearerIdentity(req));
}

export function requireAnyRole(identity: VerifiedIdentity, allowed: string[]): void {
  if (!identity.roles.some((role) => allowed.includes(role))) {
    throw new ApiError(403, 'ACCESS_DENIED', 'You do not have permission to perform this action.');
  }
}

export async function assertPlayerRelationship(identity: VerifiedIdentity, playerId: string): Promise<void> {
  if (identity.roles.some((role) => ['admin', 'super_admin'].includes(role))) return;
  if (!databaseConfigured()) {
    throw new ApiError(503, 'AUTHORIZATION_UNAVAILABLE', 'Relationship authorization requires the production data service.');
  }

  const pool = getPool();
  try {
    const directPlayer = await pool.query(
      'select 1 from players where id = $1 and user_uid = $2 and archived_at is null limit 1',
      [playerId, identity.uid],
    );
    if (directPlayer.rowCount) return;

    const guardian = await pool.query(
      `select 1
         from guardians g
         join player_guardians pg on pg.guardian_id = g.id
        where g.user_uid = $1 and pg.player_id = $2 and pg.active = true
        limit 1`,
      [identity.uid, playerId],
    );
    if (guardian.rowCount) return;
  } catch {
    throw new ApiError(503, 'AUTHORIZATION_UNAVAILABLE', 'Relationship authorization is temporarily unavailable.');
  }

  throw new ApiError(403, 'RELATIONSHIP_DENIED', 'You are not authorized for this player record.');
}
