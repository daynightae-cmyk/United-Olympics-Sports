export type PlayerStorageScope =
  | 'preview-session'
  | 'training-log'
  | 'training-goal'
  | 'notification-read'
  | 'profile-local-patch';

const PREFIX = 'uos:player';

export function playerStorageKey(scope: PlayerStorageScope, playerId?: string) {
  if (scope === 'preview-session') return `${PREFIX}:preview-session`;
  if (!playerId) throw new Error(`playerStorageKey(${scope}) requires a playerId`);
  return `${PREFIX}:${playerId}:${scope}`;
}

function storageAvailable(storage: Storage | undefined): storage is Storage {
  if (!storage) return false;
  try {
    const key = '__uos_storage_probe__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeReadJson<T>(key: string, fallback: T, storage: Storage | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): T {
  if (!storageAvailable(storage)) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeWriteJson<T>(key: string, value: T, storage: Storage | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): boolean {
  if (!storageAvailable(storage)) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string, storage: Storage | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): void {
  if (!storageAvailable(storage)) return;
  try {
    storage.removeItem(key);
  } catch {
    // Privacy-restricted browser contexts can reject storage operations.
  }
}

export function readPlayerScopedJson<T>(scope: Exclude<PlayerStorageScope, 'preview-session'>, playerId: string, fallback: T): T {
  return safeReadJson(playerStorageKey(scope, playerId), fallback);
}

export function writePlayerScopedJson<T>(scope: Exclude<PlayerStorageScope, 'preview-session'>, playerId: string, value: T): boolean {
  return safeWriteJson(playerStorageKey(scope, playerId), value);
}
