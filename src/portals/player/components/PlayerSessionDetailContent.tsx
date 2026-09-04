import { AlertCircle, Calendar, CalendarCheck2, Clock, MapPin, ShieldCheck, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getCoach, getGroup, getSport } from '../../../data/demo/selectors';

export function PlayerSessionDetailContent({ sessionId }: { sessionId: string }) {
  const { player, sessions, coach: primaryCoach } = usePlayerSession();
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    return <div className="athlete-empty-system"><div><AlertCircle size={34} className="mx-auto text-amber-400" /><h1 className="mt-4 text-lg font-bold text-white"><BilingualText value={bi('Session record not found', 'سجل الحصة غير موجود')} /></h1><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi(`The session reference “${sessionId}” is not linked to the current athlete schedule.`, `مرجع الحصة “${sessionId}” غير مرتبط بجدول اللاعب الحالي.`)} /></p><Link to="/player/schedule" className="athlete-action-primary mt-4"><BilingualText value={bi('Return to schedule', 'العودة إلى الجدول')} /></Link></div></div>;
  }

  const sport = getSport(session.sportId);
  const group = getGroup(session.groupId);
  const leadCoach = (group?.coachIds?.[0] ? getCoach(group.coachIds[0]) : undefined) ?? primaryCoach;
  const dateIso = session.startsAt.split('T')[0];
  const attendanceForDate = player?.attendanceRecords.find((record) => record.date === dateIso);

  return (
    <section className="athlete-glass-card p-6 sm:p-8 border-amber-400/30">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="athlete-data-scope"><BilingualText value={sport?.name ?? bi('Sport not recorded', 'الرياضة غير مسجلة')} /></span><span className="text-[10px] font-mono text-slate-500"><BilingualText value={bi('Session ID', 'معرف الحصة')} />: {session.id}</span></div><h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white"><BilingualText value={bi('Assigned Training Session', 'الحصة التدريبية المخصصة')} /></h1><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('This page shows only fields available in the linked session, group, coach and attendance records.', 'تعرض هذه الصفحة الحقول المتاحة فقط في سجلات الحصة والمجموعة والمدرب والحضور المرتبطة.')} /></p></div>
        <div className="flex flex-wrap gap-2"><span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"><BilingualText value={session.status} /></span>{attendanceForDate && <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 inline-flex items-center gap-1.5"><CalendarCheck2 size={14} /><BilingualText value={attendanceLabel(attendanceForDate.status)} /></span>}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
        <RecordCard icon={<Calendar size={15} />} label={bi('Date', 'التاريخ')} value={formatDate(session.startsAt)} />
        <RecordCard icon={<Clock size={15} />} label={bi('Time', 'الوقت')} value={formatTime(session.startsAt)} />
        <RecordCard icon={<Users size={15} />} label={bi('Training group', 'المجموعة التدريبية')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} secondary={group ? `${group.ageGroup.en} · ${group.ageGroup.ar} · ${group.level.en} · ${group.level.ar}` : undefined} />
        <RecordCard icon={<User size={15} />} label={bi('Supervising coach', 'المدرب المشرف')} value={leadCoach ? `${leadCoach.nameEn} · ${leadCoach.nameAr}` : undefined} />
        <RecordCard icon={<MapPin size={15} />} label={bi('Facility / location', 'المرفق / الموقع')} value={undefined} />
        <RecordCard icon={<CalendarCheck2 size={15} />} label={bi('Attendance record', 'سجل الحضور')} value={attendanceForDate ? `${attendanceLabel(attendanceForDate.status).en} · ${attendanceLabel(attendanceForDate.status).ar}` : undefined} />
      </div>

      <div className="athlete-truth-note mt-5"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Duration, facility, directions, equipment list and check-in controls are not shown as operational features because those fields are not present in the current session contract.', 'لا يتم عرض المدة أو المرفق أو الاتجاهات أو قائمة المعدات أو أدوات تسجيل الوصول كميزات تشغيلية لأن هذه الحقول غير موجودة في عقد الحصة الحالي.')} /></div>
    </section>
  );
}

function RecordCard({ icon, label, value, secondary }: { icon: React.ReactNode; label: { en: string; ar: string }; value?: string; secondary?: string }) {
  return <div className="athlete-field"><span className="flex items-center gap-1.5 text-amber-400">{icon}<BilingualText value={label} /></span><strong className={value ? '' : 'athlete-unavailable'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong>{secondary && <small className="mt-1 block text-[10px] leading-5 text-slate-500">{secondary}</small>}</div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} · ${date.toLocaleDateString('ar', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} · ${date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}`;
}

function attendanceLabel(status: 'present' | 'absent' | 'late' | 'excused') {
  if (status === 'present') return bi('Present', 'حاضر');
  if (status === 'late') return bi('Late', 'متأخر');
  if (status === 'excused') return bi('Excused', 'معذور');
  return bi('Absent', 'غائب');
}
