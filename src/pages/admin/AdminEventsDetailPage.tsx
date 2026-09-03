import { ArrowLeft, ArrowRight, CalendarDays, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useEvent, useUpdateEvent } from '../../admin/data/adminHooks';

export function AdminEventsDetailPage() {
  const { eventId } = useParams();
  const { item: event, loading, error, refetch } = useEvent(eventId);
  const { update, loading: updateLoading } = useUpdateEvent();

  if (loading) return <div className="admin-page"><PageHeader icon={CalendarDays} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Event Detail', 'تفاصيل الفعالية')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !event) return <div className="admin-page"><PageHeader icon={CalendarDays} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Event not found', 'الفعالية غير موجودة')} description={bi('Choose a valid event from the Events directory.', 'اختر فعالية صالحة من دليل الفعاليات.')} /></div>;

  return <div className="admin-page">
    <PageHeader
      icon={CalendarDays}
      eyebrow={bi('Training Operations', 'عمليات التدريب')}
      title={bi('Event Detail', 'تفاصيل الفعالية')}
      description={event.title}
      actions={<Link to="/admin/events" className="admin-secondary-button"><ArrowLeft /><BilingualText value={bi('Back to Events', 'العودة للفعاليات')} /></Link>}
    />
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Event Information', 'معلومات الفعالية')} /><CalendarDays /></div>
      <dl className="detail-list">
        <div><dt><BilingualText value={bi('Event ID', 'رقم الفعالية')} /></dt><dd><code>{event.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Title', 'العنوان')} /></dt><dd><BilingualText value={event.title} /></dd></div>
        <div><dt><BilingualText value={bi('Description', 'الوصف')} /></dt><dd><BilingualText value={event.description} /></dd></div>
        <div><dt><BilingualText value={bi('Type', 'النوع')} /></dt><dd><BilingualText value={event.type} /></dd></div>
        <div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={event.status === 'ongoing'} /></dd></div>
        <div><dt><BilingualText value={bi('Start Date', 'تاريخ البداية')} /></dt><dd>{new Date(event.startDate).toLocaleDateString()}</dd></div>
        <div><dt><BilingualText value={bi('End Date', 'تاريخ النهاية')} /></dt><dd>{new Date(event.endDate).toLocaleDateString()}</dd></div>
        <div><dt><BilingualText value={bi('Location', 'الموقع')} /></dt><dd>{event.location && <BilingualText value={event.location} />}</dd></div>
      </dl>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Actions', 'الإجراءات')} /><ShieldCheck /></div>
      <div className="preview-form-grid">
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={event.status} onChange={(e) => update(event.id!, { status: e.target.value as any })}><option value="scheduled">Scheduled | مجدول</option><option value="ongoing">Ongoing | جاري</option><option value="completed">Completed | مكتمل</option><option value="cancelled">Cancelled | ملغي</option></select></label>
      </div>
      <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p>
    </section>
  </div>;
}