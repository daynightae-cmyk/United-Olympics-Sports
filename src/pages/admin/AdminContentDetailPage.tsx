import { ArrowLeft, CalendarDays, FileText, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContentItem, useDeleteContent, useUpdateContent } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseStatus, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const statusLabel = (status: string) => bi(status, status === 'published' ? 'منشور' : status === 'draft' ? 'مسودة' : 'مؤرشف');
const statusTone = (status: string): 'active' | 'warning' | 'neutral' => status === 'published' ? 'active' : status === 'draft' ? 'warning' : 'neutral';

export function AdminContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { item: record, loading, error } = useContentItem(contentId);
  const { update, loading: updateLoading } = useUpdateContent();
  const { delete: deleteContent, loading: deleteLoading } = useDeleteContent();

  if (loading) return <FuturePanel title={bi('Loading content', 'جارٍ تحميل المحتوى')} description={bi('Reading the editorial record from the Admin data gateway.', 'جارٍ قراءة السجل التحريري من بوابة بيانات الإدارة.')} />;
  if (error || !record) return <FuturePanel title={bi('Content not found', 'المحتوى غير موجود')} description={bi('The requested content record is not available in the current provider.', 'سجل المحتوى المطلوب غير متاح في موفر البيانات الحالي.')} />;

  const busy = updateLoading || deleteLoading;
  const setStatus = async (status: 'published' | 'draft' | 'archived') => { await update(record.id, { status }); };
  const remove = async () => { if (busy) return; await deleteContent(record.id); navigate('/admin/content'); };

  return <div className="admin-page">
    <Link to="/admin/content" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Content', 'العودة للمحتوى')} /></Link>
    <PageHeader eyebrow={bi('Experience & Access', 'التجربة والوصول')} title={record.title} description={bi(`Managed editorial record · ${record.id}`, `سجل تحريري مُدار · ${record.id}`)} actions={<div className="admin-header-actions"><PreviewNotice /><EnterpriseStatus label={statusLabel(record.status)} tone={statusTone(record.status)} /><button type="button" className="admin-danger-button" disabled={busy} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>} />

    <section className="portal-card-grid" style={{ marginTop: 14 }}>
      <article className="portal-card"><span className="portal-card-icon"><FileText size={18} /></span><h3><BilingualText value={bi('Content Type', 'نوع المحتوى')} /></h3><p><BilingualText value={record.type} /></p></article>
      <article className="portal-card"><span className="portal-card-icon"><CalendarDays size={18} /></span><h3><BilingualText value={bi('Last Updated', 'آخر تحديث')} /></h3><p>{record.updatedAt}</p></article>
      <article className="portal-card"><span className="portal-card-icon"><FileText size={18} /></span><h3><BilingualText value={bi('Record ID', 'معرف السجل')} /></h3><p><code>{record.id}</code></p></article>
    </section>

    <section className="admin-panel" style={{ marginTop: 14 }}><div className="panel-heading"><BilingualText value={bi('Publication Control', 'التحكم بالنشر')} /></div><div className="admin-form-actions">{(['draft','published','archived'] as const).map(value => <button key={value} type="button" className={record.status === value ? 'admin-primary-button' : 'admin-secondary-button'} disabled={busy} onClick={() => void setStatus(value)}><BilingualText value={statusLabel(value)} /></button>)}</div><p><BilingualText value={bi('This Preview status does not publish to an external CMS or social network.', 'حالة المعاينة هذه لا تنشر إلى نظام إدارة محتوى خارجي أو شبكة اجتماعية.')} /></p></section>
  </div>;
}
