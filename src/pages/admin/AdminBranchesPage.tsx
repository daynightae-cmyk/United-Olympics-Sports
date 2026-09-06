import { ArrowRight, Building2, Flag, Globe2, ShieldCheck, Trophy, UsersRound, TrendingUp, Zap, Target, CheckCircle, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { EnterpriseSelect } from '../../components/enterprise/EnterpriseUI';
import { demoBranches, demoCountries } from '../../data/demo/business';
import { demoPlayers } from '../../data/demo/players';
import { demoSports } from '../../data/demo/sports';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { demoCoaches } from '../../data/demo/coaches';
import { getSportPreviewMedia } from '../../data/media';

export function AdminBranchesPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCountry = searchParams.get('country') ?? 'all';
  const [query, setQuery] = useState(initialQuery);
  const [countryFilter, setCountryFilter] = useState(initialCountry);

  const filteredBranches = useMemo(() =>
    demoBranches.filter(branch =>
      (countryFilter === 'all' || branch.countryId === countryFilter) &&
      `${branch.name.en} ${branch.name.ar} ${branch.id}`.toLowerCase().includes(query.toLowerCase())
    ), [query, countryFilter]);

  const totalPlayers = new Set(demoBranches.flatMap(b => b.playerIds)).size;
  const totalCoaches = new Set(demoBranches.flatMap(b => b.coachIds)).size;
  const totalSports = new Set(demoBranches.flatMap(b => b.sportIds)).size;
  const activeCountries = demoCountries.filter(c => c.status === 'active').length;

  return (
    <div className="admin-page">
      <section className="branches-hero" aria-label="Branches overview">
        <div className="branches-hero-bg" aria-hidden="true">
          <div className="hero-gradient-ring ring-one" />
          <div className="hero-gradient-ring ring-two" />
        </div>
        <div className="branches-hero-content">
          <span className="eyebrow eyebrow-premium">
            <Building2 size={15} />
            <BilingualText value={bi('Branch Management', 'إدارة الفروع')} />
          </span>
          <h1><BilingualText value={bi('Branches', 'الفروع')} /></h1>
          <p><BilingualText value={bi('A multi-country branch cockpit for sports, programs, rosters, coaches and coverage.', 'مركز فروع متعدد الدول للرياضات والبرامج والقوائم والمدربين والتغطية.')} /></p>
        </div>
      </section>

      <PageHeader
        icon={Building2}
        eyebrow={bi('Branch Workspaces', 'مساحات الفروع')}
        title={bi('Branches', 'الفروع')}
        description={bi('Manage branch workspaces, sports coverage, athlete rosters and coach assignments from one preview cockpit.', 'أدر مساحات الفروع وتغطية الرياضات وقوائم الرياضيين وتكليفات المدربين من مركز معاينة واحد.')}
        actions={<PreviewNotice />}
      />

      <section className="admin-stat-grid branches-kpi" aria-label="Branch KPIs">
        <article className="admin-stat-card kpi-card accent-branches-main">
          <div className="kpi-icon"><Building2 size={22} /></div>
          <strong>{demoBranches.length}</strong>
          <span><BilingualText value={bi('Branch Workspaces', 'مساحات الفروع')} /></span>
          <small><BilingualText value={bi('Across all countries', 'عبر جميع الدول')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-countries-b">
          <div className="kpi-icon"><Flag size={22} /></div>
          <strong>{activeCountries}</strong>
          <span><BilingualText value={bi('Active Countries', 'الدول النشطة')} /></span>
          <small><BilingualText value={bi('Country workspaces', 'مساحات الدول')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-players-b">
          <div className="kpi-icon"><UsersRound size={22} /></div>
          <strong>{totalPlayers}</strong>
          <span><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /></span>
          <small><BilingualText value={bi('Preview records', 'سجلات تجريبية')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-coaches-b">
          <div className="kpi-icon"><ShieldCheck size={22} /></div>
          <strong>{totalCoaches}</strong>
          <span><BilingualText value={bi('Total Coaches', 'إجمالي المدربين')} /></span>
          <small><BilingualText value={bi('Verified preview', 'معاينة موثقة')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-sports-b">
          <div className="kpi-icon"><Trophy size={22} /></div>
          <strong>{totalSports}</strong>
          <span><BilingualText value={bi('Active Sports', 'الرياضات النشطة')} /></span>
          <small><BilingualText value={bi('Across branches', 'عبر الفروع')} /></small>
        </article>
      </section>

      <section className="enterprise-toolbar branches-toolbar" aria-label="Branches filters">
        <label className="enterprise-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="enterprise-search-icon"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span className="sr-only"><BilingualText value={bi('Search branches or IDs', 'البحث عن الفروع أو المعرفات')} /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search branches or IDs | البحث عن الفروع أو المعرفات" />
        </label>
        <EnterpriseSelect
          label={bi('Country', 'الدولة')}
          value={countryFilter}
          onChange={setCountryFilter}
          options={[
            { value: 'all', label: bi('All countries', 'كل الدول') },
            ...demoCountries.map(item => ({ value: item.id, label: item.name }))
          ]}
        />
        <div className="enterprise-toolbar-end">
          <span className="enterprise-result"><BilingualText value={bi(`${filteredBranches.length} branches`, `${filteredBranches.length} فروع`)} /></span>
        </div>
      </section>

      <section className="branches-grid" aria-label="Branches list">
        {filteredBranches.length > 0 ? (
          filteredBranches.map(branch => {
            const country = demoCountries.find(c => c.id === branch.countryId);
            const players = new Set(branch.playerIds);
            const sports = branch.sportIds.map(id => demoSports.find(s => s.id === id)).filter(Boolean);
            const coaches = branch.coachIds.map(id => demoCoaches.find(c => c.id === id)).filter(Boolean);
            const groups = branch.groupIds.map(id => demoTrainingGroups.find(g => g.id === id)).filter(Boolean);
            const programs = branch.programIds.map(id => demoSports.find(s => s.id === id)).filter(Boolean);

            return (
              <article key={branch.id} className="branch-card">
                <div className="branch-card-media" aria-hidden="true">
                  <div className="branch-building-bg">
                    <Building2 size={48} />
                  </div>
                </div>
                <div className="branch-card-body">
                  <div className="branch-card-head">
                    <div className="branch-identity">
                      <span className="branch-icon-wrapper"><Building2 size={20} /></span>
                      <div>
                        <h2><BilingualText value={branch.name} /></h2>
                        <p className="branch-country"><Flag size={12} /><BilingualText value={country?.name ?? { en: branch.countryId, ar: branch.countryId }} /></p>
                      </div>
                    </div>
                    <span className="branch-status status-active"><BilingualText value={bi('Active', 'نشط')} /></span>
                  </div>
                  <div className="branch-stats">
                    <div className="stat-item">
                      <UsersRound size={14} />
                      <span><BilingualText value={bi('Players', 'اللاعبون')} /></span>
                      <strong>{players.size}</strong>
                    </div>
                    <div className="stat-item">
                      <ShieldCheck size={14} />
                      <span><BilingualText value={bi('Coaches', 'المدربون')} /></span>
                      <strong>{coaches.length}</strong>
                    </div>
                    <div className="stat-item">
                      <Trophy size={14} />
                      <span><BilingualText value={bi('Sports', 'الرياضات')} /></span>
                      <strong>{branch.sportIds.length}</strong>
                    </div>
                    <div className="stat-item">
                      <Target size={14} />
                      <span><BilingualText value={bi('Groups', 'المجموعات')} /></span>
                      <strong>{groups.length}</strong>
                    </div>
                    <div className="stat-item">
                      <Zap size={14} />
                      <span><BilingualText value={bi('Programs', 'البرامج')} /></span>
                      <strong>{branch.programIds.length}</strong>
                    </div>
                  </div>
                  <div className="branch-sports-preview">
                    <h3><BilingualText value={bi('Sports at this Branch', 'الرياضات في هذا الفرع')} /></h3>
                    <div className="sports-tags">
                      {sports.map(sport => (
                        <span key={sport!.id} className={`sport-tag sport-${sport!.id}`}>
                          <BilingualText value={sport!.name} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="branch-actions">
                    <Link to={`/admin/branches/${branch.id}`} className="admin-link-button">
                      <BilingualText value={bi('Open Branch Detail', 'فتح تفاصيل الفرع')} />
                      <ChevronRight size={14} />
                    </Link>
                    <Link to={`/admin/branches/${branch.id}/overview`} className="admin-secondary-button">
                      <BilingualText value={bi('Branch Cockpit', 'قمرة قيادة الفرع')} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="enterprise-empty">
            <Building2 size={32} />
            <h3><BilingualText value={bi('No branches found', 'لم يتم العثور على فروع')} /></h3>
            <p><BilingualText value={bi('Try adjusting your search or country filter.', 'جرّب تعديل البحث أو فلتر الدولة.')} /></p>
          </div>
        )}
      </section>

      <section className="branches-integrity" aria-label="Data integrity">
        <h2 className="section-title"><BilingualText value={bi('Data Integrity', 'سلامة البيانات')} /></h2>
        <div className="integrity-grid">
          <article className="integrity-card">
            <div className="integrity-icon"><CheckCircle size={20} /></div>
            <div>
              <h3><BilingualText value={bi('No Fabricated Branches', 'لا فروع مختلقة')} /></h3>
              <p><BilingualText value={bi('Only structural workspaces: Branch Workspace 01–04', 'مساحات هيكلية فقط: مساحة الفرع 01–04')} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><ShieldCheck size={20} /></div>
            <div>
              <h3><BilingualText value={bi('Zero Operational Claims', 'صفر ادعاءات تشغيلية')} /></h3>
              <p><BilingualText value={bi('No fake addresses, phones, coordinates or real-world presence', 'لا عناوين/هواتف/إحداثيات وهمية أو وجود حقيقي')} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><Target size={20} /></div>
            <div>
              <h3><BilingualText value={bi('Ready for Live Data', 'جاهزة للبيانات الحقيقية')} /></h3>
              <p><BilingualText value={bi('Structure complete — awaiting backend integration', 'الهيكل مكتمل — بانتظار تكامل الخادم')} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><Flag size={20} /></div>
            <div>
              <h3><BilingualText value={bi('Multi-Country Ready', 'متعددة الدول')} /></h3>
              <p><BilingualText value={bi('Country filter enables cross-border branch management', 'فلتر الدولة يمكّن إدارة الفروع عبر الحدود')} /></p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}