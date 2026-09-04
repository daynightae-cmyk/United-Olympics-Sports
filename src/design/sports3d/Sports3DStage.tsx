import { resolveSport3D } from './sports3d.registry';
import type { Sports3DStageProps } from './sports3d.types';

/**
 * Framed identity stage for sport imagery.
 * Black/navy framing with a gold edge; raster watermark only when a licensed
 * local asset exists, otherwise a controlled atmospheric gradient. Decorative
 * layers are aria-hidden so screen readers hear content, not chrome.
 */
export function Sports3DStage({ sport, variant = 'card', className = '', label, children }: Sports3DStageProps) {
  const asset = sport ? resolveSport3D(sport) : null;
  const classes = `sports3d-stage sports3d-stage--${variant}${className ? ` ${className}` : ''}`.trim();
  return (
    <div className={classes} data-sport={sport ?? 'none'} aria-label={label ?? 'United Olympics Sports identity stage'}>
      <span aria-hidden="true" className="sports3d-stage-atmosphere" />
      {asset?.assetPath ? (
        <img
          src={asset.assetPath}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="sports3d-stage-watermark"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
      {children ? <div className="sports3d-stage-content">{children}</div> : null}
    </div>
  );
}

export default Sports3DStage;
