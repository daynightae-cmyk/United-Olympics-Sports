import assert from 'node:assert/strict';
import { PortalDomainRepository } from '../src/server/repositories/portal-repository.ts';
import { AdminDomainRepository } from '../src/server/repositories/admin-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const COACH_BRANCH = 'c0000000-0000-4000-8000-000000000001';
const OTHER_BRANCH = 'c0000000-0000-4000-8000-000000000002';
const COACH_GROUP = 'd0000000-0000-4000-8000-000000000001';
const OTHER_GROUP = 'd0000000-0000-4000-8000-000000000002';
const COACH_PLAYER = 'f0000000-0000-4000-8000-000000000001';
const OTHER_PLAYER = 'f0000000-0000-4000-8000-000000000002';

const coachCtx: AuthorizationContext = {
  uid: 'u-coach-1',
  provider: 'supabase',
  roles: ['coach'],
  scopes: ['coach:*'],
  tenant: { organizationIds: ['org-1'], countryIds: ['cnt-1'], branchIds: [COACH_BRANCH] },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-entity-1'],
    coachGroupIds: [COACH_GROUP],
    coachPlayerIds: [COACH_PLAYER],
  },
};

class MockCoachDb implements DbQueryClient {
  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from players where id = $1')) {
      const id = params?.[0];
      if (id === COACH_PLAYER) {
        return { rows: [{ id, branch_id: COACH_BRANCH, archived_at: null } as unknown as T], rowCount: 1 };
      }
      if (id === OTHER_PLAYER) {
        return { rows: [{ id, branch_id: OTHER_BRANCH, archived_at: null } as unknown as T], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (s.includes('insert into performance_evaluations')) {
      return { rows: [{ id: 'pe-1' } as unknown as T], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runCoachIsolationTests() {
  console.log('=== RUNNING COACH ASSIGNMENT ISOLATION TESTS ===');
  const db = new MockCoachDb();
  const portalRepo = new PortalDomainRepository(db);
  const adminRepo = new AdminDomainRepository(db);

  // 1. Coach scope retrieval
  const scope = await portalRepo.getCoachScopeData(coachCtx);
  assert.deepEqual(scope.assignedBranches, [COACH_BRANCH]);
  assert.deepEqual(scope.assignedGroups, [COACH_GROUP]);
  assert.deepEqual(scope.assignedPlayerIds, [COACH_PLAYER]);

  // 2. Performance record for assigned player PASS
  const passEval = await adminRepo.recordPerformance(coachCtx, {
    playerId: COACH_PLAYER,
    metricKey: 'agility',
    score: 88,
  });
  assert.equal(passEval.success, true);

  // 3. Performance record for unassigned player from another branch FAIL (403)
  await assert.rejects(
    async () => {
      await adminRepo.recordPerformance(coachCtx, {
        playerId: OTHER_PLAYER,
        metricKey: 'agility',
        score: 75,
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'UNASSIGNED_COACH_DENIED');
      return true;
    },
  );

  console.log('Coach assignment isolation tests: PASS');
}

runCoachIsolationTests().catch((err) => {
  console.error('FATAL: Coach isolation test failure:', err);
  process.exit(1);
});
