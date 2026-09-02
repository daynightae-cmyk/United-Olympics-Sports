import { demoPlayers } from './players';
import { metricDefinitions } from './performance';
import { demoSports } from './sports';
import { demoTrainingGroups } from './trainingGroups';

export const DEFAULT_PLAYER_PREVIEW_ID = 'player-demo-001';

export const getSport = (sportId?: string) => demoSports.find(sport => sport.id === sportId);
export const getGroup = (groupId?: string) => demoTrainingGroups.find(group => group.id === groupId);
export const getPlayer = (playerId?: string) => demoPlayers.find(player => player.id === playerId);
export const getSportGroups = (sportId: string) => demoTrainingGroups.filter(group => group.sportId === sportId);
export const getSportPlayers = (sportId: string) => demoPlayers.filter(player => player.sportId === sportId);
export const getGroupPlayers = (groupId: string) => demoPlayers.filter(player => player.groupId === groupId);
export const getSportMetrics = (sportId: string) => metricDefinitions.filter(metric => metric.sportId === sportId);

export const getLatestPlayerMetrics = (playerId: string) => {
  const player = getPlayer(playerId);
  if (!player) return [];
  return getSportMetrics(player.sportId).map(definition => {
    const records = player.performanceHistory.filter(record => record.metricId === definition.id).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    return { definition, current: records.at(-1), previous: records.at(-2) };
  });
};

export const getPlayerOverall = (playerId: string) => {
  const metrics = getLatestPlayerMetrics(playerId).map(item => item.current?.value).filter((value): value is number => typeof value === 'number');
  return metrics.length ? Math.round(metrics.reduce((sum, value) => sum + value, 0) / metrics.length) : 0;
};

export const getPlayerPreviousOverall = (playerId: string) => {
  const metrics = getLatestPlayerMetrics(playerId).map(item => item.previous?.value).filter((value): value is number => typeof value === 'number');
  return metrics.length ? Math.round(metrics.reduce((sum, value) => sum + value, 0) / metrics.length) : 0;
};

export const getPlayerAttendanceStats = (playerId: string) => {
  const player = getPlayer(playerId);
  const records = player?.attendanceRecords ?? [];
  const present = records.filter(record => record.status === 'present').length;
  const late = records.filter(record => record.status === 'late').length;
  const absent = records.filter(record => record.status === 'absent').length;
  const excused = records.filter(record => record.status === 'excused').length;
  const attended = present + late;
  const scheduled = records.length;
  return { present, late, absent, excused, attended, scheduled, rate: scheduled ? Math.round((attended / scheduled) * 100) : 0 };
};

export const getLatestPlayerFeedback = (playerId: string) => {
  const player = getPlayer(playerId);
  return player?.coachFeedback.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
};

export const getPlayerProgressSummary = (playerId: string) => {
  const metrics = getLatestPlayerMetrics(playerId);
  const ranked = metrics.slice().sort((a, b) => (b.current?.value ?? -1) - (a.current?.value ?? -1));
  const latestDate = metrics.map(item => item.current?.recordedAt).filter((value): value is string => Boolean(value)).sort().at(-1);
  const improvingCount = metrics.filter(item => typeof item.current?.value === 'number' && typeof item.previous?.value === 'number' && item.current.value > item.previous.value).length;
  const overall = getPlayerOverall(playerId);
  const previousOverall = getPlayerPreviousOverall(playerId);
  return {
    overall,
    previousOverall,
    delta: overall - previousOverall,
    latestDate,
    improvingCount,
    metricCount: metrics.length,
    strongest: ranked.find(item => item.current),
    focusNext: ranked.slice().reverse().find(item => item.current),
  };
};
