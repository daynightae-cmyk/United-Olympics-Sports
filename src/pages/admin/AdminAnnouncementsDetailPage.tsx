import { ArrowLeft, ArrowRight, Megaphone, AlertCircle, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAnnouncement, useUpdateAnnouncement } from '../../admin/data/adminHooks';

export function AdminAnnouncementsDetailPage() {
  const { announcementId } = useParams();
  const { item: announcement, loading, error, refetch } = useAnnouncement(announcementId);
  const { update, loading: updateLoading } = useUpdateAnnouncement();

  if (loading) return <div className="admin-page"><PageHeader icon={Megaphone} eyebrow={bi('Communications', 'التواصل')} title={bi('Announcement Detail', 'تفاصيل الإعلان')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !announcement) return <div className="admin-page"><PageHeader icon={Megaphone} eyebrow={bi('Communications', 'التواصل')} title={bi('Announcement not found', 'الإعلان غير موجود')} description={bi('Choose a valid announcement from the Announcements directory.', 'اختر إعلاناً صالحاً من دليل الإعلانات.')} /></div>;

  return <div className="admin-page">
    <PageHeader
      icon={Megaphone}
      eyebrow={bi('Communications', 'التواصل')}
      title={bi('Announcement Detail', 'تفاصيل الإعلان')}
      description={announcement.title}
      actions={<Link to="/admin/announcements" className="admin-secondary-button"><ArrowLeft /><BilingualText value={bi('Back to Announcements', 'العودة للإعلانات')} /></Link>}
    />
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Announcement Information', 'معلومات الإعلان')} /><Megaphone /></div>
      <dl className="detail-list">
        <div><dt><BilingualText value={bi('Announcement ID', 'رقم الإعلان')} /></dt><dd><code>{announcement.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Title', 'العنوان')} /></dt><dd><BilingualText value={announcement.title} /></dd></div>
        <div><dt><BilingualText value={bi('Body', 'المحتوى')} /></dt><dd><BilingualText value={announcement.body} /></dd></div>
        <div><dt><BilingualText value={bi('Audience', 'الجمهور')} /></dt><dd><BilingualText value={announcement.audience} /></dd></div>
        <div><dt><BilingualText value={bi('Priority', 'الأولوية')} /></dt><dd><span className={`priority-badge priority-${announcement.priority}`}><BilingualText value={{ en: announcement.priority, ar: announcement.priority }} /></span></dd></div>
        <div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={announcement.status === 'published'} /></dd></div>
        <div><dt><BilingualText value={bi('Published At', 'تاريخ النشر')} /></dt><dd>{announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleDateString() : <BilingualText value={bi('Not published', 'غير منشور')} />}</dd></div>
      </dl>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Actions', 'الإجراءات')} /><ShieldCheck /></div>
      <div className="preview-form-grid">
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={announcement.status} onChange={(e) => update(announcement.id!, { status: e.target.value as any })}><option value="draft">Draft | مسودة</option><option value="published">Published | منشور</option><option value="archived">Archived | مؤرشف</option></select></label>
        <label><BilingualText value={bi('Priority', 'الأولوية')} /><select defaultValue={announcement.priority} onChange={(e) => update(announcement.id!, { priority: e.target.value as any })}><option value="low">Low | منخفض</option><option value="normal">Normal | عادي</option><option value="high">High | عالي</option><option value="urgent">Urgent | عاجل</option></select></label>
      </div>
      <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p>
    </section>
  </div>;
}