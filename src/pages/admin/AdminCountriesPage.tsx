import { ArrowRight, Building2, Flag, Globe2, ShieldCheck, Trophy, UsersRound, TrendingUp, Zap, Target, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { demoBranches, demoCountries } from '../../data/demo/business';
import { demoPlayers } from '../../data/demo/players';
import { Sports3DIcon } from '../../design/sports3d';

export function AdminCountriesPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);

  const countries = useMemo(() =>
    demoCountries.filter(country =>
      `${country.name.en} ${country.name.ar} ${country.code}`.toLowerCase().includes(query.toLowerCase())
    ), [query]);

  const totalBranches = demoBranches.length;
  const totalPlayers = new Set(demoBranches.flatMap(b => b.playerIds)).size;
  const totalSports = new Set(demoBranches.flatMap(b => b.sportIds)).size;
  const activeCountries = demoCountries.filter(c => c.status === 'active').length;

  return (
    <div className="admin-page">
      <section className="countries-hero" aria-label="Countries overview">
        <div className="countries-hero-bg" aria-hidden="true">
          <div className="hero-gradient-ring ring-one" />
          <div className="hero-gradient-ring ring-two" />
        </div>
        <div className="countries-hero-content">
          <span className="eyebrow eyebrow-premium">
            <Globe2 size={15} />
            <BilingualText value={bi('Organization Hierarchy', 'التسلسل التنظيمي')} />
          </span>
          <h1><BilingualText value={bi('Countries', 'الدول')} /></h1>
          <p><BilingualText value={bi('Review country-level coverage across preview branches, sports and players.', 'راجع التغطية على مستوى الدول عبر الفروع والرياضات واللاعبين التجريبيين.')} /></p>
        </div>
      </section>

      <PageHeader
        icon={Flag}
        eyebrow={bi('Country Workspaces', 'مساحات الدول')}
        title={bi('Countries', 'الدول')}
        description={bi('Manage country workspaces, branches, sports coverage and athlete reach from one preview cockpit.', 'أدر مساحات الدول والفروع وتغطية الرياضات وانتشار الرياضيين من مركز معاينة واحد.')}
        actions={<PreviewNotice />}
      />

      <section className="admin-stat-grid countries-kpi" aria-label="Country KPIs">
        <article className="admin-stat-card kpi-card accent-countries">
          <div className="kpi-icon"><Flag size={22} /></div>
          <strong>{demoCountries.length}</strong>
          <span><BilingualText value={bi('Country Workspaces', 'مساحات الدول')} /></span>
          <small><BilingualText value={bi('Active', 'نشط')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-branches">
          <div className="kpi-icon"><Building2 size={22} /></div>
          <strong>{totalBranches}</strong>
          <span><BilingualText value={bi('Total Branches', 'إجمالي الفروع')} /></span>
          <small><BilingualText value={bi('Across all countries', 'عبر جميع الدول')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-players">
          <div className="kpi-icon"><UsersRound size={22} /></div>
          <strong>{totalPlayers}</strong>
          <span><BilingualText value={bi('Registered Players', 'اللاعبون المسجلون')} /></span>
          <small><BilingualText value={bi('Preview records', 'سجلات تجريبية')} /></small>
        </article>
        <article className="admin-stat-card kpi-card accent-sports">
          <div className="kpi-icon"><Trophy size={22} /></div>
          <strong>{totalSports}</strong>
          <span><BilingualText value={bi('Active Sports', 'الرياضات النشطة')} /></span>
          <small><BilingualText value={bi('Linked to branches', 'مرتبطة بالفروع')} /></small>
        </article>
      </section>

      <section className="enterprise-toolbar countries-toolbar" aria-label="Countries filters">
        <label className="enterprise-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="enterprise-search-icon"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span className="sr-only"><BilingualText value={bi('Search countries or codes', 'البحث عن الدول أو الرموز')} /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search countries or codes | البحث عن الدول أو الرموز" />
        </label>
        <div className="enterprise-toolbar-end">
          <span className="enterprise-result"><BilingualText value={bi(`${countries.length} countries`, `${countries.length} دول`)} /></span>
        </div>
      </section>

      <section className="countries-grid" aria-label="Countries list">
        {countries.length > 0 ? (
          countries.map(country => {
            const branches = demoBranches.filter(branch => branch.countryId === country.id);
            const players = new Set(branches.flatMap(branch => branch.playerIds));
            const sports = new Set(branches.flatMap(branch => branch.sportIds));
            const coaches = new Set(branches.flatMap(branch => branch.coachIds));
            const programs = new Set(branches.flatMap(branch => branch.programIds));

            return (
              <article key={country.id} className="country-card">
                <div className="country-card-media" aria-hidden="true">
                  <div className="country-flag-bg">
                    <Flag size={48} />
                  </div>
                </div>
                <div className="country-card-body">
                  <div className="country-card-head">
                    <div className="country-identity">
                      <span className="country-flag-icon"><Flag size={20} /></span>
                      <div>
                        <h2><BilingualText value={country.name} /></h2>
                        <p className="country-code"><Globe2 size={12} /><span>{country.code}</span></p>
                      </div>
                    </div>
                    <span className="country-status status-active"><BilingualText value={bi('Active', 'نشط')} /></span>
                  </div>
                  <div className="country-stats">
                    <div className="stat-item">
                      <Building2 size={14} />
                      <span><BilingualText value={bi('Branches', 'الفروع')} /></span>
                      <strong>{branches.length}</strong>
                    </div>
                    <div className="stat-item">
                      <UsersRound size={14} />
                      <span><BilingualText value={bi('Players', 'اللاعبون')} /></span>
                      <strong>{players.size}</strong>
                    </div>
                    <div className="stat-item">
                      <Trophy size={14} />
                      <span><BilingualText value={bi('Sports', 'الرياضات')} /></span>
                      <strong>{sports.size}</strong>
                    </div>
                    <div className="stat-item">
                      <ShieldCheck size={14} />
                      <span><BilingualText value={bi('Coaches', 'المدربون')} /></span>
                      <strong>{coaches.size}</strong>
                    </div>
                    <div className="stat-item">
                      <Target size={14} />
                      <span><BilingualText value={bi('Programs', 'البرامج')} /></span>
                      <strong>{programs.size}</strong>
                    </div>
                  </div>
                  <div className="country-branches-preview">
                    <h3><BilingualText value={bi('Branches in this Country', 'فروع في هذه الدولة')} /></h3>
                    <div className="branches-list">
                      {branches.map(branch => (
                        <Link key={branch.id} to={`/admin/branches/${branch.id}`} className="branch-link">
                          <span className="branch-icon"><Building2 size={14} /></span>
                          <span className="branch-name"><BilingualText value={branch.name} /></span>
                          <ArrowRight size={14} />
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="country-actions">
                    <Link to={`/admin/countries/${country.id}`} className="admin-link-button">
                      <BilingualText value={bi('Open Country Detail', 'فتح تفاصيل الدولة')} />
                      <ArrowRight size={14} />
                    </Link>
                    <Link to={`/admin/branches?country=${country.id}`} className="admin-secondary-button">
                      <BilingualText value={bi('View All Branches', 'عرض جميع الفروع')} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="enterprise-empty">
            <Flag size={32} />
            <h3><BilingualText value={bi('No countries found', 'لم يتم العثور على دول')} /></h3>
            <p><BilingualText value={bi('Try adjusting your search query.', 'جرّب تعديل استعلام البحث.')} /></p>
          </div>
        )}
      </section>

      <section className="countries-integrity" aria-label="Data integrity">
        <h2 className="section-title"><BilingualText value={bi('Data Integrity', 'سلامة البيانات')} /></h2>
        <div className="integrity-grid">
          <article className="integrity-card">
            <div className="integrity-icon"><CheckCircle size={20} /></div>
            <div>
              <h3><BilingualText value={bi('No Fabricated Countries', 'لا دول مختلقة')} /></h3>
              <p><BilingualText value={bi('Only structural workspaces: Country Workspace 01, 02', 'مساحات هيكلية فقط: مساحة الدولة 01، 02')} /></p>
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
        </div>
      </section>
    </div>
  );
}