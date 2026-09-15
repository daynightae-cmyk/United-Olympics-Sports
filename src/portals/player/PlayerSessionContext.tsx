import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import type {
  AchievementViewModel,
  CoachViewModel,
  MessageViewModel,
  ParentViewModel,
  PaymentViewModel,
  PlayerViewModel,
  SessionViewModel,
  SportViewModel,
  SubscriptionViewModel,
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
import { fetchPlayerPortalSnapshot, type PlayerPortalSnapshot } from '../../lib/portal-data-client';
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
  attendanceStats: { present: number; late: number; absent: number; excused: number; total: number; rate: number | null; streak: number };
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
const EMPTY_FEEDBACK: CoachFeedback[] = [];

function bi(en: string, ar = en): BilingualText { return { en, ar }; }

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

function toSport(item: SportViewModel): Sport { return { ...item }; }
function toParent(item: ParentViewModel): Parent {
  return { id: item.id, nameEn: item.nameEn, nameAr: item.nameAr, playerIds: item.playerIds, preferredLanguage: item.preferredLanguage, status: item.status, phone: item.phone, email: item.email };
}
function coachPlayerIds(coach: CoachViewModel, players: PlayerViewModel[]): string[] {
  const groups = new Set(coach.groupIds);
  return players.filter((player) => Boolean(player.groupId && groups.has(player.groupId))).map((player) => player.id);
}
function toCoach(item: CoachViewModel, players: PlayerViewModel[]): Coach {
  return { id: item.id, nameEn: item.nameEn, nameAr: item.nameAr, sportIds: item.sportIds, branchIds: item.branchIds, groupIds: item.groupIds, playerIds: coachPlayerIds(item, players), specializations: item.specializations, certifications: item.certifications, status: item.status };
}
function toGroup(item: TrainingGroupViewModel, players: PlayerViewModel[], coaches: CoachViewModel[]): TrainingGroup {
  return { id: item.id, sportId: item.sportId, name: item.name, ageGroup: item.ageGroup, level: item.level, playerIds: players.filter((player) => player.groupId === item.id).map((player) => player.id), coachIds: coaches.filter((coach) => coach.groupIds.includes(item.id)).map((coach) => coach.id), programIds: item.programIds, status: item.status };
}
function playerCoachIds(player: PlayerViewModel, coaches: CoachViewModel[]): string[] {
  if (!player.groupId) return [];
  return coaches.filter((coach) => coach.groupIds.includes(player.groupId!)).map((coach) => coach.id);
}
function toPreviewPlayer(item: PlayerViewModel, coaches: CoachViewModel[], achievements: AchievementViewModel[]): Player {
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
    achievements: achievements.filter((achievement) => achievement.playerId === item.id && achievement.status === 'awarded').map((achievement) => achievement.title),
    attendanceRecords: [],
  };
}

function normalizeAttendanceStatus(value: string): Player['attendanceRecords'][number]['status'] {
  return value === 'present' || value === 'absent' || value === 'late' || value === 'excused' ? value : 'absent';
}
function normalizeSubscriptionStatus(value: string): Subscription['status'] {
  return value === 'active' || value === 'pending' || value === 'expired' || value === 'cancelled' ? value : 'pending';
}
function normalizePaymentStatus(value: string): Payment['status'] {
  return value === 'completed' || value === 'pending' || value === 'failed' || value === 'refunded' ? value : 'pending';
}

function productionPlayer(snapshot: PlayerPortalSnapshot): Player {
  const groupId = snapshot.schedule[0]?.groupId;
  return {
    id: snapshot.player.id,
    nameEn: snapshot.player.fullName,
    nameAr: snapshot.player.fullName,
    sportId: '',
    groupId,
    coachIds: [],
    level: bi('Not recorded', 'غير مسجل'),
    status: bi('Active', 'نشط'),
    performanceHistory: snapshot.performance
      .filter((item) => typeof item.score === 'number')
      .map((item) => ({ id: item.id, playerId: snapshot.player.id, metricId: item.metricKey, value: item.score ?? 0, recordedAt: item.date })),
    coachFeedback: [],
    achievements: snapshot.achievements.map((item) => bi(item.title, item.titleAr || item.title)),
    attendanceRecords: snapshot.attendance.map((item) => ({ id: item.id, date: item.date, status: normalizeAttendanceStatus(item.status) })),
  };
}

