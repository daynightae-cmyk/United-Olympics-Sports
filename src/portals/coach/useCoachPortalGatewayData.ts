import { useEffect, useMemo, useState } from 'react';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import type {
  BranchViewModel,
  MessageViewModel,
  ParentViewModel,
  PlayerViewModel,
  ProgramViewModel,
  SessionViewModel,
  SportViewModel,
  TrainingGroupViewModel,
} from '../../admin/data/viewModels';
import type { CoachPortalScopeSnapshot } from '../../lib/portal-data-client';
import { useCoachSession } from './CoachSessionContext';

function bi(en: string, ar = en) { return { en, ar }; }

interface CoachPortalDataState {
  groups: TrainingGroupViewModel[];
  players: PlayerViewModel[];
  sessions: SessionViewModel[];
  programs: ProgramViewModel[];
  sports: SportViewModel[];
  parents: ParentViewModel[];
  messages: MessageViewModel[];
  branches: BranchViewModel[];
}

const EMPTY: CoachPortalDataState = {
  groups: [],
  players: [],
  sessions: [],
  programs: [],
  sports: [],
  parents: [],
  messages: [],
  branches: [],
};

function mapProductionWorkspace(snapshot: CoachPortalScopeSnapshot): CoachPortalDataState {
  const players: PlayerViewModel[] = snapshot.players.map((player) => ({
    id: player.id,
    nameEn: player.fullName,
    nameAr: player.fullName,
    sportId: player.sportId ?? '',
    groupId: player.groupId ?? undefined,
    programId: player.programId ?? undefined,
    level: bi('Not recorded', 'غير مسجل'),
    status: bi('Active', 'نشط'),
    attendanceRate: player.attendanceRate,
    performanceScore: player.performanceScore,
  }));

  const groups: TrainingGroupViewModel[] = snapshot.groups.map((group) => ({
    id: group.id,
    sportId: group.sportId,
    name: bi(group.name),
    ageGroup: bi('Not recorded', 'غير مسجل'),
    level: bi('Not recorded', 'غير مسجل'),
    playerCount: players.filter((player) => player.groupId === group.id).length,
    coachCount: 1,
    programIds: [group.programId],
    status: group.status === 'active' ? 'active' : 'inactive',
  }));

  const sessions: SessionViewModel[] = snapshot.sessions.map((session) => ({
    id: session.id,
    sportId: session.sportId,
    groupId: session.groupId,
    startsAt: session.startsAt,
    status: bi(session.status),
    coachIds: [snapshot.coach.id],
  }));

  const programs: ProgramViewModel[] = snapshot.programs.map((program) => ({
    id: program.id,
    name: bi(program.name, program.nameAr || program.name),
    sportId: program.sportId,
    description: bi('Program record', 'سجل البرنامج'),
    ageGroups: [],
    level: bi('Not recorded', 'غير مسجل'),
    status: program.status === 'active' ? 'active' : 'inactive',
  }));

  const sports: SportViewModel[] = snapshot.sports.map((sport) => ({
    id: sport.id,
    name: bi(sport.name, sport.nameAr || sport.name),
    description: bi('Sport record', 'سجل الرياضة'),
    ageGroups: [],
    programIds: snapshot.programs.filter((program) => program.sportId === sport.id).map((program) => program.id),
    icon: '',
    status: sport.status === 'active' ? 'active' : 'inactive',
  }));

  const parents: ParentViewModel[] = snapshot.parents.map((parent) => ({
    id: parent.id,
    nameEn: parent.fullName,
    nameAr: parent.fullName,
    playerIds: parent.playerIds,
    playerCount: parent.playerIds.length,
    preferredLanguage: 'en',
    status: 'active',
  }));

  const messages: MessageViewModel[] = snapshot.messages.map((message) => ({
    id: message.id,
    fromId: message.fromId,
    toIds: message.toIds,
    subject: bi('Portal message', 'رسالة البوابة'),
    body: bi(message.content),
    sentAt: message.sentAt,
    ...(message.readAt ? { readAt: message.readAt } : {}),
    status: message.readAt ? 'read' : 'delivered',
  }));

  const branches: BranchViewModel[] = snapshot.branches.map((branch) => ({
    id: branch.id,
    name: bi(branch.name, branch.nameAr || branch.name),
    countryId: branch.countryId,
    organizationId: branch.organizationId,
    sportIds: sports.map((sport) => sport.id),
    programIds: programs.filter((program) => snapshot.groups.some((group) => group.branchId === branch.id && group.programId === program.id)).map((program) => program.id),
    groupIds: snapshot.groups.filter((group) => group.branchId === branch.id).map((group) => group.id),
    coachIds: branch.id === snapshot.coach.branchId ? [snapshot.coach.id] : [],
    playerIds: snapshot.players.filter((player) => player.branchId === branch.id).map((player) => player.id),
    sportCount: sports.length,
    programCount: programs.length,
    groupCount: snapshot.groups.filter((group) => group.branchId === branch.id).length,
    coachCount: branch.id === snapshot.coach.branchId ? 1 : 0,
    playerCount: snapshot.players.filter((player) => player.branchId === branch.id).length,
    status: branch.status === 'active' ? 'active' : 'inactive',
  }));

  return { groups, players, sessions, programs, sports, parents, messages, branches };
}

