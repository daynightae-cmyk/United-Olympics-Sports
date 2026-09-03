import type { Coach, CoachFeedback, Parent, Player, Session, TrainingGroup } from '../../../domain/contracts';
import { demoBranches } from '../../../data/demo/business';
import { demoCoaches } from '../../../data/demo/coaches';
import { demoParents } from '../../../data/demo/parents';
import { demoSessions } from '../../../data/demo/sessions';
import { getLatestPlayerMetrics } from '../../../data/demo/selectors';

export function selectPlayerSessions(player: Player | null): Session[] {
  if (!player?.groupId) return [];
  return demoSessions
    .filter((session) => session.groupId === player.groupId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function selectUpcomingSession(sessions: Session[], now = new Date()): Session | null {
  const nowMs = now.getTime();
  return sessions
    .filter((session) => new Date(session.startsAt).getTime() >= nowMs)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] ?? null;
}

export function selectAssignedCoaches(player: Player | null, group?: TrainingGroup): Coach[] {
  if (!player) return [];
  const ids = new Set([...(player.coachIds ?? []), ...(group?.coachIds ?? [])]);
  return demoCoaches.filter((coach) => ids.has(coach.id));
}

export function selectPrimaryCoach(player: Player | null, group?: TrainingGroup): Coach | undefined {
  return selectAssignedCoaches(player, group)[0];
}

export function selectPlayerParent(player: Player | null): Parent | undefined {
  if (!player) return undefined;
  return demoParents.find((parent) => parent.playerIds.includes(player.id));
}

export function selectPlayerBranch(player: Player | null) {
  if (!player) return undefined;
  return demoBranches.find((branch) => branch.playerIds.includes(player.id));
}

export function selectPlayerFeedback(player: Player | null, source: CoachFeedback[]): CoachFeedback[] {
  if (!player) return [];
  return source
    .filter((feedback) => feedback.playerId === player.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function selectPlayerOverallScore(player: Player | null): number | null {
  if (!player) return null;
  const values = getLatestPlayerMetrics(player.id)
    .map((metric) => metric.current?.value)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
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
