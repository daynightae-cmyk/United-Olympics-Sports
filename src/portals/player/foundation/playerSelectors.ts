import type { Branch, Coach, CoachFeedback, Parent, Player, Session, TrainingGroup } from '../../../domain/contracts';

export function selectPlayerSessions(player: Player | null, source: Session[] = []): Session[] {
  if (!player?.groupId) return [];
  return source
    .filter((session) => session.groupId === player.groupId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function selectUpcomingSession(sessions: Session[], now = new Date()): Session | null {
  const nowMs = now.getTime();
  return sessions
    .filter((session) => new Date(session.startsAt).getTime() >= nowMs)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] ?? null;
}

export function selectAssignedCoaches(player: Player | null, group?: TrainingGroup, source: Coach[] = []): Coach[] {
  if (!player) return [];
  const ids = new Set([...(player.coachIds ?? []), ...(group?.coachIds ?? [])]);
  return source.filter((coach) => ids.has(coach.id));
}

export function selectPrimaryCoach(player: Player | null, group?: TrainingGroup, source: Coach[] = []): Coach | undefined {
  return selectAssignedCoaches(player, group, source)[0];
}

export function selectPlayerParent(player: Player | null, source: Parent[] = []): Parent | undefined {
  if (!player) return undefined;
  return source.find((parent) => parent.playerIds.includes(player.id));
}

export function selectPlayerBranch(player: Player | null, source: Branch[] = []): Branch | undefined {
  if (!player) return undefined;
  return source.find((branch) => branch.playerIds.includes(player.id));
}

export function selectPlayerFeedback(player: Player | null, source: CoachFeedback[]): CoachFeedback[] {
  if (!player) return [];
  return source
    .filter((feedback) => feedback.playerId === player.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function selectPlayerOverallScore(player: Player | null): number | null {
  if (!player?.performanceHistory?.length) return null;
  const latestByMetric = new Map<string, { value: number; recordedAt: string }>();
  for (const record of player.performanceHistory) {
    if (!Number.isFinite(record.value)) continue;
    const existing = latestByMetric.get(record.metricId);
    if (!existing || new Date(record.recordedAt).getTime() > new Date(existing.recordedAt).getTime()) {
      latestByMetric.set(record.metricId, { value: record.value, recordedAt: record.recordedAt });
    }
  }
  const values = [...latestByMetric.values()].map((record) => record.value);
  if (!values.length) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function selectLatestPerformanceDate(player: Player | null): string | null {
  if (!player?.performanceHistory?.length) return null;
  const sorted = [...player.performanceHistory].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  return sorted[0]?.recordedAt ?? null;
}
