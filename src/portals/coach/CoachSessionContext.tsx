import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCoaches } from '../../admin/data/adminHooks';
import type { CoachViewModel } from '../../admin/data/viewModels';
import { signOutEverywhere } from '../../lib/auth-client';

const PREVIEW_SESSION_KEY = 'uos:coach-portal:preview-session:v1';
const PRODUCTION_SESSION_KEY = 'uos:coach-portal:session:v1';

type CoachSessionProviderKind = 'production' | 'preview' | null;

export type CoachAuthorizationScope = {
  groupIds: string[];
  playerIds: string[];
};

type ProductionCoachSession = {
  coachId: string;
  provider: 'production';
  createdAt: string;
  authorizedGroupIds: string[];
  authorizedPlayerIds: string[];
};

interface CoachSessionContextValue {
  coach: CoachViewModel | undefined;
  allCoaches: CoachViewModel[];
  isAuthenticated: boolean;
  isPreviewSession: boolean;
  activeCoachId: string | undefined;
  authorizedGroupIds: string[];
  authorizedPlayerIds: string[];
  loading: boolean;
  error: Error | null;
  setActiveCoachId: (id: string) => void;
  login: (id?: string, provider?: Exclude<CoachSessionProviderKind, null>, scope?: CoachAuthorizationScope) => void;
  refreshProductionScope: (scope: CoachAuthorizationScope) => void;
  logout: () => void;
}

const CoachSessionContext = createContext<CoachSessionContextValue | undefined>(undefined);

function normalizeIds(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => value.trim()))];
}

function readStoredCoachSession(): { coachId?: string; provider: CoachSessionProviderKind; scope: CoachAuthorizationScope } {
  if (typeof window === 'undefined') return { provider: null, scope: { groupIds: [], playerIds: [] } };
  try {
    const raw = window.localStorage.getItem(PRODUCTION_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as Partial<ProductionCoachSession>;
      if (session.provider === 'production' && typeof session.coachId === 'string' && session.coachId) {
        return {
          coachId: session.coachId,
          provider: 'production',
          scope: {
            groupIds: normalizeIds(session.authorizedGroupIds),
            playerIds: normalizeIds(session.authorizedPlayerIds),
          },
        };
      }
    }
  } catch {
    window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
  }

  const previewId = window.sessionStorage.getItem(PREVIEW_SESSION_KEY) ?? undefined;
  return previewId
    ? { coachId: previewId, provider: 'preview', scope: { groupIds: [], playerIds: [] } }
    : { provider: null, scope: { groupIds: [], playerIds: [] } };
}

export function CoachSessionProvider({ children }: { children: React.ReactNode }) {
  const coachQuery = useCoaches({ page: 1, pageSize: 500 });
  const allCoaches = useMemo(
    () => coachQuery.data.items.filter((item) => item.status === 'active'),
    [coachQuery.data.items],
  );
  const initial = useMemo(readStoredCoachSession, []);
  const [activeCoachId, setActiveCoachIdState] = useState<string | undefined>(initial.coachId);
  const [sessionProvider, setSessionProvider] = useState<CoachSessionProviderKind>(initial.provider);
  const [productionScope, setProductionScope] = useState<CoachAuthorizationScope>(initial.scope);

  const baseCoach = useMemo(
    () => activeCoachId ? allCoaches.find((item) => item.id === activeCoachId) : undefined,
    [activeCoachId, allCoaches],
  );

  const coach = useMemo(() => {
    if (!baseCoach) return undefined;
    if (sessionProvider !== 'production') return baseCoach;
    return { ...baseCoach, groupIds: productionScope.groupIds };
  }, [baseCoach, productionScope.groupIds, sessionProvider]);

  useEffect(() => {
    if (coachQuery.loading || !activeCoachId) return;
    if (!allCoaches.some((item) => item.id === activeCoachId)) {
      setActiveCoachIdState(undefined);
      setSessionProvider(null);
      setProductionScope({ groupIds: [], playerIds: [] });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
        window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
      }
    }
  }, [activeCoachId, allCoaches, coachQuery.loading]);

  const writeProductionSession = (id: string, scope: CoachAuthorizationScope) => {
    const normalizedScope = { groupIds: normalizeIds(scope.groupIds), playerIds: normalizeIds(scope.playerIds) };
    setProductionScope(normalizedScope);
    if (typeof window !== 'undefined') {
      const session: ProductionCoachSession = {
        coachId: id,
        provider: 'production',
        createdAt: new Date().toISOString(),
        authorizedGroupIds: normalizedScope.groupIds,
        authorizedPlayerIds: normalizedScope.playerIds,
      };
      window.localStorage.setItem(PRODUCTION_SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
    }
  };

  const persistCoachId = (id: string, provider: Exclude<CoachSessionProviderKind, null>, scope?: CoachAuthorizationScope) => {
    if (!allCoaches.some((item) => item.id === id)) return false;
    if (sessionProvider === 'production' && activeCoachId && id !== activeCoachId) return false;
    setActiveCoachIdState(id);
    setSessionProvider(provider);
    if (provider === 'production') {
      writeProductionSession(id, scope ?? { groupIds: [], playerIds: [] });
    } else if (typeof window !== 'undefined') {
      setProductionScope({ groupIds: [], playerIds: [] });
      window.sessionStorage.setItem(PREVIEW_SESSION_KEY, id);
      window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
    }
    return true;
  };

  const setActiveCoachId = (id: string) => {
    persistCoachId(id, sessionProvider ?? 'preview', productionScope);
  };

  const login = (
    id?: string,
    provider: Exclude<CoachSessionProviderKind, null> = 'preview',
    scope?: CoachAuthorizationScope,
  ) => {
    const idToUse = id ?? activeCoachId;
    if (!idToUse || !persistCoachId(idToUse, provider, scope)) logout();
  };

  const refreshProductionScope = (scope: CoachAuthorizationScope) => {
    if (sessionProvider !== 'production' || !activeCoachId) return;
    writeProductionSession(activeCoachId, scope);
  };

  const logout = () => {
    const wasProduction = sessionProvider === 'production';
    setActiveCoachIdState(undefined);
    setSessionProvider(null);
    setProductionScope({ groupIds: [], playerIds: [] });
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
      window.localStorage.removeItem('uos:coach-portal:auth');
      window.localStorage.removeItem('uos:coach-portal:active-id');
    }
    if (wasProduction) void signOutEverywhere().catch(() => undefined);
  };

  return (
    <CoachSessionContext.Provider
      value={{
        coach,
        allCoaches,
        isAuthenticated: Boolean(coach),
        isPreviewSession: sessionProvider === 'preview',
        activeCoachId,
        authorizedGroupIds: sessionProvider === 'production' ? productionScope.groupIds : [],
        authorizedPlayerIds: sessionProvider === 'production' ? productionScope.playerIds : [],
        loading: coachQuery.loading,
        error: coachQuery.error,
        setActiveCoachId,
        login,
        refreshProductionScope,
        logout,
      }}
    >
      {children}
    </CoachSessionContext.Provider>
  );
}

export function useCoachSession() {
  const context = useContext(CoachSessionContext);
  if (!context) throw new Error('useCoachSession must be used within a CoachSessionProvider');
  return context;
}
