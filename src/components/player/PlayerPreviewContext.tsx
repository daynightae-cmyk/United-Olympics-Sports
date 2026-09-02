import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Player, Sport, TrainingGroup } from '../../domain/contracts';
import { DEFAULT_PLAYER_PREVIEW_ID, getGroup, getPlayer, getSport } from '../../data/demo/selectors';

type PlayerPreviewValue = {
  requestedId: string;
  player?: Player;
  sport?: Sport;
  group?: TrainingGroup;
  developerOverride: boolean;
};

const PlayerPreviewContext = createContext<PlayerPreviewValue | null>(null);

export function PlayerPreviewProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const value = useMemo<PlayerPreviewValue>(() => {
    const isLocalPreviewHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const developerId = isLocalPreviewHost ? new URLSearchParams(location.search).get('previewPlayer') : null;
    const requestedId = developerId || DEFAULT_PLAYER_PREVIEW_ID;
    const player = getPlayer(requestedId);
    return {
      requestedId,
      player,
      sport: getSport(player?.sportId),
      group: getGroup(player?.groupId),
      developerOverride: Boolean(developerId),
    };
  }, [location.search]);

  return <PlayerPreviewContext.Provider value={value}>{children}</PlayerPreviewContext.Provider>;
}

export function usePlayerPreview() {
  const value = useContext(PlayerPreviewContext);
  if (!value) throw new Error('usePlayerPreview must be used inside PlayerPreviewProvider');
  return value;
}
