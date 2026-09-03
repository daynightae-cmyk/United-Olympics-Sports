import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePlayerSession } from './PlayerSessionContext';

interface PlayerProtectedRouteProps {
  children: React.ReactNode;
}

export function PlayerProtectedRoute({ children }: PlayerProtectedRouteProps) {
  const { isAuthenticated } = usePlayerSession();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login with return state
    return <Navigate to="/player/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
