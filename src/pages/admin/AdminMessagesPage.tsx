import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, MessageSquare, MailOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useMessages, useCreateMessage } from '../../admin/data/adminHooks';

const emptyMessageDraft = { fromId: '', toIds: '', subjectEn: '', subjectAr: '', bodyEn: '', bodyAr: '', status: 'sent' };

export function AdminMessagesPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(emptyMessageDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading } = useMessages({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateMessage();

  const messages = useMemo(() => data?.items.filter(msg => {
    const matchesQuery = `${msg.subject.en} ${msg.subject.ar} ${msg.id} ${msg.fromId} ${msg.toIds.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'all' || msg.status === status);
  }) ?? [], [data, query, status]);

  const setField = (field: keyof typeof emptyMessageDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeForm = () => { if (!createLoading) setShowForm(false); };
  const submitMessage = async () => {
    const recipients = draft.toIds.split(',').map(value => value.trim()).filter(Boolean);
    if (!draft.fromId.trim() || recipients.length === 0 || !draft.subjectEn.trim() || !draft.subjectAr.trim() || !draft.bodyEn.trim() || !draft.bodyAr.trim()) {
      setFormError('From, at least one recipient, subject, and body are required. | المرسل ومستلم واحد على الأقل والموضوع والمحتوى مطلوبة.');
      return;
    }
    setFormError('');
    await create({
      fromId: draft.fromId.trim(),
      toIds: recipients,
      subject: { en: draft.subjectEn.trim(), ar: draft.subjectAr.trim() },
      body: { en: draft.bodyEn.trim(), ar: draft.bodyAr.trim() },
      sentAt: new Date().toISOString(),
      status: draft.status as 'sent' | 'delivered' | 'read' | 'failed',
      readAt: draft.status === 'read' ? new Date().toISOString() : undefined,
    });
    setDraft(emptyMessageDraft);
    setShowForm(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Communications', 'التواصل')} title={bi('Messages', 'الرسائل')} description={bi('Manage Preview internal messages with persistent browser records.', 'أدر رسائل المعاينة الداخلية كسجلات محفوظة في المتصفح.')} actions={<button className="admin-primary-button" onClick={() => { setFormError(''); setShowForm(true); }}><Plus /><BilingualText value={bi('Compose Message', 'كتابة رسالة')} /></button>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Message saved to Preview data. No external delivery or production backend write was claimed.', 'تم حفظ الرسالة في بيانات المعاينة. لا يتم الادعاء بإرسال خارجي أو كتابة في نظام إنتاجي.')} /></div>}
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Messages | البحث عن الرسائل</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Messages | البحث عن الرسائل" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="sent">Sent | مرسل</option><option value="delivered">Delivered | تم التسليم</option><option value="read">Read | مقروء</option><option value="failed">Failed | فشل</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${messages.length} preview records`, `${messages.length} سجلات معاينة`)} /></span>
      </div>
    </section>
    {loading ? <div className="enterprise-empty" role="status"><MessageSquare size={28} /><BilingualText value={bi('Loading messages…', 'جارٍ تحميل الرسائل…')} /></div> : <>
      <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Messages Directory | دليل الرسائل</caption><thead><tr>{[bi('Message', 'الرسالة'), bi('From', 'من'), bi('To', 'إلى'), bi('Status', 'الحالة'), bi('Sent', 'تاريخ الإرسال'), bi('Read', 'تاريخ القراءة'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{messages.map(msg => <tr key={msg.id}><td><MailOpen size={16} /><BilingualText value={msg.subject} /></td><td><code>{msg.fromId}</code></td><td>{msg.toIds.join(', ')}</td><td><StatusBadge active={msg.status === 'read'} /></td><td>{new Date(msg.sentAt).toLocaleDateString()}</td><td>{msg.readAt ? new Date(msg.readAt).toLocaleDateString() : <BilingualText value={bi('Unread', 'غير مقروء')} />}</td><td><Link className="row-action" to={`/admin/messages/${msg.id}`} aria-label={`Open ${msg.subject.en} | فتح ${msg.subject.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
      <section className="player-mobile-list">{messages.map(msg => <article className="player-mobile-card" key={msg.id}><div className="mobile-player-head"><MessageSquare size={24} /><div><BilingualText value={msg.subject} /><StatusBadge active={msg.status === 'read'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('From', 'من')} /><code>{msg.fromId}</code></span><span><BilingualText value={bi('To', 'إلى')} />{msg.toIds.join(', ')}</span><span><BilingualText value={bi('Sent', 'تاريخ الإرسال')} />{new Date(msg.sentAt).toLocaleDateString()}</span></div><Link className="admin-link-button" to={`/admin/messages/${msg.id}`}><BilingualText value={bi('Open Message', 'فتح الرسالة')} /><ArrowRight /></Link></article>)}</section>
    </>}
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Compose Message | كتابة رسالة" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Compose Message', 'كتابة رسالة')} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button className="admin-icon-button" onClick={closeForm} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving stores the message in Preview data only; it does not send email, SMS, WhatsApp, or push notifications.', 'الحفظ يخزن الرسالة في بيانات المعاينة فقط؛ ولا يرسل بريدًا أو رسالة نصية أو واتساب أو إشعارًا فوريًا.')} /></div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid">
      <label><BilingualText value={bi('From (user ID)', 'من (معرف المستخدم)')} /><input value={draft.fromId} onChange={e => setField('fromId', e.target.value)} placeholder="admin-user-id" /></label>
      <label><BilingualText value={bi('To (comma-separated user IDs)', 'إلى (معرفات مستخدمين مفصولة بفواصل)')} /><input value={draft.toIds} onChange={e => setField('toIds', e.target.value)} placeholder="user-001, user-002" /></label>
      <label><BilingualText value={bi('Subject (English)', 'الموضوع (إنجليزي)')} /><input value={draft.subjectEn} onChange={e => setField('subjectEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Subject (Arabic)', 'الموضوع (عربي)')} /><input value={draft.subjectAr} onChange={e => setField('subjectAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Body (English)', 'المحتوى (إنجليزي)')} /><textarea rows={4} value={draft.bodyEn} onChange={e => setField('bodyEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Body (Arabic)', 'المحتوى (عربي)')} /><textarea rows={4} value={draft.bodyAr} onChange={e => setField('bodyAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Preview status', 'حالة المعاينة')} /><select value={draft.status} onChange={e => setField('status', e.target.value)}><option value="sent">Sent | مرسل</option><option value="delivered">Delivered | تم التسليم</option><option value="read">Read | مقروء</option><option value="failed">Failed | فشل</option></select></label>
    </div><div className="dialog-actions"><button className="admin-secondary-button" onClick={closeForm} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" onClick={() => void submitMessage()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Message', createLoading ? 'جارٍ الحفظ…' : 'حفظ الرسالة')} /></button></div></section></div>}
  </div>;
}
