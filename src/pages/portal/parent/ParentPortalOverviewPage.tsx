import { HeartHandshake } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function ParentPortalOverviewPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal', 'بوابة ولي الأمر')} title={bi('Overview', 'نظرة عامة')} description={bi('Parent portal full architecture preview.', 'معاينة الهيكل الكامل لبوابة ولي الأمر.')} /><div className="admin-preview-card"><HeartHandshake size={32} /><h3><BilingualText value={bi('Parent Portal Overview', 'نظرة عامة بوابة ولي الأمر')} /></h3></div></div>;
}
