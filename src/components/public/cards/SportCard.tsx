import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../bilingual/BilingualText';
import { Sports3DIcon } from '../../../design/sports3d';
import { MediaRegistry } from '../../../data/public/mediaRegistry';
import type { MediaAsset } from '../../../data/public/mediaRegistry';
import { UosImage } from '../UosImage';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export type SportCardData = {
  id: string;
  slug?: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  ages?: { en: string; ar: string };
  focus?: { en: string; ar: string };
  pathwaysCount?: number;
};

export type SportCardProps = {
  sport: SportCardData;
  mediaAsset?: MediaAsset;
  featured?: boolean;
  className?: string;
};

const sportRouteMap: Record<string, string> = {
  football: '/sports/football',
  swimming: '/sports/swimming',
  basketball: '/sports/basketball',
  tennis: '/sports/tennis',
  gymnastics: '/sports/gymnastics',
  'martial-arts': '/sports/martial-arts',
  martialarts: '/sports/martial-arts',
};

export function SportCard({ sport, mediaAsset, featured = false, className = '' }: SportCardProps) {
  const reducedMotion = useReducedMotion();
  const asset = mediaAsset ?? MediaRegistry.getSportAsset(sport.id, 'card');
  const destination = sportRouteMap[sport.id] ?? `/sports/${sport.slug || sport.id}`;

  const avifSet = asset ? MediaRegistry.getSourceSet(asset, 'avif') : undefined;
  const webpSet = asset ? MediaRegistry.getSourceSet(asset, 'webp') : undefined;

  const sportIconKey = (
    sport.id === 'martial-arts' || sport.id === 'martialarts' ? 'martial-arts' :
    sport.id as 'football' | 'basketball' | 'swimming' | 'tennis' | 'gymnastics'
  );

  return (
    <article
      className={`uos-sport-card ${featured ? 'is-featured' : ''} ${className}`.trim()}
      data-sport-id={sport.id}
      id={`sport-card-${sport.id}`}
    >
      <div className="uos-card-media-wrapper">
        {asset ? (
          <UosImage
            asset={asset}
            className="uos-card-img"
            containerClassName="w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="uos-card-media-fallback" aria-hidden="true" />
        )}
        <div className="uos-card-media-gradient" aria-hidden="true" />
        
        <div className="uos-card-badge-container">
          <div className="uos-card-3d-emblem">
            <Sports3DIcon sport={sportIconKey} size="md" decorative />
          </div>
          {featured && (
            <span className="uos-card-tag">
              <Sparkles size={13} aria-hidden="true" />
              <BilingualText value={bi('Olympic Discipline', 'رياضة أولمبية')} />
            </span>
          )}
        </div>
      </div>

      <div className="uos-card-content">
        <h3 className="uos-card-title">
          <BilingualText value={sport.name} />
        </h3>

        <p className="uos-card-description">
          <BilingualText value={sport.description} />
        </p>

        {sport.ages && (
          <div className="uos-card-meta-row">
            <span className="uos-card-meta-label">
              <BilingualText value={bi('Age Pathways', 'الفئات العمرية')} />
            </span>
            <strong className="uos-card-meta-value">
              <BilingualText value={sport.ages} />
            </strong>
          </div>
        )}

        <div className="uos-card-footer">
          <Link
            to={destination}
            className="uos-card-action-link"
            aria-label={`Explore ${sport.name.en} | استكشف ${sport.name.ar}`}
          >
            <span>
              <BilingualText value={bi('Explore Sport', 'استكشف الرياضة')} />
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {!reducedMotion && (
        <div className="uos-card-shine-effect" aria-hidden="true" />
      )}
    </article>
  );
}

export default SportCard;
