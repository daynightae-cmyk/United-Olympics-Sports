import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function PlayerPortalOverviewPage() {
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Player Portal', 'بوابة اللاعب')} title={bi('Overview', 'نظرة عامة')} description={bi('Player portal overview preview.', 'معاينة نظرة عامة بوابة اللاعب.')} />
    <div className="admin-preview-card"><ShieldCheck size={32} /><h3><BilingualText value={bi('Player Portal', 'بوابة اللاعب')} /></h3><p><BilingualText value={bi('Overview, schedule, attendance, performance, achievements, and profile.', 'نظرة عامة، الجدول، الحضور، الأداء، الإنجازات، والملف الشخصي.')} /></p></div>
  </div>;
}
