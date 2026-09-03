import type { CSSProperties } from 'react';
import { getSports3DAsset } from './sports3d.registry';
import type { Sports3DKey, Sports3DStageSize, Sports3DStageTone } from './sports3d.types';
import { Sports3DIcon } from './Sports3DIcon';

interface Sports3DStageProps {
  assetKey?: Sports3DKey;
  className?: string;
  size?: Sports3DStageSize;
  tone?: Sports3DStageTone;
  opacity?: number;
  eager?: boolean;
}

export function Sports3DStage({
  assetKey,
  className = '',
  size = 'md',
  tone = 'brand',
  opacity = 1,
  eager = false,
}: Sports3DStageProps) {
  const asset = getSports3DAsset(assetKey);
  if (!asset || !assetKey) return null;

  const style = { '--uos-sports3d-opacity': Math.min(1, Math.max(0, opacity)) } as CSSProperties;

  return (
    <span
      className={`uos-sports3d-stage uos-sports3d-stage--${size} uos-sports3d-stage--${tone} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <span className="uos-sports3d-stage__halo" />
      <Sports3DIcon assetKey={assetKey} eager={eager} />
    </span>
  );
}
