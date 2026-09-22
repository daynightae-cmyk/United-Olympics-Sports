import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarCheck2,
  Clock,
  Download,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { formatPlayerDate, formatPlayerTime } from '../foundation/playerLocale';
import type { Session } from '../../../domain/contracts';

export function PlayerSessionDetailContent({ sessionId }: { sessionId: string }) {
  const { player, sessions, sport, group, coach, program, branch, isPreviewSession } = usePlayerSession();
  const { bilingualOrder } = useUiSettings();
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    return (
      <div className="athlete-empty-system">
        <div>
          <AlertCircle size={36} className="mx-auto text-amber-400" />
          <h1 className="mt-4 text-xl font-bold text-white">
            <BilingualText value={bi('Session record not found', 'سجل الحصة غير موجود')} />
          </h1>
          <p className="mt-2 text-xs leading-6 text-slate-400 max-w-md mx-auto">
            <BilingualText
              value={bi(
                `The session reference “${sessionId}” is not linked to your assigned training group in current records.`,
                `مرجع الحصة “${sessionId}” غير مرتبط بمجموعة تدريبك في السجلات الحالية.`
              )}
            />
          </p>
          <Link to="/player/schedule" className="athlete-action-primary mt-5 inline-flex items-center gap-2">
            <ArrowLeft size={15} className="rtl:rotate-180" />
            <BilingualText value={bi('Return to training schedule', 'العودة لجدول التدريب')} />
          </Link>
        </div>
      </div>
    );
  }

  const dateIso = session.startsAt.split('T')[0];
  const attendanceForDate = player?.attendanceRecords.find((record) => record.date === dateIso);
  const sessionDate = new Date(session.startsAt);
  const now = new Date();
  const isFuture = sessionDate.getTime() >= now.getTime();
  const isToday = sessionDate.toDateString() === now.toDateString();

  const icsDownloadUrl = generateIcsUrl(
    session,
    sport?.name.en ?? 'Training Session',
    group?.name.en ?? 'United Olympics Sports Group',
    branch?.name.en ?? 'United Olympics Sports'
  );

  return (
    <div className="space-y-6">
      {/* Session Hero & Preparation Banner */}
      <section className="athlete-glass-card p-6 sm:p-8 border-amber-400/30">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="athlete-data-scope">
                <BilingualText value={sport?.name ?? bi('Sport not recorded', 'الرياضة غير مسجلة')} />
              </span>
              {program && (
                <span className="athlete-data-scope text-amber-300 border-amber-400/30">
                  <Layers size={12} />
                  <BilingualText value={program.name} />
                </span>
              )}
              {isPreviewSession && (
                <span className="athlete-data-scope text-amber-300 border-amber-400/30">
                  <Sparkles size={12} />
                  <BilingualText value={bi('Preview data', 'بيانات معاينة')} />
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-500">
                #{session.id.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              <BilingualText value={bi('Training Session Details', 'تفاصيل الحصة التدريبية')} />
            </h1>

            <p className="text-xs leading-6 text-slate-400 max-w-2xl">
              <BilingualText
                value={bi(
                  'Scheduled training session details and group assignment for your player record.',
                  'تفاصيل الحصة التدريبية وسياق المجموعة المسجلة في ملف اللاعب الخاص بك.'
                )}
              />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15">
              <BilingualText value={session.status} />
            </span>

            {isToday ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <BilingualText value={bi('Happening today', 'تقام اليوم')} />
              </span>
            ) : isFuture ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <BilingualText value={bi('Upcoming', 'قادمة')} />
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                <BilingualText value={bi('Past session', 'حصة سابقة')} />
              </span>
            )}

            {attendanceForDate && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
                <CalendarCheck2 size={14} />
                <BilingualText value={attendanceLabel(attendanceForDate.status)} />
              </span>
            )}
          </div>
        </div>

        {/* Truthful Session Status Summary */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400 block mb-4">
            <BilingualText value={bi('Session Status Summary', 'ملخص حالة الحصة')} />
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[.02] p-3">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                <BilingualText value={bi('Lifecycle Status', 'حالة الحصة')} />
              </span>
              <strong className="text-xs text-white block">
                <BilingualText value={session.status} />
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                <BilingualText value={bi('Recorded in system database', 'مسجلة في قاعدة بيانات النظام')} />
              </span>
            </div>

            <div className={`rounded-xl border p-3 ${isToday ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/[.02]'}`}>
              <span className="text-[10px] font-bold text-amber-400 block mb-1">
                <BilingualText value={bi('Scheduled Start', 'موعد البدء المجدول')} />
              </span>
              <strong className="text-xs text-white block font-mono">
                {formatPlayerTime(session.startsAt, bilingualOrder)}
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {formatPlayerDate(session.startsAt, bilingualOrder, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className={`rounded-xl border p-3 ${attendanceForDate ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[.02]'}`}>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                <BilingualText value={bi('Attendance Record', 'سجل الحضور')} />
              </span>
              <strong className="text-xs text-white block">
                {attendanceForDate ? (
                  <span className="text-emerald-300"><BilingualText value={attendanceLabel(attendanceForDate.status)} /></span>
                ) : (
                  <span className="text-slate-400"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>
                )}
              </strong>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {attendanceForDate ? (
                  <BilingualText value={bi('Recorded attendance entry', 'مدخل حضور مسجل')} />
                ) : (
                  <BilingualText value={bi('Recorded when submitted by coach', 'يُسجل عند اعتماده من المدرب')} />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <RecordCard
            icon={<Calendar size={15} />}
            label={bi('Date', 'التاريخ')}
            value={formatPlayerDate(session.startsAt, bilingualOrder, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          />
          <RecordCard
            icon={<Clock size={15} />}
            label={bi('Time', 'الوقت')}
            value={formatPlayerTime(session.startsAt, bilingualOrder)}
          />
          <RecordCard
            icon={<Users size={15} />}
            label={bi('Training group', 'المجموعة التدريبية')}
            value={group ? `${group.name.en} · ${group.name.ar}` : undefined}
            secondary={group ? `${group.ageGroup.en} · ${group.ageGroup.ar} · ${group.level.en} · ${group.level.ar}` : undefined}
          />
          <RecordCard
            icon={<User size={15} />}
            label={bi('Assigned coach', 'المدرب المعيّن')}
            value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined}
            secondary={coach?.specializations?.length ? coach.specializations.join(' · ') : undefined}
          />
          <RecordCard
            icon={<MapPin size={15} />}
            label={bi('Facility / branch', 'المرفق / الفرع')}
            value={branch ? `${branch.name.en} · ${branch.name.ar}` : undefined}
          />
          <RecordCard
            icon={<CalendarCheck2 size={15} />}
            label={bi('Attendance status', 'حالة الحضور')}
            value={attendanceForDate ? `${attendanceLabel(attendanceForDate.status).en} · ${attendanceLabel(attendanceForDate.status).ar}` : undefined}
            secondary={attendanceForDate ? undefined : (bilingualOrder === 'ar-first' ? 'يتم تسجيل الحضور من قبل المدرب في الميدان' : 'Recorded on-site by coaching team')}
          />
        </div>

        {/* General Advisory Notice */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/[.02] p-4 text-xs text-slate-300 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
              <BilingualText value={bi('General Athlete Advisory (Advisory — Not Session Data)', 'إرشادات عامة للاعب (توجيهات عامة — وليست بيانات خاصة بالحصة)')} />
            </span>
            <p className="leading-relaxed text-slate-400 m-0">
              <BilingualText value={bi(
                'Bring sport-appropriate apparel, personal hydration, and report to your designated coach at the scheduled start time. Specific drills and session protocols are communicated directly on-site.',
                'يرجى إحضار الملابس الرياضية المناسبة وعبوة المياه الشخصية، والتواجد مع المدرب في موعد البدء المجدول. تُحدد التمارين والبروتوكولات الميدانية مباشرة في موقع التدريب.'
              )} />
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="athlete-action-row mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
          <a
            href={icsDownloadUrl}
            download={`uos-session-${session.id}.ics`}
            className="athlete-action-primary inline-flex items-center gap-2"
          >
            <Download size={14} />
            <BilingualText value={bi('Add to Calendar (.ics)', 'إضافة للتقويم (.ics)')} />
          </a>

          <Link to="/player/schedule" className="athlete-action-secondary inline-flex items-center gap-2">
            <Calendar size={14} />
            <BilingualText value={bi('Back to Schedule', 'العودة للجدول')} />
          </Link>

          <Link to="/player/attendance" className="athlete-action-secondary inline-flex items-center gap-2">
            <CalendarCheck2 size={14} />
            <BilingualText value={bi('View Attendance History', 'عرض سجل الحضور')} />
          </Link>
        </div>

        {/* Data Boundary & Privacy Guarantee Note */}
        <div className="athlete-truth-note mt-6">
          <ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed">
            <BilingualText value={bi(
              'This view is strictly scoped to your authorized player record. Peer attendee identities, guardian contacts, and internal administrative notes are excluded to guarantee privacy.',
              'تقتصر هذه المعاينة حصرًا على سجل اللاعب المصرح به. وتُستثنى بيانات المشاركين الآخرين وجهات اتصال أولياء الأمور والملاحظات الإدارية الداخلية لضمان الخصوصية التامة.'
            )} />
          </p>
        </div>
      </section>
    </div>
  );
}

function RecordCard({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  label: { en: string; ar: string };
  value?: string;
  secondary?: string;
}) {
  return (
    <div className="athlete-field">
      <span className="flex items-center gap-1.5 text-amber-400">
        {icon}
        <BilingualText value={label} />
      </span>
      <strong className={value ? '' : 'athlete-unavailable'}>
        {value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}
      </strong>
      {secondary && (
        <small className="mt-1 block text-[10px] leading-5 text-slate-400 font-medium">
          {secondary}
        </small>
      )}
    </div>
  );
}

function attendanceLabel(status: 'present' | 'absent' | 'late' | 'excused') {
  if (status === 'present') return bi('Present', 'حاضر');
  if (status === 'late') return bi('Late', 'متأخر');
  if (status === 'excused') return bi('Excused', 'معذور');
  return bi('Absent', 'غائب');
}

function generateIcsUrl(session: Session, sportName: string, groupName: string, venueName: string) {
  const start = new Date(session.startsAt);
  const formatIcs = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//United Olympics Sports//Player Schedule//EN',
    'BEGIN:VEVENT',
    `UID:uos-${session.id}@unitedolympicssports.com`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(start)}`,
    `SUMMARY:UOS Training: ${sportName} - ${groupName}`,
    `DESCRIPTION:United Olympics Sports scheduled training session for group ${groupName}.`,
    `LOCATION:${venueName}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
