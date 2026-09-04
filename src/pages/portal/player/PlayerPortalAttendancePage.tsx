import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  Calendar,
  ShieldCheck,
  TrendingUp,
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

  const filteredRecords = attendanceRecords.filter((rec) => {
    if (filter === 'all') return true;
    return rec.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Check size={12} />
            <BilingualText value={bi('Present · On Time', 'حاضر · في الموعد')} />
          </span>
        );
      case 'late':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
            <Clock size={12} />
            <BilingualText value={bi('Late Arrival', 'حضور متأخر')} />
          </span>
        );
      case 'excused':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <AlertCircle size={12} />
            <BilingualText value={bi('Excused Absence', 'غياب معذور')} />
          </span>
        );
      case 'absent':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle size={12} />
            <BilingualText value={bi('Unexcused Absence', 'غياب غير معذور')} />
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="player-attendance-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <BilingualText value={bi('Habit & Consistency Track', 'مسار الالتزام والانضباط')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Attendance Journey', 'مسيرة الحضور التدريبي')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Attendance records for athlete ${player.nameEn}`,
                  `سجل الحضور للرياضي ${player.nameAr}`
                )}
              />
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Flame size={15} className="text-amber-400" />
              <span>{attendanceStats.streak} <BilingualText value={bi('Sessions Streak', 'حصص متتالية')} /></span>
            </span>
          </div>
        </div>

        {/* Metrics Quad */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Overall Attendance Rate', 'نسبة الحضور الإجمالية')} /></span>
            <strong className="text-emerald-400 text-xl font-bold">
              {attendanceStats.rate}%
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Present (On Time)', 'حاضر (في الموعد)')} /></span>
            <strong className="text-white text-xl font-bold">
              {attendanceStats.present}
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Late Arrivals', 'حضور متأخر')} /></span>
            <strong className="text-amber-400 text-xl font-bold">
              {attendanceStats.late}
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Total Scheduled Sessions', 'إجمالي الحصص المسجلة')} /></span>
            <strong className="text-slate-300 text-xl font-bold">
              {attendanceStats.total}
            </strong>
          </div>
        </div>
      </div>

      {/* Monthly Rhythm Heatmap */}
      <div className="athlete-glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-amber-400" />
          <BilingualText value={bi('Session Rhythm & Attendance Pulse', 'نبض وإيقاع الحضور التدريبي')} />
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          <BilingualText
            value={bi(
              'Visual representation of your consecutive training attendance across recorded dates.',
              'تمثيل بصري لتسلسل حضورك في الحصص التدريبية عبر التواريخ المسجلة.'
            )}
          />
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {attendanceRecords.map((record) => {
            const dateObj = new Date(record.date);
            const dateStr = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const isPresent = record.status === 'present';
            const isLate = record.status === 'late';

            return (
              <div
                key={record.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                  isPresent
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isLate
                    ? 'bg-amber-400/5 border-amber-400/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{dateStr}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPresent
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : isLate
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span><BilingualText value={bi('Training Session', 'حصة تدريبية')} /></span>
                  <span className="font-semibold capitalize text-slate-300">
                    {record.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="athlete-glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">
              <BilingualText value={bi('Attendance Records', 'سجلات الحضور')} />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              <BilingualText value={bi('Attendance history for the current season', 'سجل الحضور للموسم الحالي')} />
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['all', 'present', 'late', 'excused'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/5 my-2">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-300">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-100 block">
                      {new Date(rec.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      <BilingualText value={bi('Squad Training Session', 'حصة تدريب الفريق')} />
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(rec.status)}</div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <BilingualText value={bi('No attendance records match the selected filter.', 'لا توجد سجلات حضور تطابق الفلتر المحدد.')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
