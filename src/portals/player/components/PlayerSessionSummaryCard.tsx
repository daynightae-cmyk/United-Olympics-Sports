import { CalendarClock, ChevronRight, UsersRound } from 'lucide-react';
import type { Coach, Session, Sport, TrainingGroup } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { formatPlayerDate, formatPlayerTime } from '../foundation/playerLocale';

interface PlayerSessionSummaryCardProps {
  session: Session;
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  onOpen?: () => void;
  compact?: boolean;
}

export function PlayerSessionSummaryCard({ session, sport, group, coach, onOpen, compact = false }: PlayerSessionSummaryCardProps) {
  const { bilingualOrder } = useUiSettings();
  return (
    <article className={`cgpt-session-card ${compact ? 'cgpt-session-card--compact' : ''}`}>
      <div className="cgpt-session-card__time">
        <CalendarClock size={18} />
        <strong>{formatPlayerTime(session.startsAt, bilingualOrder)}</strong>
        <span>{formatPlayerDate(session.startsAt, bilingualOrder, { day: '2-digit', month: 'short' })}</span>
      </div>
      <div className="cgpt-session-card__body">
        <div className="cgpt-session-card__topline">
          <BilingualText value={sport?.name ?? bi('Training session', 'حصة تدريبية')} />
          <span className="cgpt-session-card__status"><BilingualText value={session.status} /></span>
        </div>
        <div className="cgpt-session-card__meta">
          {group && <span><UsersRound size={13} /><BilingualText value={group.name} /></span>}
          <span>{coach ? (bilingualOrder === 'ar-first' ? coach.nameAr : coach.nameEn) : (bilingualOrder === 'ar-first' ? 'غير معين' : 'Not assigned')}</span>
        </div>
      </div>
      {onOpen && (
        <button type="button" className="cgpt-session-card__open" onClick={onOpen} aria-label={bilingualOrder === 'ar-first' ? 'فتح تفاصيل الحصة' : 'Open session details'}>
          <ChevronRight size={18} className="rtl:rotate-180" />
        </button>
      )}
    </article>
  );
}
