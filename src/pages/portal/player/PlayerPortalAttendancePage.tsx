import { AlertCircle, Calendar, Check, CheckCircle2, Clock, Flame, XCircle } from 'lucide-react';
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

  return (
    <div className="space-y-6" id="player-attendance-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400"><CheckCircle2 size={18} /><BilingualText value={bi('Recorded Attendance', 'الحضور المسجل')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Attendance Journey', 'مسيرة الحضور')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Attendance records linked to athlete ${player.nameEn}. Missing attendance data is never interpreted as zero attendance.`, `سجلات الحضور المرتبطة باللاعب ${player.nameAr}. ولا يتم تفسير غياب بيانات الحضور على أنه حضور بنسبة صفر.`)} /></p></div>
          <span className="athlete-data-scope"><Flame size={13} />{attendanceStats.total === 0 ? <BilingualText value={bi('No streak recorded', 'لا يوجد تسلسل مسجل')} /> : <><span>{attendanceStats.streak}</span><BilingualText value={bi('session streak', 'حصص متتالية')} /></>}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <Stat label={bi('Attendance rate', 'نسبة الحضور')} value={attendanceStats.rate === null ? undefined : `${attendanceStats.rate}%`} />
          <Stat label={bi('Present', 'حاضر')} value={attendanceStats.total ? String(attendanceStats.present) : undefined} />
          <Stat label={bi('Late', 'متأخر')} value={attendanceStats.total ? String(attendanceStats.late) : undefined} />
          <Stat label={bi('Recorded sessions', 'الحصص المسجلة')} value={attendanceStats.total ? String(attendanceStats.total) : undefined} />
        </div>
      </section>

      <section className="athlete-glass-card p-5 sm:p-6">
        <header><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Attendance pulse', 'نبض الحضور')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Recorded Session Rhythm', 'إيقاع الحصص المسجلة')} /></h2><p className="mt-1 text-xs text-slate-400"><BilingualText value={bi('Each tile represents an attendance record that actually exists for the athlete.', 'تمثل كل بطاقة سجل حضور موجودًا فعليًا للاعب.')} /></p></header>
        {attendanceRecords.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {attendanceRecords.map((record) => <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-3.5"><div className="flex items-center justify-between gap-2"><strong className="text-xs text-slate-200">{formatDate(record.date)}</strong><StatusDot status={record.status} /></div><div className="mt-3 pt-3 border-t border-white/5"><StatusBadge status={record.status} /></div></article>)}
          </div>
        ) : <div className="athlete-empty-system mt-5"><div><Calendar size={32} className="mx-auto text-slate-500" /><h3 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No attendance record yet', 'لا يوجد سجل حضور حتى الآن')} /></h3><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Rates, streaks and session counts stay unrecorded until attendance data exists.', 'تظل النسب والتسلسل وعدد الحصص غير مسجلة حتى تتوفر بيانات حضور.')} /></p></div></div>}
      </section>

      <section className="athlete-glass-card p-5 sm:p-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('History', 'السجل')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Attendance Records', 'سجلات الحضور')} /></h2></div><div className="flex flex-wrap gap-2" role="tablist" aria-label="Attendance filters | فلاتر الحضور">{filters.map((item) => <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${filter === item.id ? 'bg-amber-400 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}><BilingualText value={item.label} /></button>)}</div></header>
        {filteredRecords.length ? <div className="mt-3 divide-y divide-white/5">{filteredRecords.map((record) => <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 grid place-items-center text-amber-400"><Calendar size={15} /></span><div><strong className="text-xs text-white block">{formatDateLong(record.date)}</strong><span className="text-[10px] text-slate-500"><BilingualText value={bi('Training session attendance', 'حضور الحصة التدريبية')} /></span></div></div><StatusBadge status={record.status} /></div>)}</div> : <div className="athlete-empty-system mt-4"><div><Calendar size={30} className="mx-auto text-slate-500" /><h3 className="mt-3 text-sm font-bold text-white"><BilingualText value={filter === 'all' ? bi('No attendance records', 'لا توجد سجلات حضور') : bi('No records match this filter', 'لا توجد سجلات تطابق هذا الفلتر')} /></h3></div></div>}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-white text-xl font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === 'present') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"><Check size={11} /><BilingualText value={bi('Present', 'حاضر')} /></span>;
  if (status === 'late') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20"><Clock size={11} /><BilingualText value={bi('Late', 'متأخر')} /></span>;
  if (status === 'excused') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20"><AlertCircle size={11} /><BilingualText value={bi('Excused', 'معذور')} /></span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-300 border border-red-500/20"><XCircle size={11} /><BilingualText value={bi('Absent', 'غائب')} /></span>;
}

function StatusDot({ status }: { status: AttendanceStatus }) {
  const tone = status === 'present' ? 'bg-emerald-400' : status === 'late' ? 'bg-amber-400' : status === 'excused' ? 'bg-blue-400' : 'bg-red-400';
  return <span className={`w-2.5 h-2.5 rounded-full ${tone}`} aria-hidden="true" />;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })} · ${date.toLocaleDateString('ar', { month: 'short', day: 'numeric' })}`;
}

function formatDateLong(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} · ${date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}`;
}
