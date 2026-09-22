import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarCheck2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  List,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerSessionSummaryCard } from '../../../portals/player/components/PlayerSessionSummaryCard';
import { selectUpcomingSession } from '../../../portals/player/foundation/playerSelectors';
import { formatPlayerTime } from '../../../portals/player/foundation/playerLocale';
import type { Session } from '../../../domain/contracts';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function PlayerPortalSchedulePage() {
  const {
    player,
    sessions,
    sport,
    group,
    coach,
    program,
    branch,
    isPreviewSession,
  } = usePlayerSession();
  const { bilingualOrder } = useUiSettings();
  const navigate = useNavigate();

  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [timingFilter, setTimingFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  if (!player) return null;

  const today = new Date();
  const nowMs = today.getTime();

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay() + (currentWeek * 7));

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const orderedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    return orderedSessions.filter((session) => new Date(session.startsAt).getTime() >= nowMs);
  }, [orderedSessions, nowMs]);

  const pastSessions = useMemo(() => {
    return orderedSessions.filter((session) => new Date(session.startsAt).getTime() < nowMs);
  }, [orderedSessions, nowMs]);

  const nextUpcomingSession = selectUpcomingSession(sessions, today);

  const filteredListSessions = useMemo(() => {
    if (timingFilter === 'upcoming') return upcomingSessions;
    if (timingFilter === 'past') return [...pastSessions].reverse();
    return orderedSessions;
  }, [timingFilter, upcomingSessions, pastSessions, orderedSessions]);

  const sessionsForDay = (date: Date) => {
    const target = localDateKey(date);
    return orderedSessions.filter((session) => localDateKey(new Date(session.startsAt)) === target);
  };

  const getAttendanceStatusForSession = (session: Session) => {
    const dateIso = session.startsAt.split('T')[0];
    return player.attendanceRecords.find((record) => record.date === dateIso)?.status;
  };

  return (
    <div className="admin-page space-y-7" id="player-schedule-page">
      <PageHeader
        eyebrow={bi('Athlete training schedule', 'جدول تدريب اللاعب')}
        title={bi('Training Schedule & Sessions', 'جدول الحصص والتدريب')}
        description={bi(
          `Official training sessions assigned to ${player.nameEn} through the ${group?.name.en ?? 'assigned'} group. Location, coach, and session times reflect authentic academy records.`,
          `حصص التدريب الرسمية المخصصة للاعب ${player.nameAr} من خلال مجموعة ${group?.name.ar ?? 'التدريب'}. يعكس الموقع والمدرب وأوقات الحصص السجلات المعتمدة للأكاديمية.`
        )}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[.03] p-0.5" role="tablist" aria-label="Timing filter | تصنيف المواعيد">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timingFilter === 'upcoming' ? 'bg-amber-400 text-black shadow' : 'text-slate-300 hover:text-white'}`}
                onClick={() => setTimingFilter('upcoming')}
                aria-selected={timingFilter === 'upcoming'}
              >
                <BilingualText value={bi('Upcoming', 'القادمة')} />
                <span className="ml-1.5 opacity-75 font-mono">({upcomingSessions.length})</span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timingFilter === 'past' ? 'bg-amber-400 text-black shadow' : 'text-slate-300 hover:text-white'}`}
                onClick={() => setTimingFilter('past')}
                aria-selected={timingFilter === 'past'}
              >
                <BilingualText value={bi('Past', 'السابقة')} />
                <span className="ml-1.5 opacity-75 font-mono">({pastSessions.length})</span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${timingFilter === 'all' ? 'bg-amber-400 text-black shadow' : 'text-slate-300 hover:text-white'}`}
                onClick={() => setTimingFilter('all')}
                aria-selected={timingFilter === 'all'}
              >
                <BilingualText value={bi('All', 'الكل')} />
                <span className="ml-1.5 opacity-75 font-mono">({orderedSessions.length})</span>
              </button>
            </div>

            <div className="inline-flex rounded-xl border border-white/10 bg-white/[.03] p-0.5" role="tablist" aria-label="View mode | وضع العرض">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${viewMode === 'week' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setViewMode('week')}
                aria-selected={viewMode === 'week'}
              >
                <Calendar size={13} />
                <BilingualText value={bi('Week', 'أسبوع')} />
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setViewMode('list')}
                aria-selected={viewMode === 'list'}
              >
                <List size={13} />
                <BilingualText value={bi('List', 'قائمة')} />
              </button>
            </div>

            {isPreviewSession && (
              <span className="athlete-data-scope border-amber-400/30 text-amber-300">
                <Sparkles size={13} />
                <BilingualText value={bi('Preview data', 'بيانات معاينة')} />
              </span>
            )}
            <span className="athlete-data-scope">
              <ShieldCheck size={13} />
              <BilingualText value={bi('Provider sessions', 'حصص مزود البيانات')} />
            </span>
          </div>
        }
      />

      {/* Primary Athlete Preparation Hub & Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-6 items-start">
        {/* Main Schedule Column */}
        <div className="space-y-5 min-w-0">
          {/* Week Navigation Toolbar */}
          {viewMode === 'week' && (
            <section className="schedule-toolbar flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[.025]" aria-label="Schedule navigation">
              <div className="schedule-nav flex items-center gap-2">
                <button
                  type="button"
                  className="nav-btn p-2 rounded-xl border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white transition-colors"
                  onClick={() => setCurrentWeek((week) => week - 1)}
                  aria-label={bi('Previous week', 'الأسبوع السابق').en}
                >
                  <ChevronLeft size={18} className="rtl:rotate-180" />
                </button>
                <div className="week-range px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  <BilingualText value={{
                    en: `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    ar: `${weekDays[0].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                  }} />
                </div>
                <button
                  type="button"
                  className="nav-btn p-2 rounded-xl border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white transition-colors"
                  onClick={() => setCurrentWeek((week) => week + 1)}
                  aria-label={bi('Next week', 'الأسبوع التالي').en}
                >
                  <ChevronRight size={18} className="rtl:rotate-180" />
                </button>
              </div>
              <button
                type="button"
                className="admin-secondary-button text-xs px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-amber-400/40 transition-colors"
                onClick={() => setCurrentWeek(0)}
              >
                <BilingualText value={bi('This Week', 'هذا الأسبوع')} />
              </button>
            </section>
          )}

          {/* Week View Representation */}
          {viewMode === 'week' && (
            <section className="schedule-week-view" aria-label="Weekly schedule">
              <div className="schedule-week-grid">
                {weekDays.map((day, dayIndex) => {
                  const daySessions = sessionsForDay(day);
                  const isToday = day.toDateString() === today.toDateString();
                  return (
                    <div key={localDateKey(day)} className={`schedule-day-column ${isToday ? 'today' : ''}`}>
                      <header>
                        <div>
                          <strong><BilingualText value={{ en: dayLabels[dayIndex], ar: dayLabelsAr[dayIndex] }} /></strong>
                          <span>{day.getDate()}</span>
                        </div>
                        {isToday && <span className="today-badge text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30"><BilingualText value={bi('Today', 'اليوم')} /></span>}
                      </header>
                      <div className="day-sessions p-2.5 space-y-2">
                        {daySessions.length ? daySessions.map((session) => {
                          const attendance = getAttendanceStatusForSession(session);
                          return (
                            <Link
                              key={session.id}
                              to={`/player/schedule/${encodeURIComponent(session.id)}`}
                              className="schedule-session-card block rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/[.03] hover:bg-white/[.06] p-3 transition-all no-underline text-slate-200 group"
                            >
                              <div className="session-header flex items-center justify-between gap-1 text-[11px] mb-1.5">
                                <span className="session-time font-mono font-bold text-amber-300 flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatPlayerTime(session.startsAt, bilingualOrder)}
                                </span>
                                <span className="session-status text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                                  <BilingualText value={session.status} />
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                <BilingualText value={sport?.name ?? bi('Training session', 'حصة تدريبية')} />
                              </h4>
                              <div className="session-meta mt-1.5 space-y-1 text-[10px] text-slate-400">
                                {group && (
                                  <span className="flex items-center gap-1">
                                    <Users size={11} className="text-slate-400 flex-shrink-0" />
                                    <BilingualText value={group.name} />
                                  </span>
                                )}
                                {branch && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} className="text-amber-400/80 flex-shrink-0" />
                                    <BilingualText value={branch.name} />
                                  </span>
                                )}
                              </div>
                              {attendance && (
                                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                  <CalendarCheck2 size={11} />
                                  <span>{attendance.toUpperCase()}</span>
                                </div>
                              )}
                            </Link>
                          );
                        }) : (
                          <div className="no-sessions py-8 text-center text-xs text-slate-500">
                            <BilingualText value={bi('No linked sessions', 'لا توجد حصص مرتبطة')} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* List View Representation */}
          {viewMode === 'list' && (
            <section className="schedule-list-view space-y-3" aria-label="Schedule list">
              {filteredListSessions.length ? (
                filteredListSessions.map((session) => {
                  const attendance = getAttendanceStatusForSession(session);
                  const isFuture = new Date(session.startsAt).getTime() >= nowMs;
                  return (
                    <article
                      key={session.id}
                      className="schedule-session-card list-card rounded-2xl border border-white/10 bg-white/[.025] hover:border-amber-400/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="list-session-date p-3 rounded-xl border border-white/10 bg-white/[.02] text-center min-w-[70px] flex-shrink-0">
                          <span className="text-[10px] uppercase font-extrabold text-amber-400 block">
                            {new Date(session.startsAt).toLocaleDateString(bilingualOrder === 'ar-first' ? 'ar-SA' : 'en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-black text-white font-mono block">
                            {new Date(session.startsAt).getDate()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(session.startsAt).toLocaleDateString(bilingualOrder === 'ar-first' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                          </span>
                        </div>

                        <div className="list-session-main space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              <BilingualText value={sport?.name ?? bi('Training', 'تدريب')} />
                            </span>
                            {isFuture && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 uppercase">
                                <BilingualText value={bi('Upcoming', 'قادمة')} />
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white">
                            <BilingualText value={sport?.name ?? bi('Training session', 'حصة تدريبية')} />
                          </h4>
                          <div className="list-session-details flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
                              <Clock size={13} className="text-amber-400" />
                              {formatPlayerTime(session.startsAt, bilingualOrder)}
                            </span>
                            {group && (
                              <span className="inline-flex items-center gap-1">
                                <Users size={13} />
                                <BilingualText value={group.name} />
                              </span>
                            )}
                            {coach && (
                              <span className="inline-flex items-center gap-1">
                                <span>{bilingualOrder === 'ar-first' ? coach.nameAr : coach.nameEn}</span>
                              </span>
                            )}
                            {branch && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={13} className="text-amber-400/80" />
                                <BilingualText value={branch.name} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="list-session-status flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          {attendance && (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                              {attendance.toUpperCase()}
                            </span>
                          )}
                          <span className="status-badge px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
                            <BilingualText value={session.status} />
                          </span>
                        </div>
                        <Link
                          to={`/player/schedule/${encodeURIComponent(session.id)}`}
                          className="athlete-action-secondary text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-1 text-amber-300 hover:text-white"
                        >
                          <BilingualText value={bi('View Session', 'عرض الحصة')} />
                          <ExternalLink size={12} className="rtl:rotate-180" />
                        </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="athlete-empty-system">
                  <div>
                    <CalendarClock size={42} className="mx-auto text-slate-500" />
                    <h3 className="mt-4 text-base font-bold text-white">
                      {timingFilter === 'upcoming' ? (
                        <BilingualText value={bi('No upcoming training sessions', 'لا توجد حصص تدريبية قادمة')} />
                      ) : timingFilter === 'past' ? (
                        <BilingualText value={bi('No past sessions on record', 'لا توجد حصص سابقة مسجلة')} />
                      ) : (
                        <BilingualText value={bi('No linked sessions', 'لا توجد حصص مرتبطة')} />
                      )}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      <BilingualText value={bi(
                        'No training sessions are currently logged for this athlete group in the selected filter range.',
                        'لا توجد حصص تدريبية مسجلة حاليًا لمجموعة هذا اللاعب ضمن نطاق التصنيف المحدد.'
                      )} />
                    </p>
                    {timingFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setTimingFilter('all')}
                        className="athlete-action-secondary mt-4 text-xs"
                      >
                        <BilingualText value={bi('Show all sessions', 'عرض كل الحصص')} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Side Preparation Column */}
        <aside className="space-y-5">
          {/* Next Training Pulse / Preparation Card */}
          <section className="athlete-glass-card p-5 sm:p-6 border-amber-400/30 space-y-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400">
                  <BilingualText value={bi('Session Preparation Hub', 'مركز تحضير الحصة')} />
                </span>
                <h2 className="mt-1 text-lg font-black text-white">
                  <BilingualText value={bi('Next Training Pulse', 'نبض التدريب القادم')} />
                </h2>
              </div>
              <CalendarClock size={20} className="text-amber-400" />
            </header>

            {nextUpcomingSession ? (
              <div className="space-y-4">
                <PlayerSessionSummaryCard
                  session={nextUpcomingSession}
                  sport={sport}
                  group={group}
                  coach={coach}
                  branch={branch}
                  attendanceStatus={getAttendanceStatusForSession(nextUpcomingSession)}
                  onOpen={() => navigate(`/player/schedule/${nextUpcomingSession.id}`)}
                />

                <div className="rounded-xl border border-white/10 bg-white/[.02] p-3 text-xs text-slate-300 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                    <BilingualText value={bi('Athlete Checklist', 'قائمة تحضير اللاعب')} />
                  </span>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li><BilingualText value={bi('Official academy training kit', 'طقم التدريب الرسمي للأكاديمية')} /></li>
                    <li><BilingualText value={bi('Sport-appropriate footwear & gear', 'حذاء ومعدات مناسبة للرياضة')} /></li>
                    <li><BilingualText value={bi('Hydration bottle', 'قارورة مياه مخصصة')} /></li>
                  </ul>
                </div>

                <Link
                  to={`/player/schedule/${nextUpcomingSession.id}`}
                  className="athlete-action-primary w-full text-center"
                >
                  <BilingualText value={bi('Prepare for Session', 'التحضير للحصة')} />
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2 text-xs text-slate-400">
                <p><BilingualText value={bi('No future session is currently scheduled for your group.', 'لا توجد حصة مستقبلية مجدولة حاليًا لمجموعتك.')} /></p>
                <p className="text-[11px] text-slate-500"><BilingualText value={bi('Check back once new training fixtures are posted by your coach.', 'يرجى التحقق لاحقًا عند إضافة مواعيد تدريب جديدة من قِبل المدرب.')} /></p>
              </div>
            )}
          </section>

          {/* Schedule Truth & Group Alignment Snapshot */}
          <section className="athlete-glass-card p-5 sm:p-6 space-y-4">
            <header>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400">
                <BilingualText value={bi('Schedule alignment', 'توافق الجدول')} />
              </span>
              <h3 className="mt-1 text-base font-bold text-white">
                <BilingualText value={bi('Assigned Cohort & Venues', 'المجموعة والمقر المخصص')} />
              </h3>
            </header>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400"><BilingualText value={bi('Sport', 'الرياضة')} /></span>
                <strong className="text-white font-semibold">
                  <BilingualText value={sport?.name ?? bi('Not recorded', 'غير مسجل')} />
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400"><BilingualText value={bi('Program', 'البرنامج')} /></span>
                <strong className="text-white font-semibold">
                  <BilingualText value={program?.name ?? bi('Not recorded', 'غير مسجل')} />
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400"><BilingualText value={bi('Training group', 'المجموعة')} /></span>
                <strong className="text-white font-semibold">
                  <BilingualText value={group?.name ?? bi('Not recorded', 'غير مسجل')} />
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400"><BilingualText value={bi('Branch / Venue', 'الفرع / الموقع')} /></span>
                <strong className="text-white font-semibold">
                  <BilingualText value={branch?.name ?? bi('Main Facility', 'المقر الرئيسي')} />
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400"><BilingualText value={bi('Lead coach', 'المدرب المشرف')} /></span>
                <strong className="text-white font-semibold">
                  {coach ? (bilingualOrder === 'ar-first' ? coach.nameAr : coach.nameEn) : <BilingualText value={bi('Staff coach', 'مدرب معتمد')} />}
                </strong>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/player/attendance"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
              >
                <Activity size={13} />
                <BilingualText value={bi('View your attendance records', 'عرض سجلات حضورك')} />
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Schedule Data Boundary Note */}
      <section className="schedule-note pt-2" aria-label="Schedule data boundary">
        <div className="athlete-truth-note">
          <ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed text-xs">
            <BilingualText value={bi(
              'Session IDs, sport/group relationships, start times, and recorded statuses are derived authoritatively from the training database. Facility and attendance details are shown where verified in provider records.',
              'يتم استرجاع معرفات الحصص وعلاقات الرياضة والمجموعة وأوقات البدء والحالات المسجلة مباشرة من قاعدة بيانات التدريب. وتُعرض تفاصيل المرفق والحضور عند التحقق منها في سجلات النظام.'
            )} />
          </p>
        </div>
      </section>
    </div>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
