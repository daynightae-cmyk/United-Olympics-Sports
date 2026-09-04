import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FileText, Image } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseStatus } from '../../components/enterprise/EnterpriseUI';
import { previewContent } from '../../data/demo/adminRecords';
import { sportMediaAssets } from '../../data/media';

export function AdminContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const record = previewContent.find((item) => item.id === contentId);
  const linkedMedia = sportMediaAssets.filter((asset) =>
    `${asset.id} ${asset.sportId} ${asset.altEn}`.toLowerCase().includes((record?.title.en ?? '').split(' ')[0].toLowerCase()),
  ).slice(0, 4);

  if (!record) {
    return <div className="admin-page">
      <Link to="/admin/content" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Content', 'العودة للمحتوى')} /></Link>
      <PageHeader eyebrow={bi('Experience & Access', 'التجربة والوصول')} title={bi('Content Not Found', 'المحتوى غير موجود')} description={bi(`No preview content matches “${contentId ?? '—'}”.`, `لا يوجد محتوى تجريبي يطابق “${contentId ?? '—'}”.`)} />
      <div className="admin-preview-card"><FileText size={32} /><h3><BilingualText value={bi('Unknown content reference', 'مرجع محتوى غير معروف')} /></h3><p><BilingualText value={bi('Return to the content workspace and choose an existing record.', 'عد إلى مساحة المحتوى واختر سجلًا موجودًا.')} /></p></div>
    </div>;
  }

  return <div className="admin-page">
    <Link to="/admin/content" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Content', 'العودة للمحتوى')} /></Link>
    <PageHeader
      eyebrow={bi('Experience & Access', 'التجربة والوصول')}
      title={record.title}
      description={bi(`Preview editorial record · ${record.id}`, `سجل تحريري تجريبي · ${record.id}`)}
    />
    <section className="portal-card-grid" style={{ marginTop: 14 }}>
      <article className="portal-card"><span className="portal-card-icon"><FileText size={18} /></span><h3><BilingualText value={bi('Content Type', 'نوع المحتوى')} /></h3><p><BilingualText value={record.type} /></p></article>
      <article className="portal-card"><span className="portal-card-icon"><CalendarDays size={18} /></span><h3><BilingualText value={bi('Last Updated', 'آخر تحديث')} /></h3><p>{record.updatedAt}</p></article>
      <article className="portal-card"><span className="portal-card-icon"><Image size={18} /></span><h3><BilingualText value={bi('Publication Status', 'حالة النشر')} /></h3><p><EnterpriseStatus label={bi(record.status, record.status)} tone={record.status === 'published' ? 'active' : 'warning'} /></p></article>
    </section>
    <section className="portal-section" style={{ marginTop: 14 }}>
      <header><div><h2><BilingualText value={bi('Linked Media Preview', 'معاينة الوسائط المرتبطة')} /></h2><p><BilingualText value={bi('Verified sport media whose reference matches this record title.', 'وسائط رياضية موثقة يطابق مرجعها عنوان هذا السجل.')} /></p></div></header>
      {linkedMedia.length ? (
        <div className="enterprise-grid-3">{linkedMedia.map((asset) => <article className="enterprise-panel content-asset-card" key={asset.id}><div className="content-asset-image"><img src={asset.url} alt={`${asset.altEn} | ${asset.altAr}`} loading="lazy" decoding="async" /></div><div className="content-asset-copy"><h3>{asset.id}</h3><p><BilingualText value={{ en: asset.altEn, ar: asset.altAr }} /></p></div></article>)}</div>
      ) : (
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12 }}><BilingualText value={bi('No verified media references this record yet.', 'لا توجد وسائط موثقة تشير إلى هذا السجل بعد.')} /></p>
      )}
    </section>
  </div>;
}
