import React, { createContext, useContext, useState, useMemo } from 'react';
import { demoCoaches } from '../../data/demo/coaches';
import type { Coach } from '../../domain/contracts';

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

export function CoachSessionProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('uos:coach-portal:auth') === 'true';
  });
  const [activeCoachId, setActiveCoachIdState] = useState<string | undefined>(() => {
    return localStorage.getItem('uos:coach-portal:active-id') || undefined;
  });

  const coach = useMemo(() => {
    if (!isAuthenticated || !activeCoachId) return undefined;
    return demoCoaches.find((c) => c.id === activeCoachId);
  }, [isAuthenticated, activeCoachId]);

  const setActiveCoachId = (id: string) => {
    setActiveCoachIdState(id);
    localStorage.setItem('uos:coach-portal:active-id', id);
  };

  const login = (id?: string) => {
    const idToUse = id || activeCoachId;
    if (!idToUse || !demoCoaches.find(c => c.id === idToUse)) {
      setIsAuthenticated(false);
      localStorage.setItem('uos:coach-portal:auth', 'false');
      return;
    }
    setActiveCoachId(idToUse);
    setIsAuthenticated(true);
    localStorage.setItem('uos:coach-portal:auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('uos:coach-portal:auth', 'false');
  };

  return (
    <CoachSessionContext.Provider
      value={{
        coach,
        allCoaches: demoCoaches,
        isAuthenticated,
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
