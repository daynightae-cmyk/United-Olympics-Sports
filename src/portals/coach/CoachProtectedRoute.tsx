import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCoachSession } from './CoachSessionContext';

interface CoachProtectedRouteProps {
  children: React.ReactNode;
}

export function CoachProtectedRoute({ children }: CoachProtectedRouteProps) {
  const { isAuthenticated } = useCoachSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/coach/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