type PreviewBundle = {
  players: PlayerViewModel[];
  sports: SportViewModel[];
  groups: TrainingGroupViewModel[];
  coaches: CoachViewModel[];
  parents: ParentViewModel[];
  sessions: SessionViewModel[];
  subscriptions: SubscriptionViewModel[];
  payments: PaymentViewModel[];
  achievements: AchievementViewModel[];
  messages: MessageViewModel[];
};

const EMPTY_PREVIEW: PreviewBundle = { players: [], sports: [], groups: [], coaches: [], parents: [], sessions: [], subscriptions: [], payments: [], achievements: [], messages: [] };

function resolveParticipantName(participantId: string, player: Player, coaches: CoachViewModel[], parents: ParentViewModel[]) {
  if (participantId === player.id) return { name: bi(player.nameEn, player.nameAr), role: bi('Player', 'اللاعب'), category: 'support' as const, senderRole: 'player' as const };
  const coach = coaches.find((item) => item.id === participantId);
  if (coach) return { name: bi(coach.nameEn, coach.nameAr), role: bi('Coach', 'المدرب'), category: 'coach' as const, senderRole: 'coach' as const };
  const parent = parents.find((item) => item.id === participantId);
  if (parent) return { name: bi(parent.nameEn, parent.nameAr), role: bi('Parent / guardian record', 'سجل ولي الأمر'), category: 'support' as const, senderRole: 'system' as const };
  return { name: bi(participantId), role: bi('Recorded system participant', 'طرف مسجل في النظام'), category: 'admin' as const, senderRole: 'admin' as const };
}

function toPlayerThread(message: MessageViewModel, player: Player, coaches: CoachViewModel[], parents: ParentViewModel[]): PlayerChatThread {
  const isOutgoing = message.fromId === player.id;
  const participantId = isOutgoing ? (message.toIds.find((id) => id !== player.id) ?? message.toIds[0] ?? message.fromId) : message.fromId;
  const participant = resolveParticipantName(participantId, player, coaches, parents);
  const sender = resolveParticipantName(message.fromId, player, coaches, parents);
  const content = [message.body.en, message.body.ar].filter(Boolean).join(' · ');
  return { id: `thread-${message.id}`, participantName: participant.name, participantRole: participant.role, category: participant.category, lastMessage: content, lastMessageTime: message.sentAt, unreadCount: !isOutgoing && !message.readAt ? 1 : 0, messages: [{ id: message.id, senderId: message.fromId, senderName: sender.name, senderRole: sender.senderRole, content, timestamp: message.sentAt, isSelf: isOutgoing }] };
}

