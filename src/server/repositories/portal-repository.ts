import { databaseConfigured, getPool } from '../../db/index';
import type { AuthorizationContext } from '../authorization-context';
import { assertCanManagePlayer } from '../authorization-context';
import { ApiError, isUuid } from '../http';
import type { DbQueryClient } from '../vertical-slice';

export interface PlayerPortalData {
  player: {
    id: string;
    fullName: string;
    userUid: string | null;
    branchId: string | null;
  };
  schedule: Array<{ id: string; groupId: string; startsAt: string; status: string }>;
  attendance: Array<{ id: string; sessionId: string; status: string; date: string }>;
  performance: Array<{ id: string; metricKey: string; score: number | null; notes: string | null; date: string }>;
  subscriptions: Array<{ id: string; programId: string; status: string; currency: string | null; amountMinor: number | null }>;
  achievements: Array<{ id: string; title: string; titleAr: string | null; badge: string | null; category: string; earnedAt: string }>;
}

export interface CoachPortalWorkspaceData {
  coach: { id: string; fullName: string; branchId: string | null };
  assignedBranches: string[];
  assignedGroups: string[];
  assignedPlayerIds: string[];
  groups: Array<{
    id: string;
    branchId: string;
    programId: string;
    sportId: string;
    name: string;
    status: string;
  }>;
  players: Array<{
    id: string;
    fullName: string;
    branchId: string | null;
    groupId: string | null;
    programId: string | null;
    sportId: string | null;
    attendanceRate: number;
    performanceScore: number | null;
  }>;
  sessions: Array<{ id: string; groupId: string; sportId: string; startsAt: string; status: string }>;
  programs: Array<{ id: string; sportId: string; name: string; nameAr: string | null; status: string }>;
  sports: Array<{ id: string; name: string; nameAr: string | null; status: string }>;
  parents: Array<{ id: string; fullName: string; playerIds: string[] }>;
  messages: Array<{ id: string; fromId: string; toIds: string[]; content: string; sentAt: string; readAt: string | null }>;
  branches: Array<{ id: string; countryId: string; organizationId: string; name: string; nameAr: string | null; status: string }>;
}

export class PortalDomainRepository {
  constructor(private readonly clientOverride?: DbQueryClient) {}

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  async getPlayerData(ctx: AuthorizationContext, playerId: string): Promise<PlayerPortalData> {
    if (!playerId || !isUuid(playerId)) throw new ApiError(400, 'VALIDATION_ERROR', 'A valid playerId is required.');
    assertCanManagePlayer(ctx, playerId);

    const playerRes = await this.db.query<{ id: string; full_name: string; user_uid: string | null; branch_id: string | null; archived_at: string | null }>(
      'select id, full_name, user_uid, branch_id, archived_at from players where id = $1',
      [playerId],
    );
    if (!playerRes.rows.length) throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found.');
    const playerRow = playerRes.rows[0];
    if (playerRow.archived_at) throw new ApiError(400, 'PLAYER_ARCHIVED', 'Player record is archived.');

    const scheduleRes = await this.db.query<{ id: string; group_id: string; starts_at: string | Date; status: string }>(
      `select s.id, s.group_id, s.starts_at, s.status
         from sessions s
         join players p on p.group_id = s.group_id
        where p.id = $1 and p.archived_at is null
        order by s.starts_at desc
        limit 50`,
      [playerId],
    );
    const attendanceRes = await this.db.query<{ id: string; session_id: string; status: string; created_at: string | Date }>(
      `select a.id, a.session_id, a.status, a.created_at
         from attendance a
        where a.player_id = $1
        order by a.created_at desc
        limit 50`,
      [playerId],
    );
    const perfRes = await this.db.query<{ id: string; metric_key: string; score: number | null; notes: string | null; created_at: string | Date }>(
      `select pe.id, pe.metric_key, pe.score, pe.notes, pe.created_at
         from performance_evaluations pe
        where pe.player_id = $1
        order by pe.created_at desc
        limit 50`,
      [playerId],
    );
    const subRes = await this.db.query<{ id: string; program_id: string; status: string; currency: string | null; amount_minor: number | null }>(
      `select s.id, s.program_id, s.status, s.currency, s.amount_minor
         from subscriptions s
        where s.player_id = $1
        order by s.created_at desc
        limit 20`,
      [playerId],
    );
    const achRes = await this.db.query<{ id: string; title: string; title_ar: string | null; badge: string | null; category: string; earned_at: string | Date }>(
      `select a.id, a.title, a.title_ar, a.badge, a.category, a.earned_at
         from achievements a
        where a.player_id = $1
        order by a.earned_at desc
        limit 50`,
      [playerId],
    );

    return {
      player: { id: playerRow.id, fullName: playerRow.full_name, userUid: playerRow.user_uid, branchId: playerRow.branch_id },
      schedule: scheduleRes.rows.map((r) => ({ id: r.id, groupId: r.group_id, startsAt: new Date(r.starts_at).toISOString(), status: r.status })),
      attendance: attendanceRes.rows.map((r) => ({ id: r.id, sessionId: r.session_id, status: r.status, date: new Date(r.created_at).toISOString() })),
      performance: perfRes.rows.map((r) => ({ id: r.id, metricKey: r.metric_key, score: r.score, notes: r.notes, date: new Date(r.created_at).toISOString() })),
      subscriptions: subRes.rows.map((r) => ({ id: r.id, programId: r.program_id, status: r.status, currency: r.currency, amountMinor: r.amount_minor })),
      achievements: achRes.rows.map((r) => ({ id: r.id, title: r.title, titleAr: r.title_ar, badge: r.badge, category: r.category, earnedAt: new Date(r.earned_at).toISOString() })),
    };
  }

