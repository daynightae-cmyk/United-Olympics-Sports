import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalOverviewPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal', 'بوابة اللاعب')} title={bi('Overview', 'نظرة عامة')} description={bi('Player portal full architecture preview.', 'معاينة الهيكل الكامل لبوابة اللاعب.')} /><div className="admin-preview-card"><ShieldCheck size={32} /><h3><BilingualText value={bi('Player Portal Overview', 'نظرة عامة بوابة اللاعب')} /></h3></div></div>;
}