export function PlayerSessionProvider({ children }: { children: React.ReactNode }) {
  const { gateway, mode: dataMode } = useAdminData();
  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(readActivePlayerId);
  const [authRequested, setAuthRequested] = useState<boolean>(readAuthFlag);
  const [sessionProvider, setSessionProvider] = useState<PlayerSessionProviderKind>(readSessionProvider);
  const [preview, setPreview] = useState<PreviewBundle>(EMPTY_PREVIEW);
  const [production, setProduction] = useState<PlayerPortalSnapshot | null>(null);
  const [loading, setLoading] = useState(() => Boolean(readAuthFlag() && readActivePlayerId()));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const provider = sessionProvider;
    const playerId = activePlayerId;
    if (!authRequested || !provider || !playerId) {
      setLoading(false);
      setError(null);
      setProduction(null);
      if (provider !== 'preview') setPreview(EMPTY_PREVIEW);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    if (provider === 'production') {
      setPreview(EMPTY_PREVIEW);
      void fetchPlayerPortalSnapshot(playerId)
        .then((snapshot) => { if (active) setProduction(snapshot); })
        .catch((caught) => { if (active) { setProduction(null); setError(caught instanceof Error ? caught : new Error('PLAYER_PORTAL_DATA_FAILED')); } })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }

    if (dataMode !== 'preview') {
      setLoading(false);
      setError(new Error('PREVIEW_PROVIDER_DISABLED'));
      return () => { active = false; };
    }

    setProduction(null);
    void Promise.all([
      gateway.listPlayers({ page: 1, pageSize: 2000 }),
      gateway.listSports({ page: 1, pageSize: 500 }),
      gateway.listGroups({ page: 1, pageSize: 2000 }),
      gateway.listCoaches({ page: 1, pageSize: 1000 }),
      gateway.listParents({ page: 1, pageSize: 2000 }),
      gateway.listSessions({ page: 1, pageSize: 4000 }),
      gateway.listSubscriptions({ page: 1, pageSize: 4000 }),
      gateway.listPayments({ page: 1, pageSize: 4000 }),
      gateway.listAchievements({ page: 1, pageSize: 4000 }),
      gateway.listMessages({ page: 1, pageSize: 4000 }),
    ])
      .then(([players, sports, groups, coaches, parents, sessions, subscriptions, payments, achievements, messages]) => {
        if (!active) return;
        setPreview({ players: players.items, sports: sports.items, groups: groups.items, coaches: coaches.items, parents: parents.items, sessions: sessions.items, subscriptions: subscriptions.items, payments: payments.items, achievements: achievements.items, messages: messages.items });
      })
      .catch((caught) => { if (active) { setPreview(EMPTY_PREVIEW); setError(caught instanceof Error ? caught : new Error('PLAYER_PREVIEW_DATA_FAILED')); } })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [activePlayerId, authRequested, dataMode, gateway, sessionProvider]);

  const previewPlayerView = useMemo(() => activePlayerId ? preview.players.find((item) => item.id === activePlayerId) : undefined, [activePlayerId, preview.players]);
  const player = useMemo<Player | null>(() => {
    if (sessionProvider === 'production') return production ? productionPlayer(production) : null;
    return previewPlayerView ? toPreviewPlayer(previewPlayerView, preview.coaches, preview.achievements) : null;
  }, [preview.achievements, preview.coaches, previewPlayerView, production, sessionProvider]);

  const allPlayers = useMemo(() => {
    if (sessionProvider === 'production') return player ? [player] : [];
    return preview.players.map((item) => toPreviewPlayer(item, preview.coaches, preview.achievements));
  }, [player, preview.achievements, preview.coaches, preview.players, sessionProvider]);

  const sport = useMemo(() => sessionProvider === 'preview' && player ? preview.sports.find((item) => item.id === player.sportId) : undefined, [player, preview.sports, sessionProvider]);
  const groupView = useMemo(() => sessionProvider === 'preview' && player?.groupId ? preview.groups.find((item) => item.id === player.groupId) : undefined, [player?.groupId, preview.groups, sessionProvider]);
  const group = useMemo(() => groupView ? toGroup(groupView, preview.players, preview.coaches) : undefined, [groupView, preview.coaches, preview.players]);
  const assignedCoachViews = useMemo(() => {
    if (sessionProvider !== 'preview' || !player) return [];
    const ids = new Set(player.coachIds);
    return preview.coaches.filter((item) => ids.has(item.id));
  }, [player, preview.coaches, sessionProvider]);
  const allCoaches = useMemo(() => assignedCoachViews.map((item) => toCoach(item, preview.players)), [assignedCoachViews, preview.players]);
  const coach = allCoaches[0];
  const parentView = useMemo(() => sessionProvider === 'preview' && player ? preview.parents.find((item) => item.playerIds.includes(player.id)) : undefined, [player, preview.parents, sessionProvider]);
  const parent = parentView ? toParent(parentView) : undefined;

  const sessions = useMemo<Session[]>(() => {
    if (!player) return [];
    if (sessionProvider === 'production') return (production?.schedule ?? []).map((item) => ({ id: item.id, sportId: '', groupId: item.groupId, startsAt: item.startsAt, status: bi(item.status) }));
    if (!player.groupId) return [];
    return preview.sessions.filter((item) => item.groupId === player.groupId).map((item) => ({ id: item.id, sportId: item.sportId, groupId: item.groupId, startsAt: item.startsAt, status: item.status }));
  }, [player, preview.sessions, production?.schedule, sessionProvider]);

  const attendanceRecords = player?.attendanceRecords ?? [];
  const attendanceStats = useMemo(() => {
    if (sessionProvider === 'production') {
      const records = production?.attendance ?? [];
      const counts = { present: 0, late: 0, absent: 0, excused: 0 };
      records.forEach((item) => { counts[normalizeAttendanceStatus(item.status)] += 1; });
      const total = records.length;
      const rate = total ? Math.round(((counts.present + counts.late) / total) * 100) : null;
      return { ...counts, total, rate, streak: 0 };
    }
    const rate = typeof previewPlayerView?.attendanceRate === 'number' && Number.isFinite(previewPlayerView.attendanceRate) ? previewPlayerView.attendanceRate : null;
    return { present: 0, late: 0, absent: 0, excused: 0, total: 0, rate, streak: 0 };
  }, [previewPlayerView?.attendanceRate, production?.attendance, sessionProvider]);

  const metrics = useMemo<PerformanceRecord[]>(() => {
    if (!player) return [];
    if (sessionProvider === 'production') return player.performanceHistory;
    return player.performanceHistory;
  }, [player, sessionProvider]);
  const overallScore = useMemo(() => {
    if (sessionProvider === 'production') {
      const values = (production?.performance ?? []).map((item) => item.score).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    }
    return typeof previewPlayerView?.performanceScore === 'number' && Number.isFinite(previewPlayerView.performanceScore) ? previewPlayerView.performanceScore : null;
  }, [previewPlayerView?.performanceScore, production?.performance, sessionProvider]);

  const subscriptions = useMemo<Subscription[]>(() => {
    if (!player) return [];
    if (sessionProvider === 'production') return (production?.subscriptions ?? []).map((item) => ({ id: item.id, playerId: player.id, programId: item.programId, branchId: production?.player.branchId ?? '', plan: bi('Recorded subscription', 'اشتراك مسجل'), status: normalizeSubscriptionStatus(item.status), startDate: '', amount: (item.amountMinor ?? 0) / 100, currency: item.currency ?? 'AED' }));
    return preview.subscriptions.filter((item) => item.playerId === player.id).map((item) => ({ ...item }));
  }, [player, preview.subscriptions, production, sessionProvider]);

  const payments = useMemo<Payment[]>(() => {
    if (!player || sessionProvider !== 'preview') return [];
    return preview.payments.filter((item) => item.playerId === player.id).map((item) => ({ ...item, status: normalizePaymentStatus(item.status) }));
  }, [player, preview.payments, sessionProvider]);

  const achievements = useMemo<PlayerAchievementItem[]>(() => {
    if (!player) return [];
    if (sessionProvider === 'production') return (production?.achievements ?? []).map((item) => ({ id: item.id, title: bi(item.title, item.titleAr || item.title), description: bi(item.badge || item.category), tier: 'recorded', category: bi(item.category), awardedAt: item.earnedAt, isLocked: false }));
    return preview.achievements.filter((item) => item.playerId === player.id && item.status === 'awarded').map((item) => ({ id: item.id, title: item.title, description: item.description, tier: 'recorded', category: item.category, awardedAt: item.awardedAt, isLocked: false }));
  }, [player, preview.achievements, production?.achievements, sessionProvider]);

  const threads = useMemo<PlayerChatThread[]>(() => {
    if (!player || sessionProvider !== 'preview') return [];
    return preview.messages.filter((item) => item.fromId === player.id || item.toIds.includes(player.id)).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).map((item) => toPlayerThread(item, player, preview.coaches, preview.parents));
  }, [player, preview.coaches, preview.messages, preview.parents, sessionProvider]);

  const derivedNotifications = useMemo<PlayerNotificationItem[]>(() => {
    if (!player) return [];
    const items: PlayerNotificationItem[] = [];
    const nextSession = [...sessions].filter((session) => new Date(session.startsAt).getTime() >= Date.now()).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
    if (nextSession) items.push({ id: `notif-session-${nextSession.id}`, title: bi('Upcoming Training Session', 'حصة تدريبية قادمة'), description: bi(`A recorded session is scheduled for ${new Date(nextSession.startsAt).toLocaleString()}.`, `توجد حصة مسجلة مجدولة في ${new Date(nextSession.startsAt).toLocaleString('ar')}.`), category: 'schedule', timestamp: nextSession.startsAt, isRead: false, actionUrl: `/player/schedule/${nextSession.id}` });
    const latestAchievement = [...achievements].filter((item) => item.awardedAt).sort((a, b) => new Date(b.awardedAt!).getTime() - new Date(a.awardedAt!).getTime())[0];
    if (latestAchievement?.awardedAt) items.push({ id: `notif-achievement-${latestAchievement.id}`, title: bi('Achievement on Athlete Record', 'إنجاز في سجل اللاعب'), description: latestAchievement.title, category: 'achievement', timestamp: latestAchievement.awardedAt, isRead: false, actionUrl: '/player/achievements' });
    return items;
  }, [achievements, player, sessions]);

  const [notifications, setNotifications] = useState<PlayerNotificationItem[]>([]);
  useEffect(() => setNotifications(derivedNotifications), [derivedNotifications]);

  const isPlayerNotFound = Boolean(activePlayerId && !loading && !player && !error);
  const isAuthenticated = Boolean(authRequested && player && !error);
  const isPreviewSession = sessionProvider === 'preview';

  useEffect(() => {
    if (loading || error || !activePlayerId || player) return;
    setAuthRequested(false);
    setActivePlayerIdState(null);
    setSessionProvider(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, 'false');
      window.localStorage.removeItem(ACTIVE_PLAYER_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [activePlayerId, error, loading, player]);

  const setActivePlayerId = (id: string) => {
    if (!allPlayers.some((item) => item.id === id)) return;
    if (sessionProvider === 'production' && activePlayerId && id !== activePlayerId) return;
    setActivePlayerIdState(id);
    if (typeof window !== 'undefined') window.localStorage.setItem(ACTIVE_PLAYER_KEY, id);
  };

  const login = (athleteId?: string) => {
    const idToUse = athleteId ?? activePlayerId;
    if (!idToUse) return;
    setSessionProvider(readSessionProvider());
    setActivePlayerIdState(idToUse);
    setAuthRequested(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_PLAYER_KEY, idToUse);
      window.localStorage.setItem(AUTH_KEY, 'true');
    }
  };

  const logout = () => {
    const provider = readSessionProvider();
    void (provider === 'production' ? productionAuthGateway : previewAuthGateway).signOut().catch(() => undefined);
    setAuthRequested(false);
    setSessionProvider(null);
    setActivePlayerIdState(null);
    setProduction(null);
    setPreview(EMPTY_PREVIEW);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, 'false');
      window.localStorage.removeItem(ACTIVE_PLAYER_KEY);
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem('uos:player-portal:profile-patches');
    }
  };

  const updateProfile = (patch: Partial<Player>) => {
    if (sessionProvider !== 'preview' || !previewPlayerView) return;
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
    void gateway.updatePlayer(previewPlayerView.id, supportedPatch).then((result) => {
      setPreview((current) => ({ ...current, players: current.players.map((item) => item.id === result.item.id ? result.item : item) }));
    }).catch(() => undefined);
  };

  const markNotificationRead = (id: string) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  const markAllNotificationsRead = () => setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  const unreadNotificationCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  return (
    <PlayerSessionContext.Provider value={{
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
      feedback: EMPTY_FEEDBACK,
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
    }}>
      {children}
    </PlayerSessionContext.Provider>
  );
}

export function usePlayerSession() {
  const context = useContext(PlayerSessionContext);
  if (!context) throw new Error('usePlayerSession must be used within a PlayerSessionProvider');
  return context;
}
