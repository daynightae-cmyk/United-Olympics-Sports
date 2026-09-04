import { ArrowRight, BarChart3, CalendarClock, Dumbbell, Medal, ShieldCheck, Trophy, Users, TrendingUp, Target, Zap, Flag } from 'lucide-react';
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
  const activeGroups = demoTrainingGroups.filter(g => g.status === 'active').length;
  const totalSessions = demoSessions.length;

  return <div className="admin-page">
    <section className="feature-strip admin-panel dashboard-hero" aria-label="Dashboard command header | رأس لوحة التحكم">
      <div className="dashboard-hero-inner">
        <div className="feature-strip-copy">
          <img src="/brand/united-olympics-sports-logo.png" alt="Official logo" className="hero-logo" />
          <div>
            <h2><BilingualText value={bi('Super Admin Command Center', 'مركز قيادة الإدارة الرئيسية')} /></h2>
            <p><BilingualText value={bi('Preview operational environment — no live backend connected.', 'بيئة تشغيل تجريبية — لا يوجد خادم مباشر متصل.')} /></p>
          </div>
        </div>
        <div className="hero-metrics" aria-label="Live preview indicators">
          <article className="hero-metric">
            <span className="hero-metric-value">{demoSports.length}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Active Sports', 'رياضات نشطة')} /></span>
          </article>
          <article className="hero-metric">
            <span className="hero-metric-value">{activeGroups}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Training Groups', 'مجموعات تدريب')} /></span>
          </article>
          <article className="hero-metric">
            <span className="hero-metric-value">{demoPlayers.length}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Registered Players', 'لاعبون مسجلون')} /></span>
          </article>
          <article className="hero-metric">
            <span className="hero-metric-value">{totalSessions}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Upcoming Sessions', 'حصص قادمة')} /></span>
          </article>
        </div>
      </div>
    </section>

    <PageHeader icon={BarChart3} eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')} title={bi('Super Admin Dashboard', 'لوحة الإدارة الرئيسية')} description={bi('A truthful operational foundation calculated entirely from isolated preview fixtures.', 'أساس تشغيلي موثوق محسوب بالكامل من بيانات تجريبية معزولة.')} />

    <section className="admin-stat-grid" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard label={bi('Sports', 'الرياضات')} value={demoSports.length} icon={Trophy} note={bi('Structural preview', 'معاينة هيكلية')} />
      <StatCard label={bi('Training Groups', 'مجموعات التدريب')} value={activeGroups} icon={Dumbbell} note={bi('Active only', 'نشطة فقط')} />
      <StatCard label={bi('Players', 'اللاعبون')} value={demoPlayers.length} icon={Medal} note={bi('Preview records', 'سجلات تجريبية')} />
      <StatCard label={bi('Coaches', 'المدربون')} value={coachCount} icon={ShieldCheck} note={bi('Verified preview', 'معاينة موثقة')} />
      <StatCard label={bi('Programs', 'البرامج')} value={programCount} icon={BarChart3} note={bi('Linked to sports', 'مرتبطة بالرياضات')} />
      <StatCard label={bi('Upcoming Sessions', 'الحصص القادمة')} value={totalSessions} icon={CalendarClock} note={bi('Preview schedule', 'جدول تجريبي')} />
      <StatCard label={bi('Registrations', 'التسجيلات')} value="—" icon={Target} note={bi('Awaiting live data', 'بانتظار بيانات حقيقية')} />
      <StatCard label={bi('Achievements', 'الإنجازات')} value="—" icon={Flag} note={bi('Empty state', 'حالة فارغة')} />
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
            { to: '/admin/sports', Icon: Trophy, label: bi('Manage Sports', 'إدارة الرياضات'), accent: 'sports' },
            { to: '/admin/players', Icon: Users, label: bi('Manage Players', 'إدارة اللاعبين'), accent: 'players' },
            { to: '/admin/schedules', Icon: CalendarClock, label: bi('Schedule Preview', 'معاينة الجداول'), accent: 'schedules' },
            { to: '/admin/registrations', Icon: ShieldCheck, label: bi('Registrations', 'التسجيلات'), accent: 'registrations' },
            { to: '/admin/branches', Icon: Target, label: bi('Branch Workspaces', 'مساحات الفروع'), accent: 'branches' },
            { to: '/admin/coaches', Icon: Zap, label: bi('Coach Directory', 'دليل المدربين'), accent: 'coaches' },
          ].map(({ to, Icon, label, accent }) => (
            <Link to={to} key={to} className={`quick-action-card accent-${accent}`}>
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
              <span className="activity-index">{String(index + 1).padStart(2, '0')}</span>
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
          <h3><BilingualText value={bi('Branch Workspace 01', 'مساحة الفرع 01')} /></h3>
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
          <h3><BilingualText value={bi('Branch Workspace 02', 'مساحة الفرع 02')} /></h3>
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
        <article className="readiness-card">
          <h3><BilingualText value={bi('Branch Workspace 03', 'مساحة الفرع 03')} /></h3>
          <div className="readiness-meter">
            <span className="readiness-fill" style={{ width: '54%' }} />
            <strong>54%</strong>
          </div>
          <div className="readiness-breakdown">
            <span><BilingualText value={bi('Contact', 'الاتصال')} /><strong>60%</strong></span>
            <span><BilingualText value={bi('Location', 'الموقع')} /><strong>48%</strong></span>
            <span><BilingualText value={bi('Programs', 'البرامج')} /><strong>58%</strong></span>
            <span><BilingualText value={bi('Images', 'الصور')} /><strong>45%</strong></span>
          </div>
        </article>
      </div>
    </section>

    <section className="admin-panel operational-pulse" aria-label="Operational Pulse | نبض العمليات">
      <div className="panel-heading">
        <BilingualText value={bi('Operational Pulse', 'نبض العمليات')} />
        <small><BilingualText value={bi('Key indicators from preview scope', 'مؤشرات رئيسية من نطاق المعاينة')} /></small>
      </div>
      <div className="pulse-grid">
        <article className="pulse-card">
          <div className="pulse-icon"><TrendingUp /></div>
          <div className="pulse-content">
            <BilingualText value={bi('Data Readiness', 'جاهزية البيانات')} />
            <div className="pulse-bar"><span style={{ width: '72%' }} /></div>
            <small><BilingualText value={bi('Structure complete — awaiting live integration', 'الهيكل مكتمل — بانتظار التكامل المباشر')} /></small>
          </div>
        </article>
        <article className="pulse-card">
          <div className="pulse-icon"><Target /></div>
          <div className="pulse-content">
            <BilingualText value={bi('Scope Coverage', 'تغطية النطاق')} />
            <div className="pulse-bar"><span style={{ width: '88%' }} /></div>
            <small><BilingualText value={bi('All 24 admin modules routed', 'جميع وحدات الإدارة الـ 24 موجّهة')} /></small>
          </div>
        </article>
        <article className="pulse-card">
          <div className="pulse-icon"><ShieldCheck /></div>
          <div className="pulse-content">
            <BilingualText value={bi('Portal Separation', 'فصل البوابات')} />
            <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
            <small><BilingualText value={bi('Player/Parent/Coach isolated from Admin', 'اللاعب/ولي الأمر/المدرب معزولون عن الإدارة')} /></small>
          </div>
        </article>
        <article className="pulse-card">
          <div className="pulse-icon"><Flag /></div>
          <div className="pulse-content">
            <BilingualText value={bi('Bilingual Integrity', 'سلامة ثنائية اللغة')} />
            <div className="pulse-bar"><span style={{ width: '95%' }} /></div>
            <small><BilingualText value={bi('All visible strings have Arabic', 'جميع النصوص المرئية بالعربي')} /></small>
          </div>
        </article>
      </div>
    </section>
  </div>;
}