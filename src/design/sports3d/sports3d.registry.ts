/**
 * UOS Sports 3D — centralized registry.
 *
 * ALL sport 3D rendering goes through this registry. Do not scatter direct
 * `public/media/sports-3d/*` paths around the application.
 *
 * Reference source: "Sports 3D Icon Pack — Community" (Figma).
 * License terms cannot be verified in this environment, therefore every entry
 * carries `licenseStatus: 'review-required'` and `assetPath: null` until a
 * licensed local asset is bundled under `public/media/sports-3d/`.
 *
 * NO FALSE SPORT MAPPING (absolute rule):
 * - gymnastics  -> NEVER gym
 * - martial-arts -> NEVER boxing
 * Disciplines without an exact match resolve to null so callers retain the
 * existing coded/vector visual instead of mislabelling a sport.
 */
import type { Sport3DAsset, Sport3DId, UosSportSlug } from './sports3d.types';

export const SPORTS_3D_SOURCE = {
  name: 'Sports 3D Icon Pack — Community',
  url: 'https://www.figma.com/design/CyQcMFSehwzldAwhzPT8dZ/Sports-3D-Icon-Pack--Community-?node-id=114-120',
  licenseStatus: 'review-required' as const,
} as const;

const KNOWN_ASSETS: Record<Sport3DId, Sport3DAsset> = {
  football: {
    id: 'football',
    labelEn: 'Football',
    labelAr: 'كرة القدم',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Football category)',
  },
  basketball: {
    id: 'basketball',
    labelEn: 'Basketball',
    labelAr: 'كرة السلة',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Basketball category)',
  },
  swimming: {
    id: 'swimming',
    labelEn: 'Swimming',
    labelAr: 'السباحة',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Swimming category)',
  },
  tennis: {
    id: 'tennis',
    labelEn: 'Tennis',
    labelAr: 'التنس',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Tennis category)',
  },
  trophy: {
    id: 'trophy',
    labelEn: 'Trophy',
    labelAr: 'الكأس',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Trophy category)',
  },
  stopwatch: {
    id: 'stopwatch',
    labelEn: 'Stopwatch',
    labelAr: 'ساعة التوقيت',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Stopwatch category)',
  },
  whistle: {
    id: 'whistle',
    labelEn: 'Whistle',
    labelAr: 'الصافرة',
    assetPath: null,
    licenseStatus: 'review-required',
    sourceNote: 'Sports 3D Icon Pack — Community (Whistle category)',
  },
};

/**
 * Resolve an app sport slug to its exact 3D asset.
 * Returns null when there is no exact match (gymnastics, martial-arts) or
 * when no licensed raster is bundled yet — callers must then retain the
 * coded/vector visual. Never remap to a neighbouring sport.
 */
export function resolveSport3D(sport: UosSportSlug | Sport3DId): Sport3DAsset | null {
  const asset = (KNOWN_ASSETS as Record<string, Sport3DAsset>)[sport];
  if (!asset) return null;
  if (!asset.assetPath) return null;
  return asset;
}

/** Registry metadata for diagnostics / About surfaces (never user-facing claims). */
export const Sports3DRegistry = {
  name: 'United Olympics Sports 3D',
  brand: 'United Olympics Sports',
  source: SPORTS_3D_SOURCE,
  assetCount: Object.keys(KNOWN_ASSETS).length,
  bundledAssetCount: 0,
};
