import { adminAuth } from '../lib/firebase-admin.ts';
import { getPool, databaseConfigured } from '../db/index.ts';
import { ApiError, getHeader, type ApiRequest } from './http.ts';

export type IdentityProvider = 'supabase' | 'firebase';

export interface ProviderIdentity {
  provider: IdentityProvider;
  subject: string;
  uid: string;
  email?: string;
}

export interface VerifiedIdentity extends ProviderIdentity {
  roles: string[];
  scopes: string[];
}

const DEFAULT_SUPABASE_URL = 'https://olmbezzzqavgjwydlfey.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

function supabaseConfig(): { url: string; publishableKey: string } {
  return {
    url: process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL,
    publishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
      || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
      || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  };
}

function tokenIssuer(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { iss?: unknown };
    return typeof parsed.iss === 'string' ? parsed.iss : null;
  } catch {
    return null;
  }
}

export function identityFromFirebaseDecoded(decoded: { uid: string; email?: string | null }): ProviderIdentity {
  return {
    provider: 'firebase',
    subject: decoded.uid,
    uid: decoded.uid,
    ...(decoded.email ? { email: decoded.email } : {}),
  };
}

export function identityFromSupabaseUser(user: { id: string; email?: string | null }): ProviderIdentity {
  return {
    provider: 'supabase',
    subject: user.id,
    uid: `supabase:${user.id}`,
    ...(user.email ? { email: user.email } : {}),
  };
}

export async function verifySupabaseAccessToken(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderIdentity | null> {
  const { url, publishableKey } = supabaseConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl(`${url}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const user = await response.json() as { id?: unknown; email?: unknown };
    if (typeof user.id !== 'string' || !user.id) return null;
    return identityFromSupabaseUser({
      id: user.id,
      ...(typeof user.email === 'string' ? { email: user.email } : {}),
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyFirebaseAccessToken(token: string): Promise<ProviderIdentity | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return identityFromFirebaseDecoded(decoded);
  } catch {
    return null;
  }
}

export async function verifyBearerIdentity(req: ApiRequest): Promise<VerifiedIdentity> {
  const authorization = getHeader(req, 'authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'A valid sign-in token is required.');
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) throw new ApiError(401, 'AUTH_REQUIRED', 'A valid sign-in token is required.');

  const issuer = tokenIssuer(token);
  const { url: supabaseUrl } = supabaseConfig();
  const supabaseIssuer = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;

  let providerIdentity: ProviderIdentity | null = null;
  if (issuer === supabaseIssuer) {
    providerIdentity = await verifySupabaseAccessToken(token);
  } else if (issuer?.startsWith('https://securetoken.google.com/')) {
    providerIdentity = await verifyFirebaseAccessToken(token);
  } else {
    providerIdentity = await verifySupabaseAccessToken(token);
    if (!providerIdentity) providerIdentity = await verifyFirebaseAccessToken(token);
  }

  if (!providerIdentity) {
    throw new ApiError(401, 'AUTH_INVALID', 'The sign-in token is invalid or expired.');
  }

  return {
    ...providerIdentity,
    roles: [],
    scopes: [],
  };
}

export async function resolveAuthorization(identity: VerifiedIdentity): Promise<VerifiedIdentity> {
  const authorizationBase: VerifiedIdentity = { ...identity, roles: [], scopes: [] };
  if (!databaseConfigured()) return authorizationBase;

  try {
    const pool = getPool();
    const [roleResult, scopeResult] = await Promise.all([
      pool.query<{ role: string }>('select role from app_user_roles where uid = $1 and active = true', [identity.uid]),
      pool.query<{ scope: string }>('select scope from app_user_scopes where uid = $1 and active = true', [identity.uid]),
    ]);

    return {
      ...authorizationBase,
      roles: [...new Set(roleResult.rows.map((row) => row.role.trim()).filter(Boolean))],
      scopes: [...new Set(scopeResult.rows.map((row) => row.scope.trim()).filter(Boolean))],
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

import {
  type AuthorizationContext,
  resolveAuthorizationContext,
} from './authorization-context.ts';

export * from './authorization-context.ts';

export async function requireAuthorizationContext(req: ApiRequest): Promise<AuthorizationContext> {
  const verified = await verifyBearerIdentity(req);
  return resolveAuthorizationContext(verified);
}
