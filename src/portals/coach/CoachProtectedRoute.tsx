import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import { PortalRouteLoader, PortalRuntimeError } from '../../components/portal/PortalRouteState';
import { clientShowcaseMode } from '../../lib/preview-guard';
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
    login,
  } = useCoachSession();
  const { gateway, mode } = useAdminData();
  const location = useLocation();
  const showcase = clientShowcaseMode();
  const [showcaseBootstrapped, setShowcaseBootstrapped] = useState(!showcase);

  useEffect(() => {
    if (!showcase || loading || isAuthenticated || mode !== 'preview') {
      if (!showcase || isAuthenticated) setShowcaseBootstrapped(true);
      return;
    }

    let active = true;
    setShowcaseBootstrapped(false);
    void gateway.listCoaches({ page: 1, pageSize: 50 })
      .then((result) => {
        if (!active) return;
        const target = result.items.find((item) => item.status === 'active') ?? result.items[0];
        if (target) login(target.id, 'preview');
        setShowcaseBootstrapped(true);
      })
      .catch(() => {
        if (active) setShowcaseBootstrapped(true);
      });

    return () => { active = false; };
  }, [gateway, isAuthenticated, loading, login, mode, showcase]);

  if (error) {
    return <PortalRuntimeError portal="coach" onRetry={() => window.location.reload()} />;
  }
  if (!showcaseBootstrapped || loading) return <PortalRouteLoader portal="coach" />;

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
