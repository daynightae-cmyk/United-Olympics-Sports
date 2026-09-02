import { FileBarChart } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminReportsPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Insights', 'الرؤى')}
      title={bi('Reports', 'التقارير')}
      description={bi('Organization reports and analytics preview.', 'معاينة تقارير المؤسسة والتحليلات.')}
    />
    <div className="admin-preview-card">
      <FileBarChart size={32} />
      <h3><BilingualText value={bi('Reports Module', 'وحدة التقارير')} /></h3>
      <p><BilingualText value={bi('Report generation and analytics are structural previews.', 'إنشاء التقارير والتحليلات هي معاينات هيكلية.')} /></p>
    </div>
  </div>;
}
