import React from 'react';
import { Calendar, Clock, MapPin, User, Users, CalendarCheck2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getSport, getGroup, getCoach } from '../../../data/demo/selectors';

export function PlayerSessionDetailContent({ sessionId }: { sessionId: string }) {
  const { player, sessions, coach: primaryCoach } = usePlayerSession();

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto border-amber-400/20">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-bold text-white">
          <BilingualText value={bi('Session Not Found', 'الحصة غير موجودة')} />
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          <BilingualText
            value={bi(
              `The training session reference "${sessionId}" could not be located in your assigned program records.`,
              `لم يتم العثور على الحصة التدريبية المرجعية "${sessionId}" ضمن سجلات برنامجك التدريبي.`
            )}
          />
        </p>
        <Link
          to="/player/schedule"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-colors mt-2"
        >
          <span><BilingualText value={bi('View Full Schedule', 'عرض الجدول الكامل')} /></span>
        </Link>
      </div>
    );
  }

  const sport = getSport(session.sportId);
  const group = getGroup(session.groupId);
  const leadCoach = (group?.coachIds && group.coachIds[0] ? getCoach(group.coachIds[0]) : null) || primaryCoach;

  const startDate = new Date(session.startsAt);
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = startDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateIso = session.startsAt.split('T')[0];
  const attendanceForDate = player?.attendanceRecords?.find((r) => r.date === dateIso);

  return (
    <div className="athlete-glass-card p-6 sm:p-8 border-amber-400/30">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <BilingualText value={sport ? sport.name : bi('Sport Training', 'تدريب رياضي')} />
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {session.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            <BilingualText value={bi('Assigned Training Session', 'الحصة التدريبية المخصصة')} />
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 font-medium text-amber-300">
              <Calendar size={15} className="text-amber-400" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-200">
              <Clock size={15} className="text-amber-400" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start text-center">
            <BilingualText value={session.status} />
          </span>
          {attendanceForDate && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <CalendarCheck2 size={14} className="text-blue-400" />
              <span>
                <BilingualText value={bi(`Attendance: ${attendanceForDate.status.toUpperCase()}`, `تسجيل الحضور: ${attendanceForDate.status}`)} />
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={14} className="text-amber-400" />
            <span><BilingualText value={bi('Training Group', 'المجموعة التدريبية')} /></span>
          </div>
          <p className="text-sm font-bold text-white">
            <BilingualText value={group ? group.name : bi('Assigned Squad', 'المجموعة المخصصة')} />
          </p>
          <p className="text-[11px] text-slate-400">
            <BilingualText value={group ? group.ageGroup : bi('Standard', 'عادي')} /> · <BilingualText value={group ? group.level : bi('Level', 'المستوى')} />
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <User size={14} className="text-amber-400" />
            <span><BilingualText value={bi('Supervising Coach', 'المدرب المشرف')} /></span>
          </div>
          <p className="text-sm font-bold text-white">
            {leadCoach ? leadCoach.nameEn : <BilingualText value={bi('Not assigned', 'غير معين')} />}
          </p>
          {leadCoach && (
            <p className="text-[11px] text-slate-400">
              {leadCoach.nameAr}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={14} className="text-amber-400" />
            <span><BilingualText value={bi('Facility / Location', 'المرفق الرياضي')} /></span>
          </div>
          <p className="text-sm font-bold text-white">
            <BilingualText value={bi('—', '—')} />
          </p>
        </div>
      </div>
    </div>
  );
}
