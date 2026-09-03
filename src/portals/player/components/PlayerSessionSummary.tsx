import React from 'react';
import { Calendar, Clock, User, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerSessionSummary({ sessionId, onClick }: { sessionId: string, onClick?: () => void }) {
  const { player, sessions, coach, sport, group } = usePlayerSession();

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="athlete-glass-card p-5 flex items-center gap-4 text-slate-400 border-amber-400/20">
        <AlertCircle size={20} className="text-amber-400" />
        <span className="text-xs font-semibold">
          <BilingualText value={bi('Session unavailable or not assigned to you.', 'الحصة غير متاحة أو غير مخصصة لك.')} />
        </span>
      </div>
    );
  }

  const startDate = new Date(session.startsAt);
  const timeStr = startDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className={`athlete-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${onClick ? 'athlete-glass-card-interactive cursor-pointer' : ''}`}
    >
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex flex-col items-center justify-center text-amber-400 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase">
            {startDate.toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <span className="text-lg font-extrabold leading-none text-white">
            {startDate.getDate()}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100">
              <BilingualText value={sport ? sport.name : bi('Training Session', 'حصة تدريبية')} />
            </span>
            <span className="text-[11px] text-amber-400/90 font-medium">
              · <BilingualText value={group ? group.name : bi('—', '—')} />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-slate-300">
              <Clock size={13} className="text-amber-400" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1">
              <User size={13} className="text-amber-400" />
              <span>{coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BilingualText value={session.status} />
        </span>
        <Link
          to={`/player/schedule/${session.id}`}
          onClick={(e) => {
            if (onClick) {
              // we don't prevent default, just stop prop
              e.stopPropagation();
            }
          }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={bi('Open session detail', 'فتح تفاصيل الحصة').en}
        >
          <ChevronRight size={16} className="rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
