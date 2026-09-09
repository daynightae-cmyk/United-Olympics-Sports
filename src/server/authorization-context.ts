import { getPool, databaseConfigured } from '../db/index.ts';
import { ApiError } from './http.ts';
import type { ProviderIdentity, VerifiedIdentity } from './auth.ts';

export interface TenantBindings {
  organizationIds: string[];
  countryIds: string[];
  branchIds: string[];
}

export interface DomainBindings {
  playerIds: string[];
  guardianIds: string[];
  guardianPlayerIds: string[];
  coachIds: string[];
  coachGroupIds: string[];
  coachPlayerIds: string[];
}

export interface AuthorizationContext {
  uid: string;
  provider: 'supabase' | 'firebase';
  email?: string;
  roles: string[];
  scopes: string[];
  tenant: TenantBindings;
  bindings: DomainBindings;
}

export function isSuperAdmin(ctx: AuthorizationContext): boolean {
  return ctx.roles.includes('super_admin') || ctx.scopes.includes('*');
}

export function canAccessOrganization(ctx: AuthorizationContext, organizationId: string): boolean {
  if (isSuperAdmin(ctx)) return true;
  return ctx.tenant.organizationIds.includes(organizationId);
}

export function canAccessCountry(
  ctx: AuthorizationContext,
  countryId: string,
  parentOrgId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (parentOrgId && ctx.tenant.organizationIds.includes(parentOrgId)) return true;
  return ctx.tenant.countryIds.includes(countryId);
}

export function canAccessBranch(
  ctx: AuthorizationContext,
  branchId: string,
  parentCountryId?: string,
  parentOrgId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (parentOrgId && ctx.tenant.organizationIds.includes(parentOrgId)) return true;
  if (parentCountryId && ctx.tenant.countryIds.includes(parentCountryId)) return true;
  return ctx.tenant.branchIds.includes(branchId);
}

export function canManagePlayer(
  ctx: AuthorizationContext,
  playerId: string,
  branchId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (branchId && ctx.tenant.branchIds.includes(branchId)) return true;
  if (ctx.bindings.guardianPlayerIds.includes(playerId)) return true;
  if (ctx.bindings.playerIds.includes(playerId)) return true;
  return false;
}

export function canManageCoach(
  ctx: AuthorizationContext,
  coachId: string,
  branchId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (branchId && ctx.tenant.branchIds.includes(branchId)) return true;
  if (ctx.bindings.coachIds.includes(coachId)) return true;
  return false;
}

export function canRecordAttendance(
  ctx: AuthorizationContext,
  groupId: string,
  branchId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (branchId && ctx.tenant.branchIds.includes(branchId)) return true;
  if (ctx.bindings.coachGroupIds.includes(groupId)) return true;
  return false;
}

export function canRecordPerformance(
  ctx: AuthorizationContext,
  playerId: string,
  groupId?: string,
  branchId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  if (branchId && ctx.tenant.branchIds.includes(branchId)) return true;
  if (ctx.bindings.coachPlayerIds.includes(playerId)) return true;
  if (groupId && ctx.bindings.coachGroupIds.includes(groupId)) return true;
  return false;
}

export function canManageFinance(
  ctx: AuthorizationContext,
  organizationId?: string,
  branchId?: string,
): boolean {
  if (isSuperAdmin(ctx)) return true;
  const hasFinanceRole = ctx.roles.some((r) => ['finance_admin', 'admin'].includes(r));
  const hasFinanceScope = ctx.scopes.some((s) => ['finance:*', 'finance:write', '*'].includes(s));
  if (!hasFinanceRole && !hasFinanceScope) return false;

  if (organizationId && ctx.tenant.organizationIds.includes(organizationId)) return true;
  if (branchId && ctx.tenant.branchIds.includes(branchId)) return true;
  return ctx.tenant.organizationIds.length > 0 || ctx.tenant.branchIds.length > 0;
}

export function canManageStore(ctx: AuthorizationContext): boolean {
  if (isSuperAdmin(ctx)) return true;
  return ctx.roles.includes('store_admin') || ctx.scopes.includes('store:*');
}

// Assertions that throw 403 ApiError
export function assertCanAccessOrganization(ctx: AuthorizationContext, orgId: string): void {
  if (!canAccessOrganization(ctx, orgId)) {
    throw new ApiError(403, 'CROSS_ORGANIZATION_DENIED', 'Access to the requested organization is denied.');
  }
}

export function assertCanAccessCountry(ctx: AuthorizationContext, countryId: string, orgId?: string): void {
  if (!canAccessCountry(ctx, countryId, orgId)) {
    throw new ApiError(403, 'CROSS_COUNTRY_DENIED', 'Access to the requested country is denied.');
  }
}

