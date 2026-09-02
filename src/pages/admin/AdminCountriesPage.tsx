import { ArrowRight, Building2, Flag, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoCountries } from '../../data/demo/business';
import { getCountryBranches } from '../../data/demo/selectors';

export function AdminCountriesPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Organization Hierarchy', 'التسلسل التنظيمي')}
      title={bi('Countries', 'الدول')}
      description={bi('Preview country-level organisation across the Gulf region.', 'معاينة التنظيم على مستوى الدول في منطقة الخليج.')}
    />
    <div className="country-management-grid">
      {demoCountries.map(country => {
        const branches = getCountryBranches(country.id);
        return <article className="country-management-card" key={country.id}>
          <div className="country-card-head">
            <span className="country-glyph"><Flag /></span>
            <StatusBadge active={country.status === 'active'} />
          </div>
          <h2><BilingualText value={country.name} /></h2>
          <p className="country-code"><Globe /><code>{country.code}</code></p>
          <div className="country-derived-stats">
            <span><Building2 /><BilingualText value={bi('Branches', 'الفروع')} /><strong>{branches.length}</strong></span>
            <span><Users /><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /><strong>{branches.reduce((sum, b) => sum + b.playerIds.length, 0)}</strong></span>
          </div>
          <Link className="admin-link-button" to={`/admin/countries/${country.id}`}>
            <BilingualText value={bi('Open Country', 'فتح الدولة')} /><ArrowRight />
          </Link>
        </article>;
      })}
    </div>
  </div>;
}
