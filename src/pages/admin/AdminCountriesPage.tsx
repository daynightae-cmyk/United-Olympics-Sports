import { ArrowRight, Building2, Flag, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useCountries } from '../../admin/data/adminHooks';

export function AdminCountriesPage() {
  const { data, loading } = useCountries({ page: 1, pageSize: 50 });
  const countries = data?.items ?? [];
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Organization Hierarchy', 'التسلسل التنظيمي')}
      title={bi('Countries', 'الدول')}
      description={bi('Preview country-level organisation across the Gulf region.', 'معاينة التنظيم على مستوى الدول في منطقة الخليج.')}
    />
    <div className="country-management-grid">
      {countries.map(country => {
        return <article className="country-management-card" key={country.id}>
          <div className="country-card-head">
            <span className="country-glyph"><Flag /></span>
            <StatusBadge active={country.status === 'active'} />
          </div>
          <h2><BilingualText value={country.name} /></h2>
          <p className="country-code"><Globe /><code>{country.code}</code></p>
          <div className="country-derived-stats">
            <span><Building2 /><BilingualText value={bi('Branches', 'الفروع')} /><strong>{(country as any).branchCount ?? 0}</strong></span>
            <span><Users /><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /><strong>0</strong></span>
          </div>
          <Link className="admin-link-button" to={`/admin/countries/${country.id}`}>
            <BilingualText value={bi('Open Country', 'فتح الدولة')} /><ArrowRight />
          </Link>
        </article>;
      })}
    </div>
  </div>;
}
