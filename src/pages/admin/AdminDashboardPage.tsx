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
    <section className="feature-strip admin-panel" aria-label="Dashboard command header | رأس لوحة التحكم" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))', borderColor: 'rgba(212,175,55,0.18)', padding: '28px 24px', borderRadius: '22px', marginBottom: '28px', boxShadow: '0 14px 36px rgba(0,0,0,0.28)' }}>
      <div className="feature-strip-copy" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img src="/brand/united-olympics-sports-logo.png" alt="Official logo" style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 0 18px rgba(215,180,90,.22))', flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f4d98a' }}><BilingualText value={bi('Super Admin Command Center', 'مركز قيادة الإدارة الرئيسية')} /></h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}><BilingualText value={bi('Preview operational environment — no live backend connected.', 'بيئة تشغيل تجريبية — لا يوجد خادم مباشر متصل.')} /></p>
        </div>
      </div>
    </section>

    <PageHeader icon={BarChart3} eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')} title={bi('Super Admin Dashboard', 'لوحة الإدارة الرئيسية')} description={bi('A truthful operational foundation calculated entirely from isolated preview fixtures.', 'أساس تشغيلي موثوق محسوب بالكامل من بيانات تجريبية معزولة.')} />

    <section className="admin-stat-grid" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard label={bi('Sports', 'الرياضات')} value={demoSports.length} icon={Trophy} />
      <StatCard label={bi('Training Groups', 'مجموعات التدريب')} value={demoTrainingGroups.length} icon={Dumbbell} />
      <StatCard label={bi('Players', 'اللاعبون')} value={demoPlayers.length} icon={Medal} />
      <StatCard label={bi('Coaches', 'المدربون')} value={coachCount} icon={ShieldCheck} />
      <StatCard label={bi('Programs', 'البرامج')} value={programCount} icon={BarChart3} />
      <StatCard label={bi('Upcoming Sessions', 'الحصص القادمة')} value={demoSessions.length} icon={CalendarClock} note={bi('Preview schedule', 'جدول تجريبي')} />
    </section>

    <section className="admin-dashboard-grid" aria-label="Dashboard sections | أقسام لوحة التحكم">
      <section className="admin-panel quick-panel">
        <div className="panel-heading">
          <div>
            <BilingualText value={bi('Quick Access', 'وصول سريع')} />
            <small><BilingualText value={bi('Primary management surfaces', 'واجهات الإدارة الأساسية')} /></small>
          </div>
        </div>
        <div className="quick-grid">
          {[
            { to: '/admin/sports', Icon: Trophy, label: bi('Manage Sports', 'إدارة الرياضات') },
            { to: '/admin/players', Icon: Users, label: bi('Manage Players', 'إدارة اللاعبين') },
            { to: '/admin/schedules', Icon: CalendarClock, label: bi('Schedule Preview', 'معاينة الجداول') },
            { to: '/admin/registrations', Icon: ShieldCheck, label: bi('Registrations', 'التسجيلات') },
          ].map(({ to, Icon, label }) => (
            <Link to={to} key={to} className="quick-action-card">
              <span className="quick-action-icon"><Icon /></span>
              <span className="quick-action-label"><BilingualText value={label} /></span>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-panel activity-panel">
        <div className="panel-heading">
          <div>
            <BilingualText value={bi('Recent Preview Activity', 'نشاط المعاينة الحديث')} />
            <small><BilingualText value={bi('Local preview events only', 'أحداث معاينة محلية فقط')} /></small>
          </div>
          <span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Not Live', 'ليست مباشرة')} /></span>
        </div>
        <div className="activity-list">
          {demoActivity.map((item, index) => (
            <article key={item.id} className="activity-item">
              <span className="activity-index">0{index + 1}</span>
              <div className="activity-body">
                <BilingualText value={item.title} />
                <small><BilingualText value={item.time} /></small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>

    <section className="branch-readiness-preview admin-panel" aria-label="Branch Readiness Preview | معاينة جاهزية الفروع">
      <div className="panel-heading">
        <BilingualText value={bi('Branch Readiness', 'جاهزية الفروع')} />
        <small><BilingualText value={bi('Calculated from current preview fixtures', 'محسوبة من البيانات التجريبية الحالية')} /></small>
      </div>
      <div className="readiness-grid">
        <article className="readiness-card">
          <h3><BilingualText value={bi('Branch A', 'الفرع أ')} /></h3>
          <div className="readiness-meter">
            <span className="readiness-fill" style={{ width: '68%' }} />
            <strong>68%</strong>
          </div>
          <div className="readiness-breakdown">
            <span><BilingualText value={bi('Contact', 'الاتصال')} /><strong>75%</strong></span>
            <span><BilingualText value={bi('Location', 'الموقع')} /><strong>67%</strong></span>
            <span><BilingualText value={bi('Programs', 'البرامج')} /><strong>55%</strong></span>
            <span><BilingualText value={bi('Images', 'الصور')} /><strong>62%</strong></span>
          </div>
        </article>
        <article className="readiness-card">
          <h3><BilingualText value={bi('Branch B', 'الفرع ب')} /></h3>
          <div className="readiness-meter">
            <span className="readiness-fill" style={{ width: '42%' }} />
            <strong>42%</strong>
          </div>
          <div className="readiness-breakdown">
            <span><BilingualText value={bi('Contact', 'الاتصال')} /><strong>35%</strong></span>
            <span><BilingualText value={bi('Location', 'الموقع')} /><strong>50%</strong></span>
            <span><BilingualText value={bi('Programs', 'البرامج')} /><strong>40%</strong></span>
            <span><BilingualText value={bi('Images', 'الصور')} /><strong>30%</strong></span>
          </div>
        </article>
      </div>
    </section>
  </div>;
}
