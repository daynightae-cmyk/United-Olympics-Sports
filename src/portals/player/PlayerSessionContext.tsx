import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { demoPlayers } from '../../data/demo/players';
import { getGroup, getSport } from '../../data/demo/selectors';
import { PreviewAuthGateway, type PlayerAuthGateway, type PlayerAuthSession } from './PlayerAuthGateway';
import { useLocation } from 'react-router-dom';

type PlayerSession = {
  player: (typeof demoPlayers)[number];
  sport: ReturnType<typeof getSport>;
  group: ReturnType<typeof getGroup>;
  mode: 'preview';
  authSession: PlayerAuthSession;
  gateway: PlayerAuthGateway;
};

const PlayerSessionContext = createContext<PlayerSession | null>(null);

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const value = useMemo<PlayerSession | null>(() => {
    const query = new URLSearchParams(location.search);
    const requestedPlayerId = query.get('previewPlayerId') ?? window.sessionStorage.getItem('uos:player-preview-session:v1');
    if (!requestedPlayerId) return null;
    const player = demoPlayers.find(candidate => candidate.id === requestedPlayerId);
    if (!player) return null;
    const gateway = new PreviewAuthGateway(player.id);
    return { player, sport: getSport(player.sportId), group: getGroup(player.groupId), mode: 'preview', authSession: { playerId: player.id, mode: 'preview' }, gateway };
  }, [location.search]);
  return <PlayerSessionContext.Provider value={value}>{children}</PlayerSessionContext.Provider>;
}

export function useOptionalPlayerSession() { return useContext(PlayerSessionContext); }

export function usePlayerSession() {
  const session = useContext(PlayerSessionContext);
  if (!session) throw new Error('usePlayerSession must be used within PlayerSessionProvider');
  return session;
}
