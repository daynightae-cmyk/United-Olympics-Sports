import { Award } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function CoachPortalOverviewPage() {
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Coach Portal', 'بوابة المدرب')} title={bi('Overview', 'نظرة عامة')} description={bi('Coach portal overview preview.', 'معاينة نظرة عامة بوابة المدرب.')} />
    <div className="admin-preview-card"><Award size={32} /><h3><BilingualText value={bi('Coach Portal', 'بوابة المدرب')} /></h3><p><BilingualText value={bi('Schedule, groups, players, attendance, evaluations, programs, messages, and profile.', 'الجدول، المجموعات، اللاعبون، الحضور، التقييمات، البرامج، الرسائل، والملف الشخصي.')} /></p></div>
  </div>;
}
