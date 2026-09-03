import { ArrowRight, BarChart3, Dumbbell, FolderCog, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useSports } from '../../admin/data/adminHooks';

export function AdminSportsPage() {
  const { data, loading } = useSports({ page: 1, pageSize: 50 });
  const sports = data?.items ?? [];
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Sports Management Center', 'مركز إدارة الرياضات')} title={bi('Sports', 'الرياضات')} description={bi('Data-driven sport structures with every count derived from linked preview fixtures.', 'هياكل رياضية قائمة على البيانات، وكل عدد مشتق من العلاقات التجريبية المرتبطة.')} />
    <div className="sport-management-grid">{sports.map(sport => {
      return <article className="sport-management-card" key={sport.id}>
        <div className="sport-card-head"><span className="sport-glyph"><Trophy /></span><StatusBadge active={sport.status === 'active'} /></div>
        <h2><BilingualText value={sport.name} /></h2><p><BilingualText value={sport.description} /></p>
        <div className="sport-derived-stats">
        <span><Dumbbell /><BilingualText value={bi('Training Groups', 'مجموعات التدريب')} /><strong>{sport.programIds?.length ?? 0}</strong></span>
        <span><Users /><BilingualText value={bi('Players', 'اللاعبون')} /><strong>0</strong></span>
        <span><ShieldCheck /><BilingualText value={bi('Coaches', 'المدربون')} /><strong>0</strong></span>
        <span><FolderCog /><BilingualText value={bi('Programs', 'البرامج')} /><strong>{sport.programIds?.length ?? 0}</strong></span>
        <span><BarChart3 /><BilingualText value={bi('Performance Metrics', 'مؤشرات الأداء')} /><strong>0</strong></span>
        </div>
        <Link className="admin-link-button" to={`/admin/sports/${sport.id}`}><BilingualText value={bi('Open Sport', 'فتح الرياضة')} /><ArrowRight /></Link>
      </article>;
    })}</div>
  </div>;
}
