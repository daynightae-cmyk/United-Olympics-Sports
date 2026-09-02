import { FileText } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminContentPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Experience & Access', 'التجربة والوصول')}
      title={bi('Content', 'المحتوى')}
      description={bi('Content management and editor preview.', 'معاينة إدارة المحتوى والمحرر.')}
    />
    <div className="admin-preview-card">
      <FileText size={32} />
      <h3><BilingualText value={bi('Content Module', 'وحدة المحتوى')} /></h3>
      <p><BilingualText value={bi('Content editing and experience management are preview structures.', 'تحرير المحتوى وإدارة التجربة هي هياكل تجريبية.')} /></p>
    </div>
  </div>;
}
