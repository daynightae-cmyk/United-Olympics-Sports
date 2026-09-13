import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import {
  assertCanAccessBranch,
  assertCanAccessCountry,
  assertCanAccessOrganization,
  assertCanManagePlayer,
  assertCanRecordPerformance,
  isSuperAdmin,
} from '../authorization-context.ts';
import { recordAudit } from '../audit.ts';
import { ApiError, isUuid, normalizeString } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';
import type {
  OrganizationViewModel,
  CountryViewModel,
  BranchViewModel,
  SportViewModel,
  ProgramViewModel,
  TrainingGroupViewModel,
  PlayerViewModel,
  CoachViewModel,
  ParentViewModel,
  SessionViewModel,
  RegistrationViewModel,
  AchievementViewModel,
  EventViewModel,
  AnnouncementViewModel,
  AuditActivityViewModel,
  ListResult,
  ListQueryParams,
  CreateResult,
  UpdateResult,
} from '../../admin/data/viewModels.ts';

export class AdminDomainRepository {
  private clientOverride?: DbQueryClient;

  constructor(clientOverride?: DbQueryClient) {
    this.clientOverride = clientOverride;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  // --- 1. ORGANIZATION ---
  async getOrganization(ctx: AuthorizationContext): Promise<OrganizationViewModel | null> {
    const orgId = ctx.tenant.organizationIds[0];
    const query = orgId
      ? 'select id, name, name_ar, status from organizations where id = $1 limit 1'
      : 'select id, name, name_ar, status from organizations order by created_at asc limit 1';
    const params = orgId ? [orgId] : [];

    const res = await this.db.query<{ id: string; name: string; name_ar: string | null; status: string }>(query, params);
    if (!res.rows.length) return null;

    const row = res.rows[0];
    const countriesCountRes = await this.db.query<{ count: string }>(
      'select count(*)::text as count from countries where organization_id = $1 and status = $2',
      [row.id, 'active'],
    );

    return {
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      description: {
        en: 'Premier Olympic Sports Training Organization across UAE and MENA.',
        ar: 'المؤسسة الرائدة للتدريب الأولمبي الرياضي في الإمارات ومنطقة الشرق الأوسط.',
      },
      countryCount: parseInt(countriesCountRes.rows[0]?.count || '0', 10),
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  /**
   * First-run production bootstrap. Creates the initial organization and binds
   * the calling authenticated identity as super_admin. Allowed ONLY when the
   * organizations table is empty — afterwards the bootstrap is permanently
   * closed (403 BOOTSTRAP_CLOSED). No owner UID is ever hard-coded.
   */
  async bootstrapOrganization(
    identity: { uid: string; provider: string; email?: string },
    data: { name: string; nameAr?: string },
  ): Promise<OrganizationViewModel> {
    const name = normalizeString(data.name, 160);
    const nameAr = normalizeString(data.nameAr, 160);
    if (!name) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Organization name in English is required.');
    }

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from organizations');
    if (parseInt(countRes.rows[0]?.count || '0', 10) > 0) {
      throw new ApiError(403, 'BOOTSTRAP_CLOSED', 'First setup is already complete. Bootstrap is permanently closed.');
    }

    const orgId = randomUUID();
    await this.db.query('insert into organizations (id, name, name_ar, status) values ($1, $2, $3, $4)', [
      orgId,
      name,
      nameAr ?? name,
      'active',
    ]);
    if (identity.email) {
      await this.db.query(
        'insert into users (uid, email) values ($1, $2) on conflict (uid) do update set email = excluded.email',
        [identity.uid, identity.email],
      );
    }
    await this.db.query('insert into app_user_roles (uid, role, active, organization_id) values ($1, $2, true, $3)', [
      identity.uid,
      'super_admin',
      orgId,
    ]);
    await this.db.query('insert into app_user_scopes (uid, scope, active) values ($1, $2, true)', [identity.uid, '*']);

    const ctx: AuthorizationContext = {
      uid: identity.uid,
      provider: (identity.provider === 'firebase' ? 'firebase' : 'supabase') as AuthorizationContext['provider'],
      ...(identity.email ? { email: identity.email } : {}),
      roles: ['super_admin'],
      scopes: ['*'],
      tenant: { organizationIds: [orgId], countryIds: [], branchIds: [] },
      bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
    };
    await recordAudit(ctx, {
      action: 'organization.bootstrap',
      entityType: 'organization',
      entityId: orgId,
      organizationId: orgId,
      metadata: { name },
    });

    return {
      id: orgId,
      name: { en: name, ar: nameAr || name },
      description: { en: 'Organization record created by first-run setup.', ar: 'سجل المنظمة المنشأ من الإعداد الأول.' },
      countryCount: 0,
      status: 'active',
    };
  }

  // --- 2. COUNTRIES ---
  async listCountries(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<CountryViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.organizationIds.length > 0) {
      queryParams.push(ctx.tenant.organizationIds);
      whereClause += ` and organization_id = any($${queryParams.length})`;
    }
    if (!isSuperAdmin(ctx) && ctx.tenant.countryIds.length > 0) {
      queryParams.push(ctx.tenant.countryIds);
      whereClause += ` and id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from countries ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      name: string;
      name_ar: string | null;
      iso_code: string;
      organization_id: string;
      status: string;
    }>(
      `select id, name, name_ar, iso_code, organization_id, status
         from countries ${whereClause}
        order by name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: CountryViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      code: row.iso_code,
      organizationId: row.organization_id,
      branchCount: 0,
      status: row.status === 'active' ? 'active' : 'inactive',
    }));

