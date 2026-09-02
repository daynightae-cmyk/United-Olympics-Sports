import { ClipboardCheck } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function CoachPortalEvaluationsPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Coach Portal | Evaluations', 'بوابة المدرب | التقييمات')} title={bi('Evaluations', 'التقييمات')} description={bi('Coach evaluation preview.', 'معاينة تقييمات المدرب.')} /><div className="admin-preview-card"><ClipboardCheck size={32} /><h3><BilingualText value={bi('Coach Evaluations', 'تقييمات المدرب')} /></h3></div></div>;
}
