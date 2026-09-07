import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  useAchievements,
  useCoaches,
  useGroups,
  useMessages,
  useParents,
  usePayments,
  usePlayers,
  useSessions,
  useSports,
  useSubscriptions,
  useUpdatePlayer,
} from '../../admin/data/adminHooks';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import type {
  AchievementViewModel,
  CoachViewModel,
  MessageViewModel,
  ParentViewModel,
  PlayerViewModel,
  SportViewModel,
  TrainingGroupViewModel,
} from '../../admin/data/viewModels';
import type {
  BilingualText,
  Coach,
  CoachFeedback,
  Parent,
  Payment,
  PerformanceRecord,
  Player,
  Session,
  Sport,
  Subscription,
  TrainingGroup,
} from '../../domain/contracts';
import { previewAuthGateway, productionAuthGateway } from './auth/PlayerAuthGateway';

const AUTH_KEY = 'uos:player-portal:auth';
const ACTIVE_PLAYER_KEY = 'uos:player-portal:active-id';
const SESSION_KEY = 'uos:player-portal:session';

export interface PlayerDocumentItem {
  id: string;
  title: BilingualText;
  category: 'identity' | 'consent' | 'medical' | 'certificate' | 'evaluation';
  issueDate: string;
  expiryDate?: string;
  status: 'verified' | 'pending' | 'expired';
  fileSize: string;
  verifiedBy: BilingualText;
}

export interface PlayerNotificationItem {
  id: string;
  title: BilingualText;
  description: BilingualText;
  category: 'schedule' | 'feedback' | 'attendance' | 'achievement' | 'membership';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface PlayerChatMessage {
  id: string;
  senderId: string;
  senderName: BilingualText;
  senderRole: 'coach' | 'admin' | 'player' | 'system';
  content: string;
  timestamp: string;
  isSelf: boolean;
}

export interface PlayerChatThread {
  id: string;
  participantName: BilingualText;
  participantRole: BilingualText;
  participantAvatar?: string;
  category: 'coach' | 'admin' | 'support';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: PlayerChatMessage[];
}

export interface PlayerAchievementItem {
  id: string;
  title: BilingualText;
  description: BilingualText;
  tier: 'gold' | 'silver' | 'bronze' | 'diamond' | 'recorded';
  category: BilingualText;
  awardedAt?: string;
  isLocked: boolean;
  criteria?: BilingualText;
}

type PlayerSessionProviderKind = 'production' | 'preview' | null;

interface PlayerSessionContextType {
  player: Player | null;
  isPlayerNotFound: boolean;
  allPlayers: Player[];
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  allCoaches: Coach[];
  parent?: Parent;
  sessions: Session[];
  attendanceRecords: Player['attendanceRecords'];
  attendanceStats: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    rate: number | null;
    streak: number;
  };
  metrics: PerformanceRecord[];
  overallScore: number | null;
  feedback: CoachFeedback[];
  subscriptions: Subscription[];
  payments: Payment[];
  documents: PlayerDocumentItem[];
  notifications: PlayerNotificationItem[];
  unreadNotificationCount: number;
  messages: PlayerChatThread[];
  achievements: PlayerAchievementItem[];
  isAuthenticated: boolean;
  isPreviewSession: boolean;
  activePlayerId: string | null;
  loading: boolean;
  error: Error | null;
  setActivePlayerId: (id: string) => void;
  switchPlayer: (id: string) => void;
  login: (athleteId?: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Player>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const PlayerSessionContext = createContext<PlayerSessionContextType | null>(null);
const EMPTY_DOCUMENTS: PlayerDocumentItem[] = [];

function readActivePlayerId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_PLAYER_KEY);
}

function readAuthFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AUTH_KEY) === 'true';
}

function readSessionProvider(): PlayerSessionProviderKind {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const provider = (JSON.parse(raw) as { provider?: string }).provider;
    return provider === 'preview' || provider === 'production' ? provider : null;
  } catch {
    return null;
  }
}

function toSport(item: SportViewModel): Sport {
  return { ...item };
}

