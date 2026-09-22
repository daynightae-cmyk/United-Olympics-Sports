import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarClock,
  FileText,
  Gauge,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerAthleteIdentityCard } from '../../../portals/player/components/PlayerAthleteIdentityCard';
import { PlayerEmptyState } from '../../../portals/player/components/PlayerEmptyState';
import { PlayerSessionSummaryCard } from '../../../portals/player/components/PlayerSessionSummaryCard';
import { TrainingLog } from '../../../portals/player/components/TrainingLog';
import { useTrainingLog } from '../../../portals/player/hooks/useTrainingLog';
import { selectUpcomingSession } from '../../../portals/player/foundation/playerSelectors';
import { formatPlayerDate } from '../../../portals/player/foundation/playerLocale';

export function PlayerPortalOverviewPage() {
  const {
    player,
    sport,
    group,
    coach,
    program,
    branch,
    sessions,
    attendanceStats,
    feedback,
    overallScore,
    metrics,
    achievements,
    subscriptions,
    isPreviewSession,
  } = usePlayerSession();
  const { bilingualOrder } = useUiSettings();
  const navigate = useNavigate();
  const [identityOpen, setIdentityOpen] = useState(false);
  if (!player) return null;

  const nextSession = selectUpcomingSession(sessions);
  const score = typeof overallScore === 'number' && Number.isFinite(overallScore) ? overallScore : null;
  const attendanceRate = attendanceStats.rate;
  const latestFeedback = [...feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).at(0);
  const training = useTrainingLog(player.id);

  return (
    <div className="space-y-7" id="player-overview-page">
      <div className="athlete-overview-head">
        <div className="athlete-overview-copy">
          <span className="athlete-overview-eyebrow"><BilingualText value={bi('Athlete workspace', 'مساحة اللاعب')} /></span>
          <h1 className="athlete-overview-title"><BilingualText value={bi('Your Player Portal', 'بوابة اللاعب الخاصة بك')} /></h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPreviewSession && (
            <span className="athlete-data-scope border-amber-400/30 text-amber-300">
              <Sparkles size={13} />
              <BilingualText value={bi('Preview data mode', 'وضع بيانات المعاينة')} />
            </span>
          )}
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Player-scoped provider records', 'سجلات مزود البيانات الخاصة باللاعب')} /></span>
        </div>
      </div>

      <PlayerAthleteIdentityCard
        player={player}
        sport={sport}
        group={group}
        coach={coach}
        program={program}
        branch={branch}
        nextSession={nextSession}
        attendanceRate={attendanceRate}
        overallScore={score}
        preview={isPreviewSession}
        onOpenIdentity={() => setIdentityOpen(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-5">
        <section className="athlete-glass-card p-5 sm:p-6 space-y-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Training pulse', 'نبض التدريب')} /></span>
              <h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Next on your schedule', 'القادم في جدولك')} /></h2>
            </div>
            <CalendarClock size={20} className="text-amber-400" />
          </header>
          {nextSession ? (
            <div className="space-y-3">
              <PlayerSessionSummaryCard
                session={nextSession}
                sport={sport}
                group={group}
                coach={coach}
                onOpen={() => navigate(`/player/schedule/${nextSession.id}`)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400">
                {branch && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-400 flex-shrink-0" />
                    <BilingualText value={branch.name} />
                  </span>
                )}
                <Link
                  to="/player/schedule"
                  className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition-colors"
                >
                  <BilingualText value={bi('View all sessions', 'عرض كل الحصص')} />
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <PlayerEmptyState
                compact
                title={bi('No upcoming training', 'لا يوجد تدريب قادم')}
                description={bi('No future session is linked to the assigned group in the current records.', 'لا توجد حصة مستقبلية مرتبطة بالمجموعة المعينة ضمن السجلات الحالية.')}
              />
              <div className="pt-1">
                <Link
                  to="/player/schedule"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                >
                  <Calendar size={13} />
                  <BilingualText value={bi('Check full training schedule', 'الاطلاع على جدول التدريب الكامل')} />
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="mb-5">
            <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Athlete snapshot', 'ملخص اللاعب')} /></span>
            <h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Current recorded signals', 'المؤشرات المسجلة حاليًا')} /></h2>
          </header>
          <div className="grid grid-cols-2 gap-3">
            <Snapshot icon={<Activity size={16} />} label={bi('Attendance', 'الحضور')} value={typeof attendanceRate === 'number' ? `${attendanceRate}%` : undefined} />
            <Snapshot icon={<Gauge size={16} />} label={bi('Performance', 'الأداء')} value={score === null ? undefined : `${Math.round(score)}/100`} />
            <Snapshot
              icon={<Trophy size={16} />}
              label={bi('Achievements', 'الإنجازات')}
              value={achievements.length ? String(achievements.length) : (player.achievements.length ? String(player.achievements.length) : undefined)}
            />
            <Snapshot
              icon={<ShieldCheck size={16} />}
              label={bi('Program status', 'حالة البرنامج')}
              value={
                subscriptions.find((s) => s.status === 'active')
                  ? (bilingualOrder === 'ar-first' ? 'نشط' : 'Active')
                  : subscriptions[0]?.status
                    ? (bilingualOrder === 'ar-first' ? 'مسجل' : 'Enrolled')
                    : (player.status ? (bilingualOrder === 'ar-first' ? player.status.ar : player.status.en) : undefined)
              }
            />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="athlete-glass-card p-5 sm:p-6 space-y-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-400">
                <BilingualText value={bi('Attendance breakdown', 'تفصيل الحضور')} />
              </span>
              <h2 className="mt-1 text-lg font-black text-white">
                <BilingualText value={bi('Session attendance history', 'سجل حضور الحصص')} />
              </h2>
            </div>
            <Activity size={20} className="text-emerald-400" />
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  <BilingualText value={bi('Overall attendance rate', 'معدل الحضور العام')} />
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {typeof attendanceRate === 'number' ? `${attendanceRate}%` : <span className="athlete-unavailable text-base"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>}
                </span>
              </div>
              {attendanceStats.total > 0 && (
                <div className="text-end">
                  <span className="text-xs text-slate-400 block">
                    <BilingualText value={bi('Recorded sessions', 'الحصص المسجلة')} />
                  </span>
                  <span className="text-lg font-extrabold text-amber-300">
                    {attendanceStats.total}
                  </span>
                </div>
              )}
            </div>

            {typeof attendanceRate === 'number' && (
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={attendanceRate} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <AttendancePill label={bi('Present', 'حاضر')} count={attendanceStats.present} color="emerald" />
            <AttendancePill label={bi('Late', 'متأخر')} count={attendanceStats.late} color="amber" />
            <AttendancePill label={bi('Excused', 'معذور')} count={attendanceStats.excused} color="sky" />
            <AttendancePill label={bi('Absent', 'غائب')} count={attendanceStats.absent} color="rose" />
          </div>

          <div className="pt-1">
            <Link
              to="/player/attendance"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <BilingualText value={bi('View complete attendance records', 'عرض سجلات الحضور الكاملة')} />
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>

        <section className="athlete-glass-card p-5 sm:p-6 space-y-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400">
                <BilingualText value={bi('Performance evaluations', 'تقييمات الأداء')} />
              </span>
              <h2 className="mt-1 text-lg font-black text-white">
                <BilingualText value={bi('Recorded benchmarks', 'المؤشرات المسجلة')} />
              </h2>
            </div>
            <Gauge size={20} className="text-amber-400" />
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  <BilingualText value={bi('Overall evaluation score', 'درجة التقييم العامة')} />
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {score !== null ? (
                    <>
                      {Math.round(score)}
                      <span className="text-base font-normal text-slate-400">/100</span>
                    </>
                  ) : (
                    <span className="athlete-unavailable text-base"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>
                  )}
                </span>
              </div>
              {score !== null && (
                <div className="text-end">
                  <span className="text-xs text-slate-400 block">
                    <BilingualText value={bi('Evaluation tier', 'مستوى التقييم')} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {score >= 85 ? (
                      <BilingualText value={bi('Elite', 'نخبة')} />
                    ) : score >= 70 ? (
                      <BilingualText value={bi('Advanced', 'متقدم')} />
                    ) : score >= 50 ? (
                      <BilingualText value={bi('Developing', 'قيد التطوير')} />
                    ) : (
                      <BilingualText value={bi('Recorded', 'مسجل')} />
                    )}
                  </span>
                </div>
              )}
            </div>

            {score !== null && (
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
            )}
          </div>

          {metrics.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">
                <BilingualText value={bi('Recent recorded metrics', 'المقاييس المسجلة مؤخرًا')} />
              </span>
              <div className="space-y-1.5">
                {metrics.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.02] px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-300">
                      {item.metricId.replace(/[-_]/g, ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-300">{item.value}</span>
                      {item.recordedAt && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatPlayerDate(item.recordedAt, bilingualOrder, { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[.015] p-3 text-xs text-slate-400 leading-relaxed">
              <BilingualText
                value={bi(
                  'No individual metric benchmarks have been logged yet for this athlete.',
                  'لم يتم تسجيل مقاييس أداء فردية بعد لهذا اللاعب.'
                )}
              />
            </div>
          )}

          <div className="pt-1">
            <Link
              to="/player/performance"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <BilingualText value={bi('Open full performance center', 'فتح مركز الأداء الكامل')} />
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5">
        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Coach perspective', 'رؤية المدرب')} /></span>
              <h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Latest recorded feedback', 'أحدث الملاحظات المسجلة')} /></h2>
            </div>
            <MessageSquareText size={19} className="text-amber-400" />
          </header>
          {latestFeedback ? (
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-sm leading-7 text-slate-200"><BilingualText value={latestFeedback.summary} /></p>
              <Link to="/player/feedback" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300">
                <BilingualText value={bi('Open feedback center', 'فتح مركز الملاحظات')} />
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <PlayerEmptyState
              compact
              title={bi('Detailed coach feedback is not available', 'ملاحظات المدرب التفصيلية غير متاحة')}
              description={bi('The shared provider does not expose a player feedback collection yet, so this area stays empty instead of loading legacy fixture notes.', 'لا يوفّر مزود البيانات المشترك مجموعة ملاحظات تفصيلية للاعب حتى الآن، لذلك تبقى هذه المساحة فارغة بدل تحميل ملاحظات تجريبية قديمة.')}
            />
          )}
        </section>

        <TrainingLog
          entries={training.entries}
          weeklyGoal={training.weeklyGoal}
          currentWeekMinutes={training.currentWeekMinutes}
          onAddEntry={training.addEntry}
          onDeleteEntry={training.deleteEntry}
          onUpdateGoal={training.updateWeeklyGoal}
        />
      </div>

      <section
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        aria-label="Player quick links | روابط اللاعب السريعة"
      >
        <QuickLink to="/player/attendance" icon={<Activity size={17} />} title={bi('Attendance', 'الحضور')} />
        <QuickLink to="/player/performance" icon={<Gauge size={17} />} title={bi('Performance', 'الأداء')} />
        <QuickLink to="/player/achievements" icon={<Trophy size={17} />} title={bi('Achievements', 'الإنجازات')} />
        <QuickLink to="/player/documents" icon={<FileText size={17} />} title={bi('Documents', 'المستندات')} />
        <QuickLink to="/player/schedule" icon={<CalendarClock size={17} />} title={bi('Schedule', 'الجدول')} />
        <QuickLink to="/player/profile" icon={<User size={17} />} title={bi('Profile & ID', 'الملف والهوية')} />
      </section>

      {identityOpen && (
        <div className="athlete-modal-overlay" role="presentation" onClick={() => setIdentityOpen(false)}>
          <div
            className="athlete-modal-content w-full max-w-lg athlete-glass-card p-6 border-amber-400/30"
            role="dialog"
            aria-modal="true"
            aria-labelledby="athlete-identity-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Identity preview', 'معاينة الهوية')} /></span>
                <h2 id="athlete-identity-title" className="mt-1 text-xl font-black text-white">
                  {bilingualOrder === 'ar-first' ? player.nameAr : player.nameEn}
                  <span
                    lang={bilingualOrder === 'ar-first' ? 'en' : 'ar'}
                    dir={bilingualOrder === 'ar-first' ? 'ltr' : 'rtl'}
                    className="block text-base text-amber-300 mt-1 text-left rtl:text-right"
                  >
                    {bilingualOrder === 'ar-first' ? player.nameEn : player.nameAr}
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIdentityOpen(false)}
                className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                aria-label="Close athlete identity | إغلاق هوية اللاعب"
              >
                <X size={18} />
              </button>
            </header>
            <div className="athlete-field-grid mt-5">
              <IdentityField label={bi('Player ID', 'معرف اللاعب')} value={player.id} mono />
              <IdentityField label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
              <IdentityField label={bi('Program', 'البرنامج')} value={program ? `${program.name.en} · ${program.name.ar}` : undefined} />
              <IdentityField label={bi('Branch / Venue', 'الفرع / الموقع')} value={branch ? `${branch.name.en} · ${branch.name.ar}` : undefined} />
              <IdentityField label={bi('Level', 'المستوى')} value={`${player.level.en} · ${player.level.ar}`} />
              <IdentityField label={bi('Group', 'المجموعة')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} />
              <IdentityField label={bi('Coach', 'المدرب')} value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined} />
              <IdentityField label={bi('Status', 'الحالة')} value={`${player.status.en} · ${player.status.ar}`} />
            </div>
            <div className="athlete-truth-note mt-5">
              <ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <BilingualText value={bi('This is a visual player-record preview, not an issued credential, access token or official membership card.', 'هذه معاينة بصرية لسجل اللاعب وليست بطاقة اعتماد صادرة أو رمز دخول أو بطاقة عضوية رسمية.')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Snapshot({ icon, label, value }: { icon?: React.ReactNode; label: { en: string; ar: string }; value?: string }) {
  return (
    <div className="athlete-snapshot-card">
      <div className="flex items-center gap-1.5 text-[10px] font-bold">{icon}<BilingualText value={label} /></div>
      <strong className={`block ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong>
    </div>
  );
}

function AttendancePill({
  label,
  count,
  color,
}: {
  label: { en: string; ar: string };
  count: number;
  color: 'emerald' | 'amber' | 'sky' | 'rose';
}) {
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    sky: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  };
  return (
    <div className={`rounded-xl border p-2.5 text-center ${colorMap[color]}`}>
      <span className="text-[10px] font-bold block text-slate-400 mb-0.5">
        <BilingualText value={label} />
      </span>
      <strong className="text-lg font-black font-mono block">
        {count}
      </strong>
    </div>
  );
}

function QuickLink({ to, icon, title }: { to: string; icon: React.ReactNode; title: { en: string; ar: string } }) {
  return (
    <Link to={to} className="athlete-glass-card athlete-glass-card-interactive athlete-quick-link-card flex flex-col justify-between gap-3 text-slate-200 no-underline">
      <span>{icon}</span>
      <strong><BilingualText value={title} /></strong>
    </Link>
  );
}

function IdentityField({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return (
    <div className="athlete-field">
      <span><BilingualText value={label} /></span>
      <strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong>
    </div>
  );
}
