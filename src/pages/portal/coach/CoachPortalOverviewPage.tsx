import { Award } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function CoachPortalOverviewPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Coach Portal', 'بوابة المدرب')} title={bi('Overview', 'نظرة عامة')} description={bi('Coach portal full architecture preview.', 'معاينة الهيكل الكامل لبوابة المدرب.')} /><div className="admin-preview-card"><Award size={32} /><h3><BilingualText value={bi('Coach Portal Overview', 'نظرة عامة بوابة المدرب')} /></h3></div></div>;
}
