import { ArrowRight, FolderCog, Gamepad2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoPrograms } from '../../data/demo/programs';
import { demoSports } from '../../data/demo/sports';

export function AdminProgramsPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Program Management', 'إدارة البرامج')}
      title={bi('Programs', 'البرامج')}
      description={bi('Training programmes delivered across sports and branches.', 'البرامج التدريبية المقدمة عبر الرياضات والفروع.')}
    />
    <div className="program-management-grid">
      {demoPrograms.map(program => {
        const sport = demoSports.find(s => s.id === program.sportId);
        return <article className="program-management-card" key={program.id}>
          <div className="program-card-head">
            <span className="program-glyph"><FolderCog /></span>
          </div>
          <h2><BilingualText value={program.name} /></h2>
          {sport && <p className="program-sport"><Gamepad2 /><BilingualText value={sport.name} /></p>}
          <div className="program-derived-stats">
            <span><Gamepad2 /><BilingualText value={bi('Sport', 'الرياضة')} /><strong><BilingualText value={program.sport} /></strong></span>
            <span><Users /><BilingualText value={bi('Level', 'المستوى')} /><strong><BilingualText value={program.level} /></strong></span>
          </div>
          <p className="program-focus"><BilingualText value={program.description} /></p>
          <Link className="admin-link-button" to={`/admin/programs/${program.id}`}>
            <BilingualText value={bi('Open Program', 'فتح البرنامج')} /><ArrowRight />
          </Link>
        </article>;
      })}
    </div>
  </div>;
}
