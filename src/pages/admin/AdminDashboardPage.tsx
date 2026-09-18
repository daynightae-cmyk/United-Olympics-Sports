import { ArrowRight, Cloud, Database, Network, Server, Webhook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import {
  useAuditActivity,
  useCoaches,
  usePlayers,
  useSessions,
  useSports,
} from '../../admin/data/adminHooks';

function metricValue(loading: boolean, error: Error | null, total: number): string | number {
  if (loading) return '…';
  if (error) return '—';
  return total;
}

function metricNote(loading: boolean, error: Error | null) {
  if (loading) return bi('Loading live records', 'جارٍ تحميل السجلات الفعلية');
  if (error) return bi('Data unavailable', 'البيانات غير متاحة');
  return bi('Live records', 'سجلات فعلية');
}

export function AdminDashboardPage() {
  const { mode } = useAdminData();
  const sports = useSports({ page: 1, pageSize: 1 });
  const players = usePlayers({ page: 1, pageSize: 1 });
  const coaches = useCoaches({ page: 1, pageSize: 1 });
  const sessions = useSessions({ page: 1, pageSize: 1 });
  const audit = useAuditActivity({ page: 1, pageSize: 5 });

  const coreQueries = [sports, players, coaches, sessions];
  const coreLoading = coreQueries.some((query) => query.loading);
  const coreError = coreQueries.find((query) => query.error)?.error ?? null;
  const dataStatus = coreError ? 'Unavailable' : coreLoading ? 'Checking' : 'Connected';
  const dataStatusAr = coreError ? 'غير متاح' : coreLoading ? 'جارٍ الفحص' : 'متصل';

  return <div className="admin-page">
    <section className="feature-strip admin-panel dashboard-hero" aria-label="Dashboard command header | رأس لوحة التحكم">
      <div className="dashboard-hero-inner">
        <div className="feature-strip-copy">
          <img src="/brand/united-olympics-sports-logo.png" alt="Official logo" className="hero-logo" />
          <div>
            <h2><BilingualText value={bi('UOS Operating System', 'نظام تشغيل يونايتد أوليمبيكس')} /></h2>
            <p><BilingualText value={bi('Live operational records are loaded through the active Admin data gateway.', 'تُحمّل السجلات التشغيلية الفعلية عبر بوابة بيانات الإدارة النشطة.')} /></p>
          </div>
        </div>
        <div className="hero-metrics" aria-label="Live data indicators">
          <article className="hero-metric">
            <span className={`hero-metric-value ${!coreLoading && !coreError ? 'text-green-500' : ''}`}>{dataStatus}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Data API', 'واجهة البيانات')} /></span>
            <small className="sr-only">{dataStatusAr}</small>
          </article>
          <article className="hero-metric">
            <span className={`hero-metric-value ${mode === 'live' ? 'text-green-500' : ''}`}>{mode === 'live' ? 'Live' : 'Preview'}</span>
            <span className="hero-metric-label"><BilingualText value={bi('Data Mode', 'وضع البيانات')} /></span>
          </article>
        </div>
      </div>
    </section>

    <PageHeader
      icon={Server}
      eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')}
      title={bi('Command Center', 'مركز القيادة')}
      description={bi(
        coreError
          ? 'The Admin data service is currently unavailable. Counts are not being guessed or replaced with preview values.'
          : coreLoading
            ? 'Loading the current operational record counts from the active data service.'
            : 'Operational counts below reflect the records returned by the active Admin data service.',
        coreError
          ? 'خدمة بيانات الإدارة غير متاحة حاليًا، ولن يتم تخمين الأعداد أو استبدالها ببيانات تجريبية.'
          : coreLoading
            ? 'جارٍ تحميل أعداد السجلات التشغيلية الحالية من خدمة البيانات النشطة.'
            : 'تعكس الأعداد أدناه السجلات التي أعادتها خدمة بيانات الإدارة النشطة.',
      )}
    />

    <section className="admin-stat-grid compact" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard
        label={bi('Sports', 'الرياضات')}
        value={metricValue(sports.loading, sports.error, sports.data.total)}
        icon={Database}
        note={metricNote(sports.loading, sports.error)}
      />
      <StatCard
        label={bi('Players', 'اللاعبون')}
        value={metricValue(players.loading, players.error, players.data.total)}
        icon={Database}
        note={metricNote(players.loading, players.error)}
      />
      <StatCard
        label={bi('Coaches', 'المدربون')}
        value={metricValue(coaches.loading, coaches.error, coaches.data.total)}
        icon={Database}
        note={metricNote(coaches.loading, coaches.error)}
      />
      <StatCard
        label={bi('Sessions', 'الحصص')}
        value={metricValue(sessions.loading, sessions.error, sessions.data.total)}
        icon={Database}
        note={metricNote(sessions.loading, sessions.error)}
      />
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
          <span className="truth-badge">
            <BilingualText value={audit.error ? bi('Unavailable', 'غير متاح') : audit.loading ? bi('Checking', 'جارٍ الفحص') : bi('Live Feed', 'بث مباشر')} />
          </span>
        </div>

        <div className="activity-list">
          {audit.loading ? (
            <p><BilingualText value={bi('Loading audit activity…', 'جارٍ تحميل نشاط التدقيق…')} /></p>
          ) : audit.error ? (
            <p><BilingualText value={bi('Audit activity is unavailable right now.', 'نشاط التدقيق غير متاح حاليًا.')} /></p>
          ) : audit.data.items.length === 0 ? (
            <p><BilingualText value={bi('No activity recorded yet.', 'لم يتم تسجيل أي نشاط بعد.')} /></p>
          ) : (
            audit.data.items.map((item, index) => (
              <article key={item.id}>
                <span className="activity-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <BilingualText value={item.action} />
                  <small><BilingualText value={item.details} /></small>
                </div>
                <time
                  dateTime={item.timestamp}
                  style={{ marginInlineStart: 'auto', color: 'var(--admin-muted)', fontSize: '9px', whiteSpace: 'nowrap' }}
                >
                  {new Date(item.timestamp).toLocaleString()}
                </time>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  </div>;
}
