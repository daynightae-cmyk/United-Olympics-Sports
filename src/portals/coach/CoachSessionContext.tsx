import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCoaches } from '../../admin/data/adminHooks';
import type { CoachViewModel } from '../../admin/data/viewModels';

const PREVIEW_SESSION_KEY = 'uos:coach-portal:preview-session:v1';

interface CoachSessionContextValue {
  coach: CoachViewModel | undefined;
  allCoaches: CoachViewModel[];
  isAuthenticated: boolean;
  activeCoachId: string | undefined;
  loading: boolean;
  error: Error | null;
  setActiveCoachId: (id: string) => void;
  login: (id?: string) => void;
  logout: () => void;
}

const CoachSessionContext = createContext<CoachSessionContextValue | undefined>(undefined);

function readPreviewCoachId() {
  if (typeof window === 'undefined') return undefined;
  return window.sessionStorage.getItem(PREVIEW_SESSION_KEY) ?? undefined;
}

export function CoachSessionProvider({ children }: { children: React.ReactNode }) {
  const coachQuery = useCoaches({ page: 1, pageSize: 500 });
  const allCoaches = useMemo(
    () => coachQuery.data.items.filter((item) => item.status === 'active'),
    [coachQuery.data.items],
  );
  const [activeCoachId, setActiveCoachIdState] = useState<string | undefined>(readPreviewCoachId);

  const coach = useMemo(
    () => activeCoachId ? allCoaches.find((item) => item.id === activeCoachId) : undefined,
    [activeCoachId, allCoaches],
  );

  useEffect(() => {
    if (coachQuery.loading || !activeCoachId) return;
    if (!allCoaches.some((item) => item.id === activeCoachId)) {
      setActiveCoachIdState(undefined);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
    }
  }, [activeCoachId, allCoaches, coachQuery.loading]);

  const setActiveCoachId = (id: string) => {
    if (!allCoaches.some((item) => item.id === id)) return;
    setActiveCoachIdState(id);
    if (typeof window !== 'undefined') window.sessionStorage.setItem(PREVIEW_SESSION_KEY, id);
  };

  const login = (id?: string) => {
    const idToUse = id ?? activeCoachId;
    if (!idToUse || !allCoaches.some((item) => item.id === idToUse)) {
      logout();
      return;
    }
    setActiveCoachId(idToUse);
  };

  const logout = () => {
    setActiveCoachIdState(undefined);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      window.localStorage.removeItem('uos:coach-portal:auth');
      window.localStorage.removeItem('uos:coach-portal:active-id');
    }
  };

  return (
    <CoachSessionContext.Provider
      value={{
        coach,
        allCoaches,
        isAuthenticated: Boolean(coach),
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
