import { Clock, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseStatus, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalMessagesPage() {
  const { parent, children, familyMessages, loading, error } = useParentPortalGatewayData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading && !parent) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family messages…', 'جارٍ تحميل رسائل الأسرة…')} /></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Message provider unavailable', 'موفر بيانات الرسائل غير متاح')} /></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.', 'سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  const selected = familyMessages.find((message) => message.id === selectedId) ?? familyMessages[0] ?? null;
  const familyIds = new Set([parent.id, ...children.map((child) => child.id)]);
  const relatedChildren = (toIds: string[], fromId: string) => children.filter((child) => toIds.includes(child.id) || fromId === child.id);

  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Parent Portal · Messages', 'بوابة ولي الأمر · الرسائل')}
      title={bi('Messages', 'الرسائل')}
      description={bi('Read-only messages from the shared provider that are addressed to this parent or a linked athlete.', 'رسائل للقراءة فقط من موفر البيانات المشترك وموجهة إلى ولي الأمر الحالي أو أحد اللاعبين المرتبطين.')}
      actions={<PreviewNotice />}
    />

    <section className="messages-layout" aria-label="Messages">
      <aside className="messages-sidebar" aria-label="Message threads">
        <div className="messages-header">
          <h3><BilingualText value={bi('Provider records', 'سجلات موفر البيانات')} /></h3>
          <span className="parent-scope"><ShieldCheck size={12}/>{familyMessages.length}</span>
        </div>
        <div className="messages-list">
          {familyMessages.length ? familyMessages.map((message) => {
            const childLinks = relatedChildren(message.toIds, message.fromId);
            const incoming = !familyIds.has(message.fromId);
            return <button
              type="button"
              key={message.id}
              className={`message-thread ${selected?.id === message.id ? 'active' : ''}`}
              onClick={() => setSelectedId(message.id)}
              style={{ width: '100%', textAlign: 'start', border: 0 }}
            >
              <div className="thread-avatar"><span className={incoming ? 'avatar-admin' : 'avatar-coach'} aria-hidden="true">{incoming ? 'I' : 'F'}</span></div>
              <div className="thread-content">
                <div className="thread-header"><h4>{message.fromId}</h4><time>{new Date(message.sentAt).toLocaleDateString('en-GB')}</time></div>
                <p className="thread-subject"><BilingualText value={message.subject} /></p>
                <p className="thread-preview"><BilingualText value={message.body} /></p>
                {childLinks.map((child) => <span className="thread-child" key={child.id}><Users size={10}/><BilingualText value={{ en: child.nameEn, ar: child.nameAr }} /></span>)}
              </div>
            </button>;
          }) : <div style={{ padding: 18 }}><BilingualText value={bi('No family-addressed provider messages.', 'لا توجد رسائل لدى موفر البيانات موجهة لهذه الأسرة.')} /></div>}
        </div>
      </aside>

      <main className="messages-main" aria-label="Message content">
        {selected ? <article className="message-thread-view">
          <header className="thread-view-header">
            <div className="thread-view-sender"><div className="sender-avatar"><span className="avatar-admin" aria-hidden="true">M</span></div><div><h3>{selected.fromId}</h3><small><BilingualText value={bi('Provider sender ID', 'معرف المرسل لدى الموفر')} /></small></div></div>
            <div className="thread-view-meta"><time><Clock size={14}/>{new Date(selected.sentAt).toLocaleString('en-GB')}</time><EnterpriseStatus label={bi(selected.status, selected.status === 'read' ? 'مقروء' : selected.status === 'delivered' ? 'تم التسليم' : selected.status === 'sent' ? 'مرسل' : 'فشل')} tone={selected.status === 'failed' ? 'danger' : selected.status === 'read' ? 'active' : 'info'} /></div>
          </header>
          <div className="thread-view-subject"><BilingualText value={selected.subject} /></div>
          <div className="thread-view-body"><p><BilingualText value={selected.body} /></p><p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 13 }}><BilingualText value={bi(`Recipients: ${selected.toIds.join(', ')}`, `المستلمون: ${selected.toIds.join('، ')}`)} /></p></div>
          <footer className="thread-view-footer"><div className="parent-truth"><ShieldCheck size={13}/><BilingualText value={bi('Compose and Reply are unavailable until a Parent-safe recipient and delivery contract is connected. No send action is simulated.', 'الإنشاء والرد غير متاحين حتى يتم ربط عقد مستلمين وتسليم آمن لولي الأمر. لا تتم محاكاة أي عملية إرسال.')} /></div></footer>
        </article> : <div className="messages-empty"><MessageSquare size={64} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} /><h3><BilingualText value={bi('No Family Messages', 'لا توجد رسائل للأسرة')} /></h3><p><BilingualText value={bi('Only provider records addressed to this parent or linked athletes appear here.', 'تظهر هنا فقط سجلات موفر البيانات الموجهة لولي الأمر أو اللاعبين المرتبطين.')} /></p></div>}
      </main>
    </section>
  </div>;
}