    return { items, total, page, pageSize };
  }

  async getCountry(ctx: AuthorizationContext, id: string): Promise<CountryViewModel | null> {
    assertCanAccessCountry(ctx, id);
    const res = await this.db.query<{
      id: string;
      name: string;
      name_ar: string | null;
      iso_code: string;
      organization_id: string;
      status: string;
    }>('select id, name, name_ar, iso_code, organization_id, status from countries where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      code: row.iso_code,
      organizationId: row.organization_id,
      branchCount: 0,
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  async createCountry(ctx: AuthorizationContext, data: Partial<CountryViewModel>): Promise<CreateResult<CountryViewModel>> {
    const nameEn = normalizeString(data.name?.en, 100);
    const nameAr = normalizeString(data.name?.ar, 100) || nameEn;
    const code = normalizeString(data.code, 10)?.toUpperCase();
    const orgId = data.organizationId || ctx.tenant.organizationIds[0];

    if (!nameEn || !code || !orgId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Name, code, and organizationId are required.');
    }
    assertCanAccessOrganization(ctx, orgId);

    const id = randomUUID();
    await this.db.query(
      `insert into countries (id, organization_id, iso_code, name, name_ar, status, created_at, updated_at)
       values ($1, $2, $3, $4, $5, 'active', now(), now())`,
      [id, orgId, code, nameEn, nameAr],
    );

    await recordAudit(ctx, {
      action: 'country.create',
      entityType: 'country',
      entityId: id,
      organizationId: orgId,
      countryId: id,
      metadata: { nameEn, nameAr, code },
    });

    const created: CountryViewModel = {
      id,
      name: { en: nameEn, ar: nameAr },
      code,
      organizationId: orgId,
      branchCount: 0,
      status: 'active',
    };
    return { item: created, message: 'Country created successfully' };
  }

  async updateCountry(
    ctx: AuthorizationContext,
    id: string,
    data: Partial<CountryViewModel>,
  ): Promise<UpdateResult<CountryViewModel>> {
    assertCanAccessCountry(ctx, id);
    const existing = await this.getCountry(ctx, id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Country not found.');
    }

    const nameEn = normalizeString(data.name?.en, 100) || existing.name.en;
    const nameAr = normalizeString(data.name?.ar, 100) || existing.name.ar;
    const status = data.status === 'inactive' ? 'inactive' : 'active';

    await this.db.query(
      `update countries
          set name = $1, name_ar = $2, status = $3, updated_at = now()
        where id = $4`,
      [nameEn, nameAr, status, id],
    );

    await recordAudit(ctx, {
      action: 'country.update',
      entityType: 'country',
      entityId: id,
      organizationId: existing.organizationId,
      countryId: id,
      metadata: { nameEn, nameAr, status },
    });

    const updated: CountryViewModel = {
      ...existing,
      name: { en: nameEn, ar: nameAr },
      status,
    };
    return { item: updated, message: 'Country updated successfully' };
  }

  // --- 3. BRANCHES ---
  async listBranches(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<BranchViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.branchIds.length > 0) {
      queryParams.push(ctx.tenant.branchIds);
      whereClause += ` and b.id = any($${queryParams.length})`;
    }
    if (!isSuperAdmin(ctx) && ctx.tenant.countryIds.length > 0) {
      queryParams.push(ctx.tenant.countryIds);
      whereClause += ` and b.country_id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from branches b ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      name: string;
      name_ar: string | null;
      country_id: string;
      organization_id: string;
      status: string;
    }>(
      `select b.id, b.name, b.name_ar, b.country_id, c.organization_id, b.status
         from branches b
         join countries c on b.country_id = c.id
       ${whereClause}
        order by b.name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: BranchViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      countryId: row.country_id,
      organizationId: row.organization_id,
      sportIds: [],
      programIds: [],
      groupIds: [],
      coachIds: [],
      playerIds: [],
      sportCount: 0,
      programCount: 0,
      groupCount: 0,
      coachCount: 0,
      playerCount: 0,
      status: row.status === 'active' ? 'active' : 'inactive',
    }));

    return { items, total, page, pageSize };
  }

  async getBranch(ctx: AuthorizationContext, id: string): Promise<BranchViewModel | null> {
    assertCanAccessBranch(ctx, id);
    const res = await this.db.query<{
      id: string;
      name: string;
      name_ar: string | null;
      country_id: string;
      organization_id: string;
      status: string;
    }>(
      `select b.id, b.name, b.name_ar, b.country_id, c.organization_id, b.status
         from branches b
         join countries c on b.country_id = c.id
        where b.id = $1`,
      [id],
    );

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      countryId: row.country_id,
      organizationId: row.organization_id,
      sportIds: [],
      programIds: [],
      groupIds: [],
      coachIds: [],
      playerIds: [],
      sportCount: 0,
      programCount: 0,
      groupCount: 0,
      coachCount: 0,
      playerCount: 0,
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  async createBranch(ctx: AuthorizationContext, data: Partial<BranchViewModel>): Promise<CreateResult<BranchViewModel>> {
    const nameEn = normalizeString(data.name?.en, 100);
    const nameAr = normalizeString(data.name?.ar, 100) || nameEn;
    const countryId = data.countryId || ctx.tenant.countryIds[0];

    if (!nameEn || !countryId || !isUuid(countryId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Valid branch name and countryId are required.');
    }
    assertCanAccessCountry(ctx, countryId);

    const id = randomUUID();
    await this.db.query(
      `insert into branches (id, country_id, name, name_ar, status, created_at, updated_at)
       values ($1, $2, $3, $4, 'active', now(), now())`,
      [id, countryId, nameEn, nameAr],
    );

    await recordAudit(ctx, {
      action: 'branch.create',
      entityType: 'branch',
      entityId: id,
      countryId,
      branchId: id,
      metadata: { nameEn, nameAr },
    });

    const created: BranchViewModel = {
      id,
      name: { en: nameEn, ar: nameAr },
      countryId,
      organizationId: ctx.tenant.organizationIds[0] || '',
      sportIds: [],
      programIds: [],
      groupIds: [],
      coachIds: [],
      playerIds: [],
      sportCount: 0,
      programCount: 0,
      groupCount: 0,
      coachCount: 0,
      playerCount: 0,
      status: 'active',
    };
    return { item: created, message: 'Branch created successfully' };
  }

  async updateBranch(
    ctx: AuthorizationContext,
    id: string,
    data: Partial<BranchViewModel>,
  ): Promise<UpdateResult<BranchViewModel>> {
    assertCanAccessBranch(ctx, id);
    const existing = await this.getBranch(ctx, id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Branch not found.');
    }

    const nameEn = normalizeString(data.name?.en, 100) || existing.name.en;
    const nameAr = normalizeString(data.name?.ar, 100) || existing.name.ar;
    const status = data.status === 'inactive' ? 'inactive' : 'active';

    await this.db.query(
      `update branches
          set name = $1, name_ar = $2, status = $3, updated_at = now()
        where id = $4`,
      [nameEn, nameAr, status, id],
    );

    await recordAudit(ctx, {
      action: 'branch.update',
      entityType: 'branch',
      entityId: id,
      countryId: existing.countryId,
      branchId: id,
      metadata: { nameEn, nameAr, status },
    });

    const updated: BranchViewModel = {
      ...existing,
      name: { en: nameEn, ar: nameAr },
      status,
    };
    return { item: updated, message: 'Branch updated successfully' };
  }

  // --- 4. SPORTS ---
  async listSports(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<SportViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from sports');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      code: string;
      name: string;
      name_ar: string | null;
      status: string;
    }>(
      `select id, code, name, name_ar, status
         from sports
        order by name asc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: SportViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      description: { en: `${row.name} training curriculum.`, ar: `منهج تدريب ${row.name_ar || row.name}.` },
      ageGroups: [{ en: 'U8-U18', ar: 'تحت 8 - تحت 18' }],
      programIds: [],
      icon: row.code.toLowerCase(),
      status: row.status === 'active' ? 'active' : 'inactive',
    }));

    return { items, total, page, pageSize };
  }

  async getSport(ctx: AuthorizationContext, id: string): Promise<SportViewModel | null> {
    const res = await this.db.query<{
      id: string;
      code: string;
      name: string;
      name_ar: string | null;
      status: string;
    }>('select id, code, name, name_ar, status from sports where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      description: { en: `${row.name} training curriculum.`, ar: `منهج تدريب ${row.name_ar || row.name}.` },
      ageGroups: [{ en: 'U8-U18', ar: 'تحت 8 - تحت 18' }],
      programIds: [],
      icon: row.code.toLowerCase(),
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  // --- 5. PROGRAMS ---
  async listPrograms(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<ProgramViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.branchIds.length > 0) {
      queryParams.push(ctx.tenant.branchIds);
      whereClause += ` and branch_id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from programs ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      branch_id: string;
      sport_id: string;
      name: string;
      name_ar: string | null;
      status: string;
    }>(
      `select id, branch_id, sport_id, name, name_ar, status
         from programs ${whereClause}
        order by name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: ProgramViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      sportId: row.sport_id,
      name: { en: row.name, ar: row.name_ar || row.name },
      description: { en: `${row.name} developmental program.`, ar: `برنامج تطوير ${row.name_ar || row.name}.` },
      ageGroups: [{ en: 'Youth', ar: 'الناشئين' }],
      level: { en: 'Developmental', ar: 'تطويري' },
      status: row.status === 'active' ? 'active' : 'inactive',
    }));

    return { items, total, page, pageSize };
  }

  async getProgram(ctx: AuthorizationContext, id: string): Promise<ProgramViewModel | null> {
    const res = await this.db.query<{
      id: string;
      branch_id: string;
      sport_id: string;
      name: string;
      name_ar: string | null;
      status: string;
    }>('select id, branch_id, sport_id, name, name_ar, status from programs where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      sportId: row.sport_id,
      name: { en: row.name, ar: row.name_ar || row.name },
      description: { en: `${row.name} developmental program.`, ar: `برنامج تطوير ${row.name_ar || row.name}.` },
      ageGroups: [{ en: 'Youth', ar: 'الناشئين' }],
      level: { en: 'Developmental', ar: 'تطويري' },
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  // --- 6. GROUPS ---
  async listGroups(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<TrainingGroupViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.branchIds.length > 0) {
      queryParams.push(ctx.tenant.branchIds);
      whereClause += ` and g.branch_id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from groups g ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      branch_id: string;
      program_id: string;
      name: string;
      sport_id: string;
      status: string;
    }>(
      `select g.id, g.branch_id, g.program_id, g.name, p.sport_id, g.status
         from groups g
         join programs p on g.program_id = p.id
       ${whereClause}
        order by g.name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: TrainingGroupViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      sportId: row.sport_id,
      name: { en: row.name, ar: row.name },
      ageGroup: { en: 'U14', ar: 'تحت 14' },
      level: { en: 'Intermediate', ar: 'متوسط' },
      playerCount: 0,
      coachCount: 0,
      programIds: [row.program_id],
      status: row.status === 'active' ? 'active' : 'inactive',
    }));

    return { items, total, page, pageSize };
  }

  async getGroup(ctx: AuthorizationContext, id: string): Promise<TrainingGroupViewModel | null> {
    const res = await this.db.query<{
      id: string;
      branch_id: string;
      program_id: string;
      name: string;
      sport_id: string;
      status: string;
    }>(
      `select g.id, g.branch_id, g.program_id, g.name, p.sport_id, g.status
         from groups g
         join programs p on g.program_id = p.id
        where g.id = $1`,
      [id],
    );

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      sportId: row.sport_id,
      name: { en: row.name, ar: row.name },
      ageGroup: { en: 'U14', ar: 'تحت 14' },
      level: { en: 'Intermediate', ar: 'متوسط' },
      playerCount: 0,
      coachCount: 0,
      programIds: [row.program_id],
      status: row.status === 'active' ? 'active' : 'inactive',
    };
  }

  // --- 7. PLAYERS ---
  async listPlayers(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<PlayerViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where p.archived_at is null';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx)) {
      if (ctx.tenant.branchIds.length > 0) {
        queryParams.push(ctx.tenant.branchIds);
        whereClause += ` and p.branch_id = any($${queryParams.length})`;
      } else if (ctx.bindings.playerIds.length > 0) {
        queryParams.push(ctx.bindings.playerIds);
        whereClause += ` and p.id = any($${queryParams.length})`;
      } else if (ctx.bindings.guardianPlayerIds.length > 0) {
        queryParams.push(ctx.bindings.guardianPlayerIds);
        whereClause += ` and p.id = any($${queryParams.length})`;
      }
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from players p ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      full_name: string;
      branch_id: string | null;
      user_uid: string | null;
      attendance_rate?: number;
      avg_performance_score?: number | null;
    }>(
      `select p.id, p.full_name, p.branch_id, p.user_uid,
              coalesce(round((count(distinct case when a.status in ('present', 'late') then a.id end)::numeric / nullif(count(distinct a.id), 0)) * 100), 0)::int as attendance_rate,
              round(avg(pe.score))::int as avg_performance_score
         from players p
         left join attendance a on a.player_id = p.id
         left join performance_evaluations pe on pe.player_id = p.id
       ${whereClause}
        group by p.id, p.full_name, p.branch_id, p.user_uid
        order by p.full_name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: PlayerViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      sportId: '',
      level: { en: 'Active', ar: 'نشط' },
      status: { en: 'Registered', ar: 'مسجل' },
      attendanceRate: typeof row.attendance_rate === 'number' ? row.attendance_rate : 0,
      performanceScore: typeof row.avg_performance_score === 'number' ? row.avg_performance_score : null,
    }));

    return { items, total, page, pageSize };
  }

  async getPlayer(ctx: AuthorizationContext, id: string): Promise<PlayerViewModel | null> {
    assertCanManagePlayer(ctx, id);
    const res = await this.db.query<{
      id: string;
      full_name: string;
      branch_id: string | null;
      user_uid: string | null;
      attendance_rate?: number;
      avg_performance_score?: number | null;
    }>(
      `select p.id, p.full_name, p.branch_id, p.user_uid,
              coalesce(round((count(distinct case when a.status in ('present', 'late') then a.id end)::numeric / nullif(count(distinct a.id), 0)) * 100), 0)::int as attendance_rate,
              round(avg(pe.score))::int as avg_performance_score
         from players p
         left join attendance a on a.player_id = p.id
         left join performance_evaluations pe on pe.player_id = p.id
        where p.id = $1 and p.archived_at is null
        group by p.id, p.full_name, p.branch_id, p.user_uid`,
      [id],
    );

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      sportId: '',
      level: { en: 'Active', ar: 'نشط' },
      status: { en: 'Registered', ar: 'مسجل' },
      attendanceRate: typeof row.attendance_rate === 'number' ? row.attendance_rate : 0,
      performanceScore: typeof row.avg_performance_score === 'number' ? row.avg_performance_score : null,
    };
  }

  async createPlayer(ctx: AuthorizationContext, data: Partial<PlayerViewModel>): Promise<CreateResult<PlayerViewModel>> {
    const fullName = normalizeString(data.nameEn || data.nameAr, 120);
    const branchId = ctx.tenant.branchIds[0];

    if (!fullName) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Player name is required.');
    }
    if (branchId) assertCanAccessBranch(ctx, branchId);

    const id = randomUUID();
    await this.db.query(
      `insert into players (id, branch_id, full_name, created_at, updated_at)
       values ($1, $2, $3, now(), now())`,
      [id, branchId || null, fullName],
    );

    await recordAudit(ctx, {
      action: 'player.create',
      entityType: 'player',
      entityId: id,
      branchId,
      metadata: { fullName },
    });

    const created: PlayerViewModel = {
      id,
      nameEn: fullName,
      nameAr: fullName,
      sportId: data.sportId || '',
      level: { en: 'Active', ar: 'نشط' },
      status: { en: 'Registered', ar: 'مسجل' },
      attendanceRate: 0,
      performanceScore: null,
    };
    return { item: created, message: 'Player created successfully' };
  }

  async updatePlayer(
    ctx: AuthorizationContext,
    id: string,
    data: Partial<PlayerViewModel>,
  ): Promise<UpdateResult<PlayerViewModel>> {
    assertCanManagePlayer(ctx, id);
    const existing = await this.getPlayer(ctx, id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Player not found.');
    }

    const fullName = normalizeString(data.nameEn || data.nameAr, 120) || existing.nameEn;

    await this.db.query(
      `update players
          set full_name = $1, updated_at = now()
        where id = $2 and archived_at is null`,
      [fullName, id],
    );

    await recordAudit(ctx, {
      action: 'player.update',
      entityType: 'player',
      entityId: id,
      metadata: { fullName },
    });

    const updated: PlayerViewModel = {
      ...existing,
      nameEn: fullName,
      nameAr: fullName,
    };
    return { item: updated, message: 'Player updated successfully' };
  }

  // --- 8. COACHES ---
  async listCoaches(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<CoachViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.branchIds.length > 0) {
      queryParams.push(ctx.tenant.branchIds);
      whereClause += ` and c.branch_id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(`select count(*)::text as count from coaches c ${whereClause}`, queryParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      full_name: string;
      branch_id: string | null;
      user_uid: string | null;
    }>(
      `select c.id, c.full_name, c.branch_id, c.user_uid
         from coaches c
       ${whereClause}
        order by c.full_name asc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: CoachViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      sportIds: [],
      branchIds: row.branch_id ? [row.branch_id] : [],
      groupIds: [],
      playerCount: 0,
      specializations: [{ en: 'Olympic Coaching', ar: 'تدريب أولمبي' }],
      certifications: [{ en: 'IOC Certified', ar: 'معتمد من اللجنة الأولمبية' }],
      status: 'active',
    }));

    return { items, total, page, pageSize };
  }

  async getCoach(ctx: AuthorizationContext, id: string): Promise<CoachViewModel | null> {
    const res = await this.db.query<{
      id: string;
      full_name: string;
      branch_id: string | null;
      user_uid: string | null;
    }>('select c.id, c.full_name, c.branch_id, c.user_uid from coaches c where c.id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      sportIds: [],
      branchIds: row.branch_id ? [row.branch_id] : [],
      groupIds: [],
      playerCount: 0,
      specializations: [{ en: 'Olympic Coaching', ar: 'تدريب أولمبي' }],
      certifications: [{ en: 'IOC Certified', ar: 'معتمد من اللجنة الأولمبية' }],
      status: 'active',
    };
  }

  // --- 9. GUARDIANS / PARENTS ---
  async listParents(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<ParentViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from guardians');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      full_name: string;
      user_uid: string;
    }>(
      `select g.id, g.full_name, g.user_uid
         from guardians g
        order by g.full_name asc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: ParentViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      playerIds: [],
      playerCount: 0,
      preferredLanguage: 'ar',
      status: 'active',
    }));

    return { items, total, page, pageSize };
  }

  async getParent(ctx: AuthorizationContext, id: string): Promise<ParentViewModel | null> {
    const res = await this.db.query<{
      id: string;
      full_name: string;
      user_uid: string;
    }>('select g.id, g.full_name, g.user_uid from guardians g where g.id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      nameEn: row.full_name,
      nameAr: row.full_name,
      playerIds: [],
      playerCount: 0,
      preferredLanguage: 'ar',
      status: 'active',
    };
  }

  // --- 10. SESSIONS ---
  async listSessions(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<SessionViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    let whereClause = 'where 1=1';
    const queryParams: unknown[] = [];

    if (!isSuperAdmin(ctx) && ctx.tenant.branchIds.length > 0) {
      queryParams.push(ctx.tenant.branchIds);
      whereClause += ` and g.branch_id = any($${queryParams.length})`;
    }

    const countRes = await this.db.query<{ count: string }>(
      `select count(*)::text as count
         from sessions s
         join groups g on s.group_id = g.id
       ${whereClause}`,
      queryParams,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    queryParams.push(pageSize, offset);
    const dataRes = await this.db.query<{
      id: string;
      group_id: string;
      starts_at: string | Date;
      status: string;
      sport_id: string;
    }>(
      `select s.id, s.group_id, s.starts_at, s.status, p.sport_id
         from sessions s
         join groups g on s.group_id = g.id
         join programs p on g.program_id = p.id
       ${whereClause}
        order by s.starts_at desc
        limit $${queryParams.length - 1} offset $${queryParams.length}`,
      queryParams,
    );

    const items: SessionViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      sportId: row.sport_id,
      groupId: row.group_id,
      startsAt: new Date(row.starts_at).toISOString(),
      status: { en: row.status, ar: row.status === 'scheduled' ? 'مجدول' : 'مكتمل' },
      coachIds: [],
    }));

    return { items, total, page, pageSize };
  }

  async getSession(ctx: AuthorizationContext, id: string): Promise<SessionViewModel | null> {
    const res = await this.db.query<{
      id: string;
      group_id: string;
      starts_at: string | Date;
      status: string;
      sport_id: string;
    }>(
      `select s.id, s.group_id, s.starts_at, s.status, p.sport_id
         from sessions s
         join groups g on s.group_id = g.id
         join programs p on g.program_id = p.id
        where s.id = $1`,
      [id],
    );

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      sportId: row.sport_id,
      groupId: row.group_id,
      startsAt: new Date(row.starts_at).toISOString(),
      status: { en: row.status, ar: row.status === 'scheduled' ? 'مجدول' : 'مكتمل' },
      coachIds: [],
    };
  }

  // --- 11. REGISTRATIONS / SERVICE REQUESTS ---
  async listRegistrations(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<RegistrationViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from service_requests');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      player_id: string;
      status: string;
      created_at: string | Date;
      payload: Record<string, unknown>;
    }>(
      `select id, player_id, status, created_at, payload
         from service_requests
        order by created_at desc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: RegistrationViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      playerId: row.player_id,
      programId: (row.payload?.programId as string) || '',
      status: (row.status as any) || 'pending',
      requestedAt: new Date(row.created_at).toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getRegistration(ctx: AuthorizationContext, id: string): Promise<RegistrationViewModel | null> {
    const res = await this.db.query<{
      id: string;
      player_id: string;
      status: string;
      created_at: string | Date;
      payload: Record<string, unknown>;
    }>('select id, player_id, status, created_at, payload from service_requests where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      playerId: row.player_id,
      programId: (row.payload?.programId as string) || '',
      status: (row.status as any) || 'pending',
      requestedAt: new Date(row.created_at).toISOString(),
    };
  }

  // --- 12. PERFORMANCE EVALUATIONS ---
  async recordPerformance(
    ctx: AuthorizationContext,
    input: {
      playerId: string;
      metricKey: string;
      score: number;
      sessionId?: string;
      notes?: string;
    },
  ): Promise<{ id: string; success: boolean }> {
    const playerId = normalizeString(input.playerId, 64);
    const metricKey = normalizeString(input.metricKey, 64);
    const score = input.score;

    if (!playerId || !isUuid(playerId) || !metricKey) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'A valid playerId and metricKey are required.');
    }
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Performance score must be a number between 0 and 100.');
    }

    // Verify AuthorizationContext
    assertCanRecordPerformance(ctx, playerId);

    // Fetch player to ensure existence and tenant consistency
    const playerRes = await this.db.query<{ id: string; branch_id: string | null; archived_at: string | null }>(
      'select id, branch_id, archived_at from players where id = $1',
      [playerId],
    );
    if (!playerRes.rows.length) {
      throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found.');
    }
    if (playerRes.rows[0].archived_at) {
      throw new ApiError(400, 'PLAYER_ARCHIVED', 'Cannot evaluate an archived player.');
    }

    const branchId = playerRes.rows[0].branch_id || undefined;
    if (branchId) assertCanAccessBranch(ctx, branchId);

    const evalId = randomUUID();
    const coachId = ctx.bindings.coachIds[0] || null;

    await this.db.query(
      `insert into performance_evaluations
         (id, player_id, session_id, coach_id, metric_key, score, notes, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
      [evalId, playerId, input.sessionId || null, coachId, metricKey, score, input.notes || null],
    );

    await recordAudit(ctx, {
      action: 'performance.record',
      entityType: 'performance_evaluation',
      entityId: evalId,
      branchId,
      metadata: { playerId, metricKey, score, notes: input.notes, recordedByUid: ctx.uid },
    });

    return { id: evalId, success: true };
  }

  // --- 13. ACHIEVEMENTS ---
  async listAchievements(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<AchievementViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from achievements');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      player_id: string | null;
      title: string;
      title_ar: string | null;
      badge: string | null;
      category: string;
      earned_at: string | Date;
    }>(
      `select id, player_id, title, title_ar, badge, category, earned_at
         from achievements
        order by earned_at desc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: AchievementViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      description: { en: row.title, ar: row.title_ar || row.title },
      category: { en: row.category, ar: row.category },
      playerId: row.player_id || undefined,
      awardedAt: new Date(row.earned_at).toISOString(),
      status: 'awarded',
    }));

    return { items, total, page, pageSize };
  }

  async getAchievement(ctx: AuthorizationContext, id: string): Promise<AchievementViewModel | null> {
    const res = await this.db.query<{
      id: string;
      player_id: string | null;
      title: string;
      title_ar: string | null;
      badge: string | null;
      category: string;
      earned_at: string | Date;
    }>('select id, player_id, title, title_ar, badge, category, earned_at from achievements where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      description: { en: row.title, ar: row.title_ar || row.title },
      category: { en: row.category, ar: row.category },
      playerId: row.player_id || undefined,
      awardedAt: new Date(row.earned_at).toISOString(),
      status: 'awarded',
    };
  }

  // --- 14. EVENTS ---
  async listEvents(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<EventViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from events');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      title: string;
      title_ar: string | null;
      description: string | null;
      description_ar: string | null;
      starts_at: string | Date;
      ends_at: string | Date;
      location: string | null;
      status: string;
    }>(
      `select id, title, title_ar, description, description_ar, starts_at, ends_at, location, status
         from events
        order by starts_at asc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: EventViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      description: { en: row.description || row.title, ar: row.description_ar || row.description || row.title },
      type: { en: 'Olympic Event', ar: 'حدث أولمبي' },
      startDate: new Date(row.starts_at).toISOString(),
      endDate: new Date(row.ends_at).toISOString(),
      location: row.location ? { en: row.location, ar: row.location } : undefined,
      status: (row.status as any) || 'scheduled',
    }));

    return { items, total, page, pageSize };
  }

  async getEvent(ctx: AuthorizationContext, id: string): Promise<EventViewModel | null> {
    const res = await this.db.query<{
      id: string;
      title: string;
      title_ar: string | null;
      description: string | null;
      description_ar: string | null;
      starts_at: string | Date;
      ends_at: string | Date;
      location: string | null;
      status: string;
    }>('select id, title, title_ar, description, description_ar, starts_at, ends_at, location, status from events where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      description: { en: row.description || row.title, ar: row.description_ar || row.description || row.title },
      type: { en: 'Olympic Event', ar: 'حدث أولمبي' },
      startDate: new Date(row.starts_at).toISOString(),
      endDate: new Date(row.ends_at).toISOString(),
      location: row.location ? { en: row.location, ar: row.location } : undefined,
      status: (row.status as any) || 'scheduled',
    };
  }

  // --- 15. ANNOUNCEMENTS ---
  async listAnnouncements(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<AnnouncementViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from announcements');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      title: string;
      title_ar: string | null;
      content: string;
      content_ar: string | null;
      priority: string;
      status: string;
      published_at: string | Date | null;
    }>(
      `select id, title, title_ar, content, content_ar, priority, status, published_at
         from announcements
        order by created_at desc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: AnnouncementViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      body: { en: row.content, ar: row.content_ar || row.content },
      audience: { en: 'All Members', ar: 'جميع الأعضاء' },
      priority: (row.priority as any) || 'normal',
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : undefined,
      status: (row.status as any) || 'published',
    }));

    return { items, total, page, pageSize };
  }

  async getAnnouncement(ctx: AuthorizationContext, id: string): Promise<AnnouncementViewModel | null> {
    const res = await this.db.query<{
      id: string;
      title: string;
      title_ar: string | null;
      content: string;
      content_ar: string | null;
      priority: string;
      status: string;
      published_at: string | Date | null;
    }>('select id, title, title_ar, content, content_ar, priority, status, published_at from announcements where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      body: { en: row.content, ar: row.content_ar || row.content },
      audience: { en: 'All Members', ar: 'جميع الأعضاء' },
      priority: (row.priority as any) || 'normal',
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : undefined,
      status: (row.status as any) || 'published',
    };
  }

  // --- 16. AUDIT ACTIVITY ---
  async listAuditActivity(ctx: AuthorizationContext, params?: ListQueryParams): Promise<ListResult<AuditActivityViewModel>> {
    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const countRes = await this.db.query<{ count: string }>('select count(*)::text as count from audit_logs');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<{
      id: string;
      actor_uid: string;
      action: string;
      entity_type: string;
      entity_id: string;
      ip_address: string | null;
      created_at: string | Date;
    }>(
      `select id, actor_uid, action, entity_type, entity_id, ip_address, created_at
         from audit_logs
        order by created_at desc
        limit $1 offset $2`,
      [pageSize, offset],
    );

    const items: AuditActivityViewModel[] = dataRes.rows.map((row) => ({
      id: row.id,
      actorId: row.actor_uid,
      actorName: { en: `User ${row.actor_uid}`, ar: `المستخدم ${row.actor_uid}` },
      action: { en: row.action, ar: row.action },
      entityType: { en: row.entity_type, ar: row.entity_type },
      entityId: row.entity_id,
      details: { en: `Action ${row.action} on ${row.entity_type}`, ar: `إجراء ${row.action} على ${row.entity_type}` },
      timestamp: new Date(row.created_at).toISOString(),
      ip: row.ip_address || undefined,
    }));

    return { items, total, page, pageSize };
  }

  async getAuditActivity(ctx: AuthorizationContext, id: string): Promise<AuditActivityViewModel | null> {
    const res = await this.db.query<{
      id: string;
      actor_uid: string;
      action: string;
      entity_type: string;
      entity_id: string;
      ip_address: string | null;
      created_at: string | Date;
    }>('select id, actor_uid, action, entity_type, entity_id, ip_address, created_at from audit_logs where id = $1', [id]);

    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      actorId: row.actor_uid,
      actorName: { en: `User ${row.actor_uid}`, ar: `المستخدم ${row.actor_uid}` },
      action: { en: row.action, ar: row.action },
      entityType: { en: row.entity_type, ar: row.entity_type },
      entityId: row.entity_id,
      details: { en: `Action ${row.action} on ${row.entity_type}`, ar: `إجراء ${row.action} على ${row.entity_type}` },
      timestamp: new Date(row.created_at).toISOString(),
      ip: row.ip_address || undefined,
    };
  }
}
