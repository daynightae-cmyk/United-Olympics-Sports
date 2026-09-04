import { ArrowRight, Building2, CheckCircle2, Globe2, Plus, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranches } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmBadge, BmButton, BmDataTable, BmDrawer, BmEmptyState, BmErrorState, BmFilterBar, BmFilterSelect, BmLoadingTable, BmPageHeader, type BmColumn } from '../../components/benchmark/BenchmarkComponents';
import { UosFormSection, UosSelectField, UosSteps, UosTextField } from '../../components/fields/UosFields';
import { UiDialog } from '../../components/ui/UiPrimitives';
import type { BranchViewModel } from '../../admin/data/viewModels';
import { demoCountries } from '../../data/demo/business';
import { demoSports } from '../../data/demo/sports';

function sortText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && 'en' in value) return String((value as { en: unknown }).en ?? '');
  return '';
}

const WIZARD_STEPS = [bi('Identity', 'الهوية'), bi('Location & Sports', 'الموقع والرياضات'), bi('Review', 'المراجعة')];

export function AdminBranchesPage() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [notice, setNotice] = useState(false);
  const [draftNameEn, setDraftNameEn] = useState('');
  const [draftNameAr, setDraftNameAr] = useState('');
  const [draftCountry, setDraftCountry] = useState('');
  const [draftSport, setDraftSport] = useState('');
  const [draftError, setDraftError] = useState<{ en: string; ar: string } | null>(null);
  const { data, loading, error } = useBranches({ page: 1, pageSize: 50 });

  const branches = useMemo(() => {
    const items = (data?.items ?? []).filter(branch =>
      (country === 'all' || branch.countryId === country) &&
      `${branch.name.en} ${branch.name.ar} ${branch.id}`.toLowerCase().includes(query.toLowerCase())
    );
    return [...items].sort((a, b) => {
      const av = sortText(a[sortBy as keyof BranchViewModel]);
      const bv = sortText(b[sortBy as keyof BranchViewModel]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [data, query, country, sortBy, sortDir]);

  const allSelected = branches.length > 0 && branches.every(b => selected.includes(b.id));
  const toggleAll = () => setSelected(allSelected ? [] : branches.map(b => b.id));
  const toggleRow = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const onSort = (key: string) => { if (sortBy === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortBy(key); setSortDir('asc'); } };
  const reset = () => { setQuery(''); setCountry('all'); setSelected([]); };

  const startWizard = () => {
    setWizardStep(0);
    setDraftError(null);
    setWizardOpen(true);
  };

  const nextWizard = () => {
    if (wizardStep === 0 && (!draftNameEn.trim() || !draftNameAr.trim())) {
      setDraftError({ en: 'Enter the branch name in both languages to continue.', ar: 'أدخل اسم الفرع باللغتين للمتابعة.' });
      return;
    }
    if (wizardStep === 1 && (!draftCountry || !draftSport)) {
      setDraftError({ en: 'Choose a country and a primary sport to continue.', ar: 'اختر الدولة والرياضة الأساسية للمتابعة.' });
      return;
    }
    setDraftError(null);
    setWizardStep((step) => Math.min(step + 1, WIZARD_STEPS.length - 1));
  };

  const preparePreview = () => {
    setWizardOpen(false);
    setNotice(true);
  };

  const columns: BmColumn<BranchViewModel>[] = [
    {
      key: 'name', label: bi('Branch', 'الفرع'), sortable: true,
      render: (b) => (
        <div className="bm-cell-entity">
          <span className="bm-cell-avatar"><Building2 aria-hidden="true" /></span>
          <span><strong><BilingualText value={b.name} /></strong><small>{b.id}</small></span>
        </div>
      ),
      mobileRender: (b) => (
        <div className="bm-mobile-card-head">
          <span className="bm-cell-avatar"><Building2 aria-hidden="true" /></span>
          <div className="bm-mobile-card-title">
            <strong><BilingualText value={b.name} /></strong>
            <small>{b.id}</small>
          </div>
        </div>
      ),
    },
    { key: 'countryId', label: bi('Country', 'الدولة'), sortable: true, render: (b) => <BilingualText value={demoCountries.find(c => c.id === b.countryId)?.name ?? bi(b.countryId, b.countryId)} /> },
    { key: 'playerCount', label: bi('Players', 'اللاعبون'), sortable: true, render: (b) => <span className="bm-cell-strong">{b.playerCount}</span> },
    { key: 'coachCount', label: bi('Coaches', 'المدربون'), sortable: true, render: (b) => <span className="bm-cell-strong">{b.coachCount}</span> },
    { key: 'programCount', label: bi('Programs', 'البرامج'), sortable: true, render: (b) => b.programCount },
    { key: 'sportCount', label: bi('Sports', 'الرياضات'), sortable: true, render: (b) => b.sportCount },
    { key: 'groupCount', label: bi('Groups', 'المجموعات'), sortable: true, render: (b) => <span className="bm-cell-strong">{b.groupCount}</span> },
    { key: 'status', label: bi('Status', 'الحالة'), sortable: true, render: (b) => <BmBadge tone={b.status === 'active' ? 'success' : 'neutral'} label={b.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} icon={b.status === 'active' ? <CheckCircle2 aria-hidden="true" /> : undefined} /> },
    {
      key: 'actions', label: bi('Open', 'فتح'),
      render: (b) => <Link to={`/admin/branches/${b.id}`} className="bm-btn bm-btn-icon" aria-label="Open branch"><ArrowRight aria-hidden="true" /></Link>,
    },
  ];

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Branch Management', 'إدارة الفروع')}
      title={bi('Branches', 'الفروع')}
      description={bi('A multi-country branch cockpit for sports, programs, rosters, coaches and coverage.', 'مركز فروع متعدد الدول للرياضات والبرامج والقوائم والمدربين والتغطية.')}
      icon={<Building2 aria-hidden="true" />}
      actions={<BmButton variant="primary" onClick={startWizard}><Plus aria-hidden="true" /><BilingualText value={bi('Add Branch', 'إضافة فرع')} /></BmButton>}
    />

    {notice && <div className="bm-badge bm-badge-info" style={{ marginBottom: '16px' }} role="status"><BilingualText value={bi('Branch preview prepared locally — not saved to any backend.', 'تم تجهيز معاينة الفرع محليًا — دون حفظ في أي نظام خلفي.')} /></div>}

    <BmFilterBar
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder={bi('Search branches or IDs', 'البحث عن الفروع أو المعرفات')}
      filters={<BmFilterSelect label={bi('Country', 'الدولة')} value={country} onChange={setCountry} options={[{ value: 'all', label: bi('All countries', 'كل الدول') }, ...demoCountries.map(c => ({ value: c.id, label: c.name }))]} />}
      onMobileOpen={() => setDrawerOpen(true)}
    />

    <div style={{ marginTop: '16px' }}>
      {loading && <BmLoadingTable rows={5} />}
      {error && <BmErrorState onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <BmDataTable<BranchViewModel>
          columns={columns}
          rows={branches}
          selectable
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          bulkActions={
            <>
              <BmButton variant="tertiary" onClick={() => setSelected([])}><CheckCircle2 aria-hidden="true" /><BilingualText value={bi('Mark reviewed', 'تحديد كمراجع')} /></BmButton>
              <BmButton variant="ghost" onClick={() => setSelected([])}><BilingualText value={bi('Clear', 'مسح')} /></BmButton>
            </>
          }
          emptyState={
            <BmEmptyState
              icon={<Building2 aria-hidden="true" />}
              title={bi('No branches match', 'لا تطابق أي فروع')}
              description={bi('Reset the country filter or search term.', 'أعد ضبط فلتر الدولة أو مصطلح البحث.')}
              action={<BmButton variant="tertiary" onClick={reset}><SlidersHorizontal aria-hidden="true" /><BilingualText value={bi('Reset filters', 'إعادة ضبط')} /></BmButton>}
            />
          }
        />
      )}
    </div>

    <BmDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={bi('Branch Filters', 'فلاتر الفروع')}
      description={bi('Search and country scope for the branch directory.', 'البحث ونطاق الدولة لدليل الفروع.')}
      footer={<BmButton variant="primary" onClick={() => setDrawerOpen(false)}><BilingualText value={bi('Show results', 'عرض النتائج')} /></BmButton>}
    >
      <div className="bm-field">
        <label className="bm-field-label" htmlFor="branch-drawer-search"><BilingualText value={bi('Search', 'البحث')} /></label>
        <input id="branch-drawer-search" className="bm-field-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search branches or IDs | البحث عن الفروع أو المعرفات" />
      </div>
      <BmFilterSelect label={bi('Country', 'الدولة')} value={country} onChange={setCountry} options={[{ value: 'all', label: bi('All countries', 'كل الدول') }, ...demoCountries.map(c => ({ value: c.id, label: c.name }))]} />
    </BmDrawer>

    <UiDialog
      open={wizardOpen}
      onClose={() => setWizardOpen(false)}
      title={bi('Add Branch Preview', 'معاينة إضافة فرع')}
      description={bi('A local intake preview. Nothing is saved to a backend.', 'معاينة إدخال محلية. لا يتم حفظ أي شيء في نظام خلفي.')}
    >
      <UosSteps steps={WIZARD_STEPS} current={wizardStep} />
      {wizardStep === 0 && (
        <UosFormSection title={bi('Identity', 'الهوية')} icon={<Building2 size={17} />} description={bi('The public branch name in both languages.', 'اسم الفرع العام باللغتين.')}>
          <UosTextField label={bi('Branch name (English)', 'اسم الفرع (إنجليزي)')} icon={<Building2 size={16} />} value={draftNameEn} onChange={(event) => setDraftNameEn(event.target.value)} required autoComplete="off" placeholder="Branch name" error={draftError} />
          <UosTextField label={bi('Branch name (Arabic)', 'اسم الفرع (عربي)')} value={draftNameAr} onChange={(event) => setDraftNameAr(event.target.value)} required autoComplete="off" placeholder="اسم الفرع" />
        </UosFormSection>
      )}
      {wizardStep === 1 && (
        <UosFormSection title={bi('Location & Sports', 'الموقع والرياضات')} icon={<Globe2 size={17} />} description={bi('Country scope and the primary sport for this preview record.', 'نطاق الدولة والرياضة الأساسية لسجل المعاينة هذا.')}>
          <UosSelectField label={bi('Country', 'الدولة')} icon={<Globe2 size={16} />} value={draftCountry} onChange={(event) => setDraftCountry(event.target.value)} required placeholder={bi('Choose country', 'اختر الدولة')} options={demoCountries.map((c) => ({ value: c.id, label: c.name }))} error={draftError} />
          <UosSelectField label={bi('Primary sport', 'الرياضة الأساسية')} value={draftSport} onChange={(event) => setDraftSport(event.target.value)} required placeholder={bi('Choose sport', 'اختر الرياضة')} options={demoSports.map((s) => ({ value: s.id, label: s.name }))} />
        </UosFormSection>
      )}
      {wizardStep === 2 && (
        <UosFormSection title={bi('Review', 'المراجعة')} icon={<CheckCircle2 size={17} />} description={bi('Confirm the preview record before preparing it locally.', 'أكد سجل المعاينة قبل تجهيزه محليًا.')}>
          <div className="uos-review-list">
            <div><span><BilingualText value={bi('Name', 'الاسم')} /></span><strong>{draftNameEn || '—'} · {draftNameAr || '—'}</strong></div>
            <div><span><BilingualText value={bi('Country', 'الدولة')} /></span><strong>{demoCountries.find((c) => c.id === draftCountry)?.name.en ?? '—'}</strong></div>
            <div><span><BilingualText value={bi('Sport', 'الرياضة')} /></span><strong>{demoSports.find((s) => s.id === draftSport)?.name.en ?? '—'}</strong></div>
          </div>
          <p className="uos-field-helper"><BilingualText value={bi('Preparing stores nothing outside this browser session.', 'التجهيز لا يحفظ أي شيء خارج جلسة المتصفح هذه.')} /></p>
        </UosFormSection>
      )}
      <div className="dialog-actions" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {wizardStep > 0 && <UiButtonSafeSecondary onClick={() => { setDraftError(null); setWizardStep((step) => step - 1); }} label={bi('Back', 'رجوع')} />}
        {wizardStep < WIZARD_STEPS.length - 1
          ? <PrimaryNext onClick={nextWizard} />
          : <PrimaryPrepare onClick={preparePreview} />}
      </div>
    </UiDialog>
  </div>;
}

function UiButtonSafeSecondary({ onClick, label }: { onClick: () => void; label: { en: string; ar: string } }) {
  return <button type="button" className="uos-btn-ghost uos-touch" onClick={onClick}><BilingualText value={label} /></button>;
}

function PrimaryNext({ onClick }: { onClick: () => void }) {
  return <button type="button" className="uos-btn-primary uos-touch" onClick={onClick}><BilingualText value={bi('Continue', 'متابعة')} /></button>;
}

function PrimaryPrepare({ onClick }: { onClick: () => void }) {
  return <button type="button" className="uos-btn-primary uos-touch" onClick={onClick}><BilingualText value={bi('Prepare Preview', 'تجهيز المعاينة')} /></button>;
}
