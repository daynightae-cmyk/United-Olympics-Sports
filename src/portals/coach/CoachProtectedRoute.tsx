import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortalRouteLoader, PortalRuntimeError } from '../../components/portal/PortalRouteState';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const {
    isAuthenticated,
    isPreviewSession,
    coach,
    loading,
    error,
    authorizedGroupIds,
    authorizedPlayerIds,
  } = useCoachSession();
  const location = useLocation();

  if (error) {
    return <PortalRuntimeError portal="coach" onRetry={() => window.location.reload()} />;
  }
  if (loading) return <PortalRouteLoader portal="coach" />;

  if (!isAuthenticated || !coach) {
    return <Navigate to="/coach/login" state={{ from: location }} replace />;
  }

  const playerMatch = location.pathname.match(/^\/coach\/players\/([^/]+)$/);
  if (playerMatch && !isPreviewSession) {
    const playerId = decodeURIComponent(playerMatch[1]);
    if (!authorizedPlayerIds.includes(playerId)) return <Navigate to="/coach/players" replace />;
  }

  const groupMatch = location.pathname.match(/^\/coach\/groups\/([^/]+)$/);
  if (groupMatch) {
    const groupId = decodeURIComponent(groupMatch[1]);
    const allowedGroups = isPreviewSession ? coach.groupIds : authorizedGroupIds;
    if (!allowedGroups.includes(groupId)) return <Navigate to="/coach/groups" replace />;
  }

  return <>{children}</>;
}
