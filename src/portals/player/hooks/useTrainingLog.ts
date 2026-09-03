import { useCallback, useEffect, useMemo, useState } from 'react';
import { readPlayerScopedJson, writePlayerScopedJson } from '../foundation/playerStorage';

export type TrainingIntensity = 'low' | 'medium' | 'high';

export interface TrainingEntry {
  id: string;
  date: string;
  durationMinutes: number;
  intensity: TrainingIntensity;
}

export interface WeeklyGoal {
  targetMinutes: number;
}

const MAX_SESSION_MINUTES = 360;
const MAX_WEEKLY_GOAL = 2400;

export function useTrainingLog(playerId: string) {
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (!playerId) {
      setEntries([]);
      setWeeklyGoal(null);
      setStorageReady(true);
      return;
    }
    setEntries(readPlayerScopedJson('training-log', playerId, [] as TrainingEntry[]));
    setWeeklyGoal(readPlayerScopedJson('training-goal', playerId, null as WeeklyGoal | null));
    setStorageReady(true);
  }, [playerId]);

  const persistEntries = useCallback((next: TrainingEntry[]) => {
    setEntries(next);
    if (playerId) writePlayerScopedJson('training-log', playerId, next);
  }, [playerId]);

  const addEntry = useCallback((durationMinutes: number, intensity: TrainingIntensity) => {
    const duration = Number(durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_SESSION_MINUTES) {
      return { ok: false as const, reason: 'INVALID_DURATION' as const };
    }
    const entry: TrainingEntry = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toISOString(),
      durationMinutes: Math.round(duration),
      intensity,
    };
    persistEntries([entry, ...entries]);
    return { ok: true as const, entry };
  }, [entries, persistEntries]);

  const deleteEntry = useCallback((entryId: string) => {
    persistEntries(entries.filter((entry) => entry.id !== entryId));
  }, [entries, persistEntries]);

  const updateWeeklyGoal = useCallback((targetMinutes: number) => {
    const target = Number(targetMinutes);
    if (!Number.isFinite(target) || target <= 0 || target > MAX_WEEKLY_GOAL) {
      return { ok: false as const, reason: 'INVALID_GOAL' as const };
    }
    const next = { targetMinutes: Math.round(target) };
    setWeeklyGoal(next);
    if (playerId) writePlayerScopedJson('training-goal', playerId, next);
    return { ok: true as const };
  }, [playerId]);

  const currentWeekMinutes = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const day = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return entries.reduce((sum, entry) => {
      const date = new Date(entry.date);
      return date >= start ? sum + entry.durationMinutes : sum;
    }, 0);
  }, [entries]);

  return {
    entries,
    weeklyGoal,
    storageReady,
    currentWeekMinutes,
    addEntry,
    deleteEntry,
    updateWeeklyGoal,
  };
}
