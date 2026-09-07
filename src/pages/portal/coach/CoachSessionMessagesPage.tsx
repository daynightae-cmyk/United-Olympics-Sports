import { MessageCircle, UserRound } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalPreviewCard, PortalSection, PortalStatus } from '../../../components/portal/PortalUI';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

export function CoachSessionMessagesPage() {
  const { coach, messages, players, parents, loading, error } = useCoachPortalGatewayData();

  if (loading) return <div className="admin-page"><div className="ui-skeleton" role="status"><span><BilingualText value={bi('Loading messages…', 'جارٍ تحميل الرسائل…')} /></span><i /><i /><i /></div></div>;
  if (error || !coach) return <div className="admin-page"><div className="enterprise-empty"><MessageCircle size={24} /><h3><BilingualText value={bi('Messages unavailable', 'الرسائل غير متاحة')} /></h3><p><BilingualText value={bi('The current provider could not supply coach messages.', 'تعذر على مصدر البيانات الحالي توفير رسائل المدرب.')} /></p></div></div>;

  const labelFor = (id: string) => {
    if (id === coach.id) return { en: coach.nameEn, ar: coach.nameAr };
    const player = players.find((item) => item.id === id);
    if (player) return { en: player.nameEn, ar: player.nameAr };
    const parent = parents.find((item) => item.id === id);
    if (parent) return { en: parent.nameEn, ar: parent.nameAr };
    return { en: id, ar: id };
  };

  return (
    <div className="admin-page">
      <PageHeader
        icon={MessageCircle}
        eyebrow={bi('Coach Portal · Messages', 'بوابة المدرب · الرسائل')}
        title={bi('Coach Inbox', 'صندوق رسائل المدرب')}
        description={bi('Only provider messages where the active coach is a sender or recipient are shown.', 'تظهر فقط رسائل مصدر البيانات التي يكون فيها المدرب النشط مرسلًا أو مستلمًا.')}
        actions={<PreviewNotice />}
      />
      <PortalSection title={bi('Provider conversations', 'محادثات مصدر البيانات')} description={bi('Read-only until the Coach Portal has a production-safe message write contract.', 'للقراءة فقط حتى تتوفر لبوابة المدرب عملية كتابة رسائل آمنة للإنتاج.')}>
        {messages.length ? <div className="message-thread">{messages.map((message) => (
          <article className="message-bubble" key={message.id}>
            <strong><BilingualText value={message.subject} /></strong>
            <p><BilingualText value={message.body} /></p>
            <small><BilingualText value={labelFor(message.fromId)} /> · {new Date(message.sentAt).toLocaleString()}</small>
            <PortalStatus label={message.readAt ? bi('Read', 'مقروءة') : bi('Delivered record', 'سجل تسليم')} tone={message.readAt ? 'active' : 'neutral'} />
          </article>
        ))}</div> : <div className="enterprise-empty"><UserRound size={24} /><h3><BilingualText value={bi('No coach messages in scope', 'لا توجد رسائل للمدرب ضمن النطاق')} /></h3><p><BilingualText value={bi('No provider message currently includes the active coach as sender or recipient.', 'لا توجد رسالة في مصدر البيانات تتضمن المدرب النشط كمرسل أو مستلم حاليًا.')} /></p></div>}
      </PortalSection>
      <PortalPreviewCard title={bi('Message write boundary', 'حدود كتابة الرسائل')} description={bi('Send and Reply controls are intentionally absent until the gateway exposes a production-safe coach messaging mutation.', 'تمت إزالة عناصر الإرسال والرد عمدًا حتى توفر بوابة البيانات عملية مراسلة آمنة للمدرب في الإنتاج.')} />
    </div>
  );
}
