import { useMemo } from 'react';
import {
  useBranches,
  useGroups,
  useMessages,
  useParents,
  usePayments,
  usePlayers,
  usePrograms,
  useSessions,
  useSports,
  useSubscriptions,
} from '../../admin/data/adminHooks';
import { readParentSession } from './parentData';

export function useParentPortalGatewayData() {
  const parentId = readParentSession()?.parentId ?? '';
  const parentQuery = useParents({ page: 1, pageSize: 500 });
  const playerQuery = usePlayers({ page: 1, pageSize: 1000 });
  const sessionQuery = useSessions({ page: 1, pageSize: 1000 });
  const subscriptionQuery = useSubscriptions({ page: 1, pageSize: 1000 });
  const paymentQuery = usePayments({ page: 1, pageSize: 1000 });
  const messageQuery = useMessages({ page: 1, pageSize: 1000 });
  const sportQuery = useSports({ page: 1, pageSize: 200 });
  const groupQuery = useGroups({ page: 1, pageSize: 500 });
  const programQuery = usePrograms({ page: 1, pageSize: 500 });
  const branchQuery = useBranches({ page: 1, pageSize: 200 });

  const parent = useMemo(
    () => parentQuery.data.items.find((item) => item.id === parentId) ?? null,
    [parentId, parentQuery.data.items],
  );

  const children = useMemo(() => {
    if (!parent) return [];
    return parent.playerIds
      .map((id) => playerQuery.data.items.find((player) => player.id === id))
      .filter((player): player is NonNullable<typeof player> => Boolean(player));
  }, [parent, playerQuery.data.items]);

  const childIds = useMemo(() => new Set(children.map((child) => child.id)), [children]);
  const familyRecipientIds = useMemo(() => new Set([parentId, ...childIds]), [childIds, parentId]);
  const groupIds = useMemo(
    () => new Set(children.map((child) => child.groupId).filter((id): id is string => Boolean(id))),
    [children],
  );

  const familySessions = useMemo(
    () => sessionQuery.data.items
      .filter((session) => groupIds.has(session.groupId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [groupIds, sessionQuery.data.items],
  );

  const familySubscriptions = useMemo(
    () => subscriptionQuery.data.items.filter((subscription) => childIds.has(subscription.playerId)),
    [childIds, subscriptionQuery.data.items],
  );

  const familyPayments = useMemo(
    () => paymentQuery.data.items.filter((payment) => childIds.has(payment.playerId)),
    [childIds, paymentQuery.data.items],
  );

  const familyMessages = useMemo(
    () => messageQuery.data.items
      .filter((message) => familyRecipientIds.has(message.fromId) || message.toIds.some((id) => familyRecipientIds.has(id)))
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
    [familyRecipientIds, messageQuery.data.items],
  );

  const loading = [
    parentQuery,
    playerQuery,
    sessionQuery,
    subscriptionQuery,
    paymentQuery,
    messageQuery,
    sportQuery,
    groupQuery,
    programQuery,
    branchQuery,
  ].some((query) => query.loading);

  const error = [
    parentQuery.error,
    playerQuery.error,
    sessionQuery.error,
    subscriptionQuery.error,
    paymentQuery.error,
    messageQuery.error,
    sportQuery.error,
    groupQuery.error,
    programQuery.error,
    branchQuery.error,
  ].find(Boolean) ?? null;

  return {
    parentId,
    parent,
    children,
    familySessions,
    familySubscriptions,
    familyPayments,
    familyMessages,
    sports: sportQuery.data.items,
    groups: groupQuery.data.items,
    programs: programQuery.data.items,
    branches: branchQuery.data.items,
    loading,
    error,
  };
}
