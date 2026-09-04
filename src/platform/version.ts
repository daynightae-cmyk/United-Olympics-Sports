/**
 * UOS version / update-awareness service (Mission 10X).
 * Source of truth for user-facing version UI. Values are real build
 * metadata (synced with package.json); no version is ever fabricated.
 * Native binary updates still require store builds — this service only
 * reports deployable web/PWA content updates within platform rules.
 */

export const CURRENT_VERSION = '0.0.0';
export const CURRENT_BUILD = 'preview';
export const BUILD_LABEL = 'Preview build';

export interface ReleaseManifest {
  version: string;
  build: string;
  releasedAt?: string;
  minimumSupportedVersion?: string;
  title?: { en: string; ar: string };
  notes?: { en: string; ar: string };
}

export interface UpdateStatus {
  checked: boolean;
  updateAvailable: boolean;
  mandatory: boolean;
  latest: ReleaseManifest | null;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((part) => Number(part) || 0);
  const pb = b.split('.').map((part) => Number(part) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Compare the running build against the deployed /version.json manifest. */
export async function checkForUpdate(): Promise<UpdateStatus> {
  try {
    const response = await fetch('/version.json', { cache: 'no-store' });
    if (!response.ok) return { checked: true, updateAvailable: false, mandatory: false, latest: null };
    const latest = (await response.json()) as ReleaseManifest;
    if (!latest?.version) return { checked: true, updateAvailable: false, mandatory: false, latest: null };
    const updateAvailable = compareVersions(latest.version, CURRENT_VERSION) > 0;
    const mandatory =
      updateAvailable &&
      Boolean(latest.minimumSupportedVersion) &&
      compareVersions(CURRENT_VERSION, latest.minimumSupportedVersion as string) < 0;
    return { checked: true, updateAvailable, mandatory, latest: updateAvailable ? latest : null };
  } catch {
    return { checked: false, updateAvailable: false, mandatory: false, latest: null };
  }
}
