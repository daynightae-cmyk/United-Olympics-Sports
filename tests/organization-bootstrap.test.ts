import assert from 'node:assert/strict';
import { AdminDomainRepository } from '../src/server/repositories/admin-repository.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

class MockBootstrapDb implements DbQueryClient {
  public organizations: Array<{ id: string; name: string }> = [];
  public roles: Array<{ uid: string; role: string; organization_id: string }> = [];
  public scopes: Array<{ uid: string; scope: string }> = [];

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('from organizations') && s.includes('count(*)')) {
      return { rows: [{ count: String(this.organizations.length) } as unknown as T], rowCount: 1 };
    }
    if (s.startsWith('insert into organizations')) {
      const [id, name] = params as [string, string];
      this.organizations.push({ id, name });
      return { rows: [], rowCount: 1 };
    }
    if (s.startsWith('insert into users')) {
      return { rows: [], rowCount: 1 };
    }
    if (s.startsWith('insert into app_user_roles')) {
      const [uid, role, organization_id] = params as [string, string, string];
      this.roles.push({ uid, role, organization_id });
      return { rows: [], rowCount: 1 };
    }
    if (s.startsWith('insert into app_user_scopes')) {
      const [uid, scope] = params as [string, string];
      this.scopes.push({ uid, scope });
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runBootstrapTests() {
  console.log('=== RUNNING ORGANIZATION BOOTSTRAP TESTS ===');
  const db = new MockBootstrapDb();
  const repo = new AdminDomainRepository(db);
  const identity = { uid: 'supabase:owner-1', provider: 'supabase', email: 'owner@example.com' };

  // 1. First bootstrap creates the organization and binds super_admin
  const org = await repo.bootstrapOrganization(identity, { name: 'United Olympics Sports', nameAr: 'يونايتد أوليمبيكس سبورت' });
  assert.equal(org.name.en, 'United Olympics Sports');
  assert.equal(org.status, 'active');
  assert.equal(db.organizations.length, 1);
  assert.deepEqual(db.roles, [{ uid: identity.uid, role: 'super_admin', organization_id: org.id }]);
  assert.deepEqual(db.scopes, [{ uid: identity.uid, scope: '*' }]);

  // 2. Second bootstrap is permanently closed
  await assert.rejects(
    async () => {
      await repo.bootstrapOrganization({ uid: 'supabase:intruder-9', provider: 'supabase' }, { name: 'Fake Org' });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'BOOTSTRAP_CLOSED');
      return true;
    },
  );
  assert.equal(db.organizations.length, 1);

  // 3. Empty name is rejected (fresh db)
  const emptyDb = new MockBootstrapDb();
  const emptyRepo = new AdminDomainRepository(emptyDb);
  await assert.rejects(
    async () => {
      await emptyRepo.bootstrapOrganization(identity, { name: '   ' });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      assert.equal(err.code, 'VALIDATION_ERROR');
      return true;
    },
  );

  console.log('Organization bootstrap tests: PASS');
}

runBootstrapTests().catch((err) => {
  console.error('FATAL: Organization bootstrap test failure:', err);
  process.exit(1);
});
