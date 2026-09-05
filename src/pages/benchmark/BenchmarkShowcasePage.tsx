import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  Flag,
  Inbox,
  LayoutDashboard,
  Mail,
  MapPin,
  Medal,
  Phone,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import {
  BmActionCard,
  BmActivityCard,
  BmBadge,
  BmButton,
  BmDataTable,
  BmDrawer,
  BmEmptyState,
  BmErrorState,
  BmFilterBar,
  BmFilterSelect,
  BmFormField,
  BmFormSection,
  BmFormSelect,
  BmIdentityCard,
  BmLoadingCards,
  BmLoadingState,
  BmLoginCard,
  BmMembershipCard,
  BmMetricCard,
  BmModal,
  BmPageHeader,
  BmScheduleCard,
  BmSectionLabel,
  type BmColumn,
} from '../../components/benchmark/BenchmarkComponents';
import { demoPlayers } from '../../data/demo/players';
import { demoSports } from '../../data/demo/sports';
import { demoBranches } from '../../data/demo/business';
import { demoCountries } from '../../data/demo/business';
import { getSport } from '../../data/demo/selectors';

type DemoRow = {
  id: string;
  name: string;
  nameAr: string;
  sport: string;
  branch: string;
  age: number;
  attendance: number;
  performance: number;
  status: 'active' | 'inactive';
};

