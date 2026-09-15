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
    const s = sql.toLowerCase().replace(/\s+/g, ' ');

    if (s.includes('from guardians') && s.includes('where id = $1 and user_uid = $2')) {
      const [guardianId, uid] = params ?? [];
      const rows = guardianId === 'guard-1' && uid === 'u-guardian-1'
        ? [{ id: 'guard-1', full_name: 'Verified Guardian' }]
        : [];
      return { rows: rows as unknown as T[], rowCount: rows.length };
    }

    if (s.includes('from players') && s.includes('where id = any($1)')) {
      const ids = (params?.[0] as string[] | undefined) ?? [];
      const allowed = [
        { id: CHILD_1, full_name: 'Child One', branch_id: 'br-1' },
        { id: CHILD_2, full_name: 'Child Two', branch_id: 'br-1' },
      ].filter((child) => ids.includes(child.id));
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

  // 1. Guardian identity is verified before any child records are exposed.
  const parentData = await repo.getParentPortalData(guardianCtx);
  assert.equal(parentData.parent.id, 'guard-1');
  assert.equal(parentData.parent.fullName, 'Verified Guardian');
  assert.deepEqual(parentData.parent.playerIds.sort(), [CHILD_1, CHILD_2].sort());

  // 2. Guardian retrieves ONLY their linked children.
  const children = await repo.getParentChildren(guardianCtx);
  assert.equal(children.length, 2);
  assert.ok(children.some((child) => child.id === CHILD_1));
  assert.ok(children.some((child) => child.id === CHILD_2));
  assert.ok(!children.some((child) => child.id === STRANGER_CHILD));

  // 3. A forged context with the right guardian id but the wrong verified uid
  // must not receive family data.
  await assert.rejects(
    () => repo.getParentPortalData({ ...guardianCtx, uid: 'u-attacker' }),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 404);
      assert.equal(err.code, 'GUARDIAN_NOT_FOUND');
      return true;
    },
  );

  // 4. Guardian access to a linked child passes.
  const child1Data = await repo.getPlayerData(guardianCtx, CHILD_1);
  assert.equal(child1Data.player.id, CHILD_1);

  // 5. Guardian access to an unlinked stranger child must fail with 403.
  await assert.rejects(
    () => repo.getPlayerData(guardianCtx, STRANGER_CHILD),
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
