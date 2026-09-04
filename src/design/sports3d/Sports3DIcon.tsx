import { resolveSport3D } from './sports3d.registry';
import type { Sports3DIconProps } from './sports3d.types';

const MONOGRAM: Record<string, string> = {
  football: 'F',
  basketball: 'B',
  swimming: 'S',
  tennis: 'T',
  trophy: 'U',
  stopwatch: 'S',
  whistle: 'W',
  gymnastics: 'G',
  'martial-arts': 'M',
};

/**
 * Sport identity medallion.
 * Renders the bundled raster asset when the registry holds one; otherwise a
 * neutral coded monogram — never a neighbouring sport's imagery.
 */
export function Sports3DIcon({ sport, size = 'md', className = '', decorative = false }: Sports3DIconProps) {
  const asset = resolveSport3D(sport);
  const label = asset ? `${asset.labelEn} | ${asset.labelAr}` : String(sport);
  const classes = `sports3d-icon sports3d-icon--${size}${className ? ` ${className}` : ''}`.trim();
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': label };

  if (asset?.assetPath) {
    return (
      <span className={classes} data-sport={sport} {...a11y}>
        <img
          src={asset.assetPath}
          alt={decorative ? '' : label}
          loading="lazy"
          decoding="async"
          className="sports3d-icon-img"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </span>
    );
  }

  return (
    <span className={`${classes} sports3d-icon--coded`} data-sport={sport} {...a11y}>
      <span aria-hidden="true" className="sports3d-icon-mono">{MONOGRAM[sport] ?? 'U'}</span>
    </span>
  );
}

export default Sports3DIcon;
