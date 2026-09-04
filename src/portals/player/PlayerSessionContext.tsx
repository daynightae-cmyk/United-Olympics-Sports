import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { demoPlayers } from '../../data/demo/players';
import { demoSports } from '../../data/demo/sports';
import { demoSessions } from '../../data/demo/sessions';
import { demoCoachFeedback } from '../../data/demo/coachFeedback';
import { demoParents } from '../../data/demo/parents';
import { demoCoaches } from '../../data/demo/coaches';
import { getSport, getGroup, getCoach, getLatestPlayerMetrics, getPlayerOverall } from '../../data/demo/selectors';
import type { Player, Sport, TrainingGroup, Coach, Parent, Session, CoachFeedback, BilingualText, Subscription, Payment } from '../../domain/contracts';

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
  /**
   * Tier is only meaningful when the record carries one. Domain achievement
   * entries are bare names, so derivations use 'recorded' (neutral) instead
   * of fabricating gold/silver/bronze claims. Not rendered as a badge.
   */
  tier: 'gold' | 'silver' | 'bronze' | 'diamond' | 'recorded';
  category: BilingualText;
  awardedAt?: string;
  isLocked: boolean;
  criteria?: BilingualText;
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
  attendanceStats: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    rate: number;
    streak: number;
  };
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

// Canonical repository starts with no fabricated documents
const INITIAL_DOCUMENTS: PlayerDocumentItem[] = [];

