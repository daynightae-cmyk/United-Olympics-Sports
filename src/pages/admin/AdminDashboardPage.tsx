import type { ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  Database,
  Globe,
  LayoutGrid,
  Server,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  ClipboardList,
  Layers,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import {
  useAuditActivity,
  useBranches,
  useCoaches,
  useCountries,
  useGroups,
  useParents,
  usePlayers,
  usePrograms,
  useRegistrations,
  useSessions,
  useSports,
} from '../../admin/data/adminHooks';

/* ─────────────────────────────────────────────────────────────────────────────
   Value formatting helpers — strictly truthful
   ───────────────────────────────────────────────────────────────────────────── */

function metricValue(loading: boolean, error: Error | null, total: number): string | number {
  if (loading) return '…';
  if (error) return '—';
  return total;
}

function metricCaption(loading: boolean, error: Error | null) {
  if (loading) return bi('Loading live records', 'جارٍ تحميل السجلات الفعلية');
  if (error) return bi('Data unavailable', 'البيانات غير متاحة');
  return bi('Live records', 'سجلات فعلية');
}

/* ─────────────────────────────────────────────────────────────────────────────
   Admin Command Center — Sports Operations Command Center
   ───────────────────────────────────────────────────────────────────────────── */

export function AdminDashboardPage() {
  const { mode } = useAdminData();
  const sports = useSports({ page: 1, pageSize: 1 });
  const players = usePlayers({ page: 1, pageSize: 1 });
  const coaches = useCoaches({ page: 1, pageSize: 1 });
  const sessions = useSessions({ page: 1, pageSize: 1 });
  const branches = useBranches({ page: 1, pageSize: 1 });
  const countries = useCountries({ page: 1, pageSize: 1 });
  const parents = useParents({ page: 1, pageSize: 1 });
  const groups = useGroups({ page: 1, pageSize: 1 });
  const programs = usePrograms({ page: 1, pageSize: 1 });
  const registrations = useRegistrations({ page: 1, pageSize: 1 });
  const audit = useAuditActivity({ page: 1, pageSize: 5 });

  const coreQueries = [sports, players, coaches, sessions];
  const coreLoading = coreQueries.some((q) => q.loading);
  const coreError = coreQueries.find((q) => q.error)?.error ?? null;
  const dataStatus = coreError ? 'Unavailable' : coreLoading ? 'Checking' : 'Connected';
  const dataStatusAr = coreError ? 'غير متاح' : coreLoading ? 'جارٍ الفحص' : 'متصل';

  return (
    <div className="admin-page uos-cc" id="admin-command-page">
      {/* ── Command Center Header ───────────────────────────────────────── */}
      <header className="uos-cc__header" data-surface="admin-command-hero" aria-labelledby="admin-command-title">
        <div className="uos-cc__header-content">
          <span className="uos-cc__kicker">
            <Server size={14} aria-hidden="true" />
            <BilingualText value={bi('Operations Command', 'قيادة العمليات')} />
          </span>
          <h1 id="admin-command-title" className="uos-cc__title">
            <BilingualText value={bi('Command Center', 'مركز القيادة')} />
          </h1>
          <p className="uos-cc__subtitle">
            <BilingualText
              value={bi(
                coreError
                  ? 'The Admin data service is unavailable. Counts remain unknown.'
                  : coreLoading
                    ? 'Loading the current operational picture from the active data gateway.'
                    : 'Live organization, athlete, coach and training records from the active Admin data gateway.',
                coreError
                  ? 'خدمة بيانات الإدارة غير متاحة. تظل الأعداد غير معروفة.'
                  : coreLoading
                    ? 'جارٍ تحميل الصورة التشغيلية الحالية من بوابة البيانات النشطة.'
                    : 'سجلات المؤسسة والرياضيين والمدربين والتدريب الفعلية من بوابة بيانات الإدارة النشطة.',
              )}
            />
          </p>

          <div className="uos-cc__status-bar">
            <span
              role="status"
              aria-live="polite"
              className={`uos-cc__status-chip ${!coreLoading && !coreError ? 'is-live' : coreError ? 'is-error' : 'is-checking'}`}
            >
              <Database size={12} aria-hidden="true" />
              <span>
                <BilingualText value={bi('Data API', 'واجهة البيانات')} />
              </span>
              <strong>{dataStatus}</strong>
              <span className="sr-only">{dataStatusAr}</span>
            </span>
            <span className={`uos-cc__status-chip ${mode === 'live' ? 'is-live' : 'is-preview'}`}>
              <ShieldCheck size={12} aria-hidden="true" />
              <span>
                <BilingualText value={bi('Data Mode', 'وضع البيانات')} />
              </span>
              <strong>{mode === 'live' ? 'Live' : 'Preview'}</strong>
            </span>
          </div>
        </div>
        <div className="uos-cc__header-brand" aria-hidden="true">
          <img
            className="uos-cc__logo"
            data-surface="admin-command-logo"
            src="/brand/united-olympics-sports-logo.png"
            alt=""
            loading="lazy"
          />
        </div>
      </header>

      {/* ── Core Operational Metrics ────────────────────────────────────── */}
      <section
        className="uos-cc__metrics"
        aria-label="Core metrics | المؤشرات الأساسية"
      >
        <MetricTile
          icon={<Trophy size={16} />}
          label={bi('Sports', 'الرياضات')}
          value={metricValue(sports.loading, sports.error, sports.data.total)}
          caption={metricCaption(sports.loading, sports.error)}
          href="/admin/sports"
        />
        <MetricTile
          icon={<UsersRound size={16} />}
          label={bi('Players', 'اللاعبون')}
          value={metricValue(players.loading, players.error, players.data.total)}
          caption={metricCaption(players.loading, players.error)}
          href="/admin/players"
        />
        <MetricTile
          icon={<UserRound size={16} />}
          label={bi('Coaches', 'المدربون')}
          value={metricValue(coaches.loading, coaches.error, coaches.data.total)}
          caption={metricCaption(coaches.loading, coaches.error)}
          href="/admin/coaches"
        />
        <MetricTile
          icon={<CalendarDays size={16} />}
          label={bi('Sessions', 'الحصص')}
          value={metricValue(sessions.loading, sessions.error, sessions.data.total)}
          caption={metricCaption(sessions.loading, sessions.error)}
          href="/admin/schedules"
        />
      </section>

      {/* ── Extended Organization Metrics ───────────────────────────────── */}
      <section
        className="uos-cc__metrics uos-cc__metrics--secondary"
        aria-label="Organization metrics | مؤشرات المؤسسة"
      >
        <MetricTile
          icon={<Building2 size={16} />}
          label={bi('Branches', 'الفروع')}
          value={metricValue(branches.loading, branches.error, branches.data.total)}
          caption={metricCaption(branches.loading, branches.error)}
          href="/admin/branches"
        />
        <MetricTile
          icon={<Globe size={16} />}
          label={bi('Countries', 'الدول')}
          value={metricValue(countries.loading, countries.error, countries.data.total)}
          caption={metricCaption(countries.loading, countries.error)}
          href="/admin/countries"
        />
        <MetricTile
          icon={<Layers size={16} />}
          label={bi('Programs', 'البرامج')}
          value={metricValue(programs.loading, programs.error, programs.data.total)}
          caption={metricCaption(programs.loading, programs.error)}
          href="/admin/programs"
        />
        <MetricTile
          icon={<LayoutGrid size={16} />}
          label={bi('Groups', 'المجموعات')}
          value={metricValue(groups.loading, groups.error, groups.data.total)}
          caption={metricCaption(groups.loading, groups.error)}
          href="/admin/groups"
        />
        <MetricTile
          icon={<Users size={16} />}
          label={bi('Parents', 'أولياء الأمور')}
          value={metricValue(parents.loading, parents.error, parents.data.total)}
          caption={metricCaption(parents.loading, parents.error)}
          href="/admin/parents"
        />
        <MetricTile
          icon={<ClipboardList size={16} />}
          label={bi('Registrations', 'التسجيلات')}
          value={metricValue(registrations.loading, registrations.error, registrations.data.total)}
          caption={metricCaption(registrations.loading, registrations.error)}
          href="/admin/registrations"
        />
      </section>

      {/* ── Operational Workspaces Grid ─────────────────────────────────── */}
      <div className="uos-cc__workspaces">
        <section className="uos-cc__panel" aria-label="Sports Operations | العمليات الرياضية">
          <div className="uos-cc__panel-head">
            <h2><BilingualText value={bi('Sports Operations', 'العمليات الرياضية')} /></h2>
            <p><BilingualText value={bi('Daily organization control', 'التحكم اليومي بالمؤسسة')} /></p>
          </div>
          <div className="uos-cc__ops-grid">
            <OperationCard
              to="/admin/sports"
              icon={<Trophy size={18} />}
              title={bi('Sports', 'الرياضات')}
              detail={bi('Catalog & reach', 'الكتالوج والانتشار')}
            />
            <OperationCard
              to="/admin/players"
              icon={<UsersRound size={18} />}
              title={bi('Players', 'اللاعبون')}
              detail={bi('Athlete directory', 'دليل الرياضيين')}
            />
            <OperationCard
              to="/admin/coaches"
              icon={<UserRound size={18} />}
              title={bi('Coaches', 'المدربون')}
              detail={bi('Assignments', 'التكليفات')}
            />
            <OperationCard
              to="/admin/schedules"
              icon={<CalendarDays size={18} />}
              title={bi('Schedules', 'الجداول')}
              detail={bi('Training operations', 'عمليات التدريب')}
            />
            <OperationCard
              to="/admin/groups"
              icon={<LayoutGrid size={18} />}
              title={bi('Groups', 'المجموعات')}
              detail={bi('Training teams', 'فرق التدريب')}
            />
            <OperationCard
              to="/admin/registrations"
              icon={<ClipboardList size={18} />}
              title={bi('Registrations', 'التسجيلات')}
              detail={bi('Enrollment pipeline', 'خط التسجيل')}
            />
          </div>
        </section>

        <section className="uos-cc__panel" aria-label="Organization | المؤسسة">
          <div className="uos-cc__panel-head">
            <h2><BilingualText value={bi('Organization', 'المؤسسة')} /></h2>
            <p><BilingualText value={bi('Structure & governance', 'الهيكل والحوكمة')} /></p>
          </div>
          <div className="uos-cc__ops-grid">
            <OperationCard
              to="/admin/branches"
              icon={<Building2 size={18} />}
              title={bi('Branches', 'الفروع')}
              detail={bi('Facilities', 'المرافق')}
            />
            <OperationCard
              to="/admin/countries"
              icon={<Globe size={18} />}
              title={bi('Countries', 'الدول')}
              detail={bi('Geographic scope', 'النطاق الجغرافي')}
            />
            <OperationCard
              to="/admin/programs"
              icon={<Layers size={18} />}
              title={bi('Programs', 'البرامج')}
              detail={bi('Development paths', 'مسارات التطوير')}
            />
            <OperationCard
              to="/admin/parents"
              icon={<Users size={18} />}
              title={bi('Parents', 'أولياء الأمور')}
              detail={bi('Family network', 'شبكة العائلات')}
            />
            <OperationCard
              to="/admin/settings"
              icon={<Server size={18} />}
              title={bi('Settings', 'الإعدادات')}
              detail={bi('Interface controls', 'ضوابط الواجهة')}
            />
            <OperationCard
              to="/admin/users"
              icon={<ShieldCheck size={18} />}
              title={bi('Users & Roles', 'المستخدمون والصلاحيات')}
              detail={bi('Access control', 'التحكم في الوصول')}
            />
          </div>
        </section>
      </div>

      {/* ── Recent Activity Feed ────────────────────────────────────────── */}
      <section className="uos-cc__activity" data-surface="admin-activity-command" aria-label="Recent Activity | النشاط الحديث">
        <div className="uos-cc__panel-head">
          <div>
            <h2><BilingualText value={bi('Recent Activity', 'النشاط الحديث')} /></h2>
            <p><BilingualText value={bi('System audit trail', 'سجل التدقيق للنظام')} /></p>
          </div>
          <span
            className={`uos-cc__feed-badge ${audit.error ? 'is-error' : audit.loading ? 'is-checking' : 'is-live'}`}
          >
            <Activity size={11} aria-hidden="true" />
            <BilingualText
              value={
                audit.error
                  ? bi('Unavailable', 'غير متاح')
                  : audit.loading
                    ? bi('Checking', 'جارٍ الفحص')
                    : bi('Live Feed', 'بث مباشر')
              }
            />
          </span>
        </div>

        <div className="uos-cc__activity-list">
          {audit.loading ? (
            <div className="uos-cc__activity-placeholder" role="status" aria-live="polite">
              {[1, 2, 3].map((i) => (
                <div key={i} className="uos-cc__activity-skeleton" aria-hidden="true">
                  <span className="uos-cc__skeleton-line uos-cc__skeleton-line--short" />
                  <span className="uos-cc__skeleton-line" />
                  <span className="uos-cc__skeleton-line uos-cc__skeleton-line--time" />
                </div>
              ))}
              <span className="sr-only">
                <BilingualText value={bi('Loading audit activity…', 'جارٍ تحميل نشاط التدقيق…')} />
              </span>
            </div>
          ) : audit.error ? (
            <div className="uos-cc__activity-empty" role="alert">
              <Activity size={20} aria-hidden="true" />
              <p><BilingualText value={bi('Audit activity is unavailable right now.', 'نشاط التدقيق غير متاح حاليًا.')} /></p>
            </div>
          ) : audit.data.items.length === 0 ? (
            <div className="uos-cc__activity-empty" role="status" aria-live="polite">
              <Clock size={20} aria-hidden="true" />
              <p><BilingualText value={bi('No activity recorded yet.', 'لم يتم تسجيل أي نشاط بعد.')} /></p>
            </div>
          ) : (
            audit.data.items.map((item, index) => (
              <article key={item.id} className="uos-cc__activity-entry">
                <span className="uos-cc__activity-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="uos-cc__activity-body">
                  <strong><BilingualText value={item.action} /></strong>
                  <small><BilingualText value={item.details} /></small>
                </div>
                <time className="uos-cc__activity-time" dateTime={item.timestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </time>
              </article>
            ))
          )}
        </div>

        {!audit.loading && !audit.error && audit.data.items.length > 0 && (
          <div className="uos-cc__activity-footer">
            <Link to="/admin/audit-activity" className="uos-cc__view-all">
              <BilingualText value={bi('View All Activity', 'عرض كل النشاط')} />
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────────────────── */

function MetricTile({
  icon,
  label,
  value,
  caption,
  href,
}: {
  icon: ReactNode;
  label: { en: string; ar: string };
  value: string | number;
  caption: { en: string; ar: string };
  href: string;
}) {
  return (
    <Link to={href} className="uos-cc__metric" data-surface="admin-command-metric" aria-label={`${label.en}: ${value}`}>
      <span className="uos-cc__metric-icon" aria-hidden="true">{icon}</span>
      <span className="uos-cc__metric-label"><BilingualText value={label} /></span>
      <strong className="uos-cc__metric-value">{value}</strong>
      <small className="uos-cc__metric-caption"><BilingualText value={caption} /></small>
    </Link>
  );
}

function OperationCard({
  to,
  icon,
  title,
  detail,
}: {
  to: string;
  icon: ReactNode;
  title: { en: string; ar: string };
  detail: { en: string; ar: string };
}) {
  return (
    <Link to={to} className="uos-cc__op-card" data-surface="admin-operation-card">
      <span className="uos-cc__op-icon" aria-hidden="true">{icon}</span>
      <span className="uos-cc__op-text">
        <strong><BilingualText value={title} /></strong>
        <small><BilingualText value={detail} /></small>
      </span>
      <ArrowRight size={14} className="uos-cc__op-arrow" aria-hidden="true" />
    </Link>
  );
}
