import { ArrowRight, CalendarDays, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../bilingual/BilingualText';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export type ProgramCardData = {
  id: string;
  slug: string;
  title: { en: string; ar: string };
  category?: { en: string; ar: string };
  description: { en: string; ar: string };
  ageRange?: { en: string; ar: string };
  schedule?: { en: string; ar: string };
  focusPoints?: Array<{ en: string; ar: string }>;
  featured?: boolean;
};

export type ProgramCardProps = {
  program: ProgramCardData;
  className?: string;
};

export function ProgramCard({ program, className = '' }: ProgramCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <article
      className={`uos-program-card ${program.featured ? 'is-featured' : ''} ${className}`.trim()}
      id={`program-card-${program.slug || program.id}`}
    >
      <div className="uos-program-card-header">
        {program.category && (
          <span className="uos-program-category">
            <Sparkles size={13} aria-hidden="true" />
            <BilingualText value={program.category} />
          </span>
        )}
        <h3 className="uos-program-title">
          <BilingualText value={program.title} />
        </h3>
      </div>

      <p className="uos-program-description">
        <BilingualText value={program.description} />
      </p>

      <div className="uos-program-meta-grid">
        {program.ageRange && (
          <div className="uos-program-meta-item">
            <Users size={15} aria-hidden="true" />
            <div>
              <span className="uos-meta-label">
                <BilingualText value={bi('Target Ages', 'الفئة المستهدفة')} />
              </span>
              <strong className="uos-meta-value">
                <BilingualText value={program.ageRange} />
              </strong>
            </div>
          </div>
        )}

        {program.schedule && (
          <div className="uos-program-meta-item">
            <CalendarDays size={15} aria-hidden="true" />
            <div>
              <span className="uos-meta-label">
                <BilingualText value={bi('Format', 'نظام البرنامج')} />
              </span>
              <strong className="uos-meta-value">
                <BilingualText value={program.schedule} />
              </strong>
            </div>
          </div>
        )}
      </div>

      {program.focusPoints && program.focusPoints.length > 0 && (
        <ul className="uos-program-focus-list" aria-label="Program highlights | محاور البرنامج">
          {program.focusPoints.map((point, index) => (
            <li key={index} className="uos-program-focus-item">
              <CheckCircle2 size={15} aria-hidden="true" />
              <BilingualText value={point} />
            </li>
          ))}
        </ul>
      )}

      <div className="uos-program-card-footer">
        <div className="uos-program-integrity-badge">
          <ShieldCheck size={14} aria-hidden="true" />
          <BilingualText value={bi('Structured Syllabus', 'منهج تدريبي منظم')} />
        </div>

        <Link
          to={`/programs/${program.slug}`}
          className="uos-program-action-button"
          aria-label={`View ${program.title.en} program | عرض برنامج ${program.title.ar}`}
        >
          <span>
            <BilingualText value={bi('View Program', 'عرض البرنامج')} />
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {!reducedMotion && (
        <div className="uos-card-glow-subtle" aria-hidden="true" />
      )}
    </article>
  );
}

export default ProgramCard;
