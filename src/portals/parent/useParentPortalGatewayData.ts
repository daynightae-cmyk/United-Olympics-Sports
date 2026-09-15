import { useEffect, useMemo, useState } from 'react';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import type {
  BranchViewModel,
  MessageViewModel,
  ParentViewModel,
  PaymentViewModel,
  PlayerViewModel,
  ProgramViewModel,
  SessionViewModel,
  SportViewModel,
  SubscriptionViewModel,
  TrainingGroupViewModel,
} from '../../admin/data/viewModels';
import { fetchParentPortalSnapshot, fetchPlayerPortalSnapshot, type PlayerPortalSnapshot } from '../../lib/portal-data-client';
import { readParentSession } from './parentData';

function bi(en: string, ar = en) { return { en, ar }; }

function attendanceRate(snapshot: PlayerPortalSnapshot): number {
  if (!snapshot.attendance.length) return 0;
  const attended = snapshot.attendance.filter((item) => item.status === 'present' || item.status === 'late').length;
  return Math.round((attended / snapshot.attendance.length) * 100);
}

function performanceScore(snapshot: PlayerPortalSnapshot): number | null {
  const scores = snapshot.performance.map((item) => item.score).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  return scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
}

function scopedPlayer(snapshot: PlayerPortalSnapshot): PlayerViewModel {
  return {
    id: snapshot.player.id,
    nameEn: snapshot.player.fullName,
    nameAr: snapshot.player.fullName,
    sportId: '',
    groupId: snapshot.schedule[0]?.groupId,
    programId: snapshot.subscriptions[0]?.programId,
    level: bi('Not recorded', 'غير مسجل'),
    status: bi('Active', 'نشط'),
    attendanceRate: attendanceRate(snapshot),
    performanceScore: performanceScore(snapshot),
  };
}

function scopedSessions(snapshots: PlayerPortalSnapshot[]): SessionViewModel[] {
  const seen = new Set<string>();
  const rows: SessionViewModel[] = [];
  for (const snapshot of snapshots) {
    for (const session of snapshot.schedule) {
      if (seen.has(session.id)) continue;
      seen.add(session.id);
      rows.push({ id: session.id, sportId: '', groupId: session.groupId, startsAt: session.startsAt, status: bi(session.status), coachIds: [] });
    }
  }
  return rows.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function scopedSubscriptions(snapshots: PlayerPortalSnapshot[]): SubscriptionViewModel[] {
  return snapshots.flatMap((snapshot) => snapshot.subscriptions.map((subscription) => ({
    id: subscription.id,
    playerId: snapshot.player.id,
    programId: subscription.programId,
    branchId: snapshot.player.branchId ?? '',
    plan: bi('Recorded subscription', 'اشتراك مسجل'),
    status: subscription.status === 'active' || subscription.status === 'pending' || subscription.status === 'expired' || subscription.status === 'cancelled'
      ? subscription.status
      : 'pending',
    startDate: '',
    amount: (subscription.amountMinor ?? 0) / 100,
    currency: subscription.currency ?? 'AED',
  })));
}

type ParentDataState = {
  parent: ParentViewModel | null;
  children: PlayerViewModel[];
  familySessions: SessionViewModel[];
  familySubscriptions: SubscriptionViewModel[];
  familyPayments: PaymentViewModel[];
  familyMessages: MessageViewModel[];
  sports: SportViewModel[];
  groups: TrainingGroupViewModel[];
  programs: ProgramViewModel[];
  branches: BranchViewModel[];
};

const EMPTY: ParentDataState = {
  parent: null,
  children: [],
  familySessions: [],
  familySubscriptions: [],
  familyPayments: [],
  familyMessages: [],
  sports: [],
  groups: [],
  programs: [],
  branches: [],
};

export function useParentPortalGatewayData() {
  const { gateway, mode } = useAdminData();
  const session = readParentSession();
  const parentId = session?.parentId ?? '';
  const [data, setData] = useState<ParentDataState>(EMPTY);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!session) {
      setData(EMPTY);
      setLoading(false);
      setError(null);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);

    if (session.provider === 'production') {
      void fetchParentPortalSnapshot()
        .then(async (family) => {
          const allowed = new Set(family.parent.playerIds);
          const childIds = family.children.map((child) => child.id).filter((id) => allowed.has(id));
          const snapshots = await Promise.all(childIds.map((id) => fetchPlayerPortalSnapshot(id)));
          if (!active) return;
          setData({
            ...EMPTY,
            parent: {
              id: family.parent.id,
              nameEn: family.parent.fullName,
              nameAr: family.parent.fullName,
              playerIds: childIds,
              playerCount: childIds.length,
              preferredLanguage: 'en',
              status: 'active',
            },
            children: snapshots.map(scopedPlayer),
            familySessions: scopedSessions(snapshots),
            familySubscriptions: scopedSubscriptions(snapshots),
          });
        })
        .catch((caught) => {
          if (!active) return;
          setData(EMPTY);
          setError(caught instanceof Error ? caught : new Error('PARENT_PORTAL_DATA_FAILED'));
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }

    if (mode !== 'preview') {
      setData(EMPTY);
      setLoading(false);
      setError(new Error('PREVIEW_PROVIDER_DISABLED'));
      return () => { active = false; };
    }

    void Promise.all([
      gateway.listParents({ page: 1, pageSize: 500 }),
      gateway.listPlayers({ page: 1, pageSize: 1000 }),
      gateway.listSessions({ page: 1, pageSize: 1000 }),
      gateway.listSubscriptions({ page: 1, pageSize: 1000 }),
      gateway.listPayments({ page: 1, pageSize: 1000 }),
      gateway.listMessages({ page: 1, pageSize: 1000 }),
      gateway.listSports({ page: 1, pageSize: 200 }),
      gateway.listGroups({ page: 1, pageSize: 500 }),
      gateway.listPrograms({ page: 1, pageSize: 500 }),
      gateway.listBranches({ page: 1, pageSize: 200 }),
    ])
      .then(([parents, players, sessions, subscriptions, payments, messages, sports, groups, programs, branches]) => {
        if (!active) return;
        const parent = parents.items.find((item) => item.id === parentId) ?? null;
        const children = parent ? parent.playerIds.map((id) => players.items.find((player) => player.id === id)).filter((item): item is PlayerViewModel => Boolean(item)) : [];
        const childIds = new Set(children.map((child) => child.id));
        const groupIds = new Set(children.map((child) => child.groupId).filter((id): id is string => Boolean(id)));
        const familyRecipientIds = new Set([parentId, ...childIds]);
        setData({
          parent,
          children,
          familySessions: sessions.items.filter((item) => groupIds.has(item.groupId)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
          familySubscriptions: subscriptions.items.filter((item) => childIds.has(item.playerId)),
          familyPayments: payments.items.filter((item) => childIds.has(item.playerId)),
          familyMessages: messages.items.filter((item) => familyRecipientIds.has(item.fromId) || item.toIds.some((id) => familyRecipientIds.has(id))).sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
          sports: sports.items,
          groups: groups.items,
          programs: programs.items,
          branches: branches.items,
        });
      })
      .catch((caught) => {
        if (!active) return;
        setData(EMPTY);
        setError(caught instanceof Error ? caught : new Error('PARENT_PREVIEW_DATA_FAILED'));
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [gateway, mode, parentId, session?.provider]);

  return useMemo(() => ({ parentId, ...data, loading, error }), [data, error, loading, parentId]);
}
