import assert from 'node:assert/strict';
import { executeAttendanceVerticalSlice, type DbQueryClient } from '../src/server/vertical-slice.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';

// Test Fixtures: IDs (RFC 4122 v4 UUIDs)
const ORG_UAE = 'a0000000-0000-4000-8000-000000000001';
const COUNTRY_UAE = 'b0000000-0000-4000-8000-000000000001';
const BRANCH_DUBAI = 'c0000000-0000-4000-8000-000000000001';
const GROUP_SWIMMING_PRO = 'd0000000-0000-4000-8000-000000000001';
const SESSION_1 = 'e0000000-0000-4000-8000-000000000001';
const PLAYER_ACTIVE = 'f0000000-0000-4000-8000-000000000001';
const PLAYER_ARCHIVED = 'f0000000-0000-4000-8000-000000000002';
const PLAYER_CROSS_BRANCH = 'f0000000-0000-4000-8000-000000000003';
const GUARDIAN_UID = 'user-guardian-123';
const PLAYER_UID = 'user-player-123';

// Fixture: Authorized Coach
const coachDubai: AuthorizationContext = {
  uid: 'coach-dubai-01',
  provider: 'supabase',
  email: 'coach.dubai@unitedolympicssports.com',
  roles: ['coach'],
  scopes: ['attendance:write'],
  tenant: {
    organizationIds: [ORG_UAE],
    countryIds: [COUNTRY_UAE],
    branchIds: [BRANCH_DUBAI],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-entity-dubai'],
    coachGroupIds: [GROUP_SWIMMING_PRO],
    coachPlayerIds: [PLAYER_ACTIVE],
  },
};

// Fixture: Egyptian Coach (Unassigned to UAE)
const coachCairo: AuthorizationContext = {
  uid: 'coach-cairo-01',
  provider: 'supabase',
  email: 'coach.cairo@unitedolympicssports.com',
  roles: ['coach'],
  scopes: ['attendance:write'],
  tenant: {
    organizationIds: ['a0000000-0000-4000-8000-000000000002'],
    countryIds: ['b0000000-0000-4000-8000-000000000002'],
    branchIds: ['c0000000-0000-4000-8000-000000000002'],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-entity-cairo'],
    coachGroupIds: ['d0000000-0000-4000-8000-000000000002'],
    coachPlayerIds: [],
  },
};

// Mock Staging Database Client
class MockStagingDb implements DbQueryClient {
  public attendanceRecords = new Map<string, any>();
  public auditRecords: any[] = [];

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();

