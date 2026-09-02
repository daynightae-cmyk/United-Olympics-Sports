import { TrendingUp } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalPerformancePage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Performance', 'بوابة اللاعب | الأداء')} title={bi('Performance', 'الأداء')} description={bi('Player performance preview.', 'معاينة أداء اللاعب.')} /><div className="admin-preview-card"><TrendingUp size={32} /><h3><BilingualText value={bi('Player Performance', 'أداء اللاعب')} /></h3></div></div>;
}
