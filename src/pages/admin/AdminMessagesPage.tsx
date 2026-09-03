import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, MessageSquare, Mail, MailOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useMessages, useCreateMessage, useUpdateMessage, useDeleteMessage } from '../../admin/data/adminHooks';

export function AdminMessagesPage() {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const [showForm, setShowForm] = useState(false); const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, loading, params, setParams, refetch } = useMessages({ page: 1, pageSize: 20 });
  const { create, loading: createLoading } = useCreateMessage();
  const { update, loading: updateLoading } = useUpdateMessage();
  const { delete: deleteFn, loading: deleteLoading } = useDeleteMessage();

  const messages = useMemo(() => data?.items.filter(msg => {
    const matchesQuery = `${msg.subject.en} ${msg.subject.ar} ${msg.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'all' || msg.status === status);
  }) ?? [], [data, query, status]);

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Communications', 'التواصل')} title={bi('Messages', 'الرسائل')} description={bi('Preview of internal messaging system.', 'معاينة لنظام المراسلة الداخلي.')} actions={<button className="admin-primary-button" onClick={() => setShowForm(true)}><Plus /><BilingualText value={bi('Compose Message', 'كتابة رسالة')} /></button>} />
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Messages | البحث عن الرسائل</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Messages | البحث عن الرسائل" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="sent">Sent | مرسل</option><option value="delivered">Delivered | تم التسليم</option><option value="read">Read | مقروء</option><option value="failed">Failed | فشل</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${messages.length} preview records`, `${messages.length} سجلات تجريبية`)} /></span>
      </div>
    </section>
    <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Messages Directory | دليل الرسائل</caption><thead><tr>{[bi('Message', 'الرسالة'), bi('From', 'من'), bi('To', 'إلى'), bi('Status', 'الحالة'), bi('Sent', 'تاريخ الإرسال'), bi('Read', 'تاريخ القراءة'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{messages.map(msg => <tr key={msg.id}><td><MailOpen size={16} /><BilingualText value={msg.subject} /></td><td><code>{msg.fromId}</code></td><td>{msg.toIds.join(', ')}</td><td><StatusBadge active={msg.status === 'read'} /></td><td>{new Date(msg.sentAt).toLocaleDateString()}</td><td>{msg.readAt ? new Date(msg.readAt).toLocaleDateString() : <BilingualText value={bi('Unread', 'غير مقروء')} />}</td><td><Link className="row-action" to={`/admin/messages/${msg.id}`} aria-label={`Open ${msg.subject.en} | فتح ${msg.subject.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
    <section className="player-mobile-list">{messages.map(msg => <article className="player-mobile-card" key={msg.id}><div className="mobile-player-head"><MessageSquare size={24} /><div><BilingualText value={msg.subject} /><StatusBadge active={msg.status === 'read'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('From', 'من')} /><code>{msg.fromId}</code></span><span><BilingualText value={bi('To', 'إلى')} />{msg.toIds.join(', ')}</span><span><BilingualText value={bi('Sent', 'تاريخ الإرسال')} />{new Date(msg.sentAt).toLocaleDateString()}</span></div><Link className="admin-link-button" to={`/admin/messages/${msg.id}`}><BilingualText value={bi('Open Message', 'فتح الرسالة')} /><ArrowRight /></Link></article>)}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Compose Message Preview Form | نموذج معاينة كتابة رسالة" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Compose Message', 'كتابة رسالة')} /><small><BilingualText value={bi('Local Preview State Only', 'حالة معاينة محلية فقط')} /></small></div><button className="admin-icon-button" onClick={() => setShowForm(false)} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('This form does not save to a database. It prepares the future data-entry experience only.', 'هذا النموذج لا يحفظ في قاعدة بيانات. إنه يجهز تجربة إدخال البيانات المستقبلية فقط.')} /></div><div className="preview-form-grid"><label><BilingualText value={bi('To (user IDs)', 'إلى (معرفات المستخدمين)')} /><input placeholder="user-001, user-002" /></label><label><BilingualText value={bi('Subject', 'الموضوع')} /><input placeholder="Message subject | موضوع الرسالة" /></label><label><BilingualText value={bi('Body', 'المحتوى')} /><textarea placeholder="Message body | محتوى الرسالة" rows={4} /></label></div><button className="admin-secondary-button" onClick={() => setShowForm(false)}><BilingualText value={bi('Close Preview Form', 'إغلاق نموذج المعاينة')} /></button></section></div>}
  </div>;
}