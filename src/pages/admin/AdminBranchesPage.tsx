import { Building2, Flag, ShieldCheck, Trophy, UsersRound, Zap, Target, CheckCircle, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice, EnterpriseSelect } from '../../components/enterprise/EnterpriseUI';
import { useBranches, useCountries } from '../../admin/data/adminHooks';
import { demoSports } from '../../data/demo/sports';

export function AdminBranchesPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') ?? 'all');
  const { data: branchResult, loading: branchesLoading, error: branchesError } = useBranches({ page: 1, pageSize: 100 });
  const { data: countryResult, loading: countriesLoading, error: countriesError } = useCountries({ page: 1, pageSize: 100 });
  const branches = branchResult.items;
  const countries = countryResult.items;

  const filteredBranches = useMemo(() => branches.filter((branch) =>
    (countryFilter === 'all' || branch.countryId === countryFilter) &&
    `${branch.name.en} ${branch.name.ar} ${branch.id}`.toLowerCase().includes(query.toLowerCase())
  ), [branches, query, countryFilter]);

  const totalPlayers = new Set(branches.flatMap((branch) => branch.playerIds)).size;
  const totalCoaches = new Set(branches.flatMap((branch) => branch.coachIds)).size;
  const totalSports = new Set(branches.flatMap((branch) => branch.sportIds)).size;
  const activeCountries = countries.filter((country) => country.status === 'active').length;
  const loading = branchesLoading || countriesLoading;
  const error = branchesError ?? countriesError;

  return (
    <div className="admin-page">
      <section className="branches-hero" aria-label="Branches overview">
        <div className="branches-hero-bg" aria-hidden="true"><div className="hero-gradient-ring ring-one" /><div className="hero-gradient-ring ring-two" /></div>
        <div className="branches-hero-content">
          <span className="eyebrow eyebrow-premium"><Building2 size={15} /><BilingualText value={bi('Branch Management', 'إدارة الفروع')} /></span>
          <h1><BilingualText value={bi('Branches', 'الفروع')} /></h1>
          <p><BilingualText value={bi('A multi-country branch cockpit for sports, programs, rosters, coaches and coverage.', 'مركز فروع متعدد الدول للرياضات والبرامج والقوائم والمدربين والتغطية.')} /></p>
        </div>
      </section>

      <PageHeader icon={Building2} eyebrow={bi('Branch Workspaces', 'مساحات الفروع')} title={bi('Branches', 'الفروع')} description={bi('Manage branch workspaces, sports coverage, athlete rosters and coach assignments from one preview cockpit.', 'أدر مساحات الفروع وتغطية الرياضات وقوائم الرياضيين وتكليفات المدربين من مركز معاينة واحد.')} actions={<PreviewNotice />} />

      <section className="admin-stat-grid branches-kpi" aria-label="Branch KPIs">
        <article className="admin-stat-card kpi-card accent-branches-main"><div className="kpi-icon"><Building2 size={22} /></div><strong>{branches.length}</strong><span><BilingualText value={bi('Branch Workspaces', 'مساحات الفروع')} /></span><small><BilingualText value={bi('Preview data source', 'مصدر بيانات المعاينة')} /></small></article>
        <article className="admin-stat-card kpi-card accent-countries-b"><div className="kpi-icon"><Flag size={22} /></div><strong>{activeCountries}</strong><span><BilingualText value={bi('Active Countries', 'الدول النشطة')} /></span><small><BilingualText value={bi('Country workspaces', 'مساحات الدول')} /></small></article>
        <article className="admin-stat-card kpi-card accent-players-b"><div className="kpi-icon"><UsersRound size={22} /></div><strong>{totalPlayers}</strong><span><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /></span><small><BilingualText value={bi('Preview records', 'سجلات معاينة')} /></small></article>
        <article className="admin-stat-card kpi-card accent-coaches-b"><div className="kpi-icon"><ShieldCheck size={22} /></div><strong>{totalCoaches}</strong><span><BilingualText value={bi('Total Coaches', 'إجمالي المدربين')} /></span><small><BilingualText value={bi('Preview records', 'سجلات معاينة')} /></small></article>
        <article className="admin-stat-card kpi-card accent-sports-b"><div className="kpi-icon"><Trophy size={22} /></div><strong>{totalSports}</strong><span><BilingualText value={bi('Active Sports', 'الرياضات النشطة')} /></span><small><BilingualText value={bi('Across branch workspaces', 'عبر مساحات الفروع')} /></small></article>
      </section>

      <section className="enterprise-toolbar branches-toolbar" aria-label="Branches filters">
        <label className="enterprise-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="enterprise-search-icon"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span className="sr-only"><BilingualText value={bi('Search branches or IDs', 'البحث عن الفروع أو المعرفات')} /></span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search branches or IDs | البحث عن الفروع أو المعرفات" />
        </label>
        <EnterpriseSelect label={bi('Country', 'الدولة')} value={countryFilter} onChange={setCountryFilter} options={[{ value: 'all', label: bi('All countries', 'كل الدول') }, ...countries.map((item) => ({ value: item.id, label: item.name }))]} />
        <div className="enterprise-toolbar-end"><span className="enterprise-result"><BilingualText value={bi(`${filteredBranches.length} branches`, `${filteredBranches.length} فروع`)} /></span></div>
      </section>

      <section className="branches-grid" aria-label="Branches list" aria-busy={loading}>
        {loading ? (
          <div className="enterprise-empty" role="status"><Building2 size={32} /><h3><BilingualText value={bi('Loading branch workspaces…', 'جارٍ تحميل مساحات الفروع…')} /></h3></div>
        ) : error ? (
          <div className="enterprise-empty" role="alert"><ShieldCheck size={32} /><h3><BilingualText value={bi('Branch data is unavailable', 'بيانات الفروع غير متاحة')} /></h3><p>{error.message}</p></div>
        ) : filteredBranches.length > 0 ? filteredBranches.map((branch) => {
          const country = countries.find((item) => item.id === branch.countryId);
          const sports = branch.sportIds.map((id) => demoSports.find((sport) => sport.id === id)).filter(Boolean);
          return (
            <article key={branch.id} className="branch-card">
              <div className="branch-card-media" aria-hidden="true"><div className="branch-building-bg"><Building2 size={48} /></div></div>
              <div className="branch-card-body">
                <div className="branch-card-head">
                  <div className="branch-identity"><span className="branch-icon-wrapper"><Building2 size={20} /></span><div><h2><BilingualText value={branch.name} /></h2><p className="branch-country"><Flag size={12} /><BilingualText value={country?.name ?? { en: branch.countryId, ar: branch.countryId }} /></p></div></div>
                  <span className={`branch-status status-${branch.status}`}><BilingualText value={branch.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} /></span>
                </div>
                <div className="branch-stats">
                  <div className="stat-item"><UsersRound size={14} /><span><BilingualText value={bi('Players', 'اللاعبون')} /></span><strong>{branch.playerCount}</strong></div>
                  <div className="stat-item"><ShieldCheck size={14} /><span><BilingualText value={bi('Coaches', 'المدربون')} /></span><strong>{branch.coachCount}</strong></div>
                  <div className="stat-item"><Trophy size={14} /><span><BilingualText value={bi('Sports', 'الرياضات')} /></span><strong>{branch.sportCount}</strong></div>
                  <div className="stat-item"><Target size={14} /><span><BilingualText value={bi('Groups', 'المجموعات')} /></span><strong>{branch.groupCount}</strong></div>
                  <div className="stat-item"><Zap size={14} /><span><BilingualText value={bi('Programs', 'البرامج')} /></span><strong>{branch.programCount}</strong></div>
                </div>
                <div className="branch-sports-preview"><h3><BilingualText value={bi('Sports at this Branch', 'الرياضات في هذا الفرع')} /></h3><div className="sports-tags">{sports.map((sport) => <span key={sport!.id} className={`sport-tag sport-${sport!.id}`}><BilingualText value={sport!.name} /></span>)}</div></div>
                <div className="branch-actions"><Link to={`/admin/branches/${branch.id}`} className="admin-link-button"><BilingualText value={bi('Open Branch Detail', 'فتح تفاصيل الفرع')} /><ChevronRight size={14} /></Link><Link to={`/admin/branches/${branch.id}/overview`} className="admin-secondary-button"><BilingualText value={bi('Branch Cockpit', 'قمرة قيادة الفرع')} /></Link></div>
              </div>
            </article>
          );
        }) : (
          <div className="enterprise-empty"><Building2 size={32} /><h3><BilingualText value={bi('No branches found', 'لم يتم العثور على فروع')} /></h3><p><BilingualText value={bi('Try adjusting your search or country filter.', 'جرّب تعديل البحث أو فلتر الدولة.')} /></p></div>
        )}
      </section>

      <section className="branches-integrity" aria-label="Data integrity">
        <h2 className="section-title"><BilingualText value={bi('Data Integrity', 'سلامة البيانات')} /></h2>
        <div className="integrity-grid">
          <article className="integrity-card"><div className="integrity-icon"><CheckCircle size={20} /></div><div><h3><BilingualText value={bi('Preview Source', 'مصدر معاينة')} /></h3><p><BilingualText value={bi('Branch records are supplied by the Admin data gateway.', 'سجلات الفروع مقدمة عبر بوابة بيانات الإدارة.')} /></p></div></article>
          <article className="integrity-card"><div className="integrity-icon"><ShieldCheck size={20} /></div><div><h3><BilingualText value={bi('Zero Production Claims', 'صفر ادعاءات إنتاج')} /></h3><p><BilingualText value={bi('Preview state is not presented as a live database.', 'حالة المعاينة لا تُعرض كقاعدة بيانات حية.')} /></p></div></article>
          <article className="integrity-card"><div className="integrity-icon"><Target size={20} /></div><div><h3><BilingualText value={bi('Provider Ready', 'جاهزة للموفر')} /></h3><p><BilingualText value={bi('The page can consume a production gateway when one is configured.', 'يمكن للصفحة استهلاك بوابة إنتاج عند تهيئتها.')} /></p></div></article>
          <article className="integrity-card"><div className="integrity-icon"><Flag size={20} /></div><div><h3><BilingualText value={bi('Multi-Country Ready', 'متعددة الدول')} /></h3><p><BilingualText value={bi('Country filtering is driven by gateway records.', 'تصفية الدول مدفوعة بسجلات البوابة.')} /></p></div></article>
        </div>
      </section>
    </div>
  );
}
