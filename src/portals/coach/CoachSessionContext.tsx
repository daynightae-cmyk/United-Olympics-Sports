import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import type { CoachViewModel } from '../../admin/data/viewModels';
import { signOutEverywhere } from '../../lib/auth-client';
import { fetchCoachPortalScope, type CoachPortalScopeSnapshot } from '../../lib/portal-data-client';

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
  productionWorkspace: CoachPortalScopeSnapshot | null;
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

function scopedCoach(
  id: string,
  fullName: string,
  branchId: string | null,
  groupIds: string[],
  playerIds: string[],
): CoachViewModel {
  return {
    id,
    nameEn: fullName,
    nameAr: fullName,
    sportIds: [],
    branchIds: branchId ? [branchId] : [],
    groupIds,
    playerCount: playerIds.length,
    specializations: [],
    certifications: [],
    status: 'active',
  };
}

export function CoachSessionProvider({ children }: { children: ReactNode }) {
  const { gateway, mode } = useAdminData();
  const initial = useMemo(readStoredCoachSession, []);
  const [activeCoachId, setActiveCoachIdState] = useState<string | undefined>(initial.coachId);
  const [sessionProvider, setSessionProvider] = useState<CoachSessionProviderKind>(initial.provider);
  const [productionScope, setProductionScope] = useState<CoachAuthorizationScope>(initial.scope);
  const [productionWorkspace, setProductionWorkspace] = useState<CoachPortalScopeSnapshot | null>(null);
  const [allCoaches, setAllCoaches] = useState<CoachViewModel[]>([]);
  const [loading, setLoading] = useState(Boolean(initial.coachId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!activeCoachId || !sessionProvider) {
      setAllCoaches([]);
      setProductionWorkspace(null);
      setLoading(false);
      setError(null);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);

    if (sessionProvider === 'production') {
      void fetchCoachPortalScope()
        .then((snapshot) => {
          if (!active) return;
          if (snapshot.coach.id !== activeCoachId) throw new Error('COACH_BINDING_MISMATCH');
          const scope = {
            groupIds: normalizeIds(snapshot.assignedGroups),
            playerIds: normalizeIds(snapshot.assignedPlayerIds),
          };
          setProductionScope(scope);
          setProductionWorkspace(snapshot);
          setAllCoaches([scopedCoach(snapshot.coach.id, snapshot.coach.fullName, snapshot.coach.branchId, scope.groupIds, scope.playerIds)]);
          writeProductionSession(snapshot.coach.id, scope);
        })
        .catch((caught) => {
          if (!active) return;
          setAllCoaches([]);
          setProductionWorkspace(null);
          setError(caught instanceof Error ? caught : new Error('COACH_PORTAL_DATA_FAILED'));
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }

    setProductionWorkspace(null);
    if (mode !== 'preview') {
      setAllCoaches([]);
      setLoading(false);
      setError(new Error('PREVIEW_PROVIDER_DISABLED'));
      return () => { active = false; };
    }

    void gateway.listCoaches({ page: 1, pageSize: 500 })
      .then((result) => {
        if (!active) return;
        setAllCoaches(result.items.filter((item) => item.status === 'active'));
      })
      .catch((caught) => {
        if (!active) return;
        setAllCoaches([]);
        setError(caught instanceof Error ? caught : new Error('COACH_PREVIEW_DATA_FAILED'));
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [activeCoachId, gateway, mode, sessionProvider]);

  const coach = useMemo(
    () => activeCoachId ? allCoaches.find((item) => item.id === activeCoachId) : undefined,
    [activeCoachId, allCoaches],
  );

  function writeProductionSession(id: string, scope: CoachAuthorizationScope) {
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
  }

  const persistCoachId = (id: string, provider: Exclude<CoachSessionProviderKind, null>, scope?: CoachAuthorizationScope) => {
    if (provider === 'preview' && mode !== 'preview') return false;
    if (provider === 'preview' && allCoaches.length && !allCoaches.some((item) => item.id === id)) return false;
    if (sessionProvider === 'production' && activeCoachId && id !== activeCoachId) return false;
    setActiveCoachIdState(id);
    setSessionProvider(provider);
    setError(null);
    if (provider === 'production') {
      writeProductionSession(id, scope ?? { groupIds: [], playerIds: [] });
    } else if (typeof window !== 'undefined') {
      setProductionWorkspace(null);
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
    setProductionWorkspace(null);
    setAllCoaches([]);
    setError(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
      window.localStorage.removeItem('uos:coach-portal:auth');
      window.localStorage.removeItem('uos:coach-portal:active-id');
    }
    if (wasProduction) void signOutEverywhere().catch(() => undefined);
  };

  return (
    <CoachSessionContext.Provider value={{
      coach,
      allCoaches,
      productionWorkspace,
      isAuthenticated: Boolean(coach && !error),
      isPreviewSession: sessionProvider === 'preview',
      activeCoachId,
      authorizedGroupIds: sessionProvider === 'production' ? productionScope.groupIds : coach?.groupIds ?? [],
      authorizedPlayerIds: sessionProvider === 'production' ? productionScope.playerIds : [],
      loading,
      error,
      setActiveCoachId,
      login,
      refreshProductionScope,
      logout,
    }}>
      {children}
    </CoachSessionContext.Provider>
  );
}

export function useCoachSession() {
  const context = useContext(CoachSessionContext);
  if (!context) throw new Error('useCoachSession must be used within a CoachSessionProvider');
  return context;
}