  async getParentPortalData(ctx: AuthorizationContext): Promise<{
    parent: { id: string; fullName: string; playerIds: string[] };
    children: Array<{ id: string; fullName: string; branchId: string | null }>;
  }> {
    const guardianId = ctx.bindings.guardianIds[0];
    if (!guardianId || ctx.bindings.guardianIds.length !== 1) {
      throw new ApiError(403, 'GUARDIAN_BINDING_REQUIRED', 'A single active guardian binding is required.');
    }
    const guardianRes = await this.db.query<{ id: string; full_name: string }>(
      'select id, full_name from guardians where id = $1 and user_uid = $2',
      [guardianId, ctx.uid],
    );
    if (!guardianRes.rows.length) throw new ApiError(404, 'GUARDIAN_NOT_FOUND', 'Guardian record not found.');

    const linkedPlayerIds = ctx.bindings.guardianPlayerIds;
    if (!linkedPlayerIds.length) {
      return { parent: { id: guardianId, fullName: guardianRes.rows[0].full_name, playerIds: [] }, children: [] };
    }
    const res = await this.db.query<{ id: string; full_name: string; branch_id: string | null }>(
      `select id, full_name, branch_id
         from players
        where id = any($1) and archived_at is null
        order by full_name asc`,
      [linkedPlayerIds],
    );
    const children = res.rows.map((r) => ({ id: r.id, fullName: r.full_name, branchId: r.branch_id }));
    return {
      parent: { id: guardianId, fullName: guardianRes.rows[0].full_name, playerIds: children.map((child) => child.id) },
      children,
    };
  }

  async getParentChildren(ctx: AuthorizationContext): Promise<Array<{ id: string; fullName: string; branchId: string | null }>> {
    return (await this.getParentPortalData(ctx)).children;
  }

