/**
 * UOS Sports 3D — shared identity types.
 *
 * 3D = SPORT IDENTITY / ATHLETE IDENTITY / ACHIEVEMENT IDENTITY only.
 * VECTOR/LUCIDE = action / navigation / status / utility (never replaced by 3D).
 */

/** Exact sport / tool identities with verified semantics. */
export type Sport3DId =
  | 'football'
  | 'basketball'
  | 'swimming'
  | 'tennis'
  | 'trophy'
  | 'stopwatch'
  | 'whistle';

/** App-level sport slugs (includes disciplines without an exact 3D match). */
export type UosSportSlug =
  | 'football'
  | 'basketball'
  | 'swimming'
  | 'tennis'
  | 'gymnastics'
  | 'martial-arts';

export type Sport3DLicenseStatus = 'verified' | 'review-required' | 'unavailable';

export interface Sport3DAsset {
  /** Canonical identity key. */
  id: Sport3DId;
  labelEn: string;
  labelAr: string;
  /**
   * Local raster asset path, or null when no licensed asset is bundled.
   * Never a temporary Figma/remote URL in production.
   */
  assetPath: string | null;
  licenseStatus: Sport3DLicenseStatus;
  sourceNote: string;
}

export type Sports3DSize = 'sm' | 'md' | 'lg' | 'hero';
export type Sports3DStageVariant = 'card' | 'hero' | 'badge' | 'watermark';

export interface Sports3DIconProps {
  sport: UosSportSlug | Sport3DId;
  size?: Sports3DSize;
  className?: string;
  /** When true the visual is aria-hidden (pure decoration next to a labelled heading). */
  decorative?: boolean;
}

export interface Sports3DStageProps {
  sport?: UosSportSlug | Sport3DId;
  variant?: Sports3DStageVariant;
  className?: string;
  label?: string;
  children?: import('react').ReactNode;
}
