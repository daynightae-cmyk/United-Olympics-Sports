import { ArrowRight, Building2, Flag, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useBranches } from '../../admin/data/adminHooks';

export function AdminBranchesPage() {
  const { data, loading } = useBranches({ page: 1, pageSize: 50 });
  const branches = data?.items ?? [];
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Branch Management', 'إدارة الفروع')}
      title={bi('Branches', 'الفروع')}
      description={bi('Centralised branch cockpit covering all operational domains.', 'مركز تحكم مركزي للفروع يغطي جميع المجالات التشغيلية.')}
    />
    <div className="branch-management-grid">
      {branches.map(branch => {
        return <article className="branch-management-card" key={branch.id}>
          <div className="branch-card-head">
            <span className="branch-glyph"><Building2 /></span>
            <StatusBadge active={branch.status === 'active'} />
          </div>
          <h2><BilingualText value={branch.name} /></h2>
          <p className="branch-country"><Flag /><BilingualText value={{ en: `Country ${branch.countryId || 'Unknown'}`, ar: `الدولة ${branch.countryId || 'غير معروف'}` }} /></p>
          {branch.address && <p className="branch-address"><MapPin /><BilingualText value={branch.address} /></p>}
          <div className="branch-derived-stats">
            <span><Building2 /><BilingualText value={bi('Sports', 'الرياضات')} /><strong>{branch.sportIds.length}</strong></span>
            <span><Users /><BilingualText value={bi('Players', 'اللاعبون')} /><strong>{branch.playerIds.length}</strong></span>
            <span><Users /><BilingualText value={bi('Coaches', 'المدربون')} /><strong>{branch.coachIds.length}</strong></span>
          </div>
          <Link className="admin-link-button" to={`/admin/branches/${branch.id}`}>
            <BilingualText value={bi('Open Branch Cockpit', 'فتح مركز تحكم الفرع')} /><ArrowRight />
          </Link>
        </article>;
      })}
    </div>
  </div>;
}
