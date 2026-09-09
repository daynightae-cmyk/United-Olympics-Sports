import { randomUUID } from 'node:crypto';
import { databaseConfigured, getPool } from '../db/index.ts';
import { ApiError, isUuid, normalizeString } from './http.ts';
import {
  type AuthorizationContext,
  assertCanAccessBranch,
  assertCanAccessCountry,
  assertCanAccessOrganization,
  assertCanRecordAttendance,
} from './authorization-context.ts';
import { recordAudit, type AuditLogEntry } from './audit.ts';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface RecordAttendanceInput {
  sessionId: string;
  playerId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceNotificationEvent {
  id: string;
  type: 'attendance.recorded';
  channel: 'in_app' | 'push';
  recipientUids: string[];
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  payload: Record<string, unknown>;
  dispatchedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  playerId: string;
  status: AttendanceStatus;
  recordedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSliceResult {
  success: boolean;
  attendance: AttendanceRecord;
  tenant: {
    organizationId: string;
    countryId: string;
    branchId: string;
    groupId: string;
  };
  audit: AuditLogEntry;
  notification: AttendanceNotificationEvent;
}

export interface DbQueryClient {
  query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }>;
}

const VALID_STATUSES = new Set<AttendanceStatus>(['present', 'absent', 'late', 'excused']);

/**
 * Executes the complete real production vertical slice:
 * Authenticated User -> Organization/Branch Binding -> Linked Player -> Group/Session -> Attendance Write -> Audit Log -> Notification Event
 */
export async function executeAttendanceVerticalSlice(
  ctx: AuthorizationContext,
  input: RecordAttendanceInput,
  clientOverride?: DbQueryClient,
): Promise<AttendanceSliceResult> {
  // Step 1: Input Validation
  const sessionId = normalizeString(input.sessionId, 64);
  const playerId = normalizeString(input.playerId, 64);
  const status = input.status;

  if (!sessionId || !isUuid(sessionId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid UUID sessionId is required.');
  }
  if (!playerId || !isUuid(playerId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid UUID playerId is required.');
  }
  if (!VALID_STATUSES.has(status)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Invalid attendance status '${status}'. Must be one of: present, absent, late, excused.`);
  }

  // Resolve DB Client
  let db: DbQueryClient;
  if (clientOverride) {
    db = clientOverride;
  } else if (databaseConfigured()) {
    db = getPool();
  } else {
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'Production database is not configured for attendance persistence.');
  }

  // Step 2: Fetch session, group, branch, country, organization hierarchy
  const sessionResult = await db.query<{
    session_id: string;
    group_id: string;
    starts_at: string | Date;
    ends_at: string | Date | null;
    session_status: string;
    group_name: string;
    branch_id: string;
    branch_name: string;
    country_id: string;
    country_iso: string;
    organization_id: string;
    organization_name: string;
  }>(
    `select
       s.id as session_id,
       s.group_id,
       s.starts_at,
       s.ends_at,
       s.status as session_status,
       g.name as group_name,
       g.branch_id,
       b.name as branch_name,
       b.country_id,
       c.iso_code as country_iso,
       c.organization_id,
       o.name as organization_name
     from sessions s
     join groups g on s.group_id = g.id
     join branches b on g.branch_id = b.id
     join countries c on b.country_id = c.id
     join organizations o on c.organization_id = o.id
     where s.id = $1`,
    [sessionId],
  );

  if (!sessionResult.rows.length) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', `Session '${sessionId}' was not found.`);
  }

  const sessionRow = sessionResult.rows[0];

  // Step 3: Multi-Tenant & RBAC Domain Isolation Assertions
  assertCanAccessOrganization(ctx, sessionRow.organization_id);
  assertCanAccessCountry(ctx, sessionRow.country_id, sessionRow.organization_id);
  assertCanAccessBranch(ctx, sessionRow.branch_id, sessionRow.country_id, sessionRow.organization_id);
  assertCanRecordAttendance(ctx, sessionRow.group_id, sessionRow.branch_id);

  // Step 4: Fetch and verify linked player
  const playerResult = await db.query<{
    player_id: string;
    full_name: string;
    user_uid: string | null;
    branch_id: string | null;
    archived_at: string | Date | null;
  }>(
    `select
       p.id as player_id,
       p.full_name,
       p.user_uid,
       p.branch_id,
       p.archived_at
     from players p
     where p.id = $1`,
    [playerId],
  );

  if (!playerResult.rows.length) {
    throw new ApiError(404, 'PLAYER_NOT_FOUND', `Player '${playerId}' was not found.`);
  }

  const playerRow = playerResult.rows[0];

  if (playerRow.archived_at) {
    throw new ApiError(400, 'PLAYER_ARCHIVED', `Player '${playerRow.full_name}' is archived. Attendance cannot be recorded.`);
  }

  if (playerRow.branch_id && playerRow.branch_id !== sessionRow.branch_id) {
    throw new ApiError(403, 'CROSS_BRANCH_DENIED', `Player '${playerRow.full_name}' is registered under a different branch.`);
  }

  // Step 5: Fetch guardian linkages for notification dispatch
  const guardianResult = await db.query<{ user_uid: string }>(
    `select g.user_uid
     from player_guardians pg
     join guardians g on pg.guardian_id = g.id
     where pg.player_id = $1
       and pg.active = true
       and g.user_uid is not null`,
    [playerId],
  );

  const recipientUids = Array.from(
    new Set(
      [playerRow.user_uid, ...guardianResult.rows.map((r) => r.user_uid)].filter(
        (uid): uid is string => typeof uid === 'string' && uid.trim().length > 0,
      ),
    ),
  );

  // Step 6: Attendance Write (upsert on unique session_id, player_id)
  const attendanceId = randomUUID();
  const upsertResult = await db.query<{
    id: string;
    session_id: string;
    player_id: string;
    status: AttendanceStatus;
    recorded_by_uid: string;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `insert into attendance (id, session_id, player_id, status, recorded_by_uid, created_at, updated_at)
     values ($1, $2, $3, $4, $5, now(), now())
     on conflict (session_id, player_id)
     do update set
       status = excluded.status,
       recorded_by_uid = excluded.recorded_by_uid,
       updated_at = now()
     returning id, session_id, player_id, status, recorded_by_uid, created_at, updated_at`,
    [attendanceId, sessionId, playerId, status, ctx.uid],
  );

  const savedAttendance = upsertResult.rows[0];
  const attendanceRecord: AttendanceRecord = {
    id: savedAttendance.id,
    sessionId: savedAttendance.session_id,
    playerId: savedAttendance.player_id,
    status: savedAttendance.status,
    recordedByUid: savedAttendance.recorded_by_uid,
    createdAt: new Date(savedAttendance.created_at).toISOString(),
    updatedAt: new Date(savedAttendance.updated_at).toISOString(),
  };

  // Step 7: Structured Audit Log
  const audit = await recordAudit(ctx, {
    action: 'attendance.record',
    entityType: 'attendance',
    entityId: attendanceRecord.id,
    organizationId: sessionRow.organization_id,
    countryId: sessionRow.country_id,
    branchId: sessionRow.branch_id,
    metadata: {
      sessionId,
      playerId,
      status,
      notes: input.notes,
      groupName: sessionRow.group_name,
      branchName: sessionRow.branch_name,
      recordedByUid: ctx.uid,
    },
  });

  // Step 8: Notification Event Construction
  const notification: AttendanceNotificationEvent = {
    id: randomUUID(),
    type: 'attendance.recorded',
    channel: 'in_app',
    recipientUids,
    title: 'Attendance Recorded',
    titleAr: 'تسجيل الحضور',
    body: `Attendance for ${playerRow.full_name} was recorded as '${status}'.`,
    bodyAr: `تم تسجيل حالة الحضور لـ ${playerRow.full_name}: ${status}.`,
    payload: {
      attendanceId: attendanceRecord.id,
      sessionId,
      playerId,
      status,
      groupName: sessionRow.group_name,
      branchId: sessionRow.branch_id,
      organizationId: sessionRow.organization_id,
      recordedByUid: ctx.uid,
    },
    dispatchedAt: new Date().toISOString(),
  };

  return {
    success: true,
    attendance: attendanceRecord,
    tenant: {
      organizationId: sessionRow.organization_id,
      countryId: sessionRow.country_id,
      branchId: sessionRow.branch_id,
      groupId: sessionRow.group_id,
    },
    audit,
    notification,
  };
}
