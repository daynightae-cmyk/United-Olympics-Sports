import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortalRouteLoader, PortalRuntimeError } from '../../components/portal/PortalRouteState';
import { fetchPortalIdentity } from '../../lib/auth-client';
import { usePlayerSession } from './PlayerSessionContext';

interface PlayerProtectedRouteProps {
  children: React.ReactNode;
}

export function PlayerProtectedRoute({ children }: PlayerProtectedRouteProps) {
  const { isAuthenticated, isPreviewSession, activePlayerId, loading, error, logout } = usePlayerSession();
  const location = useLocation();
  const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';
  const [productionValidated, setProductionValidated] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setValidationError(false);
    if (loading || error || !isAuthenticated || !activePlayerId) {
      setProductionValidated(null);
      return;
    }

    if (isPreviewSession) {
      if (!previewRuntime) {
        setProductionValidated(false);
        logout();
      } else {
        setProductionValidated(true);
      }
      return;
    }

    let active = true;
    setProductionValidated(null);
    void fetchPortalIdentity()
      .then((portal) => {
        if (!active) return;
        const valid = portal.bindings.playerIds.length === 1 && portal.bindings.playerIds[0] === activePlayerId;
        setProductionValidated(valid);
        if (!valid) logout();
      })
      .catch(() => {
        if (!active) return;
        setProductionValidated(null);
        setValidationError(true);
      });
    return () => { active = false; };
  }, [activePlayerId, error, isAuthenticated, isPreviewSession, loading, logout, previewRuntime, revision]);

  if (error || validationError) {
    return (
      <PortalRuntimeError
        portal="player"
        onRetry={error ? () => window.location.reload() : () => setRevision((value) => value + 1)}
      />
    );
  }
  if (loading || (isAuthenticated && productionValidated === null)) return <PortalRouteLoader portal="player" />;

  if (!isAuthenticated || productionValidated === false) {
    return <Navigate to="/player/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}