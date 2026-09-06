import { Building2, Flag, ShieldCheck, Trophy, UsersRound, Zap, Target, CheckCircle, ChevronRight, Plus, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice, EnterpriseSelect } from '../../components/enterprise/EnterpriseUI';
import { useBranches, useCountries, useCreateBranch, useSports } from '../../admin/data/adminHooks';

const emptyBranchDraft = {
  nameEn: '',
  nameAr: '',
  countryId: '',
  sportId: '',
  addressEn: '',
  addressAr: '',
  phone: '',
  email: '',
};

export function AdminBranchesPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') ?? 'all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyBranchDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data: branchResult, loading: branchesLoading, error: branchesError } = useBranches({ page: 1, pageSize: 100 });
  const { data: countryResult, loading: countriesLoading, error: countriesError } = useCountries({ page: 1, pageSize: 100 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateBranch();
  const branches = branchResult.items;
  const countries = countryResult.items;
  const sportsCatalog = sportResult.items;

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

  const setDraftField = (field: keyof typeof emptyBranchDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const resetDraft = () => { setDraft(emptyBranchDraft); setFormError(''); };
  const openCreate = () => { resetDraft(); setShowCreate(true); };
  const closeCreate = () => { if (!createLoading) setShowCreate(false); };

  const submitBranch = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim() || !draft.countryId || !draft.sportId) {
      setFormError('Branch names, country, and primary sport are required. | اسم الفرع باللغتين والدولة والرياضة الأساسية مطلوبة.');
      return;
    }
    setFormError('');
    await create({
      name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() },
      countryId: draft.countryId,
      organizationId: 'org-united-olympics',
      sportIds: [draft.sportId],
      programIds: [],
      groupIds: [],
      coachIds: [],
      playerIds: [],
      status: 'active',
      address: draft.addressEn.trim() || draft.addressAr.trim() ? { en: draft.addressEn.trim(), ar: draft.addressAr.trim() } : undefined,
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
    });
    setShowCreate(false);
    resetDraft();
    setSavedNotice(true);
  };

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

      <PageHeader
        icon={Building2}
        eyebrow={bi('Branch Workspaces', 'مساحات الفروع')}
        title={bi('Branches', 'الفروع')}
        description={bi('Manage branch workspaces, sports coverage, athlete rosters and coach assignments from one preview cockpit.', 'أدر مساحات الفروع وتغطية الرياضات وقوائم الرياضيين وتكليفات المدربين من مركز معاينة واحد.')}
        actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={openCreate}><Plus size={16} /><BilingualText value={bi('Add Branch', 'إضافة فرع')} /></button></div>}
      />

      {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Branch saved to the browser preview store. Production backend data was not changed.', 'تم حفظ الفرع في مخزن المعاينة بالمتصفح. لم يتم تغيير بيانات نظام إنتاجي خلفي.')} /></div>}

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
          const sports = branch.sportIds.map((id) => sportsCatalog.find((sport) => sport.id === id)).filter(Boolean);
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

      {showCreate && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeCreate}>
        <section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Branch | إضافة فرع" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head"><div><BilingualText value={bi('Add Branch', 'إضافة فرع')} /><small><BilingualText value={bi('Browser-persistent preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button type="button" className="admin-icon-button" onClick={closeCreate} aria-label="Close | إغلاق"><X /></button></div>
          <div className="preview-warning"><BilingualText value={bi('This creates a persistent Preview record in this browser. It does not write to a production backend.', 'ينشئ هذا سجل معاينة محفوظًا في هذا المتصفح. لا يكتب إلى نظام خلفي إنتاجي.')} /></div>
          {formError && <p role="alert" className="form-error">{formError}</p>}
          <div className="preview-form-grid">
            <label><BilingualText value={bi('Branch name (English)', 'اسم الفرع (إنجليزي)')} /><input value={draft.nameEn} onChange={(event) => setDraftField('nameEn', event.target.value)} placeholder="Abu Dhabi Branch" /></label>
            <label><BilingualText value={bi('Branch name (Arabic)', 'اسم الفرع (عربي)')} /><input value={draft.nameAr} onChange={(event) => setDraftField('nameAr', event.target.value)} placeholder="فرع أبوظبي" /></label>
            <label><BilingualText value={bi('Country', 'الدولة')} /><select value={draft.countryId} onChange={(event) => setDraftField('countryId', event.target.value)}><option value="">Select Country | اختر الدولة</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.name.en} | {country.name.ar}</option>)}</select></label>
            <label><BilingualText value={bi('Primary sport', 'الرياضة الأساسية')} /><select value={draft.sportId} onChange={(event) => setDraftField('sportId', event.target.value)}><option value="">Select Sport | اختر الرياضة</option>{sportsCatalog.map((sport) => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label>
            <label><BilingualText value={bi('Address (English)', 'العنوان (إنجليزي)')} /><input value={draft.addressEn} onChange={(event) => setDraftField('addressEn', event.target.value)} placeholder="Branch address" /></label>
            <label><BilingualText value={bi('Address (Arabic)', 'العنوان (عربي)')} /><input value={draft.addressAr} onChange={(event) => setDraftField('addressAr', event.target.value)} placeholder="عنوان الفرع" /></label>
            <label><BilingualText value={bi('Phone', 'الهاتف')} /><input value={draft.phone} onChange={(event) => setDraftField('phone', event.target.value)} placeholder="+971..." /></label>
            <label><BilingualText value={bi('Email', 'البريد الإلكتروني')} /><input type="email" value={draft.email} onChange={(event) => setDraftField('email', event.target.value)} placeholder="branch@example.com" /></label>
          </div>
          <div className="dialog-actions"><button type="button" className="admin-secondary-button" onClick={closeCreate} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button type="button" className="admin-primary-button" onClick={() => void submitBranch()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Branch', createLoading ? 'جارٍ الحفظ…' : 'حفظ الفرع')} /></button></div>
        </section>
      </div>}
    </div>
  );
}
