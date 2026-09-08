import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePlayers } from '../../admin/data/adminHooks';
import { PortalRouteLoader } from '../../components/portal/PortalRouteState';
import { fetchPortalIdentity } from '../../lib/auth-client';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const { isAuthenticated, isPreviewSession, activeCoachId, coach, loading: coachLoading, logout } = useCoachSession();
  const playerQuery = usePlayers({ page: 1, pageSize: 2000 });
  const location = useLocation();
  const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';
  const [validated, setValidated] = useState<boolean | null>(null);

  useEffect(() => {
    if (coachLoading || !isAuthenticated || !activeCoachId) {
      setValidated(null);
      return;
    }
    if (isPreviewSession) {
      if (!previewRuntime) {
        setValidated(false);
        logout();
      } else {
        setValidated(true);
      }
      return;
    }

    let active = true;
    setValidated(null);
    void fetchPortalIdentity()
      .then((portal) => {
        if (!active) return;
        const valid = portal.bindings.coachIds.length === 1 && portal.bindings.coachIds[0] === activeCoachId;
        setValidated(valid);
        if (!valid) logout();
      })
      .catch(() => {
        if (!active) return;
        setValidated(false);
        logout();
      });
    return () => { active = false; };
  }, [activeCoachId, coachLoading, isAuthenticated, isPreviewSession, logout, previewRuntime]);

  if (coachLoading || playerQuery.loading || (isAuthenticated && validated === null)) return <PortalRouteLoader portal="coach" />;

  if (!isAuthenticated || !coach || validated === false) {
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
