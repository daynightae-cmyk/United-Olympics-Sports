import { ArrowRight, BarChart3, CalendarClock, Dumbbell, Medal, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoPlayers } from '../../data/demo/players';
import { demoActivity, demoSessions } from '../../data/demo/sessions';
import { demoSports } from '../../data/demo/sports';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';

export function AdminDashboardPage() {
  const coachCount = new Set(demoTrainingGroups.flatMap(group => group.coachIds)).size;
  const programCount = new Set(demoSports.flatMap(sport => sport.programIds)).size;
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')} title={bi('Super Admin Dashboard', 'لوحة الإدارة الرئيسية')} description={bi('A truthful operational foundation calculated entirely from isolated preview fixtures.', 'أساس تشغيلي موثوق محسوب بالكامل من بيانات تجريبية معزولة.')} />
    <section className="admin-stat-grid" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard label={bi('Sports', 'الرياضات')} value={demoSports.length} icon={Trophy} />
      <StatCard label={bi('Training Groups', 'مجموعات التدريب')} value={demoTrainingGroups.length} icon={Dumbbell} />
      <StatCard label={bi('Players', 'اللاعبون')} value={demoPlayers.length} icon={Medal} />
      <StatCard label={bi('Coaches', 'المدربون')} value={coachCount} icon={ShieldCheck} />
      <StatCard label={bi('Programs', 'البرامج')} value={programCount} icon={BarChart3} />
      <StatCard label={bi('Upcoming Sessions', 'الحصص القادمة')} value={demoSessions.length} icon={CalendarClock} note={bi('Preview schedule', 'جدول تجريبي')} />
    </section>
    <div className="admin-dashboard-grid">
      <section className="admin-panel quick-panel"><div className="panel-heading"><div><BilingualText value={bi('Quick Access', 'وصول سريع')} /><small><BilingualText value={bi('Primary management surfaces', 'واجهات الإدارة الأساسية')} /></small></div></div><div className="quick-grid">
        {[
          { to: '/admin/sports', Icon: Trophy, label: bi('Manage Sports', 'إدارة الرياضات') },
          { to: '/admin/players', Icon: Users, label: bi('Manage Players', 'إدارة اللاعبين') },
          { to: '/admin/players/player-demo-001', Icon: BarChart3, label: bi('View Performance', 'عرض الأداء') },
          { to: '/admin/schedules', Icon: CalendarClock, label: bi('Future Scheduling', 'الجداول المستقبلية') },
        ].map(({ to, Icon, label }) => <Link to={to} key={to}><Icon /><BilingualText value={label} /><ArrowRight /></Link>)}
      </div></section>
      <section className="admin-panel activity-panel"><div className="panel-heading"><div><BilingualText value={bi('Recent Demo Activity', 'نشاط تجريبي حديث')} /><small><BilingualText value={bi('Local preview events only', 'أحداث معاينة محلية فقط')} /></small></div><span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Not Live', 'ليست مباشرة')} /></span></div><div className="activity-list">{demoActivity.map((item, index) => <article key={item.id}><span className="activity-index">0{index + 1}</span><div><BilingualText value={item.title} /><small><BilingualText value={item.time} /></small></div></article>)}</div></section>
    </div>
  </div>;
}
