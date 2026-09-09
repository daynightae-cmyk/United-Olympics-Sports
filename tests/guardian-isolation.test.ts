import assert from 'node:assert/strict';
import { PortalDomainRepository } from '../src/server/repositories/portal-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const CHILD_1 = 'f0000000-0000-4000-8000-000000000001';
const CHILD_2 = 'f0000000-0000-4000-8000-000000000002';
const STRANGER_CHILD = 'f0000000-0000-4000-8000-000000000003';

const guardianCtx: AuthorizationContext = {
  uid: 'u-guardian-1',
  provider: 'supabase',
  roles: ['guardian'],
  scopes: ['guardian:*'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: [],
    guardianIds: ['guard-1'],
    guardianPlayerIds: [CHILD_1, CHILD_2],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

class MockGuardianDb implements DbQueryClient {
  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from players') && s.includes('where id = any($1)')) {
      const ids = params?.[0] as string[];
      const allowed = [
        { id: CHILD_1, full_name: 'Child One', branch_id: 'br-1' },
        { id: CHILD_2, full_name: 'Child Two', branch_id: 'br-1' },
      ].filter((c) => ids.includes(c.id));
      return { rows: allowed as unknown as T[], rowCount: allowed.length };
    }
    if (s.includes('from players where id = $1')) {
      const id = params?.[0];
      if (id === CHILD_1 || id === CHILD_2) {
        return { rows: [{ id, full_name: 'Authorized Child', user_uid: null, branch_id: 'br-1', archived_at: null } as unknown as T], rowCount: 1 };
      }
      if (id === STRANGER_CHILD) {
        return { rows: [{ id: STRANGER_CHILD, full_name: 'Stranger Child', user_uid: null, branch_id: 'br-2', archived_at: null } as unknown as T], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runGuardianIsolationTests() {
  console.log('=== RUNNING GUARDIAN ISOLATION TESTS ===');
  const db = new MockGuardianDb();
  const repo = new PortalDomainRepository(db);

  // 1. Guardian retrieves ONLY their linked children
  const children = await repo.getParentChildren(guardianCtx);
  assert.equal(children.length, 2);
  assert.ok(children.some((c) => c.id === CHILD_1));
  assert.ok(children.some((c) => c.id === CHILD_2));
  assert.ok(!children.some((c) => c.id === STRANGER_CHILD));

  // 2. Guardian access to linked child PASS
  const child1Data = await repo.getPlayerData(guardianCtx, CHILD_1);
  assert.equal(child1Data.player.id, CHILD_1);

  // 3. Guardian access to unlinked stranger child MUST FAIL (403)
  await assert.rejects(
    async () => {
      await repo.getPlayerData(guardianCtx, STRANGER_CHILD);
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'UNRELATED_PLAYER_DENIED');
      return true;
    },
  );

  console.log('Guardian isolation tests: PASS');
}

runGuardianIsolationTests().catch((err) => {
  console.error('FATAL: Guardian isolation test failure:', err);
  process.exit(1);
});
