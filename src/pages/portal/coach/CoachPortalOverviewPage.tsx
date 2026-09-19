import type { CSSProperties, ReactNode } from 'react';
import { Activity, BarChart3, CalendarDays, ClipboardCheck, FileText, Medal, MessageSquareText, ShieldCheck, Target, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmBadge, BmIdentityCard, BmMetricCard, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { Sports3DIcon } from '../../../design/sports3d';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CoachPortalOverviewPage() {
  const { coach, groups, players, sessions, sports, loading, error } = useCoachPortalGatewayData();

  if (loading) {
    return <div className="coach-page"><div className="ui-skeleton" role="status" aria-live="polite"><span><BilingualText value={bi('Loading coach workspace…', 'جارٍ تحميل مساحة المدرب…')} /></span><i /><i /><i /></div></div>;
  }

  if (error || !coach) {
    return <div className="coach-page"><div className="enterprise-empty" role="status"><ClipboardCheck size={24} /><h3><BilingualText value={bi('Coach workspace unavailable', 'مساحة المدرب غير متاحة')} /></h3><p><BilingualText value={bi('The coach data service is not available for this session.', 'خدمة بيانات المدرب غير متاحة لهذه الجلسة.')} /></p></div></div>;
  }

  const now = new Date();
  const todaySessions = sessions.filter((session) => isSameLocalDay(new Date(session.startsAt), now));
  const upcomingSessions = sessions.filter((session) => new Date(session.startsAt).getTime() >= now.getTime()).slice(0, 3);
  const attendanceRate = players.length ? Math.round(players.reduce((sum, player) => sum + player.attendanceRate, 0) / players.length) : null;
  const primaryGroup = groups[0] ?? null;
  const primarySport = primaryGroup ? sports.find((sport) => sport.id === primaryGroup.sportId) : sports[0];

  return <div className="coach-page coach-overview-page" id="coach-overview-page">
    <section className="coach-command-hero" aria-labelledby="coach-command-title">
      <div className="coach-command-hero__copy">
        <span className="coach-command-kicker"><ClipboardCheck size={17} /><BilingualText value={bi('Coach Training Workspace', 'مساحة قيادة التدريب')} /></span>
        <h1 id="coach-command-title"><BilingualText value={bi('Training Command', 'قيادة التدريب')} /></h1>
        <p><BilingualText value={bi('Assigned groups, athletes and training sessions from the shared operational provider in one focused coaching workspace.', 'المجموعات والرياضيون والحصص المكلف بها المدرب من مصدر البيانات التشغيلي المشترك في مساحة تدريب واحدة مركزة.')} /></p>
        <div className="coach-command-tags">
          <span><Target size={13} /><BilingualText value={primarySport?.name ?? bi('Sport not assigned', 'الرياضة غير معيّنة')} /></span>
          <span><ShieldCheck size={13} /><BilingualText value={bi('Assignment-scoped records', 'سجلات محكومة بالتكليف')} /></span>
        </div>
      </div>
      <div className="coach-command-hero__mark" aria-hidden="true">
        <Sports3DIcon sport="whistle" size="lg" decorative />
      </div>
      <div className="coach-command-metrics">
        <CommandMetric icon={<CalendarDays size={15} />} label={bi("Today's sessions", 'حصص اليوم')} value={String(todaySessions.length)} tone="gold" />
        <CommandMetric icon={<UsersRound size={15} />} label={bi('Assigned groups', 'المجموعات المكلف بها')} value={String(groups.length)} />
        <CommandMetric icon={<Medal size={15} />} label={bi('Roster', 'القائمة')} value={String(players.length)} />
        <CommandMetric icon={<BarChart3 size={15} />} label={bi('Attendance context', 'سياق الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} tone="success" />
      </div>
    </section>

    <section className="coach-section-block">
      <BmSectionLabel num="01" icon={<Medal aria-hidden="true" />} title={bi('Assignment', 'التكليف')} />
      <div className="bm-grid bm-grid-3 coach-assignment-grid">
        <BmIdentityCard
          avatar={<Medal aria-hidden="true" />}
          name={{ en: coach.nameEn, ar: coach.nameAr }}
          id={coach.id}
          fields={[
            { label: bi('Primary Sport', 'الرياضة الأساسية'), value: <BilingualText value={primarySport?.name ?? bi('Not assigned', 'غير معيّنة')} /> },
            { label: bi('Assigned Groups', 'المجموعات المكلف بها'), value: groups.length },
            { label: bi('Roster Size', 'حجم القائمة'), value: players.length },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Roster', 'القائمة')} value={players.length} detail={bi('Athletes in assigned groups', 'رياضيون ضمن المجموعات المكلف بها')} tier="featured" />
        <BmMetricCard icon={<CalendarDays aria-hidden="true" />} label={bi('Upcoming Sessions', 'الحصص القادمة')} value={upcomingSessions.length} detail={bi('Current coach scope', 'نطاق المدرب الحالي')} tier="featured" />
      </div>
    </section>

    <section className="coach-section-block">
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi("Today's Desk", 'مكتب اليوم')} />
      <div className="coach-desk-grid">
        <article className="coach-today coach-today--primary">
          <header><span><CalendarDays size={18} /></span><div><small><BilingualText value={bi('Live desk', 'مكتب اليوم')} /></small><h3><BilingualText value={bi("Today's Sessions", 'حصص اليوم')} /></h3></div></header>
          <p><BilingualText value={bi('Only sessions connected to the active coach or assigned groups are shown.', 'تظهر فقط الحصص المرتبطة بالمدرب النشط أو مجموعاته المكلف بها.')} /></p>
          {todaySessions.length ? <ul className="coach-today-list">{todaySessions.map((session) => <li key={session.id}><CalendarDays size={15} /><span>{new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><BilingualText value={session.status} /></li>)}</ul> : <div className="coach-desk-empty"><BilingualText value={bi('No assigned session for today in the current records.', 'لا توجد حصة مكلّف بها اليوم ضمن السجلات الحالية.')} /></div>}
        </article>

        <article className="coach-today">
          <header><span><Activity size={18} /></span><div><small><BilingualText value={bi('Training pulse', 'نبض التدريب')} /></small><h3><BilingualText value={bi('Upcoming', 'القادمة')} /></h3></div></header>
          <p><BilingualText value={bi('Next sessions from the current coach scope.', 'الحصص التالية ضمن نطاق المدرب الحالي.')} /></p>
          {upcomingSessions.length ? <ul className="coach-upcoming">{upcomingSessions.map((session) => <li key={session.id}><span>{new Date(session.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><Link to="/coach/schedule"><BilingualText value={bi('Open', 'فتح')} /></Link></li>)}</ul> : <div className="coach-desk-empty"><BilingualText value={bi('No upcoming sessions in the current records.', 'لا توجد حصص قادمة في السجلات الحالية.')} /></div>}
        </article>
      </div>
    </section>

    <section className="coach-section-block">
      <BmSectionLabel num="03" icon={<Activity aria-hidden="true" />} title={bi('Training Actions', 'إجراءات التدريب')} />
      <div className="bm-grid bm-grid-4 coach-action-grid">
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Schedule', 'الجدول')} description={bi(`${sessions.length} scoped sessions`, `${sessions.length} حصة ضمن النطاق`)} to="/coach/schedule" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Groups', 'المجموعات')} description={bi(`${groups.length} assigned groups`, `${groups.length} مجموعات مكلّف بها`)} to="/coach/groups" />
        <BmActionCard icon={<ClipboardCheck aria-hidden="true" />} title={bi('Attendance', 'الحضور')} description={bi('Review provider attendance context', 'مراجعة سياق الحضور من مصدر البيانات')} to="/coach/attendance" />
        <BmActionCard icon={<Activity aria-hidden="true" />} title={bi('Evaluations', 'التقييمات')} description={bi('Review available performance signals', 'مراجعة مؤشرات الأداء المتاحة')} to="/coach/evaluations" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Players', 'اللاعبون')} description={bi(`${players.length} linked athletes`, `${players.length} رياضيين مرتبطين`)} to="/coach/players" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Programs', 'البرامج')} description={bi('Assigned program scope', 'نطاق البرامج المكلف بها')} to="/coach/programs" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Provider-backed coach conversations', 'محادثات المدرب من مصدر البيانات')} to="/coach/messages" />
        <BmActionCard icon={<Sports3DIcon sport="whistle" size="sm" decorative />} title={bi('Profile', 'الملف الشخصي')} description={bi('Coach provider record', 'سجل المدرب من مصدر البيانات')} to="/coach/profile" />
      </div>
    </section>

    <section className="coach-section-block">
      <BmSectionLabel num="04" icon={<UsersRound aria-hidden="true" />} title={bi('Roster Cards', 'بطاقات الرياضيين')} />
      {players.length ? <div className="coach-athlete-grid">
        {players.slice(0, 6).map((player) => {
          const sport = sports.find((item) => item.id === player.sportId);
          return <article
            key={player.id}
            className="coach-athlete-card"
            style={{ '--coach-sport-accent': sportAccent(player.sportId) } as CSSProperties}
          >
            <div className="coach-athlete-card__head">
              <span className="coach-athlete-card__avatar"><UsersRound aria-hidden="true" /></span>
              <div className="coach-athlete-card__identity">
                <strong>{player.nameEn}</strong>
                <span lang="ar" dir="rtl">{player.nameAr}</span>
                <small><BilingualText value={sport?.name ?? bi(player.sportId, player.sportId)} /></small>
              </div>
              <BmBadge tone="neutral" label={player.status} />
            </div>
            <div className="coach-athlete-signals">
              <CoachSignal label={bi('Age', 'العمر')} value={player.age === undefined ? undefined : String(player.age)} />
              <CoachSignal label={bi('Level', 'المستوى')} value={<BilingualText value={player.level} />} />
              <CoachSignal label={bi('Attendance', 'الحضور')} value={`${player.attendanceRate}%`} tone="success" />
              <CoachSignal label={bi('Performance', 'الأداء')} value={player.performanceScore === null ? undefined : `${player.performanceScore}/100`} tone="gold" />
            </div>
            <Link to={`/coach/players/${player.id}`} className="coach-athlete-card__action"><BilingualText value={bi('Open Athlete', 'فتح الرياضي')} /></Link>
          </article>;
        })}
      </div> : <div className="enterprise-empty"><UsersRound size={24} /><h3><BilingualText value={bi('No athletes in scope', 'لا يوجد رياضيون ضمن النطاق')} /></h3></div>}
    </section>
  </div>;
}

function sportAccent(sportId: string) {
  const accents: Record<string, string> = {
    football: '#65d39a',
    swimming: '#53c7e8',
    basketball: '#e9a54b',
    tennis: '#c8db66',
    gymnastics: '#d893d5',
    'martial-arts': '#d36c5f',
  };
  return accents[sportId] ?? '#d4af37';
}

function CommandMetric({ icon, label, value, tone = '' }: { icon: ReactNode; label: { en: string; ar: string }; value: string; tone?: string }) {
  return <div className={`coach-command-metric ${tone}`.trim()}>
    <span className="coach-command-metric__icon">{icon}</span>
    <span><BilingualText value={label} /></span>
    <strong>{value}</strong>
  </div>;
}

function CoachSignal({ label, value, tone = '' }: { label: { en: string; ar: string }; value?: ReactNode; tone?: string }) {
  return <div className={`coach-athlete-signal ${tone}`.trim()}>
    <span><BilingualText value={label} /></span>
    <strong className={value ? '' : 'missing'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong>
  </div>;
}
