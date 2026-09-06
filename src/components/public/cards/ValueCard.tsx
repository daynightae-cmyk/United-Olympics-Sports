import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BilingualText } from '../../bilingual/BilingualText';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export type ValueCardProps = {
  icon?: LucideIcon | ReactNode;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  badgeText?: { en: string; ar: string };
  accent?: 'gold' | 'discipline' | 'training' | 'performance' | 'teamwork' | 'focus' | 'progress';
  indexNumber?: number | string;
  className?: string;
};

export function ValueCard({
  icon: IconOrElement,
  title,
  description,
  badgeText,
  accent = 'gold',
  indexNumber,
  className = '',
}: ValueCardProps) {
  const reducedMotion = useReducedMotion();

  const renderIcon = () => {
    if (!IconOrElement) return null;
    if (typeof IconOrElement === 'function') {
      const LucideComp = IconOrElement as LucideIcon;
      return <LucideComp size={22} aria-hidden="true" />;
    }
    return IconOrElement;
  };

  return (
    <article
      className={`uos-value-card accent-${accent} ${className}`.trim()}
      id={`value-card-${title.en.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className="uos-value-card-top">
        {IconOrElement && (
          <div className="uos-value-icon-box" aria-hidden="true">
            {renderIcon()}
          </div>
        )}
        {indexNumber !== undefined && (
          <span className="uos-value-number" aria-hidden="true">
            {typeof indexNumber === 'number' ? String(indexNumber).padStart(2, '0') : indexNumber}
          </span>
        )}
      </div>

      <div className="uos-value-card-body">
        {badgeText && (
          <span className="uos-value-badge">
            <BilingualText value={badgeText} />
          </span>
        )}
        <h3 className="uos-value-title">
          <BilingualText value={title} />
        </h3>
        <p className="uos-value-description">
          <BilingualText value={description} />
        </p>
      </div>

      <div className="uos-value-card-bar" aria-hidden="true" />

      {!reducedMotion && (
        <div className="uos-value-card-ambient" aria-hidden="true" />
      )}
    </article>
  );
}

export default ValueCard;