export function BenchmarkShowcasePage() {
  const benchmarkPlayer = demoPlayers.find((player) => Boolean(player));
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const demoRows: DemoRow[] = demoPlayers.slice(0, 12).map((p) => ({
    id: p.id,
    name: p.nameEn,
    nameAr: p.nameAr,
    sport: p.sportId,
    branch: demoBranches.find((b) => b.playerIds.includes(p.id))?.name.en ?? '—',
    age: p.age ?? 0,
    attendance: p.attendanceSummary ? Math.round((p.attendanceSummary.attended / Math.max(p.attendanceSummary.scheduled, 1)) * 100) : 0,
    performance: p.performanceHistory.length > 0 ? Math.round(p.performanceHistory.reduce((s, r) => s + r.value, 0) / p.performanceHistory.length) : 0,
    status: typeof p.status === 'object' && p.status.en.toLowerCase() === 'inactive' ? 'inactive' : 'active',
  }));

  const filtered = demoRows.filter((r) => {
    const hay = `${r.name} ${r.nameAr} ${r.id}`.toLowerCase();
    return hay.includes(search.toLowerCase()) && (sportFilter === 'all' || r.sport === sportFilter) && (statusFilter === 'all' || r.status === statusFilter);
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = String(a[sortBy as keyof DemoRow]);
    const bv = String(b[sortBy as keyof DemoRow]);
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((r) => r.id));
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.includes(r.id));

  const onSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const columns: BmColumn<DemoRow>[] = [
    {
      key: 'name',
      label: bi('Player', 'اللاعب'),
      sortable: true,
      render: (r) => (
        <div className="bm-cell-entity">
          <span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span>
          <span>
            <strong>{r.name}</strong>
            <small>{r.id}</small>
          </span>
        </div>
      ),
      mobileRender: (r) => (
        <div className="bm-mobile-card-head">
          <span className="bm-cell-avatar"><UserRound aria-hidden="true" /></span>
          <div className="bm-mobile-card-title">
            <strong>{r.name}</strong>
            <small>{r.id}</small>
          </div>
        </div>
      ),
    },
    { key: 'sport', label: bi('Sport', 'الرياضة'), sortable: true, render: (r) => <BilingualText value={getSport(r.sport)?.name ?? bi(r.sport, r.sport)} /> },
    { key: 'branch', label: bi('Branch', 'الفرع'), sortable: true, render: (r) => r.branch },
    { key: 'age', label: bi('Age', 'العمر'), sortable: true, render: (r) => r.age },
    { key: 'attendance', label: bi('Attendance', 'الحضور'), sortable: true, render: (r) => <span className="bm-cell-strong">{r.attendance}%</span> },
    { key: 'performance', label: bi('Performance', 'الأداء'), sortable: true, render: (r) => <span className="bm-cell-strong">{r.performance}/100</span> },
    {
      key: 'status',
      label: bi('Status', 'الحالة'),
      sortable: true,
      render: (r) => <BmBadge tone={r.status === 'active' ? 'success' : 'neutral'} label={r.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} icon={r.status === 'active' ? <CheckCircle2 aria-hidden="true" /> : undefined} />,
    },
    {
      key: 'actions',
      label: bi('Actions', 'الإجراءات'),
      render: (r) => (
        <Link to={`/admin/players/${r.id}`} className="bm-btn bm-btn-icon" aria-label="View player">
          <ArrowRight aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="bm-shell">
      <div className="bm-container">
        <BmPageHeader
          eyebrow={bi('Visual Component Benchmark', 'معيار المكونات البصرية')}
          title={bi('Premium UI System', 'نظام واجهة متميز')}
          description={bi('A complete visual component library for United Olympics Sports — cards, tables, forms, filters, buttons, modals, drawers, and system states. Built for comparison evaluation.', 'مكتبة مكونات بصرية كاملة ليونايتد أوليمبيكس سبورت — البطاقات والجداول والنماذج والفلاتر والأزرار والنوافذ واللوحات وحالات النظام. مصممة لتقييم المقارنة.')}
          actions={
            <div className="bm-btn-group">
              <BmButton variant="primary" onClick={() => setModalOpen(true)}>
                <Bell aria-hidden="true" />
                <BilingualText value={bi('Open Modal', 'فتح النافذة')} />
              </BmButton>
              <BmButton variant="secondary" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal aria-hidden="true" />
                <BilingualText value={bi('Open Drawer', 'فتح اللوحة')} />
              </BmButton>
            </div>
          }
        />

        {/* A — Card Family */}
        <BmSectionLabel num="A" icon={<LayoutDashboard aria-hidden="true" />} title={bi('Card Family', 'عائلة البطاقات')} />
        <div className="bm-grid bm-grid-4" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Total Players', 'إجمالي اللاعبين')} value={demoPlayers.length} detail={bi('Active roster', 'القائمة النشطة')} trend="+12%" trendDirection="up" />
          <BmMetricCard icon={<Trophy aria-hidden="true" />} label={bi('Sports', 'الرياضات')} value={demoSports.length} detail={bi('All active', 'كلها نشطة')} tier="featured" />
          <BmMetricCard icon={<CalendarClock aria-hidden="true" />} label={bi('Sessions', 'الحصص')} value={8} detail={bi('This week', 'هذا الأسبوع')} trend="-3%" trendDirection="down" />
          <BmMetricCard icon={<CreditCard aria-hidden="true" />} label={bi('Revenue', 'الإيراد')} value="42K" detail={bi('AED collected', 'درهم محصل')} trend="+8%" trendDirection="up" tier="featured" />
        </div>

        <div className="bm-grid bm-grid-3" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmActionCard icon={<MapPin aria-hidden="true" />} title={bi('Branches', 'الفروع')} description={bi('Manage all branch locations and their sport programs.', 'إدارة جميع مواقع الفروع وبرامجها الرياضية.')} to="/admin/branches" />
          <BmActionCard icon={<UserRound aria-hidden="true" />} title={bi('Players', 'اللاعبون')} description={bi('View and manage the complete player roster.', 'عرض وإدارة القائمة الكاملة للاعبين.')} to="/admin/players" />
          <BmActionCard icon={<Medal aria-hidden="true" />} title={bi('Groups', 'المجموعات')} description={bi('Organize training groups and team assignments.', 'تنظيم مجموعات التدريب وتعيينات الفرق.')} to="/admin/groups" />
        </div>

        <div className="bm-grid bm-grid-2" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmIdentityCard
            avatar={<UserRound aria-hidden="true" />}
            name={benchmarkPlayer ? { en: benchmarkPlayer.nameEn, ar: benchmarkPlayer.nameAr } : bi('Preview Player', 'لاعب تجريبي')}
            id={benchmarkPlayer?.id ?? 'preview-player'}
            fields={[
              { label: bi('Sport', 'الرياضة'), value: <BilingualText value={benchmarkPlayer ? (getSport(benchmarkPlayer.sportId)?.name ?? bi('—', '—')) : bi('—', '—')} /> },
              { label: bi('Age', 'العمر'), value: benchmarkPlayer?.age ?? '—' },
              { label: bi('Level', 'المستوى'), value: <BilingualText value={benchmarkPlayer?.level ?? bi('—', '—')} /> },
              { label: bi('Status', 'الحالة'), value: <BmBadge tone="success" label={bi('Active', 'نشط')} /> },
            ]}
          />
          <BmMembershipCard
            plan={bi('Premium Plan', 'الخطة المميزة')}
            price="350"
            period={bi('AED / month', 'درهم / شهر')}
            features={[
              bi('Unlimited training sessions', 'جلسات تدريب غير محدودة'),
              bi('Performance tracking', 'تتبع الأداء'),
              bi('Priority tournament entry', 'أولوية الدخول للبطولات'),
              bi('Personalized coach feedback', 'تغذية راجعة شخصية من المدرب'),
            ]}
          />
        </div>

        <div className="bm-grid bm-grid-2" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmScheduleCard time="16:00 — 17:30" title={bi('Football Training · U12', 'تدريب كرة القدم · تحت 12')} meta={[bi('Branch: Dubai', 'الفرع: دبي'), bi('Coach: Ahmed', 'المدرب: أحمد')]} accentColor="#8eb34e" />
          <BmActivityCard icon={<Award aria-hidden="true" />} title={bi('New achievement unlocked', 'إنجاز جديد')} subtitle={bi('Player performance milestone reached', 'تم الوصول لمعلم أداء اللاعب')} time={bi('2h ago', 'منذ ساعتين')} />
        </div>

        {/* B — Table System */}
        <BmSectionLabel num="B" icon={<BarChart3 aria-hidden="true" />} title={bi('Enterprise Table', 'جدول المؤسسة')} />
        <BmFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={bi('Search players or IDs', 'البحث عن اللاعبين أو المعرفات')}
          filters={
            <>
              <BmFilterSelect
                label={bi('Sport', 'الرياضة')}
                value={sportFilter}
                onChange={setSportFilter}
                options={[{ value: 'all', label: bi('All', 'الكل') }, ...demoSports.map((s) => ({ value: s.id, label: s.name }))]}
              />
              <BmFilterSelect
                label={bi('Status', 'الحالة')}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: bi('All', 'الكل') },
                  { value: 'active', label: bi('Active', 'نشط') },
                  { value: 'inactive', label: bi('Inactive', 'غير نشط') },
                ]}
              />
            </>
          }
          onMobileOpen={() => setDrawerOpen(true)}
        />
        <div style={{ marginTop: '16px', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmDataTable<DemoRow>
            columns={columns}
            rows={sorted}
            selectable
            selectedIds={selected}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={onSort}
            page={page}
            pageSize={8}
            total={sorted.length}
            onPageChange={setPage}
            bulkActions={
              <>
                <BmButton variant="tertiary" onClick={() => setSelected([])}>
                  <CheckCircle2 aria-hidden="true" />
                  <BilingualText value={bi('Mark reviewed', 'تحديد كمراجع')} />
                </BmButton>
                <BmButton variant="ghost" onClick={() => setSelected([])}>
                  <BilingualText value={bi('Clear', 'مسح')} />
                </BmButton>
              </>
            }
            emptyState={
              <BmEmptyState
                icon={<Inbox aria-hidden="true" />}
                title={bi('No players match these filters', 'لا يوجد لاعبون يطابقون هذه الفلاتر')}
                description={bi('Try adjusting your search or clearing filters.', 'حاول تعديل البحث أو مسح الفلاتر.')}
                action={<BmButton variant="tertiary" onClick={() => { setSearch(''); setSportFilter('all'); setStatusFilter('all'); }}><SlidersHorizontal aria-hidden="true" /><BilingualText value={bi('Reset filters', 'إعادة ضبط')} /></BmButton>}
              />
            }
          />
        </div>

        {/* E — Form System */}
        <BmSectionLabel num="E" icon={<Settings aria-hidden="true" />} title={bi('Form System', 'نظام النماذج')} />
        <div className="bm-grid bm-grid-2" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmFormSection icon={<User aria-hidden="true" />} title={bi('Identity | الهوية', 'Identity | الهوية')} description={bi('Personal information', 'المعلومات الشخصية')} cols={2}>
            <BmFormField label={bi('First name', 'الاسم الأول')} icon={<User aria-hidden="true" />} placeholder="Ahmed" required helper={bi('As shown on ID', 'كما هو في الهوية')} />
            <BmFormField label={bi('Last name', 'اسم العائلة')} placeholder="Al Mansoori" required />
            <BmFormField label={bi('Date of birth', 'تاريخ الميلاد')} type="date" icon={<CalendarClock aria-hidden="true" />} />
            <BmFormSelect
              label={bi('Sport', 'الرياضة')}
              icon={<Trophy aria-hidden="true" />}
              required
              options={demoSports.map((s) => ({ value: s.id, label: s.name }))}
            />
          </BmFormSection>
          <BmFormSection icon={<Phone aria-hidden="true" />} title={bi('Contact | التواصل', 'Contact | التواصل')} description={bi('Reachable information', 'معلومات التواصل')} cols={2}>
            <BmFormField label={bi('Phone', 'الهاتف')} icon={<Phone aria-hidden="true" />} placeholder="+971 50 123 4567" helper={bi('Include country code', 'أضف رمز الدولة')} />
            <BmFormField label={bi('Email', 'البريد الإلكتروني')} icon={<Mail aria-hidden="true" />} type="email" placeholder="parent@example.com" success={bi('Verified', 'موثق')} />
            <BmFormField label={bi('Address', 'العنوان')} icon={<MapPin aria-hidden="true" />} placeholder="Street, City" error={bi('Required field', 'حقل مطلوب')} />
            <BmFormSelect
              label={bi('Preferred language', 'اللغة المفضلة')}
              options={[
                { value: 'en', label: bi('English', 'الإنجليزية') },
                { value: 'ar', label: bi('Arabic', 'العربية') },
              ]}
            />
          </BmFormSection>
        </div>

        {/* G — Button Family */}
        <BmSectionLabel num="G" icon={<Plus aria-hidden="true" />} title={bi('Button Family', 'عائلة الأزرار')} />
        <div className="bm-card" style={{ padding: '24px', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <div className="bm-btn-group" style={{ marginBottom: '16px' }}>
            <BmButton variant="primary"><Plus aria-hidden="true" /><BilingualText value={bi('Primary', 'أساسي')} /></BmButton>
            <BmButton variant="secondary"><BilingualText value={bi('Secondary', 'ثانوي')} /></BmButton>
            <BmButton variant="tertiary"><BilingualText value={bi('Tertiary', 'ثالث')} /></BmButton>
            <BmButton variant="ghost"><BilingualText value={bi('Ghost', 'شفاف')} /></BmButton>
            <BmButton variant="danger"><Trash2 aria-hidden="true" /><BilingualText value={bi('Danger', 'خطر')} /></BmButton>
            <BmButton variant="icon" aria-label="Settings"><Settings aria-hidden="true" /></BmButton>
          </div>
          <div className="bm-btn-group">
            <BmButton variant="primary" loading><BilingualText value={bi('Loading', 'جارٍ')} /></BmButton>
            <BmButton variant="primary" disabled><BilingualText value={bi('Disabled', 'معطل')} /></BmButton>
            <BmButton variant="secondary" loading><BilingualText value={bi('Loading', 'جارٍ')} /></BmButton>
            <BmButton variant="secondary" disabled><BilingualText value={bi('Disabled', 'معطل')} /></BmButton>
          </div>
        </div>

        {/* L — Status Badges */}
        <BmSectionLabel num="L" icon={<CheckCircle2 aria-hidden="true" />} title={bi('Status Badges', 'شارات الحالة')} />
        <div className="bm-card" style={{ padding: '24px', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <div className="bm-btn-group">
            <BmBadge tone="success" label={bi('Active', 'نشط')} icon={<CheckCircle2 aria-hidden="true" />} />
            <BmBadge tone="warning" label={bi('Pending', 'قيد الانتظار')} icon={<AlertTriangle aria-hidden="true" />} />
            <BmBadge tone="danger" label={bi('Failed', 'فشل')} icon={<AlertTriangle aria-hidden="true" />} />
            <BmBadge tone="info" label={bi('Scheduled', 'مجدول')} icon={<Bell aria-hidden="true" />} />
            <BmBadge tone="neutral" label={bi('Inactive', 'غير نشط')} />
          </div>
        </div>

        {/* J — Empty / Loading / Error */}
        <BmSectionLabel num="J" icon={<Inbox aria-hidden="true" />} title={bi('System States', 'حالات النظام')} />
        <div className="bm-grid bm-grid-3" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmEmptyState icon={<Inbox aria-hidden="true" />} title={bi('No records yet', 'لا توجد سجلات بعد')} description={bi('Records will appear here when data is available.', 'ستظهر السجلات هنا عند توفر البيانات.')} />
          <BmErrorState />
          <div className="bm-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 16px' }}><BilingualText value={bi('Loading Skeleton', 'هيكل التحميل')} /></h3>
            <BmLoadingState lines={4} />
          </div>
        </div>
        <div style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 16px' }}><BilingualText value={bi('Loading Cards', 'بطاقات التحميل')} /></h3>
          <BmLoadingCards count={3} />
        </div>

        {/* H — Login Visual */}
        <BmSectionLabel num="H" icon={<User aria-hidden="true" />} title={bi('Login Visual', 'تصميم تسجيل الدخول')} />
        <div style={{ marginBottom: 'clamp(28px, 4vw, 44px)', borderRadius: 'var(--bm-radius-xl)', overflow: 'hidden' }}>
          <BmLoginCard
            footer={
              <span>
                <BilingualText value={bi('Need help? ', 'تحتاج مساعدة؟ ')} />
                <a href="#"><BilingualText value={bi('Contact support', 'تواصل مع الدعم')} /></a>
              </span>
            }
          >
            <div className="bm-login-fields">
              <BmFormField label={bi('Email or phone', 'البريد أو الهاتف')} icon={<Mail aria-hidden="true" />} placeholder="player@example.com" required />
              <BmFormField label={bi('Password', 'كلمة المرور')} icon={<Settings aria-hidden="true" />} type="password" placeholder="••••••••" required />
            </div>
            <div className="bm-login-actions">
              <BmButton variant="primary" style={{ width: '100%' }}>
                <BilingualText value={bi('Sign in', 'تسجيل الدخول')} />
              </BmButton>
            </div>
            <div className="bm-login-divider">
              <BilingualText value={bi('or', 'أو')} />
            </div>
            <BmButton variant="secondary" style={{ width: '100%' }}>
              <Phone aria-hidden="true" />
              <BilingualText value={bi('Sign in with phone', 'تسجيل بالهاتف')} />
            </BmButton>
          </BmLoginCard>
        </div>

        {/* K — Real Surfaces */}
        <BmSectionLabel num="K" icon={<Flag aria-hidden="true" />} title={bi('Representative Surfaces', 'الأسطح التمثيلية')} />
        <div className="bm-grid bm-grid-3" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <BmActionCard icon={<LayoutDashboard aria-hidden="true" />} title={bi('Admin Dashboard', 'لوحة الإدارة')} description={bi('Executive command center with KPIs and scope controls.', 'مركز قيادة تنفيذي مع مؤشرات وعناصر تحكم.')} to="/admin" />
          <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Admin Players', 'لاعبو الإدارة')} description={bi('High-density roster table with filters and bulk actions.', 'جدول قائمة عالي الكثافة مع فلاتر وإجراءات جماعية.')} to="/admin/players" />
          <BmActionCard icon={<MapPin aria-hidden="true" />} title={bi('Admin Branches', 'فروع الإدارة')} description={bi('Branch directory with readiness scores and links.', 'دليل الفروع مع درجات الجاهزية والروابط.')} to="/admin/branches" />
          <BmActionCard icon={<UserRound aria-hidden="true" />} title={bi('Player Home', 'الصفحة الرئيسية للاعب')} description={bi('Athlete portal overview with metrics and schedule.', 'نظرة عامة على بوابة اللاعب مع المؤشرات والجدول.')} to="/player" />
          <BmActionCard icon={<User aria-hidden="true" />} title={bi('Parent Home', 'الصفحة الرئيسية لولي الأمر')} description={bi('Parent portal with child overview and payments.', 'بوابة ولي الأمر مع نظرة عامة على الطفل والمدفوعات.')} to="/parent" />
          <BmActionCard icon={<Medal aria-hidden="true" />} title={bi('Coach Home', 'الصفحة الرئيسية للمدرب')} description={bi('Coach workspace with groups and sessions.', 'مساحة عمل المدرب مع المجموعات والحصص.')} to="/coach" />
        </div>
      </div>

      {/* I — Modal + Drawer */}
      <BmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={bi('Confirm action', 'تأكيد الإجراء')}
        description={bi('This will apply the selected changes to all marked records.', 'سيؤدي هذا إلى تطبيق التغييرات المحددة على جميع السجلات المحددة.')}
        footer={
          <>
            <BmButton variant="ghost" onClick={() => setModalOpen(false)}><BilingualText value={bi('Cancel', 'إلغاء')} /></BmButton>
            <BmButton variant="primary" onClick={() => setModalOpen(false)}><CheckCircle2 aria-hidden="true" /><BilingualText value={bi('Confirm', 'تأكيد')} /></BmButton>
          </>
        }
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--uos-text-secondary, #d4d0ca)' }}>
          <BilingualText value={bi('You are about to update 3 player records. This action cannot be undone in the preview environment.', 'أنت على وشك تحديث 3 سجلات لاعبين. لا يمكن التراجع عن هذا الإجراء في بيئة المعاينة.')} />
        </p>
      </BmModal>

      <BmDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={bi('Filters', 'الفلاتر')}
        description={bi('Refine the visible records', 'تحسين السجلات المرئية')}
        footer={
          <>
            <BmButton variant="ghost" onClick={() => { setSportFilter('all'); setStatusFilter('all'); setSearch(''); }}><BilingualText value={bi('Reset', 'إعادة ضبط')} /></BmButton>
            <BmButton variant="primary" onClick={() => setDrawerOpen(false)}><BilingualText value={bi('Apply', 'تطبيق')} /></BmButton>
          </>
        }
      >
        <div className="bm-stack">
          <BmFormField label={bi('Search', 'بحث')} icon={<Search aria-hidden="true" />} value={search} onChange={setSearch} placeholder="Search players" />
          <BmFormSelect
            label={bi('Sport', 'الرياضة')}
            icon={<Trophy aria-hidden="true" />}
            value={sportFilter}
            onChange={setSportFilter}
            options={[{ value: 'all', label: bi('All', 'الكل') }, ...demoSports.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <BmFormSelect
            label={bi('Status', 'الحالة')}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: bi('All', 'الكل') },
              { value: 'active', label: bi('Active', 'نشط') },
              { value: 'inactive', label: bi('Inactive', 'غير نشط') },
            ]}
          />
        </div>
      </BmDrawer>
    </div>
  );
}
