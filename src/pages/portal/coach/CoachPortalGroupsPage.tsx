import { UsersRound } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function CoachPortalGroupsPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Coach Portal | Groups', 'بوابة المدرب | المجموعات')} title={bi('Groups', 'المجموعات')} description={bi('Coach training groups preview.', 'معاينة مجموعات تدريب المدرب.')} /><div className="admin-preview-card"><UsersRound size={32} /><h3><BilingualText value={bi('Coach Groups', 'مجموعات المدرب')} /></h3></div></div>;
}