export function useCoachPortalGatewayData() {
  const { gateway, mode } = useAdminData();
  const { coach, isPreviewSession, productionWorkspace, loading: sessionLoading, error: sessionError } = useCoachSession();
  const [preview, setPreview] = useState<CoachPortalDataState>(EMPTY);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!isPreviewSession) {
      setPreview(EMPTY);
      setPreviewLoading(false);
      setPreviewError(null);
      return () => { active = false; };
    }

    if (mode !== 'preview' || !coach) {
      setPreview(EMPTY);
      setPreviewLoading(false);
      setPreviewError(mode === 'preview' ? null : new Error('PREVIEW_PROVIDER_DISABLED'));
      return () => { active = false; };
    }

    setPreviewLoading(true);
    setPreviewError(null);
    void Promise.all([
      gateway.listGroups({ page: 1, pageSize: 1000 }),
      gateway.listPlayers({ page: 1, pageSize: 2000 }),
      gateway.listSessions({ page: 1, pageSize: 2000 }),
      gateway.listPrograms({ page: 1, pageSize: 1000 }),
      gateway.listSports({ page: 1, pageSize: 500 }),
      gateway.listMessages({ page: 1, pageSize: 2000 }),
      gateway.listParents({ page: 1, pageSize: 1000 }),
      gateway.listBranches({ page: 1, pageSize: 500 }),
    ])
      .then(([groupResult, playerResult, sessionResult, programResult, sportResult, messageResult, parentResult, branchResult]) => {
        if (!active) return;
        const groups = groupResult.items.filter((group) => coach.groupIds.includes(group.id));
        const groupIds = new Set(groups.map((group) => group.id));
        const players = playerResult.items.filter((player) => Boolean(player.groupId && groupIds.has(player.groupId)));
        const playerIds = new Set(players.map((player) => player.id));
        const sessions = sessionResult.items
          .filter((session) => session.coachIds.includes(coach.id) || groupIds.has(session.groupId))
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const programIds = new Set(groups.flatMap((group) => group.programIds));
        const programs = programResult.items.filter((program) => programIds.has(program.id));
        const sportIds = new Set<string>(coach.sportIds);
        groups.forEach((group) => sportIds.add(group.sportId));
        const sports = sportResult.items.filter((sport) => sportIds.has(sport.id));
        const parents = parentResult.items.filter((parent) => parent.playerIds.some((id) => playerIds.has(id)));
        const messages = messageResult.items
          .filter((message) => message.fromId === coach.id || message.toIds.includes(coach.id))
          .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
        const branches = branchResult.items.filter((branch) => coach.branchIds.includes(branch.id));
        setPreview({ groups, players, sessions, programs, sports, parents, messages, branches });
      })
      .catch((caught) => {
        if (!active) return;
        setPreview(EMPTY);
        setPreviewError(caught instanceof Error ? caught : new Error('COACH_PREVIEW_DATA_FAILED'));
      })
      .finally(() => { if (active) setPreviewLoading(false); });

    return () => { active = false; };
  }, [coach, gateway, isPreviewSession, mode]);

  const production = useMemo(
    () => productionWorkspace ? mapProductionWorkspace(productionWorkspace) : EMPTY,
    [productionWorkspace],
  );
  const data = isPreviewSession ? preview : production;

  return {
    coach,
    ...data,
    loading: sessionLoading || (isPreviewSession && previewLoading),
    error: sessionError ?? (isPreviewSession ? previewError : null),
  };
}