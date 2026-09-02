import { ArrowRight, Medal, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, PlayerAvatar, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoCoaches } from '../../data/demo/coaches';
import { getBranch, getGroup } from '../../data/demo/selectors';

export function AdminCoachesPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Coach Management', 'إدارة المدربين')}
      title={bi('Coaches', 'المدربون')}
      description={bi('Preview coach directory with sport specializations and assignments.', 'دليل تجريبي للمدربين مع التخصصات الرياضية والتكليفات.')}
    />
    <section className="coach-table-wrap">
      <table className="coach-table">
        <caption className="sr-only"><BilingualText value={bi('Coach Directory', 'دليل المدربين')} /></caption>
        <thead>
          <tr>
            {[bi('Coach', 'المدرب'), bi('ID', 'المعرف'), bi('Experience', 'الخبرة'), bi('Groups', 'المجموعات'), bi('Branches', 'الفروع'), bi('Specializations', 'التخصصات'), bi('Status', 'الحالة'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}
          </tr>
        </thead>
        <tbody>
          {demoCoaches.map(coach => {
            const groups = coach.groupIds.map(gid => getGroup(gid)).filter(Boolean);
            const branches = coach.branchIds.map(bid => getBranch(bid)).filter(Boolean);
            return <tr key={coach.id}>
              <td><PlayerAvatar id={coach.id} /></td>
              <td><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></td>
              <td><code>{coach.id}</code></td>
              <td>{coach.yearsOfExperience ?? '—'} <BilingualText value={bi('yrs', 'سنة')} /></td>
              <td><Users />{groups.length}</td>
              <td><Medal />{branches.length}</td>
              <td>{coach.specializations.slice(0, 2).map((s, i) => <span key={i} className="specialization-tag"><BilingualText value={s} /></span>)}</td>
              <td><StatusBadge active={coach.status === 'active'} /></td>
              <td><Link className="row-action" to={`/admin/coaches/${coach.id}`}><ArrowRight /></Link></td>
            </tr>;
          })}
        </tbody>
      </table>
    </section>
  </div>;
}
