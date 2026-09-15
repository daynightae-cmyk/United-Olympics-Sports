import { getAccessToken } from './auth-client';
import { fetchWithRuntimeTimeout } from './runtime-timeout';

const PORTAL_DATA_TIMEOUT_MS = 10_000;

export type PortalMessageSnapshot = { id: string; fromId: string; toIds: string[]; content: string; sentAt: string; readAt: string | null };

export type PlayerPortalSnapshot = {
  player: {
    id: string;
    fullName: string;
    userUid: string | null;
    branchId: string | null;
  };
  relations: {
    branch: { id: string; name: string; nameAr: string | null } | null;
    group: { id: string; name: string; status: string } | null;
    program: { id: string; name: string; nameAr: string | null; status: string } | null;
    sport: { id: string; name: string; nameAr: string | null; status: string } | null;
    coaches: Array<{ id: string; fullName: string; branchId: string | null }>;
  };
  schedule: Array<{ id: string; groupId: string; startsAt: string; status: string }>;
  attendance: Array<{ id: string; sessionId: string; status: string; date: string }>;
  performance: Array<{ id: string; metricKey: string; score: number | null; notes: string | null; date: string }>;
  subscriptions: Array<{ id: string; programId: string; status: string; currency: string | null; amountMinor: number | null }>;
  payments: Array<{
    id: string;
    subscriptionId: string | null;
    status: string;
    currency: string | null;
    amountMinor: number | null;
    provider: string | null;
    reference: string | null;
    createdAt: string;
  }>;
  achievements: Array<{ id: string; title: string; titleAr: string | null; badge: string | null; category: string; earnedAt: string }>;
  documents: Array<{ id: string; mimeType: string | null; status: string; createdAt: string }>;
  notifications: Array<{ id: string; title: string; titleAr: string | null; body: string; bodyAr: string | null; status: string; createdAt: string }>;
  messages: PortalMessageSnapshot[];
};

export type ParentChildSummary = { id: string; fullName: string; branchId: string | null };
export type ParentPortalSnapshot = {
  parent: { id: string; fullName: string; playerIds: string[] };
  children: ParentChildSummary[];
  messages: PortalMessageSnapshot[];
};

export type CoachPortalScopeSnapshot = {
  coach: { id: string; fullName: string; branchId: string | null };
  assignedBranches: string[];
  assignedGroups: string[];
  assignedPlayerIds: string[];
  groups: Array<{ id: string; branchId: string; programId: string; sportId: string; name: string; status: string }>;
  players: Array<{
    id: string;
    fullName: string;
    branchId: string | null;
    groupId: string | null;
    programId: string | null;
    sportId: string | null;
    attendanceRate: number;
    performanceScore: number | null;
  }>;
  sessions: Array<{ id: string; groupId: string; sportId: string; startsAt: string; status: string }>;
  programs: Array<{ id: string; sportId: string; name: string; nameAr: string | null; status: string }>;
  sports: Array<{ id: string; name: string; nameAr: string | null; status: string }>;
  parents: Array<{ id: string; fullName: string; playerIds: string[] }>;
  messages: PortalMessageSnapshot[];
  branches: Array<{ id: string; countryId: string; organizationId: string; name: string; nameAr: string | null; status: string }>;
};

async function portalGet<T>(route: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('AUTH_REQUIRED');
  const response = await fetchWithRuntimeTimeout(`/api?route=${encodeURIComponent(route)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  }, PORTAL_DATA_TIMEOUT_MS);
  const payload = await response.json().catch(() => null) as (T & { ok?: boolean }) | { error?: { code?: string; message?: string } } | null;
  if (!response.ok || !payload || ('error' in payload && payload.error)) {
    const code = payload && 'error' in payload ? payload.error?.code : undefined;
    throw new Error(code || `PORTAL_DATA_${response.status}`);
  }
  return payload as T;
}

export async function fetchPlayerPortalSnapshot(playerId?: string): Promise<PlayerPortalSnapshot> {
  const token = await getAccessToken();
  if (!token) throw new Error('AUTH_REQUIRED');
  const suffix = playerId ? `&playerId=${encodeURIComponent(playerId)}` : '';
  const response = await fetchWithRuntimeTimeout(`/api?route=portal-player-data${suffix}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  }, PORTAL_DATA_TIMEOUT_MS);
  const payload = await response.json().catch(() => null) as (PlayerPortalSnapshot & { ok?: boolean }) | { error?: { code?: string } } | null;
  if (!response.ok || !payload || !('player' in payload)) {
    const code = payload && 'error' in payload ? payload.error?.code : undefined;
    throw new Error(code || 'PLAYER_PORTAL_DATA_FAILED');
  }
  return payload;
}

export async function fetchParentPortalSnapshot(): Promise<ParentPortalSnapshot> {
  const payload = await portalGet<ParentPortalSnapshot>('portal-parent-children');
  return {
    parent: payload.parent,
    children: Array.isArray(payload.children) ? payload.children : [],
    messages: Array.isArray(payload.messages) ? payload.messages : [],
  };
}

export async function fetchParentChildren(): Promise<ParentChildSummary[]> {
  return (await fetchParentPortalSnapshot()).children;
}

export async function fetchCoachPortalScope(): Promise<CoachPortalScopeSnapshot> {
  const payload = await portalGet<CoachPortalScopeSnapshot>('portal-coach-scope');
  return {
    coach: payload.coach,
    assignedBranches: Array.isArray(payload.assignedBranches) ? payload.assignedBranches : [],
    assignedGroups: Array.isArray(payload.assignedGroups) ? payload.assignedGroups : [],
    assignedPlayerIds: Array.isArray(payload.assignedPlayerIds) ? payload.assignedPlayerIds : [],
    groups: Array.isArray(payload.groups) ? payload.groups : [],
    players: Array.isArray(payload.players) ? payload.players : [],
    sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
    programs: Array.isArray(payload.programs) ? payload.programs : [],
    sports: Array.isArray(payload.sports) ? payload.sports : [],
    parents: Array.isArray(payload.parents) ? payload.parents : [],
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    branches: Array.isArray(payload.branches) ? payload.branches : [],
  };
}