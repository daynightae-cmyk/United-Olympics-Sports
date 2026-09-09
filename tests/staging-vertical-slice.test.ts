import assert from 'node:assert/strict';
import { dispatchRoute } from '../src/server/routes.ts';
import { executeAttendanceVerticalSlice, type DbQueryClient } from '../src/server/vertical-slice.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import type { ApiRequest, ApiResponse } from '../src/server/http.ts';

const ORG_ID = 'a0000000-0000-4000-8000-000000000001';
const COUNTRY_ID = 'b0000000-0000-4000-8000-000000000001';
const BRANCH_ID = 'c0000000-0000-4000-8000-000000000001';
const GROUP_ID = 'd0000000-0000-4000-8000-000000000001';
const SESSION_ID = 'e0000000-0000-4000-8000-000000000001';
const PLAYER_ID = 'f0000000-0000-4000-8000-000000000001';

const coachCtx: AuthorizationContext = {
  uid: 'coach-staging-1',
  provider: 'supabase',
  email: 'coach@unitedolympicssports.com',
  roles: ['coach'],
  scopes: ['attendance:write'],
  tenant: {
    organizationIds: [ORG_ID],
    countryIds: [COUNTRY_ID],
    branchIds: [BRANCH_ID],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-entity-1'],
    coachGroupIds: [GROUP_ID],
    coachPlayerIds: [PLAYER_ID],
  },
};

class StagingDbClient implements DbQueryClient {
  public attendanceRecords = new Map<string, any>();

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();

    if (s.includes('from sessions s') && s.includes('where s.id = $1')) {
      return {
        rows: [
          {
            session_id: SESSION_ID,
            group_id: GROUP_ID,
            starts_at: '2026-09-15T14:00:00Z',
            ends_at: '2026-09-15T15:30:00Z',
            session_status: 'scheduled',
            group_name: 'Staging Elite Squad',
            branch_id: BRANCH_ID,
            branch_name: 'Dubai Olympic Center',
            country_id: COUNTRY_ID,
            country_iso: 'AE',
            organization_id: ORG_ID,
            organization_name: 'United Olympics Sports',
          } as unknown as T,
        ],
        rowCount: 1,
      };
    }
    if (s.includes('from players p') && s.includes('where p.id = $1')) {
      return {
        rows: [
          {
            player_id: PLAYER_ID,
            full_name: 'Karim Mansour',
            user_uid: 'u-player-karim',
            branch_id: BRANCH_ID,
            archived_at: null,
          } as unknown as T,
        ],
        rowCount: 1,
      };
    }
    if (s.includes('from player_guardians pg')) {
      return {
        rows: [{ user_uid: 'u-guardian-karim' } as unknown as T],
        rowCount: 1,
      };
    }
    if (s.includes('insert into attendance')) {
      const [id, sessionId, playerId, status, recordedBy] = params as [string, string, string, string, string];
      const record = {
        id,
        session_id: sessionId,
        player_id: playerId,
        status,
        recorded_by_uid: recordedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.attendanceRecords.set(`${sessionId}:${playerId}`, record);
      return { rows: [record as unknown as T], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
}

class MockApiResponse implements ApiResponse {
  statusCode = 200;
  headers = new Map<string, string>();
  body?: string;

  setHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }
  end(body?: string): void {
    this.body = body;
  }
}

async function runStagingVerticalSliceTest() {
  console.log('=== RUNNING STAGING VERTICAL SLICE INTEGRATION TEST ===');

  const db = new StagingDbClient();

  // 1. Execute full attendance slice
  const result = await executeAttendanceVerticalSlice(
    coachCtx,
    {
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
      status: 'present',
      notes: 'Excellent performance in staging verification run.',
    },
    db,
  );

  assert.equal(result.success, true);
  assert.equal(result.attendance.status, 'present');
  assert.equal(result.tenant.branchId, BRANCH_ID);
  assert.equal(result.audit.action, 'attendance.record');
  assert.equal(result.notification.type, 'attendance.recorded');

  // 2. Dispatch query through API route
  const req: ApiRequest = {
    method: 'GET',
    url: '/api/v1/health',
    headers: {},
  };
  const res = new MockApiResponse();
  await dispatchRoute('health', req, res);
  assert.equal(res.statusCode, 200);

  console.log('Staging vertical slice integration test: PASS');
}

runStagingVerticalSliceTest().catch((err) => {
  console.error('FATAL: Staging vertical slice test failure:', err);
  process.exit(1);
});
