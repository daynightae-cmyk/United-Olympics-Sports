import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  Calendar,
  Filter,
  Check,
  XCircle,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalAttendancePage() {
  const { player, attendanceRecords, attendanceStats } = usePlayerSession();
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'excused' | 'absent'>('all');

  if (!player) return null;

  const filteredRecords = attendanceRecords.filter((record) => filter === 'all' || record.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><Check size={12} aria-hidden="true" /><BilingualText value={bi('Present · On Time', 'حاضر · في الموعد')} /></span>;
      case 'late':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1"><Clock size={12} aria-hidden="true" /><BilingualText value={bi('Late Arrival', 'حضور متأخر')} /></span>;
      case 'excused':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1"><AlertCircle size={12} aria-hidden="true" /><BilingualText value={bi('Excused Absence', 'غياب معذور')} /></span>;
      case 'absent':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1"><XCircle size={12} aria-hidden="true" /><BilingualText value={bi('Unexcused Absence', 'غياب غير معذور')} /></span>;
    }
  };

  return (
    <div className="space-y-6" id="player-attendance-page">
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400" aria-hidden="true"><CheckCircle2 size={18} /></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400"><BilingualText value={bi('Habit & Consistency Track', 'مسار الالتزام والانضباط')} /></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Attendance Journey', 'مسيرة الحضور التدريبي')} /></h1>
            <p className="text-xs text-slate-300"><BilingualText value={bi(`Attendance records for athlete ${player.nameEn}`, `سجل الحضور للرياضي ${player.nameAr}`)} /></p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Flame size={15} className="text-amber-400" aria-hidden="true" />
              {attendanceStats.total === 0
                ? <BilingualText value={bi('No streak recorded', 'لا يوجد تسلسل مسجل')} />
                : <span>{attendanceStats.streak} <BilingualText value={bi('Sessions Streak', 'حصص متتالية')} /></span>}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Overall Attendance Rate', 'نسبة الحضور الإجمالية')} /></span>
            {attendanceStats.rate === null
              ? <strong className="text-slate-300 text-sm font-bold"><BilingualText value={bi('No record yet', 'لا يوجد سجل بعد')} /></strong>
              : <strong className="text-emerald-400 text-xl font-bold">{attendanceStats.rate}%</strong>}
          </div>
          <div className="athlete-stat-pill"><span><BilingualText value={bi('Present (On Time)', 'حاضر (في الموعد)')} /></span><strong className="text-white text-xl font-bold">{attendanceStats.present}</strong></div>
          <div className="athlete-stat-pill"><span><BilingualText value={bi('Late Arrivals', 'حضور متأخر')} /></span><strong className="text-amber-400 text-xl font-bold">{attendanceStats.late}</strong></div>
          <div className="athlete-stat-pill"><span><BilingualText value={bi('Recorded Sessions', 'الحصص المسجلة')} /></span><strong className="text-slate-300 text-xl font-bold">{attendanceStats.total}</strong></div>
        </div>
      </div>

      <div className="athlete-glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Calendar size={16} className="text-amber-400" aria-hidden="true" /><BilingualText value={bi('Session Rhythm & Attendance Pulse', 'نبض وإيقاع الحضور التدريبي')} /></h3>
        <p className="text-xs text-slate-400 mb-5"><BilingualText value={bi('Visual representation of consecutive attendance across recorded dates only.', 'تمثيل بصري لتسلسل الحضور عبر التواريخ المسجلة فقط.')} /></p>

        {attendanceRecords.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {attendanceRecords.map((record) => {
              const dateObj = new Date(record.date);
              const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const tone = record.status === 'present'
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                : record.status === 'late'
                  ? 'bg-amber-400'
                  : record.status === 'absent'
                    ? 'bg-red-400'
                    : 'bg-blue-400';
              return (
                <div key={record.id} className="p-3.5 rounded-xl border bg-white/5 border-white/10 flex flex-col justify-between gap-2 transition-all">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-200">{dateStr}</span><span className={`w-2.5 h-2.5 rounded-full ${tone}`} aria-hidden="true" /></div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5"><span><BilingualText value={bi('Training Session', 'حصة تدريبية')} /></span>{getStatusBadge(record.status)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <Calendar size={24} className="mx-auto mb-3 text-slate-500" aria-hidden="true" />
            <strong className="block text-sm text-slate-200"><BilingualText value={bi('No attendance record yet', 'لا يوجد سجل حضور بعد')} /></strong>
            <p className="mt-1 text-xs text-slate-400"><BilingualText value={bi('Recorded sessions will appear here when attendance data exists.', 'ستظهر الحصص المسجلة هنا عند توفر بيانات الحضور.')} /></p>
          </div>
        )}
      </div>

      <div className="athlete-glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white"><BilingualText value={bi('Attendance Records', 'سجلات الحضور')} /></h3>
            <p className="text-xs text-slate-400 mt-0.5"><BilingualText value={bi('Recorded attendance history only', 'سجل الحضور المسجل فقط')} /></p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs" aria-label="Attendance filters | فلاتر الحضور">
            {(['all', 'present', 'late', 'excused', 'absent'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${filter === value ? 'bg-amber-400 text-black shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                <Filter size={11} className="inline-block me-1" aria-hidden="true" />{value}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/5 my-2">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-300" aria-hidden="true"><Calendar size={16} /></div>
                  <div>
                    <strong className="text-xs font-bold text-slate-100 block">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    <span className="text-[11px] text-slate-400"><BilingualText value={bi('Training Session', 'حصة تدريبية')} /></span>
                  </div>
                </div>
                <div>{getStatusBadge(record.status)}</div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Calendar size={22} className="mx-auto mb-2 text-slate-500" aria-hidden="true" />
              <strong className="block text-slate-300"><BilingualText value={bi('No attendance records', 'لا توجد سجلات حضور')} /></strong>
              <span><BilingualText value={filter === 'all' ? bi('No record has been stored yet.', 'لم يتم تسجيل أي سجل بعد.') : bi('No records match the selected filter.', 'لا توجد سجلات تطابق الفلتر المحدد.')} /></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
