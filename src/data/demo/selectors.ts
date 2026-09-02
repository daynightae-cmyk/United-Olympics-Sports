import { demoBranches, demoCountries, demoOrganization } from './business';
import { demoCoaches } from './coaches';
import { demoParents } from './parents';
import { demoPlayers } from './players';
import { demoSessions } from './sessions';
import { metricDefinitions } from './performance';
import { demoPrograms } from './programs';
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

/* ── Business entity selectors ── */
export const getOrganization = () => demoOrganization;
export const getCountry = (countryId?: string) => demoCountries.find(country => country.id === countryId);
export const getBranch = (branchId?: string) => demoBranches.find(branch => branch.id === branchId);
export const getCoach = (coachId?: string) => demoCoaches.find(coach => coach.id === coachId);
export const getParent = (parentId?: string) => demoParents.find(parent => parent.id === parentId);
export const getProgram = (programId?: string) => demoPrograms.find(program => program.id === programId);

export const getCountryBranches = (countryId: string) => demoBranches.filter(branch => branch.countryId === countryId);
export const getBranchSports = (branchId: string) => {
  const branch = getBranch(branchId);
  if (!branch) return [];
  return demoSports.filter(sport => branch.sportIds.includes(sport.id));
};
export const getBranchPrograms = (branchId: string) => {
  const branch = getBranch(branchId);
  if (!branch) return [];
  return demoPrograms.filter(program => branch.programIds.includes(program.id));
};
export const getBranchGroups = (branchId: string) => {
  const branch = getBranch(branchId);
  if (!branch) return [];
  return demoTrainingGroups.filter(group => branch.groupIds.includes(group.id));
};
export const getBranchCoaches = (branchId: string) => {
  const branch = getBranch(branchId);
  if (!branch) return [];
  return demoCoaches.filter(coach => branch.coachIds.includes(coach.id));
};
export const getBranchPlayers = (branchId: string) => {
  const branch = getBranch(branchId);
  if (!branch) return [];
  return demoPlayers.filter(player => branch.playerIds.includes(player.id));
};

export const getCoachGroups = (coachId: string) => {
  const coach = getCoach(coachId);
  if (!coach) return [];
  return demoTrainingGroups.filter(group => coach.groupIds.includes(group.id));
};
export const getCoachBranches = (coachId: string) => {
  const coach = getCoach(coachId);
  if (!coach) return [];
  return demoBranches.filter(branch => coach.branchIds.includes(branch.id));
};

export const getParentPlayers = (parentId: string) => {
  const parent = getParent(parentId);
  if (!parent) return [];
  return demoPlayers.filter(player => parent.playerIds.includes(player.id));
};
export const getSession = (sessionId?: string) => demoSessions.find(s => s.id === sessionId);
export const getCustomizationReady = () => ({ organizationId: 'org-united-olympics', status: 'ready-for-customization' });

export const getPlayerParents = (playerId: string) => demoParents.filter(parent => parent.playerIds.includes(playerId));