export function PlayerSessionProvider({ children }: { children: React.ReactNode }) {
  // Authentication defaults strictly to false unless authenticated in storage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('uos:player-portal:auth');
    return saved === 'true';
  });

  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(() => {
    return localStorage.getItem('uos:player-portal:active-id');
  });

  const [profilePatches, setProfilePatches] = useState<Record<string, Partial<Player>>>(() => {
    try {
      const raw = localStorage.getItem('uos:player-portal:profile-patches');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Base player resolution:
  // Authenticated player ID -> explicit preview player ID -> null if not found
  const { basePlayer, isPlayerNotFound } = useMemo(() => {
    if (!activePlayerId) {
      return { basePlayer: null, isPlayerNotFound: false };
    }
    const found = demoPlayers.find(p => p.id === activePlayerId);
    if (!found) {
      return { basePlayer: null, isPlayerNotFound: true };
    }
    return { basePlayer: found, isPlayerNotFound: false };
  }, [activePlayerId]);

  const player = useMemo(() => {
    if (!basePlayer) return null;
    const patch = profilePatches[basePlayer.id] || {};
    return { ...basePlayer, ...patch };
  }, [basePlayer, profilePatches]);

  const sport = useMemo(() => (player ? getSport(player.sportId) : undefined), [player]);
  const group = useMemo(() => (player?.groupId ? getGroup(player.groupId) : undefined), [player]);

  const coach = useMemo(() => {
    if (!player) return undefined;
    const primaryId = player.coachIds[0] || (group?.coachIds && group.coachIds[0]);
    return primaryId ? getCoach(primaryId) : undefined;
  }, [player, group]);

  const allCoaches = useMemo(() => {
    if (!player) return [];
    const assignedIds = new Set<string>([
      ...(player.coachIds ?? []),
      ...(group?.coachIds ?? []),
    ]);
    return demoCoaches.filter((candidate) => assignedIds.has(candidate.id));
  }, [player, group]);

  const parent = useMemo(() => {
    if (!player) return undefined;
    return demoParents.find(p => p.playerIds.includes(player.id));
  }, [player]);

  const sessions = useMemo(() => {
    if (!player || !player.groupId) return [];
    // Strict session privacy: strictly match player's assigned training group
    return demoSessions.filter(s => s.groupId === player.groupId);
  }, [player]);

  const attendanceRecords = useMemo(() => player?.attendanceRecords || [], [player]);

  // Calculated attendance streak with strict chronological ordering
  const attendanceStats = useMemo(() => {
    const counts = attendanceRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const present = counts.present || 0;
    const late = counts.late || 0;
    const absent = counts.absent || 0;
    const excused = counts.excused || 0;
    const total = attendanceRecords.length;
    const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;

    // Sort chronologically descending (latest session first)
    const sorted = [...attendanceRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    for (const rec of sorted) {
      if (rec.status === 'present') {
        streak++;
      } else {
        break;
      }
    }

    return { present, late, absent, excused, total, rate, streak };
  }, [attendanceRecords]);

  const metrics = useMemo(() => (player ? getLatestPlayerMetrics(player.id) : []), [player]);
  const overallScore = useMemo(() => (player && metrics.length > 0 ? getPlayerOverall(player.id) : null), [player, metrics]);

  const feedback = useMemo(() => {
    if (!player) return [];
    // Strict feedback privacy: strictly match player ID to prevent data leakage
    return demoCoachFeedback.filter(f => f.playerId === player.id);
  }, [player]);

  // Real approved source data OR empty arrays / unavailable state:
  // No fake payment or subscription fixtures attached to player portal
  const subscriptions = useMemo((): Subscription[] => [], []);
  const payments = useMemo((): Payment[] => [], []);

  // Achievements derived strictly from canonical player.achievements (bare
  // bilingual names). No tier, category, date or locked status is invented:
  // category names the factual source, tier stays neutral, award date stays
  // unset so surfaces render "On Athlete Record" instead of a fake date.
  const achievements = useMemo((): PlayerAchievementItem[] => {
    if (!player) return [];

    return (player.achievements || []).map((ach, idx) => ({
      id: `ach-record-${player.id}-${idx}`,
      title: ach,
      description: {
        en: 'Listed on the athlete development record.',
        ar: 'مدرج في سجل تطوير الرياضي.',
      },
      tier: 'recorded' as const,
      category: { en: 'Athlete record', ar: 'سجل اللاعب' },
      isLocked: false,
    }));
  }, [player]);

  // Notifications programmatically derived from real canonical records
  const derivedNotifications = useMemo((): PlayerNotificationItem[] => {
    if (!player) return [];
    const notifs: PlayerNotificationItem[] = [];

    // Derive from coach feedback
    if (feedback.length > 0) {
      const latestFb = feedback[0];
      notifs.push({
        id: `notif-fb-${latestFb.id}`,
        title: { en: 'Coach Feedback Available', ar: 'تتوفر ملاحظات المدرب' },
        description: latestFb.summary,
        category: 'feedback',
        timestamp: latestFb.createdAt,
        isRead: false,
        actionUrl: '/player/feedback',
      });
    }

    // Derive from upcoming sessions
    const now = new Date();
    const upcoming = sessions.filter(s => new Date(s.startsAt) >= now);
    if (upcoming.length > 0) {
      const nextSession = upcoming[0];
      notifs.push({
        id: `notif-sess-${nextSession.id}`,
        title: { en: 'Upcoming Training Session', ar: 'حصة تدريبية قادمة' },
        description: {
          en: `Next session starts at ${new Date(nextSession.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          ar: `تبدأ الحصة القادمة في ${new Date(nextSession.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        },
        category: 'schedule',
        timestamp: nextSession.startsAt,
        isRead: false,
        actionUrl: `/player/schedule/${nextSession.id}`,
      });
    }

    return notifs;
  }, [player, feedback, sessions]);

  const [notifications, setNotifications] = useState<PlayerNotificationItem[]>([]);

  useEffect(() => {
    setNotifications(derivedNotifications);
  }, [derivedNotifications]);

  // Messages: No fabricated communications; starts empty
  const [threads, setThreads] = useState<PlayerChatThread[]>([]);

  const setActivePlayerId = (id: string) => {
    setActivePlayerIdState(id);
    localStorage.setItem('uos:player-portal:active-id', id);
  };

  const login = (athleteId?: string) => {
    const idToUse = athleteId || activePlayerId;
    if (!idToUse) {
      setIsAuthenticated(false);
      localStorage.setItem('uos:player-portal:auth', 'false');
      return;
    }
    const found = demoPlayers.find(p => p.id === idToUse);
    if (!found) {
      setIsAuthenticated(false);
      localStorage.setItem('uos:player-portal:auth', 'false');
      return;
    }
    setActivePlayerId(idToUse);
    setIsAuthenticated(true);
    localStorage.setItem('uos:player-portal:auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('uos:player-portal:auth', 'false');
    localStorage.removeItem('uos:player-portal:session');
  };

  const updateProfile = (patch: Partial<Player>) => {
    if (!player) return;
    setProfilePatches(prev => {
      const next = {
        ...prev,
        [player.id]: {
          ...(prev[player.id] || {}),
          ...patch,
        },
      };
      localStorage.setItem('uos:player-portal:profile-patches', JSON.stringify(next));
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  return (
    <PlayerSessionContext.Provider
      value={{
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
        subscriptions,
        payments,
        documents: INITIAL_DOCUMENTS,
        notifications,
        unreadNotificationCount,
        messages: threads,
        achievements,
        isAuthenticated,
        activePlayerId,
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
  if (!context) {
    throw new Error('usePlayerSession must be used within a PlayerSessionProvider');
  }
  return context;
}
