import { ArrowRight, Mail, Phone, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, PlayerAvatar, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoParents } from '../../data/demo/parents';
import { getPlayer } from '../../data/demo/selectors';

export function AdminParentsPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Parent Management', 'إدارة أولياء الأمور')}
      title={bi('Parents', 'أولياء الأمور')}
      description={bi('Preview parent directory linked to enrolled players.', 'دليل تجريبي لأولياء الأمور مرتبط باللاعبين المسجلين.')}
    />
    <section className="parent-table-wrap">
      <table className="parent-table">
        <caption className="sr-only"><BilingualText value={bi('Parent Directory', 'دليل أولياء الأمور')} /></caption>
        <thead>
          <tr>
            {[bi('Parent', 'ولي الأمر'), bi('ID', 'المعرف'), bi('Children', 'الأبناء'), bi('Language', 'اللغة'), bi('Contact', 'جهة الاتصال'), bi('Status', 'الحالة'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}
          </tr>
        </thead>
        <tbody>
          {demoParents.map(parent => {
            const children = parent.playerIds.map(pid => getPlayer(pid)).filter(Boolean);
            return <tr key={parent.id}>
              <td><PlayerAvatar id={parent.id} /></td>
              <td><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></td>
              <td><code>{parent.id}</code></td>
              <td><Users />{children.length}</td>
              <td><BilingualText value={bi(parent.preferredLanguage === 'en' ? 'English' : 'العربية', parent.preferredLanguage === 'ar' ? 'العربية' : 'English')} /></td>
              <td>{parent.phone && <span><Phone />{parent.phone}</span>}{parent.email && <span><Mail />{parent.email}</span>}{!parent.phone && !parent.email && <span>—</span>}</td>
              <td><StatusBadge active={parent.status === 'active'} /></td>
              <td><Link className="row-action" to={`/admin/parents/${parent.id}`}><ArrowRight /></Link></td>
            </tr>;
          })}
        </tbody>
      </table>
    </section>
  </div>;
}
