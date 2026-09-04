import { ArrowRight, CheckCircle2, Filter, Plus, Search, SlidersHorizontal, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmBadge, BmButton, BmDataTable, BmEmptyState, BmErrorState, BmFilterBar, BmFilterSelect, BmLoadingTable, BmModal, BmFormField, BmFormSelect, BmFormSection, BmPageHeader, type BmColumn } from '../../components/benchmark/BenchmarkComponents';
import type { PlayerViewModel } from '../../admin/data/viewModels';
import { demoSports } from '../../data/demo/sports';
import { getGroup, getSport } from '../../data/demo/selectors';
import { User } from 'lucide-react';

export function AdminPlayersPage() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState(false);
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
      actions={<BmButton variant="primary" onClick={() => setShowForm(true)}><Plus aria-hidden="true" /><BilingualText value={bi('Add Player', 'إضافة لاعب')} /></BmButton>}
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

    <BmModal
      open={showForm}
      onClose={() => setShowForm(false)}
      title={bi('Add Player Preview', 'معاينة إضافة لاعب')}
      description={bi('This local form demonstrates the future intake flow without claiming persistence.', 'يوضح هذا النموذج المحلي مسار الإدخال المستقبلي دون ادعاء الحفظ الدائم.')}
      footer={
        <>
          <BmButton variant="ghost" onClick={() => setShowForm(false)}><BilingualText value={bi('Cancel', 'إلغاء')} /></BmButton>
          <BmButton variant="primary" onClick={() => { setShowForm(false); setNotice(true); }}><BilingualText value={bi('Prepare Preview', 'تجهيز المعاينة')} /></BmButton>
        </>
      }
    >
      <BmFormSection icon={<User aria-hidden="true" />} title={bi('Identity | الهوية', 'Identity | الهوية')} cols={2}>
        <BmFormField label={bi('Player name (English)', 'اسم اللاعب (إنجليزي)')} icon={<User aria-hidden="true" />} placeholder="Player name" required helper={bi('As shown on ID', 'كما هو في الهوية')} />
        <BmFormField label={bi('Player name (Arabic)', 'اسم اللاعب (عربي)')} placeholder="اسم اللاعب" required />
        <BmFormSelect label={bi('Sport', 'الرياضة')} icon={<UserRound aria-hidden="true" />} required options={demoSports.map(s => ({ value: s.id, label: s.name }))} />
        <BmFormField label={bi('Age', 'العمر')} type="number" placeholder="10" />
      </BmFormSection>
    </BmModal>
  </div>;
}
