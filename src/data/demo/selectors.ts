import { demoPlayers } from './players';
import { metricDefinitions } from './performance';
import { demoSports } from './sports';
import { demoTrainingGroups } from './trainingGroups';

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
