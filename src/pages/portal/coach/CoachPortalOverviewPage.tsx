import { Activity, CalendarDays, ClipboardCheck, FileText, MessageSquareText, UsersRound, Medal, Trophy, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel, BmBadge } from '../../../components/benchmark/BenchmarkComponents';
import { demoSessions } from '../../../data/demo/sessions';
import { demoTrainingGroups } from '../../../data/demo/trainingGroups';
import { demoPlayers } from '../../../data/demo/players';
import { getSport } from '../../../data/demo/selectors';

export function CoachPortalOverviewPage() {
  const group = demoTrainingGroups[0];
  const sport = getSport(group.sportId);
  const sessions = demoSessions.filter(session => session.groupId === group.id);
  const roster = demoPlayers.filter(player => group.playerIds.includes(player.id));
  const totalAttended = roster.reduce((sum, p) => sum + (p.attendanceSummary?.attended ?? 0), 0);
  const totalScheduled = roster.reduce((sum, p) => sum + (p.attendanceSummary?.scheduled ?? 0), 0);
  const attendanceRate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 0;

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Coach Portal', 'بوابة المدرب')}
      title={bi('Operational Session Desk', 'مكتب الجلسات التشغيلي')}
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
            { label: bi('Age Group', 'الفئة العمرية'), value: <BilingualText value={group.ageGroup} /> },
            { label: bi('Roster Size', 'حجم القائمة'), value: roster.length },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Roster', 'القائمة')} value={roster.length} detail={bi('Linked athletes', 'الرياضيون المرتبطون')} tier="featured" />
        <BmMetricCard icon={<CalendarDays aria-hidden="true" />} label={bi('Sessions', 'الحصص')} value={sessions.length} detail={bi('Preview calendar', 'تقويم تجريبي')} />
        <BmMetricCard icon={<BarChart3 aria-hidden="true" />} label={bi('Attendance Rate', 'معدل الحضور')} value={`${attendanceRate}%`} detail={bi(`${totalAttended}/${totalScheduled} records`, `${totalAttended}/${totalScheduled} سجلات`)} tier="featured" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<Activity aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Schedule', 'الجدول')} description={bi(`${sessions.length} linked preview sessions`, `${sessions.length} جلسات تجريبية مرتبطة`)} to="/coach/schedule" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Groups', 'المجموعات')} description={bi('Manage training groups', 'إدارة مجموعات التدريب')} to="/coach/groups" />
        <BmActionCard icon={<ClipboardCheck aria-hidden="true" />} title={bi('Attendance', 'الحضور')} description={bi('Open operational workflow', 'فتح سير العمل التشغيلي')} to="/coach/attendance" />
        <BmActionCard icon={<Activity aria-hidden="true" />} title={bi('Evaluations', 'التقييمات')} description={bi('Sport-aware assessment', 'تقييم خاص بالرياضة')} to="/coach/evaluations" />
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Players', 'اللاعبون')} description={bi('View full roster', 'عرض القائمة الكاملة')} to="/coach/players" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Programs', 'البرامج')} description={bi('Program assignments', 'تكليفات البرامج')} to="/coach/programs" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Team communication', 'تواصل الفريق')} to="/coach/messages" />
        <BmActionCard icon={<Trophy aria-hidden="true" />} title={bi('Profile', 'الملف الشخصي')} description={bi('Coach profile settings', 'إعدادات ملف المدرب')} to="/coach/profile" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<UsersRound aria-hidden="true" />} title={bi('Roster Snapshot', 'لمحة عن القائمة')} />
      <div className="bm-grid bm-grid-2">
        {roster.map(player => (
          <div key={player.id} className="bm-card bm-card-clickable" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="bm-cell-avatar"><UsersRound aria-hidden="true" /></span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '14px' }}>{player.nameEn}</strong>
                <div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{player.nameAr}</div>
              </div>
              <BmBadge tone="success" label={bi('Active', 'نشط')} />
            </div>
            <div className="bm-grid bm-grid-3" style={{ gap: '8px' }}>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Age', 'العمر')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{player.age ?? '—'}</strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Level', 'المستوى')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}><BilingualText value={player.level} /></strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '3px' }}>{player.attendanceSummary ? Math.round((player.attendanceSummary.attended / Math.max(player.attendanceSummary.scheduled, 1)) * 100) : 0}%</strong></div>
            </div>
            <Link to={`/coach/players/${player.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '12px', height: '38px', fontSize: '11px' }}>
              <BilingualText value={bi('View Player', 'عرض اللاعب')} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
