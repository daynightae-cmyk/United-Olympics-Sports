import { previewPayments, previewSubscriptions } from '../../data/demo/adminRecords';
import { demoParents } from '../../data/demo/parents';
import { demoSessions } from '../../data/demo/sessions';
import { getGroup, getLatestPlayerMetrics, getPlayer, getPlayerOverall, getSport } from '../../data/demo/selectors';
import type { AttendanceRecord, Parent, Player, Session } from '../../domain/contracts';

export const PARENT_SESSION_KEY = 'uos:parent-portal:session:v1';

export type ParentPreviewSession = { parentId: string; provider: 'preview'; createdAt: string };

export function readParentSession(): ParentPreviewSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PARENT_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ParentPreviewSession>;
    if (value.provider !== 'preview' || typeof value.parentId !== 'string') return null;
    return { parentId: value.parentId, provider: 'preview', createdAt: value.createdAt ?? '' };
  } catch { return null; }
}

export function startParentPreview(parentId = 'parent-preview-01') {
  const session: ParentPreviewSession = { parentId, provider: 'preview', createdAt: new Date().toISOString() };
  try { localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session)); } catch { /* storage may be unavailable */ }
  return session;
}

export function clearParentSession() {
  try { localStorage.removeItem(PARENT_SESSION_KEY); } catch { /* storage may be unavailable */ }
}

export function getActiveParent(): Parent | undefined {
  const id = readParentSession()?.parentId ?? 'parent-preview-01';
  return demoParents.find((item) => item.id === id);
}

export function getLinkedChildren(parent = getActiveParent()): Player[] {
  if (!parent) return [];
  return parent.playerIds.map((id) => getPlayer(id)).filter((item): item is Player => Boolean(item));
}

export function getFamilySessions(children = getLinkedChildren()): Array<{ session: Session; child: Player }> {
  const groupToChild = new Map(children.filter((child) => child.groupId).map((child) => [child.groupId!, child]));
  return demoSessions
    .filter((session) => groupToChild.has(session.groupId))
    .map((session) => ({ session, child: groupToChild.get(session.groupId)! }))
    .sort((a, b) => new Date(a.session.startsAt).getTime() - new Date(b.session.startsAt).getTime());
}

export function getFamilyPayments(children = getLinkedChildren()) {
  const ids = new Set(children.map((child) => child.id));
  return previewPayments.filter((payment) => ids.has(payment.playerId));
}

export function getFamilySubscriptions(children = getLinkedChildren()) {
  const ids = new Set(children.map((child) => child.id));
  return previewSubscriptions.filter((subscription) => ids.has(subscription.playerId));
}

export function getChildAttendance(child: Player) {
  const records = child.attendanceRecords ?? [];
  const present = records.filter((item) => item.status === 'present').length;
  const late = records.filter((item) => item.status === 'late').length;
  const excused = records.filter((item) => item.status === 'excused').length;
  const absent = records.filter((item) => item.status === 'absent').length;
  const total = records.length;
  const rate = total ? Math.round(((present + late) / total) * 100) : null;
  return { records, present, late, excused, absent, total, rate };
}

export function getFamilyAttendance(children = getLinkedChildren()) {
  const records: Array<AttendanceRecord & { child: Player }> = children.flatMap((child) => (child.attendanceRecords ?? []).map((record) => ({ ...record, child })));
  const present = records.filter((item) => item.status === 'present').length;
  const late = records.filter((item) => item.status === 'late').length;
  const total = records.length;
  const rate = total ? Math.round(((present + late) / total) * 100) : null;
  return { records: records.sort((a, b) => b.date.localeCompare(a.date)), present, late, total, rate };
}

export function getChildPerformance(child: Player) {
  const metrics = getLatestPlayerMetrics(child.id).filter((metric) => typeof metric.current?.value === 'number');
  return { score: metrics.length ? getPlayerOverall(child.id) : null, metrics };
}

export function childLabel(child: Player) { return { en: child.nameEn, ar: child.nameAr }; }
export { getGroup, getPlayerOverall, getSport };
