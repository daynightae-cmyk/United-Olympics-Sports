import { ArrowRight, Cloud, Database, Network, Server, Webhook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminDashboardPage() {
  return <div className="admin-page">
    <section className="feature-strip admin-panel dashboard-hero" aria-label="Dashboard command header | رأس لوحة التحكم">
      <div className="dashboard-hero-inner">
        <div className="feature-strip-copy">
          <img src="/brand/united-olympics-sports-logo.png" alt="Official logo" className="hero-logo" />
          <div>
            <h2><BilingualText value={bi('UOS Operating System', 'نظام تشغيل يونايتد أوليمبيكس')} /></h2>
            <p><BilingualText value={bi('Cloud database and integrations environment initialized.', 'تمت تهيئة قاعدة البيانات السحابية وبيئة التكاملات.')} /></p>
          </div>
        </div>
        <div className="hero-metrics" aria-label="Live preview indicators">
          <article className="hero-metric">
            <span className="hero-metric-value text-green-500">Live</span>
            <span className="hero-metric-label"><BilingualText value={bi('Database (SQL)', 'قاعدة البيانات (SQL)')} /></span>
          </article>
          <article className="hero-metric">
            <span className="hero-metric-value text-green-500">Ready</span>
            <span className="hero-metric-label"><BilingualText value={bi('OAuth Engine', 'محرك OAuth')} /></span>
          </article>
        </div>
      </div>
    </section>

    <PageHeader icon={Server} eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')} title={bi('Command Center', 'مركز القيادة')} description={bi('The database is connected and awaiting initialization of operational records.', 'قاعدة البيانات متصلة وبانتظار تهيئة السجلات التشغيلية.')} />

    <section className="admin-stat-grid" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard label={bi('Sports', 'الرياضات')} value={0} icon={Database} note={bi('Awaiting records', 'بانتظار السجلات')} />
      <StatCard label={bi('Players', 'اللاعبون')} value={0} icon={Database} note={bi('Awaiting records', 'بانتظار السجلات')} />
      <StatCard label={bi('Coaches', 'المدربون')} value={0} icon={Database} note={bi('Awaiting records', 'بانتظار السجلات')} />
      <StatCard label={bi('Upcoming Sessions', 'الحصص القادمة')} value={0} icon={Database} note={bi('Awaiting records', 'بانتظار السجلات')} />
    </section>

    <section className="admin-dashboard-grid" aria-label="Dashboard sections | أقسام لوحة التحكم">
      <section className="admin-panel quick-panel">
        <div className="panel-heading">
          <div>
            <BilingualText value={bi('System Core', 'النواة النظامية')} />
            <small><BilingualText value={bi('Infrastructure management', 'إدارة البنية التحتية')} /></small>
          </div>
        </div>
        <div className="quick-grid">
          <Link to="/admin/integrations" className="quick-action-card accent-sports">
            <span className="quick-action-icon"><Cloud /></span>
            <span className="quick-action-label"><BilingualText value={bi('Google Integrations', 'تكاملات جوجل')} /></span>
            <ArrowRight />
          </Link>
          <Link to="/admin/settings" className="quick-action-card accent-settings">
            <span className="quick-action-icon"><Webhook /></span>
            <span className="quick-action-label"><BilingualText value={bi('Interface Settings', 'إعدادات الواجهة')} /></span>
            <ArrowRight />
          </Link>
          <Link to="/admin/users" className="quick-action-card accent-users">
            <span className="quick-action-icon"><Network /></span>
            <span className="quick-action-label"><BilingualText value={bi('Users & Roles', 'المستخدمون والصلاحيات')} /></span>
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="admin-panel activity-panel">
        <div className="panel-heading">
          <div>
            <BilingualText value={bi('Recent Activity', 'النشاط الحديث')} />
            <small><BilingualText value={bi('System audit logs', 'سجلات التدقيق للنظام')} /></small>
          </div>
          <span className="truth-badge"><BilingualText value={bi('Live Feed', 'بث مباشر')} /></span>
        </div>
        <div className="activity-list" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
          <p><BilingualText value={bi('No activity recorded yet.', 'لم يتم تسجيل أي نشاط بعد.')} /></p>
        </div>
      </section>
    </section>
  </div>;
}