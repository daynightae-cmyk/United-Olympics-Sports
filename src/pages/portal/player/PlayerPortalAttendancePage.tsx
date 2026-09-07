import { AlertCircle, Calendar, Check, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { AttendanceStatus } from '../../../domain/contracts';

type AttendanceFilter = 'all' | AttendanceStatus;
const filters: Array<{ id: AttendanceFilter; label: { en: string; ar: string } }> = [
  { id: 'all', label: bi('All', 'الكل') },
  { id: 'present', label: bi('Present', 'حاضر') },
  { id: 'late', label: bi('Late', 'متأخر') },
  { id: 'excused', label: bi('Excused', 'معذور') },
  { id: 'absent', label: bi('Absent', 'غائب') },
];

export function PlayerPortalAttendancePage() {
  const { player, attendanceRecords, attendanceStats } = usePlayerSession();
  const [filter, setFilter] = useState<AttendanceFilter>('all');
  if (!player) return null;

  const filteredRecords = attendanceRecords.filter((record) => filter === 'all' || record.status === filter);
  const aggregateRate = typeof attendanceStats.rate === 'number' && Number.isFinite(attendanceStats.rate)
    ? attendanceStats.rate
    : null;
  const hasDetailedEvents = attendanceRecords.length > 0;

  return (
    <div className="space-y-6" id="player-attendance-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400"><CheckCircle2 size={18} /><BilingualText value={bi('Attendance Data', 'بيانات الحضور')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Attendance Journey', 'مسيرة الحضور')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`The player record for ${player.nameEn} may expose an aggregate attendance rate even when the shared provider does not expose dated attendance events. These two data levels are kept separate.`, `قد يوفّر سجل اللاعب ${player.nameAr} نسبة حضور إجمالية حتى عندما لا يوفّر مزود البيانات المشترك أحداث حضور مؤرخة. ويتم الفصل بين مستويي البيانات بوضوح.`)} /></p></div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={hasDetailedEvents ? bi('Aggregate + event records', 'ملخص + سجلات أحداث') : bi('Aggregate signal only', 'مؤشر إجمالي فقط')} /></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <Stat label={bi('Provider attendance rate', 'نسبة الحضور من المزود')} value={aggregateRate === null ? undefined : `${aggregateRate}%`} />
          <Stat label={bi('Detailed events', 'الأحداث التفصيلية')} value={hasDetailedEvents ? String(attendanceRecords.length) : undefined} />
          <Stat label={bi('Present events', 'أحداث الحضور')} value={hasDetailedEvents ? String(attendanceStats.present) : undefined} />
          <Stat label={bi('Late events', 'أحداث التأخير')} value={hasDetailedEvents ? String(attendanceStats.late) : undefined} />
        </div>
      </section>

      {!hasDetailedEvents && (
        <section className="athlete-glass-card p-5 sm:p-6">
          <div className="athlete-empty-system">
            <div><Calendar size={32} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('Detailed attendance events are not available', 'أحداث الحضور التفصيلية غير متاحة')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('No present/late/absent/excused counts, streak or dated history is inferred from the aggregate rate. A dedicated attendance-event contract is required before those details can be shown.', 'لا يتم استنتاج أعداد الحضور أو التأخير أو الغياب أو الأعذار أو التسلسل أو السجل المؤرخ من النسبة الإجمالية. يلزم عقد مخصص لأحداث الحضور قبل عرض تلك التفاصيل.')} /></p>{aggregateRate !== null && <p className="mt-3 text-xs font-bold text-emerald-300"><BilingualText value={bi(`Recorded aggregate rate: ${aggregateRate}%`, `النسبة الإجمالية المسجلة: ${aggregateRate}%`)} /></p>}</div>
          </div>
        </section>
      )}

      {hasDetailedEvents && (
        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Detailed history', 'السجل التفصيلي')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Attendance Events', 'أحداث الحضور')} /></h2></div><div className="flex flex-wrap gap-2" role="tablist" aria-label="Attendance filters | فلاتر الحضور">{filters.map((item) => <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${filter === item.id ? 'bg-amber-400 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}><BilingualText value={item.label} /></button>)}</div></header>
          {filteredRecords.length ? <div className="mt-3 divide-y divide-white/5">{filteredRecords.map((record) => <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 grid place-items-center text-amber-400"><Calendar size={15} /></span><div><strong className="text-xs text-white block">{formatDateLong(record.date)}</strong><span className="text-[10px] text-slate-500"><BilingualText value={bi('Recorded attendance event', 'حدث حضور مسجل')} /></span></div></div><StatusBadge status={record.status} /></div>)}</div> : <div className="athlete-empty-system mt-4"><div><Calendar size={30} className="mx-auto text-slate-500" /><h3 className="mt-3 text-sm font-bold text-white"><BilingualText value={bi('No events match this filter', 'لا توجد أحداث تطابق هذا الفلتر')} /></h3></div></div>}
        </section>
      )}

      <div className="athlete-truth-note"><AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('The portal never converts missing event-level attendance into zero attendance, perfect attendance or a fabricated streak.', 'لا تحوّل البوابة غياب بيانات أحداث الحضور إلى حضور صفري أو حضور كامل أو تسلسل مصطنع.')} /></div>
    </div>
  );
}

function Stat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-white text-xl font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not available', 'غير متاح')} />}</strong></div>;
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === 'present') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"><Check size={11} /><BilingualText value={bi('Present', 'حاضر')} /></span>;
  if (status === 'late') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20"><Clock size={11} /><BilingualText value={bi('Late', 'متأخر')} /></span>;
  if (status === 'excused') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20"><AlertCircle size={11} /><BilingualText value={bi('Excused', 'معذور')} /></span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-300 border border-red-500/20"><XCircle size={11} /><BilingualText value={bi('Absent', 'غائب')} /></span>;
}

function formatDateLong(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} · ${date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}`;
}
