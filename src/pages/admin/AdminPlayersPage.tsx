import { ArrowRight, CheckCircle2, Filter, Plus, SlidersHorizontal, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmBadge, BmButton, BmDataTable, BmDrawer, BmEmptyState, BmErrorState, BmFilterBar, BmFilterSelect, BmLoadingTable, BmPageHeader, type BmColumn } from '../../components/benchmark/BenchmarkComponents';
import { UosFormSection, UosSelectField, UosSteps, UosTextField } from '../../components/fields/UosFields';
import { UiDialog } from '../../components/ui/UiPrimitives';
import type { PlayerViewModel } from '../../admin/data/viewModels';
import { demoSports } from '../../data/demo/sports';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { getGroup, getSport } from '../../data/demo/selectors';

const PLAYER_WIZARD_STEPS = [bi('Identity', 'الهوية'), bi('Sport & Assignment', 'الرياضة والتكليف'), bi('Review', 'المراجعة')];

export function AdminPlayersPage() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [draftNameEn, setDraftNameEn] = useState('');
  const [draftNameAr, setDraftNameAr] = useState('');
  const [draftSport, setDraftSport] = useState('');
  const [draftGroup, setDraftGroup] = useState('');
  const [draftAge, setDraftAge] = useState('');
  const [draftError, setDraftError] = useState<{ en: string; ar: string } | null>(null);
  const [sortBy, setSortBy] = useState('nameEn');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, loading, error } = usePlayers({ page: 1, pageSize: 50 });

  const players = useMemo(() => {
    const items = (data?.items ?? []).filter(player => {
      const haystack = `${player.nameEn} ${player.nameAr} ${player.id}`.toLowerCase();
      const active = typeof player.status === 'object' ? player.status.en.toLowerCase() : 'active';
      return haystack.includes(query.toLowerCase()) && (sport === 'all' || player.sportId === sport) && (status === 'all' || active === status);
    });
    return [...items].sort((a, b) => {
      const av = String(a[sortBy as keyof PlayerViewModel] ?? '');
      const bv = String(b[sortBy as keyof PlayerViewModel] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [data, query, sport, status, sortBy, sortDir]);

  const allSelected = players.length > 0 && players.every(p => selected.includes(p.id));
  const toggleAll = () => setSelected(allSelected ? [] : players.map(p => p.id));
  const toggleRow = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const onSort = (key: string) => { if (sortBy === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortBy(key); setSortDir('asc'); } };
  const reset = () => { setQuery(''); setSport('all'); setStatus('all'); setSelected([]); };

  const columns: BmColumn<PlayerViewModel>[] = [
    {
      key: 'nameEn', label: bi('Player', 'اللاعب'), sortable: true,
      render: (p) => (
        <div className="bm-cell-entity">
          <span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span>
          <span><strong>{p.nameEn}</strong><small>{p.id}</small></span>
        </div>
      ),
      mobileRender: (p) => (
        <div className="bm-mobile-card-head">
          <span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span>
          <div className="bm-mobile-card-title">
            <strong>{p.nameEn} | {p.nameAr}</strong>
            <small>{p.id}</small>
          </div>
        </div>
      ),
    },
    { key: 'sportId', label: bi('Sport', 'الرياضة'), sortable: true, render: (p) => <BilingualText value={getSport(p.sportId)?.name ?? bi(p.sportId, p.sportId)} /> },
    { key: 'groupId', label: bi('Group', 'المجموعة'), render: (p) => <BilingualText value={getGroup(p.groupId)?.name ?? bi('Not assigned', 'غير معين')} /> },
    { key: 'age', label: bi('Age', 'العمر'), sortable: true, render: (p) => p.age ?? '—' },
    { key: 'level', label: bi('Level', 'المستوى'), render: (p) => <BilingualText value={p.level} /> },
    { key: 'attendanceRate', label: bi('Attendance', 'الحضور'), sortable: true, render: (p) => <span className="bm-cell-strong">{p.attendanceRate}%</span> },
    { key: 'performanceScore', label: bi('Performance', 'الأداء'), sortable: true, render: (p) => <span className="bm-cell-strong">{p.performanceScore}/100</span> },
    {
      key: 'status', label: bi('Status', 'الحالة'), sortable: true,
      render: (p) => {
        const active = typeof p.status === 'object' ? p.status.en.toLowerCase() === 'active' : true;
        return <BmBadge tone={active ? 'success' : 'neutral'} label={active ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} icon={active ? <CheckCircle2 aria-hidden="true" /> : undefined} />;
      },
    },
    { key: 'actions', label: bi('Actions', 'الإجراءات'), render: (p) => <Link to={`/admin/players/${p.id}`} className="bm-btn bm-btn-icon" aria-label="View player"><ArrowRight aria-hidden="true" /></Link> },
  ];

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Player Management', 'إدارة اللاعبين')}
      title={bi('Player Directory', 'دليل اللاعبين')}
      description={bi('A high-density roster view linked to sports, groups, attendance and performance preview data.', 'عرض قائمة عالي الكثافة مرتبط بالرياضات والمجموعات والحضور وبيانات الأداء التجريبية.')}
      icon={<UserRound aria-hidden="true" />}
      actions={<BmButton variant="primary" onClick={() => { setWizardStep(0); setDraftError(null); setShowForm(true); }}><Plus aria-hidden="true" /><BilingualText value={bi('Add Player', 'إضافة لاعب')} /></BmButton>}
    />

    {notice && <div className="bm-badge bm-badge-info" style={{ marginBottom: '16px' }} role="status"><BilingualText value={bi('Preview record prepared locally', 'تم تجهيز السجل التجريبي محليًا')} /></div>}

    <BmFilterBar
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder={bi('Search players or IDs', 'البحث عن اللاعبين أو المعرفات')}
      filters={
        <>
          <BmFilterSelect label={bi('Sport', 'الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...demoSports.map(s => ({ value: s.id, label: s.name }))]} />
          <BmFilterSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All statuses', 'كل الحالات') }, { value: 'active', label: bi('Active', 'نشط') }, { value: 'inactive', label: bi('Inactive', 'غير نشط') }]} />
        </>
      }
      onMobileOpen={() => setDrawerOpen(true)}
    />

    <div style={{ marginTop: '16px' }}>
      {loading && <BmLoadingTable rows={5} />}
      {error && <BmErrorState onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <BmDataTable<PlayerViewModel>
          columns={columns}
          rows={players}
          selectable
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          bulkActions={
            <>
              <BmButton variant="tertiary" onClick={() => { setNotice(true); setSelected([]); }}><CheckCircle2 aria-hidden="true" /><BilingualText value={bi('Mark reviewed', 'تحديد كمراجع')} /></BmButton>
              <BmButton variant="ghost" onClick={() => setSelected([])}><BilingualText value={bi('Clear', 'مسح')} /></BmButton>
            </>
          }
          emptyState={
            <BmEmptyState
              icon={<UserRound aria-hidden="true" />}
              title={bi('No players match these filters', 'لا يوجد لاعبون يطابقون هذه الفلاتر')}
              description={bi('Reset the filters to return to the preview roster.', 'أعد ضبط الفلاتر للعودة إلى قائمة المعاينة.')}
              action={<BmButton variant="tertiary" onClick={reset}><Filter aria-hidden="true" /><BilingualText value={bi('Reset filters', 'إعادة ضبط الفلاتر')} /></BmButton>}
            />
          }
        />
      )}
    </div>

    <BmDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={bi('Player Filters', 'فلاتر اللاعبين')}
      description={bi('Search, sport and status scope for the player directory.', 'البحث ونطاق الرياضة والحالة لدليل اللاعبين.')}
      footer={<BmButton variant="primary" onClick={() => setDrawerOpen(false)}><BilingualText value={bi('Show results', 'عرض النتائج')} /></BmButton>}
    >
      <div className="bm-field">
        <label className="bm-field-label" htmlFor="player-drawer-search"><BilingualText value={bi('Search', 'البحث')} /></label>
        <input id="player-drawer-search" className="bm-field-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players or IDs | البحث عن اللاعبين أو المعرفات" />
      </div>
      <BmFilterSelect label={bi('Sport', 'الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...demoSports.map(s => ({ value: s.id, label: s.name }))]} />
      <BmFilterSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All statuses', 'كل الحالات') }, { value: 'active', label: bi('Active', 'نشط') }, { value: 'inactive', label: bi('Inactive', 'غير نشط') }]} />
    </BmDrawer>

    <UiDialog
      open={showForm}
      onClose={() => setShowForm(false)}
      title={bi('Add Player Preview', 'معاينة إضافة لاعب')}
      description={bi('A local intake preview. Nothing is saved to a backend.', 'معاينة إدخال محلية. لا يتم حفظ أي شيء في نظام خلفي.')}
    >
      <UosSteps steps={PLAYER_WIZARD_STEPS} current={wizardStep} />
      {wizardStep === 0 && (
        <UosFormSection title={bi('Identity', 'الهوية')} icon={<UserRound size={17} />} description={bi('The athlete name in both languages, plus age.', 'اسم الرياضي باللغتين، إضافة إلى العمر.')}>
          <UosTextField label={bi('Player name (English)', 'اسم اللاعب (إنجليزي)')} icon={<UserRound size={16} />} value={draftNameEn} onChange={(event) => setDraftNameEn(event.target.value)} required autoComplete="off" placeholder="Player name" helper={bi('As shown on ID', 'كما هو في الهوية')} error={draftError} />
          <UosTextField label={bi('Player name (Arabic)', 'اسم اللاعب (عربي)')} value={draftNameAr} onChange={(event) => setDraftNameAr(event.target.value)} required autoComplete="off" placeholder="اسم اللاعب" />
          <UosTextField label={bi('Age', 'العمر')} value={draftAge} onChange={(event) => setDraftAge(event.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" autoComplete="off" placeholder="10" helper={bi('Optional; numbers only.', 'اختياري؛ أرقام فقط.')} />
        </UosFormSection>
      )}
      {wizardStep === 1 && (
        <UosFormSection title={bi('Sport & Assignment', 'الرياضة والتكليف')} icon={<UserRound size={17} />} description={bi('Sport first, then an optional training group in that sport.', 'الرياضة أولًا، ثم مجموعة تدريب اختيارية في الرياضة نفسها.')}>
          <UosSelectField label={bi('Sport', 'الرياضة')} icon={<UserRound size={16} />} value={draftSport} onChange={(event) => { setDraftSport(event.target.value); setDraftGroup(''); }} required placeholder={bi('Choose sport', 'اختر الرياضة')} options={demoSports.map((s) => ({ value: s.id, label: s.name }))} error={draftError} />
          <UosSelectField label={bi('Training group (optional)', 'المجموعة التدريبية (اختياري)')} value={draftGroup} onChange={(event) => setDraftGroup(event.target.value)} placeholder={bi('Choose group', 'اختر المجموعة')} options={demoTrainingGroups.filter((group) => !draftSport || group.sportId === draftSport).map((group) => ({ value: group.id, label: group.name }))} helper={bi('Groups narrow once a sport is chosen.', 'تضيق المجموعات بعد اختيار الرياضة.')} />
        </UosFormSection>
      )}
      {wizardStep === 2 && (
        <UosFormSection title={bi('Review', 'المراجعة')} icon={<CheckCircle2 size={17} />} description={bi('Confirm the preview record before preparing it locally.', 'أكد سجل المعاينة قبل تجهيزه محليًا.')}>
          <div className="uos-review-list">
            <div><span><BilingualText value={bi('Name', 'الاسم')} /></span><strong>{draftNameEn || '—'} · {draftNameAr || '—'}</strong></div>
            <div><span><BilingualText value={bi('Sport', 'الرياضة')} /></span><strong>{demoSports.find((s) => s.id === draftSport)?.name.en ?? '—'}</strong></div>
            <div><span><BilingualText value={bi('Group', 'المجموعة')} /></span><strong>{demoTrainingGroups.find((group) => group.id === draftGroup)?.name.en ?? bi('Not assigned', 'غير معين').en}</strong></div>
          </div>
          <p className="uos-field-helper"><BilingualText value={bi('Preparing stores nothing outside this browser session.', 'التجهيز لا يحفظ أي شيء خارج جلسة المتصفح هذه.')} /></p>
        </UosFormSection>
      )}
      <div className="dialog-actions" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" className="uos-btn-ghost uos-touch" onClick={() => setShowForm(false)}><BilingualText value={bi('Cancel', 'إلغاء')} /></button>
        {wizardStep > 0 && <button type="button" className="uos-btn-ghost uos-touch" onClick={() => { setDraftError(null); setWizardStep((step) => step - 1); }}><BilingualText value={bi('Back', 'رجوع')} /></button>}
        {wizardStep < PLAYER_WIZARD_STEPS.length - 1
          ? <button type="button" className="uos-btn-primary uos-touch" onClick={() => {
              if (wizardStep === 0 && (!draftNameEn.trim() || !draftNameAr.trim())) { setDraftError({ en: 'Enter the player name in both languages to continue.', ar: 'أدخل اسم اللاعب باللغتين للمتابعة.' }); return; }
              if (wizardStep === 1 && !draftSport) { setDraftError({ en: 'Choose a sport to continue.', ar: 'اختر الرياضة للمتابعة.' }); return; }
              setDraftError(null);
              setWizardStep((step) => step + 1);
            }}><BilingualText value={bi('Continue', 'متابعة')} /></button>
          : <button type="button" className="uos-btn-primary uos-touch" onClick={() => { setShowForm(false); setNotice(true); }}><BilingualText value={bi('Prepare Preview', 'تجهيز المعاينة')} /></button>}
      </div>
    </UiDialog>
  </div>;
}
