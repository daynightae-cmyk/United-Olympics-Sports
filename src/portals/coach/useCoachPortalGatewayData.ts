import { useMemo } from 'react';
import {
  useBranches,
  useGroups,
  useMessages,
  useParents,
  usePlayers,
  usePrograms,
  useSessions,
  useSports,
} from '../../admin/data/adminHooks';
import { useCoachSession } from './CoachSessionContext';

export function useCoachPortalGatewayData() {
  const { coach } = useCoachSession();
  const groupQuery = useGroups({ page: 1, pageSize: 1000 });
  const playerQuery = usePlayers({ page: 1, pageSize: 2000 });
  const sessionQuery = useSessions({ page: 1, pageSize: 2000 });
  const programQuery = usePrograms({ page: 1, pageSize: 1000 });
  const sportQuery = useSports({ page: 1, pageSize: 500 });
  const messageQuery = useMessages({ page: 1, pageSize: 2000 });
  const parentQuery = useParents({ page: 1, pageSize: 1000 });
  const branchQuery = useBranches({ page: 1, pageSize: 500 });

  const groups = useMemo(
    () => coach ? groupQuery.data.items.filter((group) => coach.groupIds.includes(group.id)) : [],
    [coach, groupQuery.data.items],
  );
  const groupIds = useMemo(() => new Set(groups.map((group) => group.id)), [groups]);

  const players = useMemo(
    () => playerQuery.data.items.filter((player) => Boolean(player.groupId && groupIds.has(player.groupId))),
    [groupIds, playerQuery.data.items],
  );
  const playerIds = useMemo(() => new Set(players.map((player) => player.id)), [players]);

  const sessions = useMemo(
    () => coach
      ? sessionQuery.data.items
        .filter((session) => session.coachIds.includes(coach.id) || groupIds.has(session.groupId))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      : [],
    [coach, groupIds, sessionQuery.data.items],
  );

  const programIds = useMemo(
    () => new Set(groups.flatMap((group) => group.programIds)),
    [groups],
  );
  const programs = useMemo(
    () => programQuery.data.items.filter((program) => programIds.has(program.id)),
    [programIds, programQuery.data.items],
  );

  const sportIds = useMemo(() => {
    const ids = new Set<string>(coach?.sportIds ?? []);
    groups.forEach((group) => ids.add(group.sportId));
    return ids;
  }, [coach, groups]);
  const sports = useMemo(
    () => sportQuery.data.items.filter((sport) => sportIds.has(sport.id)),
    [sportIds, sportQuery.data.items],
  );

  const parents = useMemo(
    () => parentQuery.data.items.filter((parent) => parent.playerIds.some((id) => playerIds.has(id))),
    [parentQuery.data.items, playerIds],
  );

  const messages = useMemo(
    () => coach
      ? messageQuery.data.items
        .filter((message) => message.fromId === coach.id || message.toIds.includes(coach.id))
        .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
      : [],
    [coach, messageQuery.data.items],
  );

  const branches = useMemo(
    () => coach ? branchQuery.data.items.filter((branch) => coach.branchIds.includes(branch.id)) : [],
    [branchQuery.data.items, coach],
  );

  const loading = [
    groupQuery,
    playerQuery,
    sessionQuery,
    programQuery,
    sportQuery,
    messageQuery,
    parentQuery,
    branchQuery,
  ].some((query) => query.loading);

  const error = [
    groupQuery.error,
    playerQuery.error,
    sessionQuery.error,
    programQuery.error,
    sportQuery.error,
    messageQuery.error,
    parentQuery.error,
    branchQuery.error,
  ].find(Boolean) ?? null;

  return {
    coach,
    groups,
    players,
    sessions,
    programs,
    sports,
    parents,
    messages,
    branches,
    loading,
    error,
  };
}
