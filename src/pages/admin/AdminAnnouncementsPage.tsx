import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, Megaphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAnnouncements, useCreateAnnouncement } from '../../admin/data/adminHooks';

const emptyAnnouncementDraft = {
  titleEn: '', titleAr: '', bodyEn: '', bodyAr: '', audienceEn: '', audienceAr: '', priority: 'normal', status: 'draft',
};

export function AdminAnnouncementsPage() {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(emptyAnnouncementDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading } = useAnnouncements({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateAnnouncement();

  const announcements = useMemo(() => data?.items.filter(ann => {
    const matchesQuery = `${ann.title.en} ${ann.title.ar} ${ann.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (priority === 'all' || ann.priority === priority) && (status === 'all' || ann.status === status);
  }) ?? [], [data, query, priority, status]);

  const setField = (field: keyof typeof emptyAnnouncementDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeForm = () => { if (!createLoading) setShowForm(false); };
  const submitAnnouncement = async () => {
    if (!draft.titleEn.trim() || !draft.titleAr.trim() || !draft.bodyEn.trim() || !draft.bodyAr.trim() || !draft.audienceEn.trim() || !draft.audienceAr.trim()) {
      setFormError('Title, body, and audience are required in both languages. | العنوان والمحتوى والجمهور مطلوبة باللغتين.');
      return;
    }
    setFormError('');
    await create({
      title: { en: draft.titleEn.trim(), ar: draft.titleAr.trim() },
      body: { en: draft.bodyEn.trim(), ar: draft.bodyAr.trim() },
      audience: { en: draft.audienceEn.trim(), ar: draft.audienceAr.trim() },
      priority: draft.priority as 'low' | 'normal' | 'high' | 'urgent',
      status: draft.status as 'draft' | 'published' | 'archived',
      publishedAt: draft.status === 'published' ? new Date().toISOString() : undefined,
    });
    setDraft(emptyAnnouncementDraft);
    setShowForm(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Communications', 'التواصل')} title={bi('Announcements', 'الإعلانات')} description={bi('Manage system-wide announcements and notices in Preview data.', 'أدر الإعلانات والتنبيهات على مستوى النظام في بيانات المعاينة.')} actions={<button className="admin-primary-button" onClick={() => { setFormError(''); setShowForm(true); }}><Plus /><BilingualText value={bi('Add Announcement', 'إضافة إعلان')} /></button>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Announcement saved to Preview data. No production backend write was made.', 'تم حفظ الإعلان في بيانات المعاينة. لم تتم كتابة بيانات في نظام إنتاجي.')} /></div>}
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Announcements | البحث عن الإعلانات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Announcements | البحث عن الإعلانات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Priority', 'الأولوية')} /><select value={priority} onChange={event => setPriority(event.target.value)}><option value="all">All Priorities | كل الأولويات</option><option value="low">Low | منخفض</option><option value="normal">Normal | عادي</option><option value="high">High | عالي</option><option value="urgent">Urgent | عاجل</option></select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="draft">Draft | مسودة</option><option value="published">Published | منشور</option><option value="archived">Archived | مؤرشف</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${announcements.length} preview records`, `${announcements.length} سجلات معاينة`)} /></span>
      </div>
    </section>
    {loading ? <div className="enterprise-empty" role="status"><Megaphone size={28} /><BilingualText value={bi('Loading announcements…', 'جارٍ تحميل الإعلانات…')} /></div> : <>
      <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Announcements Directory | دليل الإعلانات</caption><thead><tr>{[bi('Announcement', 'الإعلان'), bi('Priority', 'الأولوية'), bi('Audience', 'الجمهور'), bi('Status', 'الحالة'), bi('Published', 'تاريخ النشر'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{announcements.map(ann => <tr key={ann.id}><td><Megaphone size={16} /><BilingualText value={ann.title} /></td><td><span className={`priority-badge priority-${ann.priority}`}><BilingualText value={{ en: ann.priority, ar: ann.priority }} /></span></td><td><BilingualText value={ann.audience} /></td><td><StatusBadge active={ann.status === 'published'} /></td><td>{ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : <BilingualText value={bi('Not published', 'غير منشور')} />}</td><td><Link className="row-action" to={`/admin/announcements/${ann.id}`} aria-label={`Open ${ann.title.en} | فتح ${ann.title.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
      <section className="player-mobile-list">{announcements.map(ann => <article className="player-mobile-card" key={ann.id}><div className="mobile-player-head"><Megaphone size={24} /><div><BilingualText value={ann.title} /><StatusBadge active={ann.status === 'published'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Priority', 'الأولوية')} /><span className={`priority-badge priority-${ann.priority}`}><BilingualText value={{ en: ann.priority, ar: ann.priority }} /></span></span><span><BilingualText value={bi('Audience', 'الجمهور')} /><BilingualText value={ann.audience} /></span><span><BilingualText value={bi('Published', 'تاريخ النشر')} />{ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : <BilingualText value={bi('Not published', 'غير منشور')} />}</span></div><Link className="admin-link-button" to={`/admin/announcements/${ann.id}`}><BilingualText value={bi('Open Announcement', 'فتح الإعلان')} /><ArrowRight /></Link></article>)}</section>
    </>}
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Announcement | إضافة إعلان" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Announcement', 'إضافة إعلان')} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button className="admin-icon-button" onClick={closeForm} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving writes to the browser Preview store only.', 'الحفظ يكتب في مخزن المعاينة بالمتصفح فقط.')} /></div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid">
      <label><BilingualText value={bi('Title (English)', 'العنوان (إنجليزي)')} /><input value={draft.titleEn} onChange={e => setField('titleEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Title (Arabic)', 'العنوان (عربي)')} /><input value={draft.titleAr} onChange={e => setField('titleAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Body (English)', 'المحتوى (إنجليزي)')} /><textarea rows={4} value={draft.bodyEn} onChange={e => setField('bodyEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Body (Arabic)', 'المحتوى (عربي)')} /><textarea rows={4} value={draft.bodyAr} onChange={e => setField('bodyAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Audience (English)', 'الجمهور (إنجليزي)')} /><input value={draft.audienceEn} onChange={e => setField('audienceEn', e.target.value)} placeholder="All Parents" /></label>
      <label><BilingualText value={bi('Audience (Arabic)', 'الجمهور (عربي)')} /><input value={draft.audienceAr} onChange={e => setField('audienceAr', e.target.value)} placeholder="جميع أولياء الأمور" /></label>
      <label><BilingualText value={bi('Priority', 'الأولوية')} /><select value={draft.priority} onChange={e => setField('priority', e.target.value)}><option value="low">Low | منخفض</option><option value="normal">Normal | عادي</option><option value="high">High | عالي</option><option value="urgent">Urgent | عاجل</option></select></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={e => setField('status', e.target.value)}><option value="draft">Draft | مسودة</option><option value="published">Published | منشور</option><option value="archived">Archived | مؤرشف</option></select></label>
    </div><div className="dialog-actions"><button className="admin-secondary-button" onClick={closeForm} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" onClick={() => void submitAnnouncement()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Announcement', createLoading ? 'جارٍ الحفظ…' : 'حفظ الإعلان')} /></button></div></section></div>}
  </div>;
}