    // 1. Session lookup
    if (s.includes('from sessions s') && s.includes('where s.id = $1')) {
      const id = params?.[0];
      if (id === SESSION_1) {
        return {
          rows: [
            {
              session_id: SESSION_1,
              group_id: GROUP_SWIMMING_PRO,
              starts_at: '2026-09-10T10:00:00.000Z',
              ends_at: '2026-09-10T11:30:00.000Z',
              session_status: 'scheduled',
              group_name: 'Elite Swim Squad A',
              branch_id: BRANCH_DUBAI,
              branch_name: 'Dubai Al-Wasl Complex',
              country_id: COUNTRY_UAE,
              country_iso: 'AE',
              organization_id: ORG_UAE,
              organization_name: 'United Olympics Sports UAE',
            } as unknown as T,
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }

    // 2. Player lookup
    if (s.includes('from players p') && s.includes('where p.id = $1')) {
      const id = params?.[0];
      if (id === PLAYER_ACTIVE) {
        return {
          rows: [
            {
              player_id: PLAYER_ACTIVE,
              full_name: 'Tariq Mansour',
              user_uid: PLAYER_UID,
              branch_id: BRANCH_DUBAI,
              archived_at: null,
            } as unknown as T,
          ],
          rowCount: 1,
        };
      }
      if (id === PLAYER_ARCHIVED) {
        return {
          rows: [
            {
              player_id: PLAYER_ARCHIVED,
              full_name: 'Former Player',
              user_uid: 'user-archived-999',
              branch_id: BRANCH_DUBAI,
              archived_at: '2025-01-01T00:00:00.000Z',
            } as unknown as T,
          ],
          rowCount: 1,
        };
      }
      if (id === PLAYER_CROSS_BRANCH) {
        return {
          rows: [
            {
              player_id: PLAYER_CROSS_BRANCH,
              full_name: 'Ahmed Cairo',
              user_uid: 'user-cairo-888',
              branch_id: 'c0000000-0000-4000-8000-000000000002', // Cairo branch
              archived_at: null,
            } as unknown as T,
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }

    // 3. Guardians lookup
    if (s.includes('from player_guardians pg')) {
      const id = params?.[0];
      if (id === PLAYER_ACTIVE) {
        return {
          rows: [{ user_uid: GUARDIAN_UID } as unknown as T],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }

    // 4. Attendance upsert
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
      return {
        rows: [record as unknown as T],
        rowCount: 1,
      };
    }

    return { rows: [], rowCount: 0 };
  }
}

async function runVerticalSliceTests() {
  console.log('=== RUNNING PHASE 14: REAL PRODUCTION VERTICAL SLICE TESTS ===\n');

  // Test 1: Complete Valid Vertical Slice
  {
    console.log('Test 1: Authorized coach records valid attendance (full vertical slice)');
    const db = new MockStagingDb();
    const result = await executeAttendanceVerticalSlice(
      coachDubai,
      {
        sessionId: SESSION_1,
        playerId: PLAYER_ACTIVE,
        status: 'present',
        notes: 'Excellent stroke mechanics in 100m freestyle.',
      },
      db,
    );

    assert.equal(result.success, true);
    assert.equal(result.attendance.status, 'present');
    assert.equal(result.attendance.sessionId, SESSION_1);
    assert.equal(result.attendance.playerId, PLAYER_ACTIVE);
    assert.equal(result.attendance.recordedByUid, coachDubai.uid);

    // Tenant binding assertions
    assert.equal(result.tenant.organizationId, ORG_UAE);
    assert.equal(result.tenant.countryId, COUNTRY_UAE);
    assert.equal(result.tenant.branchId, BRANCH_DUBAI);
    assert.equal(result.tenant.groupId, GROUP_SWIMMING_PRO);

    // Audit log assertions
    assert.equal(result.audit.action, 'attendance.record');
    assert.equal(result.audit.actorUid, coachDubai.uid);
    assert.equal(result.audit.organizationId, ORG_UAE);
    assert.equal(result.audit.branchId, BRANCH_DUBAI);

    // Notification event assertions
    assert.equal(result.notification.type, 'attendance.recorded');
    assert.ok(result.notification.recipientUids.includes(PLAYER_UID));
    assert.ok(result.notification.recipientUids.includes(GUARDIAN_UID));
    assert.ok(result.notification.titleAr.includes('تسجيل الحضور'));

    console.log('  -> PASS: Vertical slice executed cleanly with DB, audit, and notification guarantees.');
  }

  // Test 2: Cross-Branch Isolation Rejection
  {
    console.log('Test 2: Cross-branch coach attempt is blocked with 403 ApiError');
    const db = new MockStagingDb();
    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          coachCairo,
          {
            sessionId: SESSION_1,
            playerId: PLAYER_ACTIVE,
            status: 'present',
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 403);
        assert.equal(err.code, 'CROSS_ORGANIZATION_DENIED');
        return true;
      },
    );
    console.log('  -> PASS: Multi-tenant boundary successfully blocked unauthorized cross-tenant write.');
  }

  // Test 3: Unassigned Group / Coach Rejection
  {
    console.log('Test 3: Unassigned coach to group is blocked with 403 ApiError');
    const db = new MockStagingDb();
    const unassignedCoach: AuthorizationContext = {
      ...coachDubai,
      tenant: {
        ...coachDubai.tenant,
        branchIds: [], // Not a branch admin
      },
      bindings: {
        ...coachDubai.bindings,
        coachGroupIds: ['some-other-group'], // Not assigned to GROUP_SWIMMING_PRO
      },
    };

    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          unassignedCoach,
          {
            sessionId: SESSION_1,
            playerId: PLAYER_ACTIVE,
            status: 'present',
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 403);
        assert.equal(err.code, 'UNASSIGNED_COACH_DENIED');
        return true;
      },
    );
    console.log('  -> PASS: Coach not assigned to group correctly denied attendance write.');
  }

  // Test 4: Archived Player Rejection
  {
    console.log('Test 4: Attempting to mark attendance for archived player is blocked with 400 ApiError');
    const db = new MockStagingDb();
    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          coachDubai,
          {
            sessionId: SESSION_1,
            playerId: PLAYER_ARCHIVED,
            status: 'absent',
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 400);
        assert.equal(err.code, 'PLAYER_ARCHIVED');
        return true;
      },
    );
    console.log('  -> PASS: Archived player write safely rejected.');
  }

  // Test 5: Cross-Branch Player Mismatch Rejection
  {
    console.log('Test 5: Cross-branch player mismatch is blocked with 403 ApiError');
    const db = new MockStagingDb();
    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          coachDubai,
          {
            sessionId: SESSION_1,
            playerId: PLAYER_CROSS_BRANCH,
            status: 'present',
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 403);
        assert.equal(err.code, 'CROSS_BRANCH_DENIED');
        return true;
      },
    );
    console.log('  -> PASS: Cross-branch player mismatch successfully prevented.');
  }

  // Test 6: Non-Existent Session Rejection
  {
    console.log('Test 6: Non-existent session returns 404 ApiError');
    const db = new MockStagingDb();
    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          coachDubai,
          {
            sessionId: '99999999-9999-4999-8999-999999999999',
            playerId: PLAYER_ACTIVE,
            status: 'present',
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.code, 'SESSION_NOT_FOUND');
        return true;
      },
    );
    console.log('  -> PASS: Missing session returns 404.');
  }

  // Test 7: Invalid Status Rejection
  {
    console.log('Test 7: Invalid status returns 400 ApiError');
    const db = new MockStagingDb();
    await assert.rejects(
      async () => {
        await executeAttendanceVerticalSlice(
          coachDubai,
          {
            sessionId: SESSION_1,
            playerId: PLAYER_ACTIVE,
            status: 'invalid-status' as any,
          },
          db,
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.status, 400);
        assert.equal(err.code, 'VALIDATION_ERROR');
        return true;
      },
    );
    console.log('  -> PASS: Invalid status validation checked.');
  }

  console.log('\n>>> ALL PHASE 14 VERTICAL SLICE TESTS PASSED SUCCESSFULLY! <<<\n');
}

runVerticalSliceTests().catch((err) => {
  console.error('FATAL: Vertical slice test failure:', err);
  process.exit(1);
});
