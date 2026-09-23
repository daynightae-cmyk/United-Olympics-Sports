import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptionalPlayerSession } from './PlayerSessionContext';

export function PlayerProtectedRoute({ children }: { children: ReactNode }) {
  const session = useOptionalPlayerSession();
  const location = useLocation();
  if (!session) return <Navigate to="/player/login" replace state={{ from: location.pathname }} />;
  return children;
}
