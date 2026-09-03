import { ArrowLeft, ArrowRight, MessageSquare, Mail, MailOpen, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useMessage, useUpdateMessage } from '../../admin/data/adminHooks';

export function AdminMessagesDetailPage() {
  const { messageId } = useParams();
  const { item: message, loading, error, refetch } = useMessage(messageId);
  const { update, loading: updateLoading } = useUpdateMessage();

  if (loading) return <div className="admin-page"><PageHeader icon={MessageSquare} eyebrow={bi('Communications', 'التواصل')} title={bi('Message Detail', 'تفاصيل الرسالة')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !message) return <div className="admin-page"><PageHeader icon={MessageSquare} eyebrow={bi('Communications', 'التواصل')} title={bi('Message not found', 'الرسالة غير موجودة')} description={bi('Choose a valid message from the Messages directory.', 'اختر رسالة صالحة من دليل الرسائل.')} /></div>;

  return <div className="admin-page">
    <PageHeader
      icon={MessageSquare}
      eyebrow={bi('Communications', 'التواصل')}
      title={bi('Message Detail', 'تفاصيل الرسالة')}
      description={message.subject}
      actions={<Link to="/admin/messages" className="admin-secondary-button"><ArrowLeft /><BilingualText value={bi('Back to Messages', 'العودة للرسائل')} /></Link>}
    />
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Message Information', 'معلومات الرسالة')} /><MailOpen /></div>
      <dl className="detail-list">
        <div><dt><BilingualText value={bi('Message ID', 'رقم الرسالة')} /></dt><dd><code>{message.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Subject', 'الموضوع')} /></dt><dd><BilingualText value={message.subject} /></dd></div>
        <div><dt><BilingualText value={bi('Body', 'المحتوى')} /></dt><dd><BilingualText value={message.body} /></dd></div>
        <div><dt><BilingualText value={bi('From', 'من')} /></dt><dd><code>{message.fromId}</code></dd></div>
        <div><dt><BilingualText value={bi('To', 'إلى')} /></dt><dd>{message.toIds.join(', ')}</dd></div>
        <div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={message.status === 'read'} /></dd></div>
        <div><dt><BilingualText value={bi('Sent At', 'تاريخ الإرسال')} /></dt><dd>{new Date(message.sentAt).toLocaleDateString()}</dd></div>
        <div><dt><BilingualText value={bi('Read At', 'تاريخ القراءة')} /></dt><dd>{message.readAt ? new Date(message.readAt).toLocaleDateString() : <BilingualText value={bi('Unread', 'غير مقروء')} />}</dd></div>
      </dl>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Actions', 'الإجراءات')} /><ShieldCheck /></div>
      <div className="preview-form-grid">
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={message.status} onChange={(e) => update(message.id!, { status: e.target.value as any })}><option value="sent">Sent | مرسل</option><option value="delivered">Delivered | تم التسليم</option><option value="read">Read | مقروء</option><option value="failed">Failed | فشل</option></select></label>
      </div>
      <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p>
    </section>
  </div>;
}