  async getCoachScopeData(ctx: AuthorizationContext): Promise<CoachPortalWorkspaceData> {
    const coachId = ctx.bindings.coachIds[0];
    if (!coachId || ctx.bindings.coachIds.length !== 1) {
      throw new ApiError(403, 'COACH_BINDING_REQUIRED', 'A single active coach binding is required.');
    }
    const coachRes = await this.db.query<{ id: string; full_name: string; branch_id: string | null }>(
      'select id, full_name, branch_id from coaches where id = $1 and user_uid = $2',
      [coachId, ctx.uid],
    );
    if (!coachRes.rows.length) throw new ApiError(404, 'COACH_NOT_FOUND', 'Coach record not found.');

    const assignedGroups = [...new Set(ctx.bindings.coachGroupIds)];
    const assignedPlayerIds = [...new Set(ctx.bindings.coachPlayerIds)];
    const assignedBranches = [...new Set([
      ...ctx.tenant.branchIds,
      ...(coachRes.rows[0].branch_id ? [coachRes.rows[0].branch_id] : []),
    ])];

    const groupRes = assignedGroups.length
      ? await this.db.query<{ id: string; branch_id: string; program_id: string; sport_id: string; name: string; status: string }>(
        `select g.id, g.branch_id, g.program_id, p.sport_id, g.name, g.status
           from groups g
           join programs p on p.id = g.program_id
          where g.id = any($1)
          order by g.name asc`,
        [assignedGroups],
      )
      : { rows: [] as Array<{ id: string; branch_id: string; program_id: string; sport_id: string; name: string; status: string }> };

    const playerRes = assignedPlayerIds.length
      ? await this.db.query<{
        id: string;
        full_name: string;
        branch_id: string | null;
        group_id: string | null;
        program_id: string | null;
        sport_id: string | null;
        attendance_rate: number;
        performance_score: number | null;
      }>(
        `select p.id, p.full_name, p.branch_id, p.group_id,
                g.program_id, pr.sport_id,
                coalesce(round((count(distinct case when a.status in ('present', 'late') then a.id end)::numeric / nullif(count(distinct a.id), 0)) * 100), 0)::int as attendance_rate,
                round(avg(pe.score))::int as performance_score
           from players p
           left join groups g on g.id = p.group_id
           left join programs pr on pr.id = g.program_id
           left join attendance a on a.player_id = p.id
           left join performance_evaluations pe on pe.player_id = p.id
          where p.id = any($1) and p.archived_at is null
          group by p.id, p.full_name, p.branch_id, p.group_id, g.program_id, pr.sport_id
          order by p.full_name asc`,
        [assignedPlayerIds],
      )
      : { rows: [] as Array<{ id: string; full_name: string; branch_id: string | null; group_id: string | null; program_id: string | null; sport_id: string | null; attendance_rate: number; performance_score: number | null }> };

    const sessionRes = assignedGroups.length
      ? await this.db.query<{ id: string; group_id: string; sport_id: string; starts_at: string | Date; status: string }>(
        `select s.id, s.group_id, pr.sport_id, s.starts_at, s.status
           from sessions s
           join groups g on g.id = s.group_id
           join programs pr on pr.id = g.program_id
          where s.group_id = any($1)
          order by s.starts_at asc
          limit 500`,
        [assignedGroups],
      )
      : { rows: [] as Array<{ id: string; group_id: string; sport_id: string; starts_at: string | Date; status: string }> };

    const programIds = [...new Set(groupRes.rows.map((row) => row.program_id))];
    const programRes = programIds.length
      ? await this.db.query<{ id: string; sport_id: string; name: string; name_ar: string | null; status: string }>(
        'select id, sport_id, name, name_ar, status from programs where id = any($1) order by name asc',
        [programIds],
      )
      : { rows: [] as Array<{ id: string; sport_id: string; name: string; name_ar: string | null; status: string }> };

    const sportIds = [...new Set(programRes.rows.map((row) => row.sport_id))];
    const sportRes = sportIds.length
      ? await this.db.query<{ id: string; name: string; name_ar: string | null; status: string }>(
        'select id, name, name_ar, status from sports where id = any($1) order by name asc',
        [sportIds],
      )
      : { rows: [] as Array<{ id: string; name: string; name_ar: string | null; status: string }> };

    const parentRes = assignedPlayerIds.length
      ? await this.db.query<{ id: string; full_name: string; player_id: string }>(
        `select g.id, g.full_name, pg.player_id
           from guardians g
           join player_guardians pg on pg.guardian_id = g.id
          where pg.player_id = any($1) and pg.active = true
          order by g.full_name asc`,
        [assignedPlayerIds],
      )
      : { rows: [] as Array<{ id: string; full_name: string; player_id: string }> };

    const messageRes = await this.db.query<{ id: string; sender_uid: string; recipient_uid: string; content: string; created_at: string | Date; read_at: string | Date | null }>(
      `select id, sender_uid, recipient_uid, content, created_at, read_at
         from messages
        where sender_uid = $1 or recipient_uid = $1
        order by created_at desc
        limit 200`,
      [ctx.uid],
    );

    const branchRes = assignedBranches.length
      ? await this.db.query<{ id: string; country_id: string; organization_id: string; name: string; name_ar: string | null; status: string }>(
        `select b.id, b.country_id, c.organization_id, b.name, b.name_ar, b.status
           from branches b
           join countries c on c.id = b.country_id
          where b.id = any($1)
          order by b.name asc`,
        [assignedBranches],
      )
      : { rows: [] as Array<{ id: string; country_id: string; organization_id: string; name: string; name_ar: string | null; status: string }> };

    const parentMap = new Map<string, { id: string; fullName: string; playerIds: string[] }>();
    for (const row of parentRes.rows) {
      const existing = parentMap.get(row.id) ?? { id: row.id, fullName: row.full_name, playerIds: [] };
      if (!existing.playerIds.includes(row.player_id)) existing.playerIds.push(row.player_id);
      parentMap.set(row.id, existing);
    }

    return {
      coach: { id: coachRes.rows[0].id, fullName: coachRes.rows[0].full_name, branchId: coachRes.rows[0].branch_id },
      assignedBranches,
      assignedGroups,
      assignedPlayerIds,
      groups: groupRes.rows.map((row) => ({ id: row.id, branchId: row.branch_id, programId: row.program_id, sportId: row.sport_id, name: row.name, status: row.status })),
      players: playerRes.rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        branchId: row.branch_id,
        groupId: row.group_id,
        programId: row.program_id,
        sportId: row.sport_id,
        attendanceRate: Number.isFinite(row.attendance_rate) ? row.attendance_rate : 0,
        performanceScore: typeof row.performance_score === 'number' && Number.isFinite(row.performance_score) ? row.performance_score : null,
      })),
      sessions: sessionRes.rows.map((row) => ({ id: row.id, groupId: row.group_id, sportId: row.sport_id, startsAt: new Date(row.starts_at).toISOString(), status: row.status })),
      programs: programRes.rows.map((row) => ({ id: row.id, sportId: row.sport_id, name: row.name, nameAr: row.name_ar, status: row.status })),
      sports: sportRes.rows.map((row) => ({ id: row.id, name: row.name, nameAr: row.name_ar, status: row.status })),
      parents: [...parentMap.values()],
      messages: messageRes.rows.map((row) => ({ id: row.id, fromId: row.sender_uid, toIds: [row.recipient_uid], content: row.content, sentAt: new Date(row.created_at).toISOString(), readAt: row.read_at ? new Date(row.read_at).toISOString() : null })),
      branches: branchRes.rows.map((row) => ({ id: row.id, countryId: row.country_id, organizationId: row.organization_id, name: row.name, nameAr: row.name_ar, status: row.status })),
    };
  }
}
