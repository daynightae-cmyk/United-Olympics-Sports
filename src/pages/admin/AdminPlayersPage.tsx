import { ArrowRight, CheckCircle2, Filter, Plus, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreatePlayer, useGroups, usePlayers, usePrograms, useSports } from '../../admin/data/adminHooks';
import type { PlayerViewModel } from '../../admin/data/viewModels';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmBadge, BmButton, BmDataTable, BmDrawer, BmEmptyState, BmErrorState, BmFilterBar, BmFilterSelect, BmLoadingTable, BmPageHeader, type BmColumn } from '../../components/benchmark/BenchmarkComponents';
import { UosFormSection, UosSelectField, UosSteps, UosTextField } from '../../components/fields/UosFields';
import { UiDialog } from '../../components/ui/UiPrimitives';

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
  const [draftProgram, setDraftProgram] = useState('');
  const [draftAge, setDraftAge] = useState('');
  const [draftError, setDraftError] = useState<{ en: string; ar: string } | null>(null);
  const [sortBy, setSortBy] = useState('nameEn');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, loading, error } = usePlayers({ page: 1, pageSize: 200 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: groupResult } = useGroups({ page: 1, pageSize: 200 });
  const { data: programResult } = usePrograms({ page: 1, pageSize: 200 });
  const { create, loading: createLoading } = useCreatePlayer();
  const sports = sportResult.items;
  const groups = groupResult.items;
  const programs = programResult.items;

  const players = useMemo(() => {
    const items = data.items.filter(player => {
      const haystack = `${player.nameEn} ${player.nameAr} ${player.id}`.toLowerCase();
      const active = player.status.en.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (sport === 'all' || player.sportId === sport) && (status === 'all' || active === status);
    });
    return [...items].sort((a, b) => {
      const av = String(a[sortBy as keyof PlayerViewModel] ?? '');
      const bv = String(b[sortBy as keyof PlayerViewModel] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [data.items, query, sport, status, sortBy, sortDir]);

  const allSelected = players.length > 0 && players.every(p => selected.includes(p.id));
  const toggleAll = () => setSelected(allSelected ? [] : players.map(p => p.id));
  const toggleRow = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const onSort = (key: string) => { if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortDir('asc'); } };
  const reset = () => { setQuery(''); setSport('all'); setStatus('all'); setSelected([]); };
  const resetDraft = () => { setDraftNameEn(''); setDraftNameAr(''); setDraftSport(''); setDraftGroup(''); setDraftProgram(''); setDraftAge(''); setDraftError(null); setWizardStep(0); };

  const validateStep = () => {
    if (wizardStep === 0 && (!draftNameEn.trim() || !draftNameAr.trim())) {
      setDraftError(bi('English and Arabic names are required.', 'الاسم بالإنجليزية والعربية مطلوبان.'));
      return false;
    }
    if (wizardStep === 1 && !draftSport) {
      setDraftError(bi('Choose a sport before continuing.', 'اختر رياضة قبل المتابعة.'));
      return false;
    }
    setDraftError(null);
    return true;
  };

  const savePlayer = async () => {
    if (!draftNameEn.trim() || !draftNameAr.trim() || !draftSport) {
      setDraftError(bi('Complete the required identity and sport fields.', 'أكمل حقول الهوية والرياضة المطلوبة.'));
      setWizardStep(!draftNameEn.trim() || !draftNameAr.trim() ? 0 : 1);
      return;
    }
    await create({
      nameEn: draftNameEn.trim(),
      nameAr: draftNameAr.trim(),
      sportId: draftSport,
      groupId: draftGroup || undefined,
      programId: draftProgram || undefined,
      age: draftAge ? Number(draftAge) : undefined,
      level: bi('Beginner', 'مبتدئ'),
      status: bi('Active', 'نشط'),
      attendanceRate: 0,
      performanceScore: null,
    });
    setShowForm(false);
    resetDraft();
    setNotice(true);
  };

  const columns: BmColumn<PlayerViewModel>[] = [
    { key: 'nameEn', label: bi('Player', 'اللاعب'), sortable: true, render: p => <div className="bm-cell-entity"><span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span><span><strong>{p.nameEn}</strong><small>{p.nameAr} · {p.id}</small></span></div>, mobileRender: p => <div className="bm-mobile-card-head"><span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span><div className="bm-mobile-card-title"><strong>{p.nameEn} | {p.nameAr}</strong><small>{p.id}</small></div></div> },
    { key: 'sportId', label: bi('Sport', 'الرياضة'), sortable: true, render: p => <BilingualText value={sports.find(item => item.id === p.sportId)?.name ?? bi(p.sportId, p.sportId)} /> },
    { key: 'groupId', label: bi('Group', 'المجموعة'), render: p => <BilingualText value={groups.find(item => item.id === p.groupId)?.name ?? bi('Not assigned', 'غير معين')} /> },
    { key: 'age', label: bi('Age', 'العمر'), sortable: true, render: p => p.age ?? '—' },
    { key: 'level', label: bi('Level', 'المستوى'), render: p => <BilingualText value={p.level} /> },
    { key: 'attendanceRate', label: bi('Attendance', 'الحضور'), sortable: true, render: p => <span className="bm-cell-strong">{p.attendanceRate}%</span> },
    { key: 'performanceScore', label: bi('Performance', 'الأداء'), sortable: true, render: p => <span className="bm-cell-strong">{p.performanceScore === null ? '—' : `${p.performanceScore}/100`}</span> },
    { key: 'status', label: bi('Status', 'الحالة'), sortable: true, render: p => { const active = p.status.en.toLowerCase() === 'active'; return <BmBadge tone={active ? 'success' : 'neutral'} label={active ? bi('Active', 'نشط') : p.status} icon={active ? <CheckCircle2 aria-hidden="true" /> : undefined} />; } },
    { key: 'actions', label: bi('Actions', 'الإجراءات'), render: p => <Link to={`/admin/players/${p.id}`} className="bm-btn bm-btn-icon" aria-label={`View ${p.nameEn}`}><ArrowRight aria-hidden="true" /></Link> },
  ];

  return <div className="admin-page">
    <BmPageHeader eyebrow={bi('Player Management', 'إدارة اللاعبين')} title={bi('Player Directory', 'دليل اللاعبين')} description={bi('Gateway-backed roster linked to sports, groups, attendance and performance records.', 'قائمة مدفوعة ببوابة البيانات مرتبطة بالرياضات والمجموعات والحضور وسجلات الأداء.')} icon={<UserRound aria-hidden="true" />} actions={<BmButton variant="primary" onClick={() => { resetDraft(); setShowForm(true); }}><Plus aria-hidden="true" /><BilingualText value={bi('Add Player', 'إضافة لاعب')} /></BmButton>} />

    {notice && <div className="bm-badge bm-badge-info" style={{ marginBottom: '16px' }} role="status"><BilingualText value={bi('Player saved to the browser preview store.', 'تم حفظ اللاعب في مخزن المعاينة بالمتصفح.')} /></div>}

    <BmFilterBar searchValue={query} onSearchChange={setQuery} searchPlaceholder={bi('Search players or IDs', 'البحث عن اللاعبين أو المعرفات')} filters={<><BmFilterSelect label={bi('Sport', 'الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...sports.map(item => ({ value: item.id, label: item.name }))]} /><BmFilterSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All statuses', 'كل الحالات') }, { value: 'active', label: bi('Active', 'نشط') }, { value: 'inactive', label: bi('Inactive', 'غير نشط') }]} /></>} onMobileOpen={() => setDrawerOpen(true)} />

    <div style={{ marginTop: '16px' }}>
      {loading && <BmLoadingTable rows={5} />}
      {error && <BmErrorState onRetry={() => globalThis.location.reload()} />}
      {!loading && !error && <BmDataTable<PlayerViewModel> columns={columns} rows={players} selectable selectedIds={selected} onToggleRow={toggleRow} onToggleAll={toggleAll} sortBy={sortBy} sortDir={sortDir} onSort={onSort} bulkActions={<><BmButton variant="ghost" onClick={() => setSelected([])}><BilingualText value={bi('Clear selection', 'مسح التحديد')} /></BmButton></>} emptyState={<BmEmptyState icon={<UserRound aria-hidden="true" />} title={bi('No players match these filters', 'لا يوجد لاعبون يطابقون هذه الفلاتر')} description={bi('Reset the filters to return to the roster.', 'أعد ضبط الفلاتر للعودة إلى القائمة.')} action={<BmButton variant="tertiary" onClick={reset}><Filter aria-hidden="true" /><BilingualText value={bi('Reset filters', 'إعادة ضبط الفلاتر')} /></BmButton>} />} />}
    </div>

    <BmDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={bi('Player Filters', 'فلاتر اللاعبين')} description={bi('Search, sport and status scope for the player directory.', 'البحث ونطاق الرياضة والحالة لدليل اللاعبين.')} footer={<BmButton variant="primary" onClick={() => setDrawerOpen(false)}><BilingualText value={bi('Show results', 'عرض النتائج')} /></BmButton>}>
      <div className="bm-field"><label className="bm-field-label" htmlFor="player-drawer-search"><BilingualText value={bi('Search', 'البحث')} /></label><input id="player-drawer-search" className="bm-field-input" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <BmFilterSelect label={bi('Sport', 'الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...sports.map(item => ({ value: item.id, label: item.name }))]} />
      <BmFilterSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All statuses', 'كل الحالات') }, { value: 'active', label: bi('Active', 'نشط') }, { value: 'inactive', label: bi('Inactive', 'غير نشط') }]} />
    </BmDrawer>

    <UiDialog open={showForm} onClose={() => !createLoading && setShowForm(false)} title={bi('Add Player', 'إضافة لاعب')} description={bi('Creates a persistent record in the browser preview data provider.', 'ينشئ سجلًا مستمرًا في موفر بيانات المعاينة بالمتصفح.')}>
      <UosSteps steps={PLAYER_WIZARD_STEPS} current={wizardStep} />
      {wizardStep === 0 && <UosFormSection title={bi('Identity', 'الهوية')} icon={<UserRound size={17} />} description={bi('Player name in both languages and optional age.', 'اسم اللاعب باللغتين والعمر الاختياري.')}><UosTextField label={bi('Player name (English)', 'اسم اللاعب (إنجليزي)')} value={draftNameEn} onChange={e => setDraftNameEn(e.target.value)} required autoComplete="off" error={draftError} /><UosTextField label={bi('Player name (Arabic)', 'اسم اللاعب (عربي)')} value={draftNameAr} onChange={e => setDraftNameAr(e.target.value)} required autoComplete="off" /><UosTextField label={bi('Age', 'العمر')} value={draftAge} onChange={e => setDraftAge(e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" autoComplete="off" /></UosFormSection>}
      {wizardStep === 1 && <UosFormSection title={bi('Sport & Assignment', 'الرياضة والتكليف')} icon={<UserRound size={17} />} description={bi('Choose a sport, then optional group and program relationships.', 'اختر الرياضة ثم المجموعة والبرنامج اختياريًا.')}><UosSelectField label={bi('Sport', 'الرياضة')} value={draftSport} onChange={e => { setDraftSport(e.target.value); setDraftGroup(''); setDraftProgram(''); }} required placeholder={bi('Choose sport', 'اختر الرياضة')} options={sports.map(item => ({ value: item.id, label: item.name }))} error={draftError} /><UosSelectField label={bi('Training group', 'المجموعة التدريبية')} value={draftGroup} onChange={e => setDraftGroup(e.target.value)} placeholder={bi('No group', 'بدون مجموعة')} options={groups.filter(group => !draftSport || group.sportId === draftSport).map(group => ({ value: group.id, label: group.name }))} /><UosSelectField label={bi('Program', 'البرنامج')} value={draftProgram} onChange={e => setDraftProgram(e.target.value)} placeholder={bi('No program', 'بدون برنامج')} options={programs.filter(program => !draftSport || program.sportId === draftSport).map(program => ({ value: program.id, label: program.name }))} /></UosFormSection>}
      {wizardStep === 2 && <UosFormSection title={bi('Review', 'المراجعة')} icon={<CheckCircle2 size={17} />} description={bi('Confirm the gateway record before saving.', 'أكد سجل بوابة البيانات قبل الحفظ.')}><dl className="detail-list"><div><dt><BilingualText value={bi('Player', 'اللاعب')} /></dt><dd>{draftNameEn} | {draftNameAr}</dd></div><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd><BilingualText value={sports.find(item => item.id === draftSport)?.name ?? bi('Not selected', 'غير محدد')} /></dd></div><div><dt><BilingualText value={bi('Group', 'المجموعة')} /></dt><dd><BilingualText value={groups.find(item => item.id === draftGroup)?.name ?? bi('Not assigned', 'غير معين')} /></dd></div></dl></UosFormSection>}
      <div className="admin-form-actions"><BmButton variant="ghost" disabled={createLoading || wizardStep === 0} onClick={() => setWizardStep(step => Math.max(0, step - 1))}><BilingualText value={bi('Back', 'رجوع')} /></BmButton>{wizardStep < 2 ? <BmButton variant="primary" disabled={createLoading} onClick={() => validateStep() && setWizardStep(step => step + 1)}><BilingualText value={bi('Continue', 'متابعة')} /></BmButton> : <BmButton variant="primary" disabled={createLoading} onClick={() => void savePlayer()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Player', 'حفظ اللاعب')} /></BmButton>}</div>
    </UiDialog>
  </div>;
}
