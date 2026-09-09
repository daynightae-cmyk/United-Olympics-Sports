import assert from 'node:assert/strict';
import { AdminDomainRepository } from '../src/server/repositories/admin-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const superAdminCtx: AuthorizationContext = {
  uid: 'admin-1',
  provider: 'supabase',
  roles: ['super_admin'],
  scopes: ['*'],
  tenant: { organizationIds: ['org-1'], countryIds: ['cnt-1'], branchIds: ['br-1'] },
  bindings: { playerIds: [], guardianIds: [], guardianPlayerIds: [], coachIds: ['coach-1'], coachGroupIds: ['grp-1'], coachPlayerIds: ['f0000000-0000-4000-8000-000000000001'] },
};

class MockAdminDb implements DbQueryClient {
  public countries: any[] = [{ id: 'cnt-1', name: 'UAE', name_ar: 'الإمارات', iso_code: 'AE', organization_id: 'org-1', status: 'active' }];
  public branches: any[] = [{ id: 'br-1', name: 'Dubai Branch', name_ar: 'فرع دبي', country_id: 'cnt-1', organization_id: 'org-1', status: 'active' }];
  public sports: any[] = [{ id: 'sp-1', code: 'SWM', name: 'Swimming', name_ar: 'السباحة', status: 'active' }];
  public players: any[] = [{ id: 'f0000000-0000-4000-8000-000000000001', full_name: 'Omar Ali', branch_id: 'br-1', user_uid: 'u-1', archived_at: null }];
  public evaluations: any[] = [];

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();

    if (s.includes('select id, name, name_ar, status from organizations')) {
      return { rows: [{ id: 'org-1', name: 'United Olympics Sports', name_ar: 'يونايتد أوليمبيكس سبورت', status: 'active' } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from countries where organization_id')) {
      return { rows: [{ count: '1' } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from countries') && s.includes('count(*)')) {
      return { rows: [{ count: String(this.countries.length) } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from countries') && !s.includes('count(*)')) {
      return { rows: this.countries as unknown as T[], rowCount: this.countries.length };
    }
    if (s.includes('insert into countries')) {
      const [id, orgId, code, nameEn, nameAr] = params as [string, string, string, string, string];
      const row = { id, organization_id: orgId, iso_code: code, name: nameEn, name_ar: nameAr, status: 'active' };
      this.countries.push(row);
      return { rows: [row as unknown as T], rowCount: 1 };
    }
    if (s.includes('from branches') && s.includes('count(*)')) {
      return { rows: [{ count: String(this.branches.length) } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from branches') && !s.includes('count(*)')) {
      return { rows: this.branches as unknown as T[], rowCount: this.branches.length };
    }
    if (s.includes('from sports') && s.includes('count(*)')) {
      return { rows: [{ count: String(this.sports.length) } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from sports') && !s.includes('count(*)')) {
      return { rows: this.sports as unknown as T[], rowCount: this.sports.length };
    }
    if (s.includes('from players') && s.includes('where id = $1')) {
      const p = this.players.find((pl) => pl.id === params?.[0]);
      return { rows: p ? [p as unknown as T] : [], rowCount: p ? 1 : 0 };
    }
    if (s.includes('from players') && s.includes('count(*)')) {
      return { rows: [{ count: String(this.players.length) } as unknown as T], rowCount: 1 };
    }
    if (s.includes('from players') && !s.includes('count(*)')) {
      return { rows: this.players as unknown as T[], rowCount: this.players.length };
    }
    if (s.includes('insert into performance_evaluations')) {
      const [id, playerId, sessionId, coachId, metricKey, score, notes] = params as any[];
      const ev = { id, playerId, sessionId, coachId, metricKey, score, notes };
      this.evaluations.push(ev);
      return { rows: [ev as unknown as T], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runAdminDomainTests() {
  console.log('=== RUNNING ADMIN CORE DOMAIN PRODUCTION TESTS ===');
  const db = new MockAdminDb();
  const repo = new AdminDomainRepository(db);

  // 1. Organization
  const org = await repo.getOrganization(superAdminCtx);
  assert.ok(org);
  assert.equal(org.name.en, 'United Olympics Sports');

  // 2. Countries list & create
  const countries = await repo.listCountries(superAdminCtx);
  assert.equal(countries.items.length, 1);
  assert.equal(countries.items[0].code, 'AE');

  const createdCountry = await repo.createCountry(superAdminCtx, {
    name: { en: 'Saudi Arabia', ar: 'السعودية' },
    code: 'SA',
    organizationId: 'org-1',
  });
  assert.equal(createdCountry.message, 'Country created successfully');
  assert.equal(createdCountry.item.code, 'SA');

  // 3. Branches
  const branches = await repo.listBranches(superAdminCtx);
  assert.equal(branches.items.length, 1);
  assert.equal(branches.items[0].name.en, 'Dubai Branch');

  // 4. Sports
  const sports = await repo.listSports(superAdminCtx);
  assert.equal(sports.items.length, 1);
  assert.equal(sports.items[0].name.en, 'Swimming');

  // 5. Performance evaluation (valid bounds)
  const validEval = await repo.recordPerformance(superAdminCtx, {
    playerId: 'f0000000-0000-4000-8000-000000000001',
    metricKey: 'speed_100m',
    score: 85,
    notes: 'Outstanding sprint.',
  });
  assert.equal(validEval.success, true);

  // 6. Performance evaluation (invalid score > 100 rejection)
  await assert.rejects(
    async () => {
      await repo.recordPerformance(superAdminCtx, {
        playerId: 'f0000000-0000-4000-8000-000000000001',
        metricKey: 'speed_100m',
        score: 150,
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 400);
      assert.equal(err.code, 'VALIDATION_ERROR');
      return true;
    },
  );

  console.log('Admin core domain production tests: PASS');
}

runAdminDomainTests().catch((err) => {
  console.error('FATAL: Admin domain test failure:', err);
  process.exit(1);
});