function toParent(item: ParentViewModel): Parent {
  return {
    id: item.id,
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    playerIds: item.playerIds,
    preferredLanguage: item.preferredLanguage,
    status: item.status,
    phone: item.phone,
    email: item.email,
  };
}

function coachPlayerIds(coach: CoachViewModel, players: PlayerViewModel[]): string[] {
  const groups = new Set(coach.groupIds);
  return players.filter((player) => Boolean(player.groupId && groups.has(player.groupId))).map((player) => player.id);
}

function toCoach(item: CoachViewModel, players: PlayerViewModel[]): Coach {
  return {
    id: item.id,
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    sportIds: item.sportIds,
    branchIds: item.branchIds,
    groupIds: item.groupIds,
    playerIds: coachPlayerIds(item, players),
    specializations: item.specializations,
    certifications: item.certifications,
    status: item.status,
  };
}

function toGroup(item: TrainingGroupViewModel, players: PlayerViewModel[], coaches: CoachViewModel[]): TrainingGroup {
  return {
    id: item.id,
    sportId: item.sportId,
    name: item.name,
    ageGroup: item.ageGroup,
    level: item.level,
    playerIds: players.filter((player) => player.groupId === item.id).map((player) => player.id),
    coachIds: coaches.filter((coach) => coach.groupIds.includes(item.id)).map((coach) => coach.id),
    programIds: item.programIds,
    status: item.status,
  };
}

function playerCoachIds(player: PlayerViewModel, coaches: CoachViewModel[]): string[] {
  if (!player.groupId) return [];
  return coaches.filter((coach) => coach.groupIds.includes(player.groupId!)).map((coach) => coach.id);
}

function toPlayer(item: PlayerViewModel, coaches: CoachViewModel[], achievements: AchievementViewModel[]): Player {
  return {
    id: item.id,
    photo: item.photo,
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    sportId: item.sportId,
    groupId: item.groupId,
    programId: item.programId,
    coachIds: playerCoachIds(item, coaches),
    age: item.age,
    level: item.level,
    status: item.status,
    performanceHistory: [],
    coachFeedback: [],
    achievements: achievements
      .filter((achievement) => achievement.playerId === item.id && achievement.status === 'awarded')
      .map((achievement) => achievement.title),
    attendanceRecords: [],
  };
}

function resolveParticipantName(
  participantId: string,
  player: Player,
  coaches: CoachViewModel[],
  parents: ParentViewModel[],
): { name: BilingualText; role: BilingualText; category: PlayerChatThread['category']; senderRole: PlayerChatMessage['senderRole'] } {
  if (participantId === player.id) {
    return {
      name: { en: player.nameEn, ar: player.nameAr },
      role: { en: 'Player', ar: 'اللاعب' },
      category: 'support',
      senderRole: 'player',
    };
  }
  const coach = coaches.find((item) => item.id === participantId);
  if (coach) {
    return {
      name: { en: coach.nameEn, ar: coach.nameAr },
      role: { en: 'Coach', ar: 'المدرب' },
      category: 'coach',
      senderRole: 'coach',
    };
  }
  const parent = parents.find((item) => item.id === participantId);
  if (parent) {
    return {
      name: { en: parent.nameEn, ar: parent.nameAr },
      role: { en: 'Parent / guardian record', ar: 'سجل ولي الأمر' },
      category: 'support',
      senderRole: 'system',
    };
  }
  return {
    name: { en: participantId, ar: participantId },
    role: { en: 'Recorded system participant', ar: 'طرف مسجل في النظام' },
    category: 'admin',
    senderRole: 'admin',
  };
}

function toPlayerThread(
  message: MessageViewModel,
  player: Player,
  coaches: CoachViewModel[],
  parents: ParentViewModel[],
): PlayerChatThread {
  const isOutgoing = message.fromId === player.id;
  const participantId = isOutgoing
    ? (message.toIds.find((id) => id !== player.id) ?? message.toIds[0] ?? message.fromId)
    : message.fromId;
  const participant = resolveParticipantName(participantId, player, coaches, parents);
  const sender = resolveParticipantName(message.fromId, player, coaches, parents);
  const content = [message.body.en, message.body.ar].filter(Boolean).join(' · ');
  return {
    id: `thread-${message.id}`,
    participantName: participant.name,
    participantRole: participant.role,
    category: participant.category,
    lastMessage: content,
    lastMessageTime: message.sentAt,
    unreadCount: !isOutgoing && !message.readAt ? 1 : 0,
    messages: [{
      id: message.id,
      senderId: message.fromId,
      senderName: sender.name,
      senderRole: sender.senderRole,
      content,
      timestamp: message.sentAt,
      isSelf: isOutgoing,
    }],
  };
}