export function assertCanAccessBranch(ctx: AuthorizationContext, branchId: string, countryId?: string, orgId?: string): void {
  if (!canAccessBranch(ctx, branchId, countryId, orgId)) {
    throw new ApiError(403, 'CROSS_BRANCH_DENIED', 'Access to the requested branch is denied.');
  }
}

export function assertCanManagePlayer(ctx: AuthorizationContext, playerId: string, branchId?: string): void {
  if (!canManagePlayer(ctx, playerId, branchId)) {
    throw new ApiError(403, 'UNRELATED_PLAYER_DENIED', 'You are not authorized to access or manage this player.');
  }
}

export function assertCanRecordAttendance(ctx: AuthorizationContext, groupId: string, branchId?: string): void {
  if (!canRecordAttendance(ctx, groupId, branchId)) {
    throw new ApiError(403, 'UNASSIGNED_COACH_DENIED', 'You are not assigned to record attendance for this group.');
  }
}

export function assertCanRecordPerformance(ctx: AuthorizationContext, playerId: string, groupId?: string, branchId?: string): void {
  if (!canRecordPerformance(ctx, playerId, groupId, branchId)) {
    throw new ApiError(403, 'UNASSIGNED_COACH_DENIED', 'You are not authorized to evaluate this player.');
  }
}

export async function resolveAuthorizationContext(identity: VerifiedIdentity): Promise<AuthorizationContext> {
  const baseContext: AuthorizationContext = {
    uid: identity.uid,
    provider: identity.provider,
    ...(identity.email ? { email: identity.email } : {}),
    roles: identity.roles || [],
    scopes: identity.scopes || [],
    tenant: {
      organizationIds: [],
      countryIds: [],
      branchIds: [],
    },
    bindings: {
      playerIds: [],
      guardianIds: [],
      guardianPlayerIds: [],
      coachIds: [],
      coachGroupIds: [],
      coachPlayerIds: [],
    },
  };

  if (!databaseConfigured()) {
    return baseContext;
  }

  const pool = getPool();
  try {
    const [rolesResult, scopesResult, playersResult, guardiansResult, coachesResult] = await Promise.all([
      pool.query<{ role: string; organization_id: string | null; country_id: string | null; branch_id: string | null }>(
        'select role, organization_id, country_id, branch_id from app_user_roles where uid = $1 and active = true',
        [identity.uid],
      ),
      pool.query<{ scope: string }>(
        'select scope from app_user_scopes where uid = $1 and active = true',
        [identity.uid],
      ),
      pool.query<{ id: string }>(
        'select id from players where user_uid = $1 and archived_at is null',
        [identity.uid],
      ),
      pool.query<{ guardian_id: string; player_id: string | null }>(
        `select g.id as guardian_id, pg.player_id
           from guardians g
      left join player_guardians pg on pg.guardian_id = g.id and pg.active = true
          where g.user_uid = $1`,
        [identity.uid],
      ),
      pool.query<{ coach_id: string; branch_id: string | null }>(
        'select id as coach_id, branch_id from coaches where user_uid = $1',
        [identity.uid],
      ),
    ]);

    const orgIds = new Set<string>();
    const countryIds = new Set<string>();
    const branchIds = new Set<string>();
    const roles = new Set<string>(baseContext.roles);

    for (const row of rolesResult.rows) {
      if (row.role) roles.add(row.role.trim());
      if (row.organization_id) orgIds.add(row.organization_id);
      if (row.country_id) countryIds.add(row.country_id);
      if (row.branch_id) branchIds.add(row.branch_id);
    }

    const scopes = new Set<string>(baseContext.scopes);
    for (const row of scopesResult.rows) {
      if (row.scope) scopes.add(row.scope.trim());
    }

    const playerIds = playersResult.rows.map((r) => r.id);
    const guardianIds = [...new Set(guardiansResult.rows.map((r) => r.guardian_id))];
    const guardianPlayerIds = guardiansResult.rows.map((r) => r.player_id).filter((id): id is string => Boolean(id));

    const coachIds = coachesResult.rows.map((r) => r.coach_id);
    for (const r of coachesResult.rows) {
      if (r.branch_id) branchIds.add(r.branch_id);
    }

    return {
      uid: identity.uid,
      provider: identity.provider,
      ...(identity.email ? { email: identity.email } : {}),
      roles: [...roles],
      scopes: [...scopes],
      tenant: {
        organizationIds: [...orgIds],
        countryIds: [...countryIds],
        branchIds: [...branchIds],
      },
      bindings: {
        playerIds,
        guardianIds,
        guardianPlayerIds,
        coachIds,
        coachGroupIds: [],
        coachPlayerIds: [],
      },
    };
  } catch (err) {
    console.error('Failed to resolve full authorization context:', err);
    throw new ApiError(503, 'AUTHORIZATION_UNAVAILABLE', 'Authorization data is temporarily unavailable.');
  }
}
