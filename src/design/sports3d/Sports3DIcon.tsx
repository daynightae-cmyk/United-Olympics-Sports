import type { BilingualText } from '../../domain/contracts';
import { getSports3DAsset } from './sports3d.registry';
import type { Sports3DKey } from './sports3d.types';

interface Sports3DIconProps {
  assetKey: Sports3DKey;
  className?: string;
  decorative?: boolean;
  alt?: BilingualText;
  eager?: boolean;
}

export function Sports3DIcon({
  assetKey,
  className = '',
  decorative = true,
  alt,
  eager = false,
}: Sports3DIconProps) {
  const asset = getSports3DAsset(assetKey);
  if (!asset?.assetPath) return null;

  const accessibleAlt = decorative ? '' : `${alt?.en ?? asset.label.en} | ${alt?.ar ?? asset.label.ar}`;

  return (
    <img
      src={asset.assetPath}
      alt={accessibleAlt}
      aria-hidden={decorative ? 'true' : undefined}
      className={`uos-sports3d-icon ${className}`.trim()}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
