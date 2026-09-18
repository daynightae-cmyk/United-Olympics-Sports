import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import { PortalRouteLoader, PortalRuntimeError } from '../../components/portal/PortalRouteState';
import { fetchPortalIdentity } from '../../lib/auth-client';
import { clientShowcaseMode, previewModeAllowed } from '../../lib/preview-guard';
import { usePlayerSession } from './PlayerSessionContext';

interface PlayerProtectedRouteProps {
  children: React.ReactNode;
}

const PLAYER_SESSION_KEY = 'uos:player-portal:session';
const PLAYER_ACTIVE_ID_KEY = 'uos:player-portal:active-id';
const PLAYER_AUTH_KEY = 'uos:player-portal:auth';

export function PlayerProtectedRoute({ children }: PlayerProtectedRouteProps) {
  const { isAuthenticated, isPreviewSession, activePlayerId, loading, error, logout, login } = usePlayerSession();
  const { gateway, mode } = useAdminData();
  const location = useLocation();
  const showcase = clientShowcaseMode();
  const previewRuntime = showcase || previewModeAllowed(import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true');
  const [productionValidated, setProductionValidated] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [showcaseBootstrapped, setShowcaseBootstrapped] = useState(!showcase);

  useEffect(() => {
    if (!showcase || loading || isAuthenticated || mode !== 'preview') {
      if (!showcase || isAuthenticated) setShowcaseBootstrapped(true);
      return;
    }

    let active = true;
    setShowcaseBootstrapped(false);
    void gateway.listPlayers({ page: 1, pageSize: 50 })
      .then((result) => {
        if (!active) return;
        const player = result.items[0];
        if (!player) {
          setShowcaseBootstrapped(true);
          return;
        }
        try {
          window.localStorage.setItem(PLAYER_SESSION_KEY, JSON.stringify({
            userId: `client-showcase-${player.id}`,
            playerId: player.id,
            provider: 'preview',
            createdAt: new Date().toISOString(),
          }));
          window.localStorage.setItem(PLAYER_ACTIVE_ID_KEY, player.id);
          window.localStorage.setItem(PLAYER_AUTH_KEY, 'true');
        } catch {
          // Storage can be unavailable in privacy modes; the in-memory session still proceeds.
        }
        login(player.id);
        setShowcaseBootstrapped(true);
      })
      .catch(() => {
        if (active) setShowcaseBootstrapped(true);
      });

    return () => { active = false; };
  }, [gateway, isAuthenticated, loading, login, mode, showcase]);

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

  if (!showcaseBootstrapped || loading || (isAuthenticated && productionValidated === null)) {
    return <PortalRouteLoader portal="player" />;
  }

  if (!isAuthenticated || productionValidated === false) {
    return <Navigate to="/player/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
