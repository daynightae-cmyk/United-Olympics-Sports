import { Activity, BarChart3, CalendarDays, ClipboardCheck, FileText, Medal, MessageSquareText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmBadge, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { Sports3DIcon } from '../../../design/sports3d';
import { demoSessions } from '../../../data/demo/sessions';
import { demoTrainingGroups } from '../../../data/demo/trainingGroups';
import { demoPlayers } from '../../../data/demo/players';
import { getSport } from '../../../data/demo/selectors';

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

import { useCoachSession } from '../../../portals/coach/CoachSessionContext';
export function CoachPortalOverviewPage() {
  const { coach } = useCoachSession();
  const group = demoTrainingGroups.find(g => coach && g.coachIds.includes(coach.id)) || demoTrainingGroups[0];
  const sport = getSport(group.sportId);
  const sessions = demoSessions
    .filter(session => session.groupId === group.id)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const roster = demoPlayers.filter(player => group.playerIds.includes(player.id));
  const now = new Date();
  const todaySessions = sessions.filter((session) => isSameLocalDay(new Date(session.startsAt), now));
  const upcomingSessions = sessions.filter((session) => new Date(session.startsAt).getTime() >= now.getTime()).slice(0, 3);
  const totalAttended = roster.reduce((sum, p) => sum + (p.attendanceSummary?.attended ?? 0), 0);
  const totalScheduled = roster.reduce((sum, p) => sum + (p.attendanceSummary?.scheduled ?? 0), 0);
  const attendanceRate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : null;

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Coach Portal', 'بوابة المدرب')}
      title={bi('Training Command', 'قيادة التدريب')}
      description={bi('Group, roster and evaluation tools organized around preview assignments.', 'أدوات المجموعة والقائمة والتقييم منظمة حول تكليفات تجريبية.')}
      icon={<ClipboardCheck aria-hidden="true" />}
    />

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="01" icon={<Medal aria-hidden="true" />} title={bi('Assignment', 'التكليف')} />
      <div className="bm-grid bm-grid-3">
        <BmIdentityCard
          avatar={<Medal aria-hidden="true" />}
          name={group.name}
          id={group.id}
          fields={[
            { label: bi('Sport', 'الرياضة'), value: <BilingualText value={sport?.name ?? bi('—', '—')} /> },
            { label: bi('Level', 'المستوى'), value: <BilingualText value={group.level} /> },
            { label: bi('Roster Size', 'حجم القائمة'), value: roster.length },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Roster', 'القائمة')} value={roster.length} detail={bi('Linked athletes', 'الرياضيون المرتبطون')} tier="featured" />
        <BmMetricCard icon={<BarChart3 aria-hidden="true" />} label={bi('Attendance Context', 'سياق الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} detail={bi(`${totalAttended}/${totalScheduled} records`, `${totalAttended}/${totalScheduled} سجلات`)} tier="featured" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi("Today's Desk", 'مكتب اليوم')} />
      <section className="coach-desk-grid">
        <div className="coach-today">
          <h3><BilingualText value={bi("Today's Sessions", 'حصص اليوم')} /></h3>
          <p><BilingualText value={bi('Filtered by the actual calendar date from assigned-group session records.', 'مصفاة حسب تاريخ اليوم الفعلي من سجلات حصص المجموعة المخصصة.')} /></p>
          {todaySessions.length ? <ul className="coach-today-list">{todaySessions.map((session) => <li key={session.id}><CalendarDays size={15} /><span>{new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><BilingualText value={session.status} /></li>)}</ul> : <p><BilingualText value={bi('No session assigned for today in the current records.', 'لا توجد حصة مخصصة لهذا اليوم في السجلات الحالية.')} /></p>}
        </div>
        <div className="coach-today">
          <h3><BilingualText value={bi('Upcoming', 'القادمة')} /></h3>
          <p><BilingualText value={bi('Next assigned sessions from existing records.', 'الحصص المخصصة القادمة من السجلات الموجودة.')} /></p>
          {upcomingSessions.length ? <ul className="coach-upcoming">{upcomingSessions.map((session) => <li key={session.id}><span>{new Date(session.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><Link to="/coach/schedule"><BilingualText value={bi('Open', 'فتح')} /></Link></li>)}</ul> : <p><BilingualText value={bi('No upcoming sessions in the current records.', 'لا توجد حصص قادمة في السجلات الحالية.')} /></p>}
        </div>
      </section>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<Activity aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Schedule', 'الجدول')} description={bi(`${sessions.length} linked preview sessions`, `${sessions.length} جلسات تجريبية مرتبطة`)} to="/coach/schedule" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Groups', 'المجموعات')} description={bi('Manage training groups', 'إدارة مجموعات التدريب')} to="/coach/groups" />
        <BmActionCard icon={<ClipboardCheck aria-hidden="true" />} title={bi('Attendance', 'الحضور')} description={bi('Open operational workflow', 'فتح سير العمل التشغيلي')} to="/coach/attendance" />
        <BmActionCard icon={<Activity aria-hidden="true" />} title={bi('Evaluations', 'التقييمات')} description={bi('Sport-aware assessment', 'تقييم خاص بالرياضة')} to="/coach/evaluations" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Players', 'اللاعبون')} description={bi(`${roster.length} linked athletes`, `${roster.length} رياضيين مرتبطين`)} to="/coach/players" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Programs', 'البرامج')} description={bi('Program assignments', 'تكليفات البرامج')} to="/coach/programs" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Team communication', 'تواصل الفريق')} to="/coach/messages" />
        <BmActionCard icon={<Sports3DIcon sport="whistle" size="sm" decorative />} title={bi('Profile', 'الملف الشخصي')} description={bi('Coach profile settings', 'إعدادات ملف المدرب')} to="/coach/profile" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="04" icon={<UsersRound aria-hidden="true" />} title={bi('Roster Snapshot', 'لمحة عن القائمة')} />
      <div className="bm-grid bm-grid-2">
        {roster.map(player => {
          const summary = player.attendanceSummary;
          const active = typeof player.status === 'object' ? player.status.en.toLowerCase() === 'active' : true;
          return (
            <div key={player.id} className="bm-card bm-card-clickable" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span className="bm-cell-avatar"><UsersRound aria-hidden="true" /></span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '14px' }}>{player.nameEn}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{player.nameAr}</div>
                </div>
                <BmBadge tone={active ? 'success' : 'neutral'} label={active ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} />
              </div>
              <div className="bm-grid bm-grid-3" style={{ gap: '8px' }}>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Age', 'العمر')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{player.age ?? '—'}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Level', 'المستوى')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}><BilingualText value={player.level} /></strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{summary ? `${summary.attended}/${summary.scheduled}` : '—'}</strong></div>
              </div>
              <Link to={`/coach/players/${player.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '12px', height: '38px', fontSize: '11px' }}>
                <BilingualText value={bi('View Player', 'عرض اللاعب')} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  </div>;
}
