import { databaseConfigured, getPool } from '../../db/index.ts';
import type { AuthorizationContext } from '../authorization-context.ts';
import { assertCanManagePlayer } from '../authorization-context.ts';
import { ApiError, isUuid } from '../http.ts';
import type { DbQueryClient } from '../vertical-slice.ts';

export interface PlayerPortalData {
  player: {
    id: string;
    fullName: string;
    userUid: string | null;
    branchId: string | null;
  };
  schedule: Array<{
    id: string;
    groupId: string;
    startsAt: string;
    status: string;
  }>;
  attendance: Array<{
    id: string;
    sessionId: string;
    status: string;
    date: string;
  }>;
  performance: Array<{
    id: string;
    metricKey: string;
    score: number | null;
    notes: string | null;
    date: string;
  }>;
  subscriptions: Array<{
    id: string;
    programId: string;
    status: string;
    currency: string | null;
    amountMinor: number | null;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    titleAr: string | null;
    badge: string | null;
    category: string;
    earnedAt: string;
  }>;
}

export class PortalDomainRepository {
  private clientOverride?: DbQueryClient;

  constructor(clientOverride?: DbQueryClient) {
    this.clientOverride = clientOverride;
  }

  private get db(): DbQueryClient {
    if (this.clientOverride) return this.clientOverride;
    if (databaseConfigured()) return getPool();
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Database service is not configured.');
  }

  async getPlayerData(ctx: AuthorizationContext, playerId: string): Promise<PlayerPortalData> {
    if (!playerId || !isUuid(playerId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'A valid playerId is required.');
    }

    assertCanManagePlayer(ctx, playerId);

    const playerRes = await this.db.query<{
      id: string;
      full_name: string;
      user_uid: string | null;
      branch_id: string | null;
      archived_at: string | null;
    }>('select id, full_name, user_uid, branch_id, archived_at from players where id = $1', [playerId]);

    if (!playerRes.rows.length) {
      throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found.');
    }
    const playerRow = playerRes.rows[0];
    if (playerRow.archived_at) {
      throw new ApiError(400, 'PLAYER_ARCHIVED', 'Player record is archived.');
    }

    // A player only sees sessions for the group persisted on their own player row.
    // This closes the previous cross-player schedule leak where every session was returned.
    const scheduleRes = await this.db.query<{
      id: string;
      group_id: string;
      starts_at: string | Date;
      status: string;
    }>(
      `select s.id, s.group_id, s.starts_at, s.status
         from sessions s
         join players p on p.group_id = s.group_id
        where p.id = $1 and p.archived_at is null
        order by s.starts_at desc
        limit 50`,
      [playerId],
    );

    const attendanceRes = await this.db.query<{
      id: string;
      session_id: string;
      status: string;
      created_at: string | Date;
    }>(
      `select a.id, a.session_id, a.status, a.created_at
         from attendance a
        where a.player_id = $1
        order by a.created_at desc
        limit 50`,
      [playerId],
    );

    const perfRes = await this.db.query<{
      id: string;
      metric_key: string;
      score: number | null;
      notes: string | null;
      created_at: string | Date;
    }>(
      `select pe.id, pe.metric_key, pe.score, pe.notes, pe.created_at
         from performance_evaluations pe
        where pe.player_id = $1
        order by pe.created_at desc
        limit 50`,
      [playerId],
    );

    const subRes = await this.db.query<{
      id: string;
      program_id: string;
      status: string;
      currency: string | null;
      amount_minor: number | null;
    }>(
      `select s.id, s.program_id, s.status, s.currency, s.amount_minor
         from subscriptions s
        where s.player_id = $1
        order by s.created_at desc
        limit 20`,
      [playerId],
    );

    const achRes = await this.db.query<{
      id: string;
      title: string;
      title_ar: string | null;
      badge: string | null;
      category: string;
      earned_at: string | Date;
    }>(
      `select a.id, a.title, a.title_ar, a.badge, a.category, a.earned_at
         from achievements a
        where a.player_id = $1
        order by a.earned_at desc
        limit 50`,
      [playerId],
    );

    return {
      player: {
        id: playerRow.id,
        fullName: playerRow.full_name,
        userUid: playerRow.user_uid,
        branchId: playerRow.branch_id,
      },
      schedule: scheduleRes.rows.map((r) => ({
        id: r.id,
        groupId: r.group_id,
        startsAt: new Date(r.starts_at).toISOString(),
        status: r.status,
      })),
      attendance: attendanceRes.rows.map((r) => ({
        id: r.id,
        sessionId: r.session_id,
        status: r.status,
        date: new Date(r.created_at).toISOString(),
      })),
      performance: perfRes.rows.map((r) => ({
        id: r.id,
        metricKey: r.metric_key,
        score: r.score,
        notes: r.notes,
        date: new Date(r.created_at).toISOString(),
      })),
      subscriptions: subRes.rows.map((r) => ({
        id: r.id,
        programId: r.program_id,
        status: r.status,
        currency: r.currency,
        amountMinor: r.amount_minor,
      })),
      achievements: achRes.rows.map((r) => ({
        id: r.id,
        title: r.title,
        titleAr: r.title_ar,
        badge: r.badge,
        category: r.category,
        earnedAt: new Date(r.earned_at).toISOString(),
      })),
    };
  }

  async getParentChildren(ctx: AuthorizationContext): Promise<Array<{ id: string; fullName: string; branchId: string | null }>> {
    const linkedPlayerIds = ctx.bindings.guardianPlayerIds;
    if (!linkedPlayerIds || linkedPlayerIds.length === 0) {
      return [];
    }

    const res = await this.db.query<{
      id: string;
      full_name: string;
      branch_id: string | null;
    }>(
      `select id, full_name, branch_id
         from players
        where id = any($1) and archived_at is null
        order by full_name asc`,
      [linkedPlayerIds],
    );

    return res.rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      branchId: r.branch_id,
    }));
  }

  async getCoachScopeData(ctx: AuthorizationContext): Promise<{
    assignedBranches: string[];
    assignedGroups: string[];
    assignedPlayerIds: string[];
  }> {
    return {
      assignedBranches: ctx.tenant.branchIds,
      assignedGroups: ctx.bindings.coachGroupIds,
      assignedPlayerIds: ctx.bindings.coachPlayerIds,
    };
  }
}