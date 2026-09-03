import { bi } from '../../components/bilingual/BilingualText';
import type { Sports3DAssetDefinition, Sports3DKey } from './sports3d.types';

const figmaCommunitySource = {
  kind: 'figma-community' as const,
  url: 'https://www.figma.com/design/CyQcMFSehwzldAwhzPT8dZ/Sports-3D-Icon-Pack--Community-?node-id=114-120',
  nodeId: '114:120',
  note: 'Source metadata retained. Exact layer-to-sport mapping and commercial license clearance require review before local assets are enabled.',
};

function pending(key: Sports3DKey, en: string, ar: string): Sports3DAssetDefinition {
  return {
    key,
    label: bi(en, ar),
    source: figmaCommunitySource,
    licenseStatus: 'review-required',
    exactMatch: true,
  };
}

/**
 * Central source of truth for UOS 3D identity media.
 *
 * IMPORTANT: assetPath intentionally remains undefined until BOTH conditions are true:
 * 1. the source layer is an exact semantic match for the registry key; and
 * 2. the asset is cleared for the intended production use.
 *
 * Consumers fail closed when assetPath is absent. This prevents false mappings such as
 * gymnastics -> gym or martial-arts -> boxing.
 */
export const sports3dRegistry = {
  football: pending('football', 'Football', 'كرة القدم'),
  basketball: pending('basketball', 'Basketball', 'كرة السلة'),
  swimming: pending('swimming', 'Swimming', 'السباحة'),
  tennis: pending('tennis', 'Tennis', 'التنس'),
  trophy: pending('trophy', 'Trophy', 'كأس'),
  stopwatch: pending('stopwatch', 'Stopwatch', 'ساعة إيقاف'),
  whistle: pending('whistle', 'Whistle', 'صافرة'),
  gym: pending('gym', 'Gym', 'صالة رياضية'),
  boxing: pending('boxing', 'Boxing', 'الملاكمة'),
  'sports-bottle': pending('sports-bottle', 'Sports Bottle', 'زجاجة رياضية'),
  'table-tennis': pending('table-tennis', 'Table Tennis', 'تنس الطاولة'),
  badminton: pending('badminton', 'Badminton', 'الريشة الطائرة'),
  hockey: pending('hockey', 'Hockey', 'الهوكي'),
  rugby: pending('rugby', 'Rugby', 'الرجبي'),
  chess: pending('chess', 'Chess', 'الشطرنج'),
  cricket: pending('cricket', 'Cricket', 'الكريكيت'),
  baseball: pending('baseball', 'Baseball', 'البيسبول'),
  esports: pending('esports', 'Esports', 'الرياضات الإلكترونية'),
  sportsperson: pending('sportsperson', 'Sportsperson', 'رياضي'),
} satisfies Record<Sports3DKey, Sports3DAssetDefinition>;

export function getSports3DAsset(key?: Sports3DKey): Sports3DAssetDefinition | undefined {
  if (!key) return undefined;
  const asset = sports3dRegistry[key];
  return asset.assetPath && asset.exactMatch ? asset : undefined;
}

/** Exact sport mapping only. No nearest-neighbour substitutions are allowed. */
export function sports3DKeyForSportId(sportId?: string): Sports3DKey | undefined {
  switch (sportId) {
    case 'football':
    case 'basketball':
    case 'swimming':
    case 'tennis':
      return sportId;
    default:
      return undefined;
  }
}
