import { Activity, BarChart3, CalendarDays, ClipboardCheck, FileText, Medal, MessageSquareText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmBadge, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { Sports3DIcon } from '../../../design/sports3d';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CoachPortalOverviewPage() {
  const { coach, groups, players, sessions, sports, loading, error } = useCoachPortalGatewayData();

  if (loading) {
    return <div className="admin-page"><div className="ui-skeleton" role="status" aria-live="polite"><span><BilingualText value={bi('Loading coach workspace…', 'جارٍ تحميل مساحة المدرب…')} /></span><i /><i /><i /></div></div>;
  }

  if (error || !coach) {
    return <div className="admin-page"><div className="enterprise-empty" role="status"><ClipboardCheck size={24} /><h3><BilingualText value={bi('Coach workspace unavailable', 'مساحة المدرب غير متاحة')} /></h3><p><BilingualText value={bi('The coach data service is not available for this session.', 'خدمة بيانات المدرب غير متاحة لهذه الجلسة.')} /></p></div></div>;
  }

  const now = new Date();
  const todaySessions = sessions.filter((session) => isSameLocalDay(new Date(session.startsAt), now));
  const upcomingSessions = sessions.filter((session) => new Date(session.startsAt).getTime() >= now.getTime()).slice(0, 3);
  const attendanceRate = players.length ? Math.round(players.reduce((sum, player) => sum + player.attendanceRate, 0) / players.length) : null;
  const primaryGroup = groups[0] ?? null;
  const primarySport = primaryGroup ? sports.find((sport) => sport.id === primaryGroup.sportId) : sports[0];

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Coach Portal', 'بوابة المدرب')}
      title={bi('Training Command', 'قيادة التدريب')}
      description={bi('Your assigned groups, athletes and sessions from the shared operational data provider.', 'مجموعاتك ورياضيّوك وحصصك المكلّف بها من مصدر البيانات التشغيلي المشترك.')}
      icon={<ClipboardCheck aria-hidden="true" />}
    />

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="01" icon={<Medal aria-hidden="true" />} title={bi('Assignment', 'التكليف')} />
      <div className="bm-grid bm-grid-3">
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
        <BmMetricCard icon={<BarChart3 aria-hidden="true" />} label={bi('Attendance Context', 'سياق الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} detail={bi('Average from provider records', 'متوسط من سجلات مصدر البيانات')} tier="featured" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi("Today's Desk", 'مكتب اليوم')} />
      <section className="coach-desk-grid">
        <div className="coach-today">
          <h3><BilingualText value={bi("Today's Sessions", 'حصص اليوم')} /></h3>
          <p><BilingualText value={bi('Only sessions connected to the active coach or assigned groups are shown.', 'تظهر فقط الحصص المرتبطة بالمدرب النشط أو مجموعاته المكلف بها.')} /></p>
          {todaySessions.length ? <ul className="coach-today-list">{todaySessions.map((session) => <li key={session.id}><CalendarDays size={15} /><span>{new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><BilingualText value={session.status} /></li>)}</ul> : <p><BilingualText value={bi('No assigned session for today in the current records.', 'لا توجد حصة مكلّف بها اليوم ضمن السجلات الحالية.')} /></p>}
        </div>
        <div className="coach-today">
          <h3><BilingualText value={bi('Upcoming', 'القادمة')} /></h3>
          <p><BilingualText value={bi('Next sessions from the current coach scope.', 'الحصص التالية ضمن نطاق المدرب الحالي.')} /></p>
          {upcomingSessions.length ? <ul className="coach-upcoming">{upcomingSessions.map((session) => <li key={session.id}><span>{new Date(session.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><Link to="/coach/schedule"><BilingualText value={bi('Open', 'فتح')} /></Link></li>)}</ul> : <p><BilingualText value={bi('No upcoming sessions in the current records.', 'لا توجد حصص قادمة في السجلات الحالية.')} /></p>}
        </div>
      </section>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<Activity aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Schedule', 'الجدول')} description={bi(`${sessions.length} scoped sessions`, `${sessions.length} حصة ضمن النطاق`)} to="/coach/schedule" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Groups', 'المجموعات')} description={bi(`${groups.length} assigned groups`, `${groups.length} مجموعات مكلّف بها`)} to="/coach/groups" />
        <BmActionCard icon={<ClipboardCheck aria-hidden="true" />} title={bi('Attendance', 'الحضور')} description={bi('Review provider attendance context', 'مراجعة سياق الحضور من مصدر البيانات')} to="/coach/attendance" />
        <BmActionCard icon={<Activity aria-hidden="true" />} title={bi('Evaluations', 'التقييمات')} description={bi('Review available performance signals', 'مراجعة مؤشرات الأداء المتاحة')} to="/coach/evaluations" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Players', 'اللاعبون')} description={bi(`${players.length} linked athletes`, `${players.length} رياضيين مرتبطين`)} to="/coach/players" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Programs', 'البرامج')} description={bi('Assigned program scope', 'نطاق البرامج المكلف بها')} to="/coach/programs" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Provider-backed coach conversations', 'محادثات المدرب من مصدر البيانات')} to="/coach/messages" />
        <BmActionCard icon={<Sports3DIcon sport="whistle" size="sm" decorative />} title={bi('Profile', 'الملف الشخصي')} description={bi('Coach provider record', 'سجل المدرب من مصدر البيانات')} to="/coach/profile" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="04" icon={<UsersRound aria-hidden="true" />} title={bi('Roster Snapshot', 'لمحة عن القائمة')} />
      {players.length ? <div className="bm-grid bm-grid-2">
        {players.slice(0, 6).map((player) => (
          <div key={player.id} className="bm-card bm-card-clickable" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="bm-cell-avatar"><UsersRound aria-hidden="true" /></span>
              <div style={{ flex: 1 }}><strong style={{ fontSize: '14px' }}>{player.nameEn}</strong><div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{player.nameAr}</div></div>
              <BmBadge tone="neutral" label={player.status} />
            </div>
            <div className="bm-grid bm-grid-3" style={{ gap: '8px' }}>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Age', 'العمر')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{player.age ?? '—'}</strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Level', 'المستوى')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}><BilingualText value={player.level} /></strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{player.attendanceRate}%</strong></div>
            </div>
            <Link to={`/coach/players/${player.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '12px', height: '38px', fontSize: '11px' }}><BilingualText value={bi('View Player', 'عرض اللاعب')} /></Link>
          </div>
        ))}
      </div> : <div className="enterprise-empty"><UsersRound size={24} /><h3><BilingualText value={bi('No athletes in scope', 'لا يوجد رياضيون ضمن النطاق')} /></h3></div>}
    </div>
  </div>;
}
