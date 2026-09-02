import { ArrowRight, Building2, Flag, Globe, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getCountry } from '../../data/demo/selectors';
import { getCountryBranches } from '../../data/demo/selectors';
import { useState } from 'react';
import { demoPlayers } from '../../data/demo/players';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'branches', label: bi('Branches', 'الفروع') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
];

export function AdminCountryDetailPage() {
  const { countryId } = useParams();
  const country = getCountry(countryId);
  const [active, setActive] = useState('overview');

  if (!country) return <FuturePanel
    title={bi('Country not found', 'الدولة غير موجودة')}
    description={bi('Choose a valid country from the Countries directory.', 'اختر دولة صالحة من دليل الدول.')}
  />;

  const branches = getCountryBranches(country.id);
  const allPlayerIds = branches.flatMap(b => b.playerIds);
  const branchPlayers = demoPlayers.filter(p => allPlayerIds.includes(p.id));

  return <div className="admin-page">
    <PageHeader
      icon={Flag}
      eyebrow={bi('Country Profile', 'ملف الدولة')}
      title={country.name}
      description={bi('A preview country record showing branch distribution and player coverage.', 'سجل دولة تجريبي يوضح توزيع الفروع وتغطية اللاعبين.')}
      actions={<StatusBadge active={country.status === 'active'} />}
    />

    <section className="country-identity-card">
      <div className="country-identity-main">
        <Globe /><code>{country.code}</code>
        <h2><BilingualText value={country.name} /></h2>
      </div>
      <dl>
        <div><dt><BilingualText value={bi('Country Code', 'رمز الدولة')} /></dt><dd><code>{country.code}</code></dd></div>
        <div><dt><BilingualText value={bi('Branches', 'الفروع')} /></dt><dd>{branches.length}</dd></div>
        <div><dt><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /></dt><dd>{branchPlayers.length}</dd></div>
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="country-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Country Information', 'معلومات الدولة')} /><small><BilingualText value={bi('Preview fixture', 'بيانات تجريبية')} /></small></div>
            <Flag />
          </div>
          <dl className="detail-list">
            <div><dt><BilingualText value={bi('Country ID', 'معرف الدولة')} /></dt><dd><code>{country.id}</code></dd></div>
            <div><dt><BilingualText value={bi('Code', 'الرمز')} /></dt><dd><code>{country.code}</code></dd></div>
            <div><dt><BilingualText value={bi('Organization', 'المنظمة')} /></dt><dd>{country.organizationId}</dd></div>
            <div><dt><BilingualText value={bi('Total Branches', 'إجمالي الفروع')} /></dt><dd>{branches.length}</dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Branch Distribution', 'توزيع الفروع')} /></div>
            <Building2 />
          </div>
          {branches.map(branch => <div className="preview-line" key={branch.id}>
            <BilingualText value={branch.name} />
            <span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span>
          </div>)}
        </section>
        <section className="admin-panel pipeline-card">
          <div className="panel-heading"><BilingualText value={bi('Operational Scope', 'النطاق التشغيلي')} /><Users /></div>
          <div className="pipeline-flow">
            {[bi('Country Operations', 'عمليات الدولة'), bi('Branch Management', 'إدارة الفروع'), bi('Player Coverage', 'تغطية اللاعبين')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 2 && <i>→</i>}</span>)}
          </div>
        </section>
      </div>}

      {active === 'branches' && <div className="branch-list-inline">
        {branches.map(branch => <article className="country-branch-card" key={branch.id}>
          <h3><BilingualText value={branch.name} /></h3>
          <p><BilingualText value={bi('Sports', 'الرياضات')} />: {branch.sportIds.length} | <BilingualText value={bi('Players', 'اللاعبون')} />: {branch.playerIds.length} | <BilingualText value={bi('Coaches', 'المدربون')} />: {branch.coachIds.length}</p>
          <Link className="admin-link-button" to={`/admin/branches/${branch.id}`}>
            <BilingualText value={bi('Open Branch', 'فتح الفرع')} /><ArrowRight />
          </Link>
        </article>)}
        {branches.length === 0 && <p className="empty-message"><BilingualText value={bi('No branches configured for this country.', 'لا توجد فروع مكونة لهذه الدولة.')} /></p>}
      </div>}

      {active === 'players' && <div className="player-list-inline">
        {branchPlayers.map(player => <div className="preview-line" key={player.id}>
          <code>{player.id}</code>
          <span>{player.nameEn} | {player.nameAr}</span>
        </div>)}
        {branchPlayers.length === 0 && <p className="empty-message"><BilingualText value={bi('No players associated with this country.', 'لا يوجد لاعبون مرتبطون بهذه الدولة.')} /></p>}
      </div>}
    </section>
  </div>;
}
