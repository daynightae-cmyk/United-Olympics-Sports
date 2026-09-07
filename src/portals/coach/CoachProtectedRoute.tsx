import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortalRouteLoader } from '../../components/portal/PortalRouteState';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const { isAuthenticated, coach, loading } = useCoachSession();
  const location = useLocation();

  if (loading) return <PortalRouteLoader portal="coach" />;

  if (!isAuthenticated || !coach) {
    return <Navigate to="/coach/login" state={{ from: location }} replace />;
  }

  const groupMatch = location.pathname.match(/^\/coach\/groups\/([^/]+)$/);
  if (groupMatch && !coach.groupIds.includes(decodeURIComponent(groupMatch[1]))) {
    return <Navigate to="/coach/groups" replace />;
  }

  return <>{children}</>;
}
