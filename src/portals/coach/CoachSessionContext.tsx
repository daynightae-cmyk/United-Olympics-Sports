import React, { createContext, useContext, useMemo, useState } from 'react';
import { demoCoaches } from '../../data/demo/coaches';
import type { Coach } from '../../domain/contracts';

const PREVIEW_SESSION_KEY = 'uos:coach-portal:preview-session:v1';

interface CoachSessionContextValue {
  coach: Coach | undefined;
  allCoaches: Coach[];
  isAuthenticated: boolean;
  activeCoachId: string | undefined;
  setActiveCoachId: (id: string) => void;
  login: (id?: string) => void;
  logout: () => void;
}

const CoachSessionContext = createContext<CoachSessionContextValue | undefined>(undefined);

function readPreviewCoachId() {
  if (typeof window === 'undefined') return undefined;
  const stored = window.sessionStorage.getItem(PREVIEW_SESSION_KEY) ?? undefined;
  return stored && demoCoaches.some((coach) => coach.id === stored) ? stored : undefined;
}

export function CoachSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeCoachId, setActiveCoachIdState] = useState<string | undefined>(readPreviewCoachId);

  const coach = useMemo(
    () => activeCoachId ? demoCoaches.find((item) => item.id === activeCoachId) : undefined,
    [activeCoachId],
  );

  const setActiveCoachId = (id: string) => {
    if (!demoCoaches.some((item) => item.id === id)) return;
    setActiveCoachIdState(id);
    if (typeof window !== 'undefined') window.sessionStorage.setItem(PREVIEW_SESSION_KEY, id);
  };

  const login = (id?: string) => {
    const idToUse = id ?? activeCoachId;
    if (!idToUse || !demoCoaches.some((item) => item.id === idToUse)) {
      logout();
      return;
    }
    setActiveCoachId(idToUse);
  };

  const logout = () => {
    setActiveCoachIdState(undefined);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      // Remove keys used by the regressed persistent preview implementation.
      window.localStorage.removeItem('uos:coach-portal:auth');
      window.localStorage.removeItem('uos:coach-portal:active-id');
    }
  };

  return (
    <CoachSessionContext.Provider
      value={{
        coach,
        allCoaches: demoCoaches,
        isAuthenticated: Boolean(coach),
        activeCoachId,
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
  if (!context) {
    throw new Error('useCoachSession must be used within a CoachSessionProvider');
  }
  return context;
}
