import { databaseConfigured, getPool } from '../db/index.ts';
import { requireIdentity, type VerifiedIdentity } from './auth.ts';
import { ApiError, assertMethod, sendJson, type ApiRequest, type ApiResponse } from './http.ts';

export interface PortalBindings {
  playerIds: string[];
  guardianIds: string[];
  guardianPlayerIds: string[];
  coachIds: string[];
  coachGroupIds: string[];
  coachPlayerIds: string[];
}

interface IdRow {
  id: string;
}

interface PlayerIdRow {
  player_id: string;
}

interface GroupIdRow {
  group_id: string;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export async function resolvePortalBindings(identity: VerifiedIdentity): Promise<PortalBindings> {
  if (!databaseConfigured()) {
    throw new ApiError(503, 'PORTAL_BINDING_UNAVAILABLE', 'Portal identity binding requires the production data service.');
  }

  try {
    const pool = getPool();
    const [players, guardians, guardianPlayers, coaches, coachGroups, coachPlayers] = await Promise.all([
      pool.query<IdRow>(
        `select id::text as id
           from players
          where user_uid = $1
            and archived_at is null
          order by id`,
        [identity.uid],
      ),
      pool.query<IdRow>(
        `select id::text as id
           from guardians
          where user_uid = $1
          order by id`,
        [identity.uid],
      ),
      pool.query<PlayerIdRow>(
        `select distinct pg.player_id::text as player_id
           from guardians g
           join player_guardians pg on pg.guardian_id = g.id
           join players p on p.id = pg.player_id
          where g.user_uid = $1
            and pg.active = true
            and p.archived_at is null
          order by pg.player_id::text`,
        [identity.uid],
      ),
      pool.query<IdRow>(
        `select id::text as id
           from coaches
          where user_uid = $1
          order by id`,
        [identity.uid],
      ),
      pool.query<GroupIdRow>(
        `select distinct cg.group_id::text as group_id
           from coaches c
           join coach_groups cg on cg.coach_id = c.id
          where c.user_uid = $1
            and cg.active = true
          order by cg.group_id::text`,
        [identity.uid],
      ),
      pool.query<PlayerIdRow>(
        `select distinct p.id::text as player_id
           from coaches c
           join coach_groups cg on cg.coach_id = c.id
           join players p on p.group_id = cg.group_id
          where c.user_uid = $1
            and cg.active = true
            and p.archived_at is null
          order by p.id::text`,
        [identity.uid],
      ),
    ]);

    return {
      playerIds: unique(players.rows.map((row) => row.id)),
      guardianIds: unique(guardians.rows.map((row) => row.id)),
      guardianPlayerIds: unique(guardianPlayers.rows.map((row) => row.player_id)),
      coachIds: unique(coaches.rows.map((row) => row.id)),
      coachGroupIds: unique(coachGroups.rows.map((row) => row.group_id)),
      coachPlayerIds: unique(coachPlayers.rows.map((row) => row.player_id)),
    };
  } catch (error) {
    console.error('Portal identity binding lookup failed:', error);
    throw new ApiError(503, 'PORTAL_BINDING_UNAVAILABLE', 'Portal identity binding is temporarily unavailable.');
  }
}

export async function portalWhoAmIHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  assertMethod(req, ['GET']);
  const identity = await requireIdentity(req);
  const bindings = await resolvePortalBindings(identity);

  sendJson(res, 200, {
    ok: true,
    identity: {
      uid: identity.uid,
      provider: identity.provider,
      ...(identity.email ? { email: identity.email } : {}),
    },
    roles: identity.roles,
    scopes: identity.scopes,
    bindings,
  });
}
