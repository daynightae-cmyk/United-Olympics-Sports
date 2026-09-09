import assert from 'node:assert/strict';
import { PortalDomainRepository } from '../src/server/repositories/portal-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const PLAYER_ID = 'f0000000-0000-4000-8000-000000000001';

const playerCtx: AuthorizationContext = {
  uid: 'u-player-1',
  provider: 'supabase',
  roles: ['player'],
  scopes: ['player:*'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: { playerIds: [PLAYER_ID], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
};

class MockPortalDb implements DbQueryClient {
  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from players where id = $1')) {
      if (params?.[0] === PLAYER_ID) {
        return {
          rows: [{ id: PLAYER_ID, full_name: 'Zaid Rashid', user_uid: 'u-player-1', branch_id: 'br-1', archived_at: null } as unknown as T],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }
    if (s.includes('from sessions s')) {
      return {
        rows: [{ id: 'ses-1', group_id: 'grp-1', starts_at: new Date().toISOString(), status: 'scheduled' } as unknown as T],
        rowCount: 1,
      };
    }
    if (s.includes('from attendance a')) {
      return {
        rows: [{ id: 'att-1', session_id: 'ses-1', status: 'present', created_at: new Date().toISOString() } as unknown as T],
        rowCount: 1,
      };
    }
    if (s.includes('from performance_evaluations pe')) {
      return {
        rows: [{ id: 'pe-1', metric_key: 'stamina', score: 90, notes: 'Great endurance', created_at: new Date().toISOString() } as unknown as T],
        rowCount: 1,
      };
    }
    if (s.includes('from subscriptions s')) {
      return {
        rows: [{ id: 'sub-1', program_id: 'prg-1', status: 'active', currency: 'AED', amount_minor: 15000 } as unknown as T],
        rowCount: 1,
      };
    }
    if (s.includes('from achievements a')) {
      return {
        rows: [{ id: 'ach-1', title: 'Top Swimmer', title_ar: 'سباح متميز', badge: 'gold', category: 'swimming', earned_at: new Date().toISOString() } as unknown as T],
        rowCount: 1,
      };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runPortalDataTests() {
  console.log('=== RUNNING PORTAL PRODUCTION DATA TESTS ===');
  const db = new MockPortalDb();
  const repo = new PortalDomainRepository(db);

  // 1. Authorized Player Portal Fetch
  const data = await repo.getPlayerData(playerCtx, PLAYER_ID);
  assert.equal(data.player.fullName, 'Zaid Rashid');
  assert.equal(data.schedule.length, 1);
  assert.equal(data.attendance.length, 1);
  assert.equal(data.attendance[0].status, 'present');
  assert.equal(data.performance.length, 1);
  assert.equal(data.performance[0].score, 90);
  assert.equal(data.subscriptions.length, 1);
  assert.equal(data.achievements.length, 1);

  // 2. Unrelated Player Access Attempt (must throw 403 ApiError)
  const unrelatedId = 'f0000000-0000-4000-8000-000000000002';
  await assert.rejects(
    async () => {
      await repo.getPlayerData(playerCtx, unrelatedId);
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'UNRELATED_PLAYER_DENIED');
      return true;
    },
  );

  console.log('Portal production data tests: PASS');
}

runPortalDataTests().catch((err) => {
  console.error('FATAL: Portal data test failure:', err);
  process.exit(1);
});