export function PlayerSessionProvider({ children }: { children: React.ReactNode }) {
  const { mode: dataMode } = useAdminData();
  const playersQuery = usePlayers({ page: 1, pageSize: 2000 });
  const sportsQuery = useSports({ page: 1, pageSize: 500 });
  const groupsQuery = useGroups({ page: 1, pageSize: 2000 });
  const coachesQuery = useCoaches({ page: 1, pageSize: 1000 });
  const parentsQuery = useParents({ page: 1, pageSize: 2000 });
  const sessionsQuery = useSessions({ page: 1, pageSize: 4000 });
  const subscriptionsQuery = useSubscriptions({ page: 1, pageSize: 4000 });
  const paymentsQuery = usePayments({ page: 1, pageSize: 4000 });
  const achievementsQuery = useAchievements({ page: 1, pageSize: 4000 });
  const messagesQuery = useMessages({ page: 1, pageSize: 4000 });
  const updatePlayerMutation = useUpdatePlayer();

  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(readActivePlayerId);
  const [authRequested, setAuthRequested] = useState<boolean>(readAuthFlag);
  const [sessionProvider, setSessionProvider] = useState<PlayerSessionProviderKind>(readSessionProvider);

  const playerViews = playersQuery.data.items;
  const coachViews = coachesQuery.data.items;
  const parentViews = parentsQuery.data.items;
  const achievementViews = achievementsQuery.data.items;

  const playerView = useMemo(
    () => activePlayerId ? playerViews.find((item) => item.id === activePlayerId) : undefined,
    [activePlayerId, playerViews],
  );

  const player = useMemo(
    () => playerView ? toPlayer(playerView, coachViews, achievementViews) : null,
    [achievementViews, coachViews, playerView],
  );

  const mappedPlayers = useMemo(
    () => playerViews.map((item) => toPlayer(item, coachViews, achievementViews)),
    [achievementViews, coachViews, playerViews],
  );

  const allPlayers = useMemo(() => {
    if (dataMode === 'preview') return mappedPlayers;
    return player ? [player] : [];
  }, [dataMode, mappedPlayers, player]);

  const sport = useMemo(
    () => player ? sportsQuery.data.items.find((item) => item.id === player.sportId) : undefined,
    [player, sportsQuery.data.items],
  );

  const groupView = useMemo(
    () => player?.groupId ? groupsQuery.data.items.find((item) => item.id === player.groupId) : undefined,
    [groupsQuery.data.items, player?.groupId],
  );

  const group = useMemo(
    () => groupView ? toGroup(groupView, playerViews, coachViews) : undefined,
    [coachViews, groupView, playerViews],
  );

  const assignedCoachViews = useMemo(() => {
    if (!player) return [];
    const ids = new Set(player.coachIds);
    return coachViews.filter((item) => ids.has(item.id));
  }, [coachViews, player]);

  const allCoaches = useMemo(
    () => assignedCoachViews.map((item) => toCoach(item, playerViews)),
    [assignedCoachViews, playerViews],
  );
  const coach = allCoaches[0];

  const parentView = useMemo(
    () => player ? parentViews.find((item) => item.playerIds.includes(player.id)) : undefined,
    [parentViews, player],
  );
  const parent = parentView ? toParent(parentView) : undefined;

  const sessions = useMemo<Session[]>(() => {
    if (!player?.groupId) return [];
    return sessionsQuery.data.items
      .filter((item) => item.groupId === player.groupId)
      .map((item) => ({ id: item.id, sportId: item.sportId, groupId: item.groupId, startsAt: item.startsAt, status: item.status }));
  }, [player?.groupId, sessionsQuery.data.items]);

  const attendanceRecords = player?.attendanceRecords ?? [];
  const attendanceStats = useMemo(() => ({
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    total: 0,
    rate: typeof playerView?.attendanceRate === 'number' && Number.isFinite(playerView.attendanceRate)
      ? playerView.attendanceRate
      : null,
    streak: 0,
  }), [playerView?.attendanceRate]);

  const metrics = player?.performanceHistory ?? [];
  const overallScore = typeof playerView?.performanceScore === 'number' && Number.isFinite(playerView.performanceScore)
    ? playerView.performanceScore
    : null;

  const feedback = useMemo<CoachFeedback[]>(() => [], []);

  const subscriptions = useMemo<Subscription[]>(() => {
    if (!player) return [];
    return subscriptionsQuery.data.items.filter((item) => item.playerId === player.id).map((item) => ({ ...item }));
  }, [player, subscriptionsQuery.data.items]);

  const payments = useMemo<Payment[]>(() => {
    if (!player) return [];
    return paymentsQuery.data.items.filter((item) => item.playerId === player.id).map((item) => ({ ...item }));
  }, [paymentsQuery.data.items, player]);

  const achievements = useMemo<PlayerAchievementItem[]>(() => {
    if (!player) return [];
    return achievementViews
      .filter((item) => item.playerId === player.id && item.status === 'awarded')
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tier: 'recorded' as const,
        category: item.category,
        awardedAt: item.awardedAt,
        isLocked: false,
      }));
  }, [achievementViews, player]);

  const threads = useMemo<PlayerChatThread[]>(() => {
    if (!player) return [];
    return messagesQuery.data.items
      .filter((item) => item.fromId === player.id || item.toIds.includes(player.id))
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .map((item) => toPlayerThread(item, player, coachViews, parentViews));
  }, [coachViews, messagesQuery.data.items, parentViews, player]);

  const derivedNotifications = useMemo<PlayerNotificationItem[]>(() => {
    if (!player) return [];
    const items: PlayerNotificationItem[] = [];
    const now = Date.now();
    const nextSession = [...sessions]
      .filter((session) => new Date(session.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
    if (nextSession) {
      items.push({
        id: `notif-session-${nextSession.id}`,
        title: { en: 'Upcoming Training Session', ar: 'حصة تدريبية قادمة' },
        description: {
          en: `A recorded session is scheduled for ${new Date(nextSession.startsAt).toLocaleString()}.`,
          ar: `توجد حصة مسجلة مجدولة في ${new Date(nextSession.startsAt).toLocaleString('ar')}.`,
        },
        category: 'schedule',
        timestamp: nextSession.startsAt,
        isRead: false,
        actionUrl: `/player/schedule/${nextSession.id}`,
      });
    }
    const latestAchievement = [...achievements]
      .filter((item) => item.awardedAt)
      .sort((a, b) => new Date(b.awardedAt!).getTime() - new Date(a.awardedAt!).getTime())[0];
    if (latestAchievement?.awardedAt) {
      items.push({
        id: `notif-achievement-${latestAchievement.id}`,
        title: { en: 'Achievement on Athlete Record', ar: 'إنجاز في سجل اللاعب' },
        description: latestAchievement.title,
        category: 'achievement',
        timestamp: latestAchievement.awardedAt,
        isRead: false,
        actionUrl: '/player/achievements',
      });
    }
    return items;
  }, [achievements, player, sessions]);

  const [notifications, setNotifications] = useState<PlayerNotificationItem[]>([]);
  useEffect(() => setNotifications(derivedNotifications), [derivedNotifications]);

  const loading = playersQuery.loading
    || sportsQuery.loading
    || groupsQuery.loading
    || coachesQuery.loading
    || parentsQuery.loading
    || sessionsQuery.loading
    || subscriptionsQuery.loading
    || paymentsQuery.loading
    || achievementsQuery.loading
    || messagesQuery.loading;

  const error = playersQuery.error
    ?? sportsQuery.error
    ?? groupsQuery.error
    ?? coachesQuery.error
    ?? parentsQuery.error
    ?? sessionsQuery.error
    ?? subscriptionsQuery.error
    ?? paymentsQuery.error
    ?? achievementsQuery.error
    ?? messagesQuery.error;

  const isPlayerNotFound = Boolean(activePlayerId && !playersQuery.loading && !playerView);
  const isAuthenticated = Boolean(authRequested && playerView);
  const isPreviewSession = sessionProvider === 'preview';

  useEffect(() => {
    if (playersQuery.loading || !activePlayerId) return;
    if (!playerView) {
      setAuthRequested(false);
      setActivePlayerIdState(null);
      setSessionProvider(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_KEY, 'false');
        window.localStorage.removeItem(ACTIVE_PLAYER_KEY);
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [activePlayerId, playerView, playersQuery.loading]);

  const setActivePlayerId = (id: string) => {
    if (!playerViews.some((item) => item.id === id)) return;
    if (dataMode !== 'preview' && activePlayerId && id !== activePlayerId) return;
    setActivePlayerIdState(id);
    if (typeof window !== 'undefined') window.localStorage.setItem(ACTIVE_PLAYER_KEY, id);
  };

  const login = (athleteId?: string) => {
    const idToUse = athleteId ?? activePlayerId;
    if (!idToUse || !playerViews.some((item) => item.id === idToUse)) {
      setAuthRequested(false);
      if (typeof window !== 'undefined') window.localStorage.setItem(AUTH_KEY, 'false');
      return;
    }
    setSessionProvider(readSessionProvider());
    setActivePlayerId(idToUse);
    setAuthRequested(true);
    if (typeof window !== 'undefined') window.localStorage.setItem(AUTH_KEY, 'true');
  };

  const logout = () => {
    const provider = readSessionProvider();
    void (provider === 'production' ? productionAuthGateway : previewAuthGateway).signOut().catch(() => undefined);
    setAuthRequested(false);
    setSessionProvider(null);
    setActivePlayerIdState(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, 'false');
      window.localStorage.removeItem(ACTIVE_PLAYER_KEY);
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem('uos:player-portal:profile-patches');
    }
  };

  const updateProfile = (patch: Partial<Player>) => {
    if (!playerView) return;
    const supportedPatch: Partial<PlayerViewModel> = {};
    if (patch.photo !== undefined) supportedPatch.photo = patch.photo;
    if (patch.nameEn !== undefined) supportedPatch.nameEn = patch.nameEn;
    if (patch.nameAr !== undefined) supportedPatch.nameAr = patch.nameAr;
    if (patch.sportId !== undefined) supportedPatch.sportId = patch.sportId;
    if (patch.groupId !== undefined) supportedPatch.groupId = patch.groupId;
    if (patch.programId !== undefined) supportedPatch.programId = patch.programId;
    if (patch.age !== undefined) supportedPatch.age = patch.age;
    if (patch.level !== undefined) supportedPatch.level = patch.level;
    if (patch.status !== undefined) supportedPatch.status = patch.status;
    if (!Object.keys(supportedPatch).length) return;
    void updatePlayerMutation.update(playerView.id, supportedPatch).catch(() => undefined);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  return (
    <PlayerSessionContext.Provider
      value={{
        player,
        isPlayerNotFound,
        allPlayers,
        sport: sport ? toSport(sport) : undefined,
        group,
        coach,
        allCoaches,
        parent,
        sessions,
        attendanceRecords,
        attendanceStats,
        metrics,
        overallScore,
        feedback,
        subscriptions,
        payments,
        documents: EMPTY_DOCUMENTS,
        notifications,
        unreadNotificationCount,
        messages: threads,
        achievements,
        isAuthenticated,
        isPreviewSession,
        activePlayerId,
        loading,
        error,
        setActivePlayerId,
        switchPlayer: setActivePlayerId,
        login,
        logout,
        updateProfile,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </PlayerSessionContext.Provider>
  );
}

export function usePlayerSession() {
  const context = useContext(PlayerSessionContext);
  if (!context) throw new Error('usePlayerSession must be used within a PlayerSessionProvider');
  return context;
}
