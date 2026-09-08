import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCoaches } from '../../admin/data/adminHooks';
import type { CoachViewModel } from '../../admin/data/viewModels';
import { signOutEverywhere } from '../../lib/auth-client';

const PREVIEW_SESSION_KEY = 'uos:coach-portal:preview-session:v1';
const PRODUCTION_SESSION_KEY = 'uos:coach-portal:session:v1';

type CoachSessionProviderKind = 'production' | 'preview' | null;

type ProductionCoachSession = {
  coachId: string;
  provider: 'production';
  createdAt: string;
};

interface CoachSessionContextValue {
  coach: CoachViewModel | undefined;
  allCoaches: CoachViewModel[];
  isAuthenticated: boolean;
  isPreviewSession: boolean;
  activeCoachId: string | undefined;
  loading: boolean;
  error: Error | null;
  setActiveCoachId: (id: string) => void;
  login: (id?: string, provider?: Exclude<CoachSessionProviderKind, null>) => void;
  logout: () => void;
}

const CoachSessionContext = createContext<CoachSessionContextValue | undefined>(undefined);

function readStoredCoachSession(): { coachId?: string; provider: CoachSessionProviderKind } {
  if (typeof window === 'undefined') return { provider: null };
  try {
    const raw = window.localStorage.getItem(PRODUCTION_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as Partial<ProductionCoachSession>;
      if (session.provider === 'production' && typeof session.coachId === 'string' && session.coachId) {
        return { coachId: session.coachId, provider: 'production' };
      }
    }
  } catch {
    window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
  }

  const previewId = window.sessionStorage.getItem(PREVIEW_SESSION_KEY) ?? undefined;
  return previewId ? { coachId: previewId, provider: 'preview' } : { provider: null };
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

  const coach = useMemo(
    () => activeCoachId ? allCoaches.find((item) => item.id === activeCoachId) : undefined,
    [activeCoachId, allCoaches],
  );

  useEffect(() => {
    if (coachQuery.loading || !activeCoachId) return;
    if (!allCoaches.some((item) => item.id === activeCoachId)) {
      setActiveCoachIdState(undefined);
      setSessionProvider(null);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
        window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
      }
    }
  }, [activeCoachId, allCoaches, coachQuery.loading]);

  const persistCoachId = (id: string, provider: Exclude<CoachSessionProviderKind, null>) => {
    if (!allCoaches.some((item) => item.id === id)) return false;
    setActiveCoachIdState(id);
    setSessionProvider(provider);
    if (typeof window !== 'undefined') {
      if (provider === 'production') {
        const session: ProductionCoachSession = { coachId: id, provider: 'production', createdAt: new Date().toISOString() };
        window.localStorage.setItem(PRODUCTION_SESSION_KEY, JSON.stringify(session));
        window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      } else {
        window.sessionStorage.setItem(PREVIEW_SESSION_KEY, id);
        window.localStorage.removeItem(PRODUCTION_SESSION_KEY);
      }
    }
    return true;
  };

  const setActiveCoachId = (id: string) => {
    persistCoachId(id, sessionProvider ?? 'preview');
  };

  const login = (id?: string, provider: Exclude<CoachSessionProviderKind, null> = 'preview') => {
    const idToUse = id ?? activeCoachId;
    if (!idToUse || !persistCoachId(idToUse, provider)) {
      logout();
    }
  };

  const logout = () => {
    const wasProduction = sessionProvider === 'production';
    setActiveCoachIdState(undefined);
    setSessionProvider(null);
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
        loading: coachQuery.loading,
        error: coachQuery.error,
        setActiveCoachId,
        login,
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
