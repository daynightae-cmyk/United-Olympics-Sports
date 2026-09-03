import type { BilingualText } from '../../domain/contracts';

export type Sports3DKey =
  | 'football'
  | 'basketball'
  | 'swimming'
  | 'tennis'
  | 'trophy'
  | 'stopwatch'
  | 'whistle'
  | 'gym'
  | 'boxing'
  | 'sports-bottle'
  | 'table-tennis'
  | 'badminton'
  | 'hockey'
  | 'rugby'
  | 'chess'
  | 'cricket'
  | 'baseball'
  | 'esports'
  | 'sportsperson';

export type Sports3DLicenseStatus = 'approved' | 'review-required';
export type Sports3DSourceKind = 'figma-community' | 'user-provided' | 'local';
export type Sports3DStageSize = 'sm' | 'md' | 'lg' | 'hero';
export type Sports3DStageTone = 'brand' | 'quiet' | 'athlete';

export interface Sports3DSource {
  kind: Sports3DSourceKind;
  url?: string;
  nodeId?: string;
  note?: string;
}

export interface Sports3DAssetDefinition {
  key: Sports3DKey;
  label: BilingualText;
  /** Local public path only. Never point production UI at a temporary Figma export URL. */
  assetPath?: `/media/sports-3d/${string}`;
  source: Sports3DSource;
  licenseStatus: Sports3DLicenseStatus;
  /** True only when the asset meaning is an exact semantic match for this key. */
  exactMatch: boolean;
}
