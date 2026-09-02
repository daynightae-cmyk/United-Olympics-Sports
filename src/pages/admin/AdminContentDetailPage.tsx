import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  return <div className="admin-page">
    <Link to="/admin/content" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Content', 'العودة للمحتوى')} /></Link>
    <PageHeader eyebrow={bi('Experience & Access', 'التجربة والوصول')} title={bi('Content Editor', 'محرر المحتوى')} description={bi(contentId ?? '-', '-') ?? { en: '-', ar: '-' }} />
    <div className="admin-preview-card"><FileText size={32} /><h3><BilingualText value={bi('Content Editor Preview', 'معاينة محرر المحتوى')} /></h3><p><BilingualText value={bi('This is the content detail and editor preview experience.', 'هذه تجربة معاينة تفاصيل المحتوى والمحرر.')} /></p></div>
  </div>;
}
