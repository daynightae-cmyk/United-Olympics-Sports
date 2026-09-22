import { CalendarClock, ChevronRight, MapPin, UsersRound } from 'lucide-react';
import type { Coach, Session, Sport, TrainingGroup } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { formatPlayerDate, formatPlayerTime } from '../foundation/playerLocale';

interface PlayerSessionSummaryCardProps {
  session: Session;
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  branch?: { id: string; name: { en: string; ar: string } };
  attendanceStatus?: 'present' | 'absent' | 'late' | 'excused';
  onOpen?: () => void;
  compact?: boolean;
}

export function PlayerSessionSummaryCard({
  session,
  sport,
  group,
  coach,
  branch,
  attendanceStatus,
  onOpen,
  compact = false,
}: PlayerSessionSummaryCardProps) {
  const { bilingualOrder } = useUiSettings();

  const attendanceBadge = attendanceStatus ? {
    present: { label: bi('Present', 'حاضر'), class: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
    late: { label: bi('Late', 'متأخر'), class: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
    excused: { label: bi('Excused', 'معذور'), class: 'text-sky-300 border-sky-500/30 bg-sky-500/10' },
    absent: { label: bi('Absent', 'غائب'), class: 'text-rose-300 border-rose-500/30 bg-rose-500/10' },
  }[attendanceStatus] : null;

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
          <div className="flex items-center gap-1.5 flex-wrap">
            {attendanceBadge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${attendanceBadge.class}`}>
                <BilingualText value={attendanceBadge.label} />
              </span>
            )}
            <span className="cgpt-session-card__status"><BilingualText value={session.status} /></span>
          </div>
        </div>
        <div className="cgpt-session-card__meta">
          {group && <span><UsersRound size={13} /><BilingualText value={group.name} /></span>}
          <span>{coach ? (bilingualOrder === 'ar-first' ? coach.nameAr : coach.nameEn) : (bilingualOrder === 'ar-first' ? 'غير معين' : 'Not assigned')}</span>
          {branch && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-amber-400/80" />
              <BilingualText value={branch.name} />
            </span>
          )}
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
