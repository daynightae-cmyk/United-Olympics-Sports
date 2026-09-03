import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoCoachFeedback } from '../../data/demo/coachFeedback';
import { demoCoaches } from '../../data/demo/coaches';
import { demoParents } from '../../data/demo/parents';
import { demoPlayers } from '../../data/demo/players';
import { demoSessions } from '../../data/demo/sessions';
import { getCoach, getGroup, getLatestPlayerMetrics, getSport } from '../../data/demo/selectors';
import type { BilingualText, Coach, CoachFeedback, Parent, Payment, Player, Session, Sport, Subscription, TrainingGroup } from '../../domain/contracts';
import { productionAuthGateway, type PlayerAuthSession } from './auth/PlayerAuthGateway';

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

/** The canonical Player domain exposes achievement names only; do not enrich them with invented metadata. */
export interface PlayerAchievementItem {
  id: string;
  title: BilingualText;
}

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
  metrics: ReturnType<typeof getLatestPlayerMetrics>;
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
  activePlayerId: string | null;
  setActivePlayerId: (id: string) => void;
  switchPlayer: (id: string) => void;
  login: (athleteId?: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Player>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const PlayerSessionContext = createContext<PlayerSessionContextType | null>(null);
const INITIAL_DOCUMENTS: PlayerDocumentItem[] = [];
const EMPTY_SUBSCRIPTIONS: Subscription[] = [];
const EMPTY_PAYMENTS: Payment[] = [];
const EMPTY_MESSAGES: PlayerChatThread[] = [];

function isStoredAuthSession(value: unknown): value is PlayerAuthSession {
  if (typeof value !== 'object' || value === null) return false;
  if (!('userId' in value) || !('playerId' in value) || !('createdAt' in value) || !('provider' in value)) return false;
  return typeof value.userId === 'string'
    && typeof value.playerId === 'string'
    && typeof value.createdAt === 'string'
    && (value.provider === 'preview' || value.provider === 'production');
}

function readStoredAuthSession(): PlayerAuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('uos:player-portal:session');
  if (!raw) return null;
  try {
    const candidate: unknown = JSON.parse(raw);
    if (!isStoredAuthSession(candidate)) return null;
    if (candidate.provider === 'production' && !productionAuthGateway.isProductionConfigured()) return null;
    return candidate;
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  localStorage.removeItem('uos:player-portal:session');
  localStorage.removeItem('uos:player-portal:active-id');
  localStorage.setItem('uos:player-portal:auth', 'false');
}

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useState<PlayerAuthSession | null>(() => readStoredAuthSession());
  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(() => readStoredAuthSession()?.playerId ?? null);
  const [profilePatches, setProfilePatches] = useState<Record<string, Partial<Player>>>(() => {
    try {
      const raw = localStorage.getItem('uos:player-portal:profile-patches');
      return raw ? JSON.parse(raw) as Record<string, Partial<Player>> : {};
    } catch {
      return {};
    }
  });

  const isAuthenticated = Boolean(authSession?.playerId && activePlayerId === authSession.playerId);

  const { basePlayer, isPlayerNotFound } = useMemo(() => {
    if (!activePlayerId) return { basePlayer: null, isPlayerNotFound: false };
    const found = demoPlayers.find((candidate) => candidate.id === activePlayerId);
    return found ? { basePlayer: found, isPlayerNotFound: false } : { basePlayer: null, isPlayerNotFound: true };
  }, [activePlayerId]);

  const player = useMemo(() => {
    if (!basePlayer) return null;
    return { ...basePlayer, ...(profilePatches[basePlayer.id] ?? {}) };
  }, [basePlayer, profilePatches]);

  const sport = useMemo(() => player ? getSport(player.sportId) : undefined, [player]);
  const group = useMemo(() => player?.groupId ? getGroup(player.groupId) : undefined, [player]);
  const coach = useMemo(() => {
    if (!player) return undefined;
    const assignedId = player.coachIds.at(0) ?? group?.coachIds.at(0);
    return assignedId ? getCoach(assignedId) : undefined;
  }, [group, player]);

  const allCoaches = useMemo(() => {
    if (!player) return [];
    const assignedIds = new Set([...(player.coachIds ?? []), ...(group?.coachIds ?? [])]);
    return demoCoaches.filter((candidate) => assignedIds.has(candidate.id));
  }, [group, player]);

  const parent = useMemo(() => player ? demoParents.find((candidate) => candidate.playerIds.includes(player.id)) : undefined, [player]);
  const sessions = useMemo(() => {
    if (!player?.groupId) return [];
    return demoSessions.filter((session) => session.groupId === player.groupId);
  }, [player]);
  const attendanceRecords = useMemo(() => player?.attendanceRecords ?? [], [player]);

  const attendanceStats = useMemo(() => {
    const counts = attendanceRecords.reduce<Record<string, number>>((accumulator, record) => {
      accumulator[record.status] = (accumulator[record.status] ?? 0) + 1;
      return accumulator;
    }, {});
    const present = counts.present ?? 0;
    const late = counts.late ?? 0;
    const absent = counts.absent ?? 0;
    const excused = counts.excused ?? 0;
    const total = attendanceRecords.length;
    const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : null;
    const sorted = [...attendanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    for (const record of sorted) {
      if (record.status !== 'present') break;
      streak += 1;
    }
    return { present, late, absent, excused, total, rate, streak };
  }, [attendanceRecords]);

  const metrics = useMemo(() => player ? getLatestPlayerMetrics(player.id) : [], [player]);
  const overallScore = useMemo(() => {
    const values = metrics.flatMap((metric) => typeof metric.current?.value === 'number' ? [metric.current.value] : []);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  }, [metrics]);

  const feedback = useMemo(() => player ? demoCoachFeedback.filter((item) => item.playerId === player.id) : [], [player]);
  const achievements = useMemo<PlayerAchievementItem[]>(() => player?.achievements.map((title, index) => ({ id: `achievement-${player.id}-${index}`, title })) ?? [], [player]);

  const derivedNotifications = useMemo<PlayerNotificationItem[]>(() => {
    if (!player) return [];
    const items: PlayerNotificationItem[] = [];
    const latestFeedback = [...feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).at(0);
    if (latestFeedback) {
      items.push({
        id: `notif-feedback-${latestFeedback.id}`,
        title: { en: 'Coach feedback available', ar: 'تتوفر ملاحظات المدرب' },
        description: latestFeedback.summary,
        category: 'feedback',
        timestamp: latestFeedback.createdAt,
        isRead: false,
        actionUrl: '/player/feedback',
      });
    }
    const nextSession = sessions
      .filter((session) => new Date(session.startsAt).getTime() >= Date.now())
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .at(0);
    if (nextSession) {
      const time = new Date(nextSession.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      items.push({
        id: `notif-session-${nextSession.id}`,
        title: { en: 'Upcoming training session', ar: 'حصة تدريبية قادمة' },
        description: { en: `Next session starts at ${time}`, ar: `تبدأ الحصة القادمة في ${time}` },
        category: 'schedule',
        timestamp: nextSession.startsAt,
        isRead: false,
        actionUrl: `/player/session/${nextSession.id}`,
      });
    }
    return items;
  }, [feedback, player, sessions]);

  const [notifications, setNotifications] = useState<PlayerNotificationItem[]>([]);
  useEffect(() => setNotifications(derivedNotifications), [derivedNotifications]);

  const applyPreviewPlayer = (id: string) => {
    const found = demoPlayers.some((candidate) => candidate.id === id);
    if (!found || authSession?.provider !== 'preview') return;
    const nextSession: PlayerAuthSession = { ...authSession, userId: `preview-user-${id}`, playerId: id, createdAt: new Date().toISOString() };
    localStorage.setItem('uos:player-portal:session', JSON.stringify(nextSession));
    localStorage.setItem('uos:player-portal:active-id', id);
    localStorage.setItem('uos:player-portal:auth', 'true');
    setAuthSession(nextSession);
    setActivePlayerIdState(id);
  };

  const login = (athleteId?: string) => {
    const storedSession = readStoredAuthSession();
    const id = athleteId ?? storedSession?.playerId;
    if (!storedSession?.playerId || !id || storedSession.playerId !== id || !demoPlayers.some((candidate) => candidate.id === id)) {
      clearStoredAuth();
      setAuthSession(null);
      setActivePlayerIdState(null);
      return;
    }
    setAuthSession(storedSession);
    setActivePlayerIdState(id);
    localStorage.setItem('uos:player-portal:active-id', id);
    localStorage.setItem('uos:player-portal:auth', 'true');
  };

  const logout = () => {
    clearStoredAuth();
    setAuthSession(null);
    setActivePlayerIdState(null);
  };

  const updateProfile = (patch: Partial<Player>) => {
    if (!player) return;
    setProfilePatches((current) => {
      const next = { ...current, [player.id]: { ...(current[player.id] ?? {}), ...patch } };
      localStorage.setItem('uos:player-portal:profile-patches', JSON.stringify(next));
      return next;
    });
  };

  const unreadNotificationCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  return (
    <PlayerSessionContext.Provider value={{
      player,
      isPlayerNotFound,
      allPlayers: demoPlayers,
      sport,
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
      subscriptions: EMPTY_SUBSCRIPTIONS,
      payments: EMPTY_PAYMENTS,
      documents: INITIAL_DOCUMENTS,
      notifications,
      unreadNotificationCount,
      messages: EMPTY_MESSAGES,
      achievements,
      isAuthenticated,
      activePlayerId,
      setActivePlayerId: applyPreviewPlayer,
      switchPlayer: applyPreviewPlayer,
      login,
      logout,
      updateProfile,
      markNotificationRead: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item)),
      markAllNotificationsRead: () => setNotifications((current) => current.map((item) => ({ ...item, isRead: true }))),
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
