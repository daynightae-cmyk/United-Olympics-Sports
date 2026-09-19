import type { ReactNode } from 'react';
import { Activity, ArrowRight, CalendarDays, Cloud, Database, Network, Server, ShieldCheck, Trophy, UserRound, UsersRound, Webhook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/admin/AdminUI';
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

  return <div className="admin-page admin-command-page" id="admin-command-page">
    <section className="admin-command-hero" aria-labelledby="admin-command-title">
      <div className="admin-command-hero__copy">
        <span className="admin-command-kicker"><Server size={17} /><BilingualText value={bi('Operations Command', 'قيادة العمليات')} /></span>
        <h1 id="admin-command-title"><BilingualText value={bi('Command Center', 'مركز القيادة')} /></h1>
        <p><BilingualText value={bi(
          coreError
            ? 'The Admin data service is unavailable. Counts remain unknown instead of being replaced with invented preview values.'
            : coreLoading
              ? 'Loading the current operational picture from the active Admin data gateway.'
              : 'Live organization, athlete, coach and training records from the active Admin data gateway.',
          coreError
            ? 'خدمة بيانات الإدارة غير متاحة. تظل الأعداد غير معروفة بدل استبدالها بقيم تجريبية مختلقة.'
            : coreLoading
              ? 'جارٍ تحميل الصورة التشغيلية الحالية من بوابة بيانات الإدارة النشطة.'
              : 'سجلات المؤسسة والرياضيين والمدربين والتدريب الفعلية من بوابة بيانات الإدارة النشطة.',
        )} /></p>

        <div className="admin-command-status-row">
          <span className={`admin-command-status ${!coreLoading && !coreError ? 'is-live' : coreError ? 'is-error' : 'is-checking'}`}>
            <Database size={13} />
            <span><BilingualText value={bi('Data API', 'واجهة البيانات')} /></span>
            <strong>{dataStatus}</strong>
            <small className="sr-only">{dataStatusAr}</small>
          </span>
          <span className={`admin-command-status ${mode === 'live' ? 'is-live' : 'is-preview'}`}>
            <ShieldCheck size={13} />
            <span><BilingualText value={bi('Data Mode', 'وضع البيانات')} /></span>
            <strong>{mode === 'live' ? 'Live' : 'Preview'}</strong>
          </span>
        </div>
      </div>

      <div className="admin-command-hero__brand" aria-hidden="true">
        <img className="official-logo admin-command-logo" src="/brand/united-olympics-sports-logo.png" alt="" />
      </div>

      <div className="admin-command-metrics">
        <CommandMetric icon={<Trophy size={15} />} label={bi('Sports', 'الرياضات')} value={metricValue(sports.loading, sports.error, sports.data.total)} />
        <CommandMetric icon={<UsersRound size={15} />} label={bi('Players', 'اللاعبون')} value={metricValue(players.loading, players.error, players.data.total)} />
        <CommandMetric icon={<UserRound size={15} />} label={bi('Coaches', 'المدربون')} value={metricValue(coaches.loading, coaches.error, coaches.data.total)} />
        <CommandMetric icon={<CalendarDays size={15} />} label={bi('Sessions', 'الحصص')} value={metricValue(sessions.loading, sessions.error, sessions.data.total)} />
      </div>
    </section>

    <section className="admin-stat-grid compact admin-athletic-stat-grid" aria-label="Overview metrics | المؤشرات العامة">
      <StatCard label={bi('Sports', 'الرياضات')} value={metricValue(sports.loading, sports.error, sports.data.total)} icon={Trophy} note={metricNote(sports.loading, sports.error)} />
      <StatCard label={bi('Players', 'اللاعبون')} value={metricValue(players.loading, players.error, players.data.total)} icon={UsersRound} note={metricNote(players.loading, players.error)} />
      <StatCard label={bi('Coaches', 'المدربون')} value={metricValue(coaches.loading, coaches.error, coaches.data.total)} icon={UserRound} note={metricNote(coaches.loading, coaches.error)} />
      <StatCard label={bi('Sessions', 'الحصص')} value={metricValue(sessions.loading, sessions.error, sessions.data.total)} icon={CalendarDays} note={metricNote(sessions.loading, sessions.error)} />
    </section>

    <section className="admin-command-grid" aria-label="Operational workspaces | مساحات العمل التشغيلية">
      <section className="admin-panel admin-operations-panel">
        <div className="panel-heading">
          <div><BilingualText value={bi('Sports Operations', 'العمليات الرياضية')} /><small><BilingualText value={bi('Daily organization control', 'التحكم اليومي بالمؤسسة')} /></small></div>
        </div>
        <div className="admin-operation-grid">
          <OperationLink to="/admin/sports" icon={<Trophy />} title={bi('Sports', 'الرياضات')} detail={bi('Catalog & reach', 'الكتالوج والانتشار')} />
          <OperationLink to="/admin/players" icon={<UsersRound />} title={bi('Players', 'اللاعبون')} detail={bi('Athlete directory', 'دليل الرياضيين')} />
          <OperationLink to="/admin/coaches" icon={<UserRound />} title={bi('Coaches', 'المدربون')} detail={bi('Assignments', 'التكليفات')} />
          <OperationLink to="/admin/schedules" icon={<CalendarDays />} title={bi('Schedules', 'الجداول')} detail={bi('Training operations', 'عمليات التدريب')} />
        </div>
      </section>

      <section className="admin-panel admin-system-panel">
        <div className="panel-heading">
          <div><BilingualText value={bi('System Core', 'النواة النظامية')} /><small><BilingualText value={bi('Infrastructure & governance', 'البنية التحتية والحوكمة')} /></small></div>
        </div>
        <div className="admin-operation-grid admin-operation-grid--system">
          <OperationLink to="/admin/integrations" icon={<Cloud />} title={bi('Integrations', 'التكاملات')} detail={bi('Connected services', 'الخدمات المتصلة')} />
          <OperationLink to="/admin/settings" icon={<Webhook />} title={bi('Settings', 'الإعدادات')} detail={bi('Interface controls', 'ضوابط الواجهة')} />
          <OperationLink to="/admin/users" icon={<Network />} title={bi('Users & Roles', 'المستخدمون والصلاحيات')} detail={bi('Access control', 'التحكم في الوصول')} />
        </div>
      </section>
    </section>

    <section className="admin-panel admin-activity-command">
      <div className="panel-heading">
        <div><BilingualText value={bi('Recent Activity', 'النشاط الحديث')} /><small><BilingualText value={bi('System audit logs', 'سجلات التدقيق للنظام')} /></small></div>
        <span className="truth-badge"><Activity size={12} /><BilingualText value={audit.error ? bi('Unavailable', 'غير متاح') : audit.loading ? bi('Checking', 'جارٍ الفحص') : bi('Live Feed', 'بث مباشر')} /></span>
      </div>

      <div className="activity-list admin-activity-list">
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
              <div><BilingualText value={item.action} /><small><BilingualText value={item.details} /></small></div>
              <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time>
            </article>
          ))
        )}
      </div>
    </section>
  </div>;
}

function CommandMetric({ icon, label, value }: { icon: ReactNode; label: { en: string; ar: string }; value: string | number }) {
  return <div className="admin-command-metric">
    <span className="admin-command-metric__icon">{icon}</span>
    <span><BilingualText value={label} /></span>
    <strong>{value}</strong>
  </div>;
}

function OperationLink({ to, icon, title, detail }: { to: string; icon: ReactNode; title: { en: string; ar: string }; detail: { en: string; ar: string } }) {
  return <Link to={to} className="admin-operation-card">
    <span className="admin-operation-icon">{icon}</span>
    <span className="admin-operation-copy"><strong><BilingualText value={title} /></strong><small><BilingualText value={detail} /></small></span>
    <ArrowRight aria-hidden="true" />
  </Link>;
}
