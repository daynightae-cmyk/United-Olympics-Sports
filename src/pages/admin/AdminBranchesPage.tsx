import { ArrowRight, Building2, CheckCircle2, ChevronDown, ChevronUp, MapPin, Plus, Search, SlidersHorizontal, Trophy, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranches } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmBadge, BmButton, BmDataTable, BmEmptyState, BmErrorState, BmFilterBar, BmFilterSelect, BmLoadingTable, BmPageHeader, type BmColumn } from '../../components/benchmark/BenchmarkComponents';
import type { BranchViewModel } from '../../admin/data/viewModels';
import { demoCountries } from '../../data/demo/business';
import { demoSports } from '../../data/demo/sports';

export function AdminBranchesPage() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, loading, error } = useBranches({ page: 1, pageSize: 50 });

  const branches = useMemo(() => {
    const items = (data?.items ?? []).filter(branch =>
      (country === 'all' || branch.countryId === country) &&
      `${branch.name.en} ${branch.name.ar} ${branch.id}`.toLowerCase().includes(query.toLowerCase())
    );
    return [...items].sort((a, b) => {
      const av = String(a[sortBy as keyof BranchViewModel] ?? '');
      const bv = String(b[sortBy as keyof BranchViewModel] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [data, query, country, sortBy, sortDir]);

  const allSelected = branches.length > 0 && branches.every(b => selected.includes(b.id));
  const toggleAll = () => setSelected(allSelected ? [] : branches.map(b => b.id));
  const toggleRow = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const onSort = (key: string) => { if (sortBy === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortBy(key); setSortDir('asc'); } };
  const reset = () => { setQuery(''); setCountry('all'); setSelected([]); };

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
    {
      key: 'readiness', label: bi('Readiness', 'الجاهزية'), sortable: true,
      render: (b) => {
        const readiness = Math.round((b.sportCount / Math.max(demoSports.length, 1) * 30) + (b.programCount / 4 * 25) + (b.groupCount / 4 * 25) + (b.playerCount / 8 * 20));
        return (
          <div style={{ minWidth: '80px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bm-gold, #d8b35a)', marginBottom: '4px' }}>{readiness}%</div>
            <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${readiness}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #d4b23a, #f0c75e)' }} />
            </div>
          </div>
        );
      },
    },
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
      description={bi('A multi-country branch cockpit for sports, programs, rosters, coaches and readiness.', 'مركز فروع متعدد الدول للرياضات والبرامج والقوائم والمدربين والجاهزية.')}
      icon={<Building2 aria-hidden="true" />}
      actions={<BmButton variant="primary"><Plus aria-hidden="true" /><BilingualText value={bi('Add Branch', 'إضافة فرع')} /></BmButton>}
    />

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
  </div>;
}
