import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { demoPlayers } from '../../data/demo/players';
import { getGroup, getSport } from '../../data/demo/selectors';

type PlayerSession = {
  player: (typeof demoPlayers)[number];
  sport: ReturnType<typeof getSport>;
  group: ReturnType<typeof getGroup>;
  mode: 'preview';
};

const PlayerSessionContext = createContext<PlayerSession | null>(null);

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const value = useMemo<PlayerSession>(() => {
    const player = demoPlayers[0];
    return { player, sport: getSport(player.sportId), group: getGroup(player.groupId), mode: 'preview' };
  }, []);
  return <PlayerSessionContext.Provider value={value}>{children}</PlayerSessionContext.Provider>;
}

export function usePlayerSession() {
  const session = useContext(PlayerSessionContext);
  if (!session) throw new Error('usePlayerSession must be used within PlayerSessionProvider');
  return session;
}
