import { Calendar, Clock, MapPin, User, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Coach, Session, Sport, TrainingGroup } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { formatPlayerDate, formatPlayerTime } from '../foundation/playerLocale';

interface PlayerNextSessionCardProps {
  session?: Session | null;
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  branch?: { id: string; name: { en: string; ar: string } };
}

export function PlayerNextSessionCard({
  session,
  coach,
  branch,
}: PlayerNextSessionCardProps) {
  const { bilingualOrder } = useUiSettings();
  const navigate = useNavigate();

  const isArabic = bilingualOrder === 'ar-first';

  const handleActionClick = () => {
    if (session) {
      navigate(`/player/schedule/${session.id}`);
    } else {
      navigate('/player/schedule');
    }
  };

  if (!session) {
    return (
      <article className="athlete-dark-card next-session-reference-card" aria-labelledby="ref-next-session-title">
        <header className="athlete-dark-card__header">
          <h2 id="ref-next-session-title" className="athlete-dark-card__title">
            <BilingualText value={bi('Next Training Session', 'الحصة التدريبية القادمة')} />
          </h2>
          <Link to="/player/schedule" className="athlete-dark-card__schedule-link">
            <span><BilingualText value={bi('View Schedule', 'عرض الجدول')} /></span>
            <ArrowUpRight size={14} className="rtl:rotate-[-90deg]" />
          </Link>
        </header>

        <div className="next-session-reference-body next-session-empty-state flex items-center justify-center p-6 text-center">
          <div className="py-4">
            <Calendar size={28} className="mx-auto text-amber-400/40 mb-3" aria-hidden="true" />
            <p className="text-white font-bold text-sm mb-1">
              <BilingualText value={bi('No upcoming training session is recorded.', 'لا توجد حصة تدريبية قادمة مسجلة.')} />
            </p>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              <BilingualText value={bi('Check your schedule for future training dates and assignments.', 'تحقق من جدولك التدريبي لمعرفة مواعيد وتفاصيل الحصص القادمة.')} />
            </p>
          </div>
        </div>

        <div className="next-session-reference-footer">
          <button
            type="button"
            onClick={handleActionClick}
            className="next-session-reference-cta-btn"
          >
            <span><BilingualText value={bi('View Schedule', 'عرض الجدول')} /></span>
            <span className="rtl:rotate-180">→</span>
          </button>
        </div>
      </article>
    );
  }

  const sessionDateStr = formatPlayerDate(session.startsAt, bilingualOrder, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const sessionTimeStr = formatPlayerTime(session.startsAt, bilingualOrder);
  const venueContent = branch?.name ? <BilingualText value={branch.name} /> : <BilingualText value={bi('Not recorded', 'غير مسجل')} />;
  const coachContent = coach ? (isArabic ? coach.nameAr : coach.nameEn) : <BilingualText value={bi('Not recorded', 'غير مسجل')} />;

  return (
    <article className="athlete-dark-card next-session-reference-card" aria-labelledby="ref-next-session-title">
      <header className="athlete-dark-card__header">
        <h2 id="ref-next-session-title" className="athlete-dark-card__title">
          <BilingualText value={bi('Next Training Session', 'الحصة التدريبية القادمة')} />
        </h2>
        <Link to="/player/schedule" className="athlete-dark-card__schedule-link">
          <span><BilingualText value={bi('View Schedule', 'عرض الجدول')} /></span>
          <ArrowUpRight size={14} className="rtl:rotate-[-90deg]" />
        </Link>
      </header>

      <div className="next-session-reference-body">
        <div className="next-session-reference-info">
          <div className="next-session-reference-row">
            <div className="next-session-reference-icon-box">
              <Calendar size={15} className="text-amber-400" />
            </div>
            <div className="next-session-reference-text">
              <span className="next-session-reference-label">
                <BilingualText value={bi('Date', 'التاريخ')} />
              </span>
              <strong className="next-session-reference-val">{sessionDateStr}</strong>
            </div>
          </div>

          <div className="next-session-reference-row">
            <div className="next-session-reference-icon-box">
              <Clock size={15} className="text-amber-400" />
            </div>
            <div className="next-session-reference-text">
              <span className="next-session-reference-label">
                <BilingualText value={bi('Time', 'الوقت')} />
              </span>
              <strong className="next-session-reference-val">{sessionTimeStr}</strong>
            </div>
          </div>

          <div className="next-session-reference-row">
            <div className="next-session-reference-icon-box">
              <MapPin size={15} className="text-amber-400" />
            </div>
            <div className="next-session-reference-text">
              <span className="next-session-reference-label">
                <BilingualText value={bi('Venue', 'الملعب')} />
              </span>
              <strong className="next-session-reference-val">
                {venueContent}
              </strong>
            </div>
          </div>

          <div className="next-session-reference-row">
            <div className="next-session-reference-icon-box">
              <User size={15} className="text-amber-400" />
            </div>
            <div className="next-session-reference-text">
              <span className="next-session-reference-label">
                <BilingualText value={bi('Coach', 'المدرب')} />
              </span>
              <strong className="next-session-reference-val">{coachContent}</strong>
            </div>
          </div>
        </div>

        <div className="next-session-reference-media-box">
          <img
            src="/media/sports/football/football-01-hero.webp"
            alt=""
            aria-hidden="true"
            className="next-session-reference-media-img"
            loading="lazy"
          />
          <div className="next-session-reference-media-overlay">
            <span className="next-session-reference-facility-badge">
              UNITED OLYMPICS SPORTS
            </span>
            <span className="next-session-reference-facility-motto">
              THIS IS WHERE BETTER PLAYERS ARE BUILT
            </span>
          </div>
        </div>
      </div>

      <div className="next-session-reference-footer">
        <button
          type="button"
          onClick={handleActionClick}
          className="next-session-reference-cta-btn"
        >
          <span><BilingualText value={bi('View Session', 'عرض الحصة')} /></span>
          <span className="rtl:rotate-180">→</span>
        </button>
      </div>
    </article>
  );
}
