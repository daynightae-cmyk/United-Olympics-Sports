import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortalRouteLoader } from '../../components/portal/PortalRouteState';
import { usePlayerSession } from './PlayerSessionContext';

interface PlayerProtectedRouteProps {
  children: React.ReactNode;
}

export function PlayerProtectedRoute({ children }: PlayerProtectedRouteProps) {
  const { isAuthenticated, loading } = usePlayerSession();
  const location = useLocation();

  if (loading) return <PortalRouteLoader portal="player" />;

  if (!isAuthenticated) {
    return <Navigate to="/player/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
