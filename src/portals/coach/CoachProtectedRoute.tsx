import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { demoPlayers } from '../../data/demo/players';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const { isAuthenticated, coach } = useCoachSession();
  const location = useLocation();

  if (!isAuthenticated || !coach) {
    return <Navigate to="/coach/login" state={{ from: location }} replace />;
  }

  const playerMatch = location.pathname.match(/^\/coach\/players\/([^/]+)$/);
  if (playerMatch) {
    const player = demoPlayers.find((item) => item.id === decodeURIComponent(playerMatch[1]));
    const inCoachScope = player && (coach.playerIds.includes(player.id) || coach.groupIds.includes(player.groupId ?? ''));
    if (!inCoachScope) return <Navigate to="/coach/players" replace />;
  }

  const groupMatch = location.pathname.match(/^\/coach\/groups\/([^/]+)$/);
  if (groupMatch && !coach.groupIds.includes(decodeURIComponent(groupMatch[1]))) {
    return <Navigate to="/coach/groups" replace />;
  }

  return <>{children}</>;
}
