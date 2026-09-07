import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePlayers } from '../../admin/data/adminHooks';
import { PortalRouteLoader } from '../../components/portal/PortalRouteState';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const { isAuthenticated, coach, loading: coachLoading } = useCoachSession();
  const playerQuery = usePlayers({ page: 1, pageSize: 2000 });
  const location = useLocation();

  if (coachLoading || playerQuery.loading) return <PortalRouteLoader portal="coach" />;

  if (!isAuthenticated || !coach) {
    return <Navigate to="/coach/login" state={{ from: location }} replace />;
  }

  const playerMatch = location.pathname.match(/^\/coach\/players\/([^/]+)$/);
  if (playerMatch) {
    const player = playerQuery.data.items.find((item) => item.id === decodeURIComponent(playerMatch[1]));
    const inCoachScope = Boolean(player?.groupId && coach.groupIds.includes(player.groupId));
    if (!inCoachScope) return <Navigate to="/coach/players" replace />;
  }

  const groupMatch = location.pathname.match(/^\/coach\/groups\/([^/]+)$/);
  if (groupMatch && !coach.groupIds.includes(decodeURIComponent(groupMatch[1]))) {
    return <Navigate to="/coach/groups" replace />;
  }

  return <>{children}</>;
}
