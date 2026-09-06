import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useEvents, useCreateEvent } from '../../admin/data/adminHooks';

const emptyEventDraft = {
  titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', typeEn: '', typeAr: '',
  startDate: '', endDate: '', locationEn: '', locationAr: '', status: 'scheduled',
};

export function AdminEventsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(emptyEventDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading } = useEvents({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateEvent();

  const events = useMemo(() => data?.items.filter(event => {
    const matchesQuery = `${event.title.en} ${event.title.ar} ${event.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (type === 'all' || event.type.en.toLowerCase() === type) && (status === 'all' || event.status === status);
  }) ?? [], [data, query, type, status]);
  const types = useMemo(() => [...new Set(data?.items.map(e => e.type.en) ?? [])], [data]);

  const setField = (field: keyof typeof emptyEventDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeForm = () => { if (!createLoading) setShowForm(false); };
  const submitEvent = async () => {
    if (!draft.titleEn.trim() || !draft.titleAr.trim() || !draft.typeEn.trim() || !draft.typeAr.trim() || !draft.startDate || !draft.endDate) {
      setFormError('Title, type, start date, and end date are required in the supported fields. | العنوان والنوع وتاريخا البداية والنهاية مطلوبة.');
      return;
    }
    if (new Date(draft.endDate).getTime() < new Date(draft.startDate).getTime()) {
      setFormError('End date cannot be before start date. | لا يمكن أن يسبق تاريخ النهاية تاريخ البداية.');
      return;
    }
    setFormError('');
    await create({
      title: { en: draft.titleEn.trim(), ar: draft.titleAr.trim() },
      description: { en: draft.descriptionEn.trim(), ar: draft.descriptionAr.trim() },
      type: { en: draft.typeEn.trim(), ar: draft.typeAr.trim() },
      startDate: draft.startDate,
      endDate: draft.endDate,
      location: draft.locationEn.trim() || draft.locationAr.trim() ? { en: draft.locationEn.trim(), ar: draft.locationAr.trim() } : undefined,
      status: draft.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
    });
    setDraft(emptyEventDraft);
    setShowForm(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Events', 'الفعاليات')} description={bi('Manage tournaments, camps and special events in the browser Preview data store.', 'أدر البطولات والمعسكرات والفعاليات الخاصة في مخزن بيانات المعاينة بالمتصفح.')} actions={<button className="admin-primary-button" onClick={() => { setFormError(''); setShowForm(true); }}><Plus /><BilingualText value={bi('Add Event', 'إضافة فعالية')} /></button>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Event saved to Preview data. No production backend write was made.', 'تم حفظ الفعالية في بيانات المعاينة. لم تتم كتابة أي بيانات في نظام إنتاجي.')} /></div>}
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Events | البحث عن الفعاليات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Events | البحث عن الفعاليات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Type', 'النوع')} /><select value={type} onChange={event => setType(event.target.value)}><option value="all">All Types | كل الأنواع</option>{types.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}</select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="scheduled">Scheduled | مجدول</option><option value="ongoing">Ongoing | جاري</option><option value="completed">Completed | مكتمل</option><option value="cancelled">Cancelled | ملغي</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${events.length} preview records`, `${events.length} سجلات معاينة`)} /></span>
      </div>
    </section>
    {loading ? <div className="enterprise-empty" role="status"><CalendarDays size={28} /><BilingualText value={bi('Loading events…', 'جارٍ تحميل الفعاليات…')} /></div> : <>
      <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Events Directory | دليل الفعاليات</caption><thead><tr>{[bi('Event', 'الفعالية'), bi('Type', 'النوع'), bi('Status', 'الحالة'), bi('Start Date', 'تاريخ البداية'), bi('End Date', 'تاريخ النهاية'), bi('Location', 'الموقع'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{events.map(event => <tr key={event.id}><td><CalendarDays size={16} /><BilingualText value={event.title} /></td><td><BilingualText value={event.type} /></td><td><StatusBadge active={event.status === 'ongoing'} /></td><td>{new Date(event.startDate).toLocaleDateString()}</td><td>{new Date(event.endDate).toLocaleDateString()}</td><td>{event.location && <BilingualText value={event.location} />}</td><td><Link className="row-action" to={`/admin/events/${event.id}`} aria-label={`Open ${event.title.en} | فتح ${event.title.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
      <section className="player-mobile-list">{events.map(event => <article className="player-mobile-card" key={event.id}><div className="mobile-player-head"><CalendarDays size={24} /><div><BilingualText value={event.title} /><StatusBadge active={event.status === 'ongoing'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Type', 'النوع')} /><BilingualText value={event.type} /></span><span><BilingualText value={bi('Date', 'التاريخ')} />{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span><span><BilingualText value={bi('Location', 'الموقع')} />{event.location && <BilingualText value={event.location} />}</span></div><Link className="admin-link-button" to={`/admin/events/${event.id}`}><BilingualText value={bi('Open Event', 'فتح الفعالية')} /><ArrowRight /></Link></article>)}</section>
    </>}
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Event | إضافة فعالية" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Event', 'إضافة فعالية')} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button className="admin-icon-button" onClick={closeForm} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving writes to the browser Preview store only.', 'الحفظ يكتب في مخزن المعاينة بالمتصفح فقط.')} /></div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid">
      <label><BilingualText value={bi('Title (English)', 'العنوان (إنجليزي)')} /><input value={draft.titleEn} onChange={e => setField('titleEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Title (Arabic)', 'العنوان (عربي)')} /><input value={draft.titleAr} onChange={e => setField('titleAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Type (English)', 'النوع (إنجليزي)')} /><input value={draft.typeEn} onChange={e => setField('typeEn', e.target.value)} placeholder="Tournament" /></label>
      <label><BilingualText value={bi('Type (Arabic)', 'النوع (عربي)')} /><input value={draft.typeAr} onChange={e => setField('typeAr', e.target.value)} placeholder="بطولة" /></label>
      <label><BilingualText value={bi('Description (English)', 'الوصف (إنجليزي)')} /><textarea rows={3} value={draft.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Description (Arabic)', 'الوصف (عربي)')} /><textarea rows={3} value={draft.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Start Date', 'تاريخ البداية')} /><input type="date" value={draft.startDate} onChange={e => setField('startDate', e.target.value)} /></label>
      <label><BilingualText value={bi('End Date', 'تاريخ النهاية')} /><input type="date" value={draft.endDate} onChange={e => setField('endDate', e.target.value)} /></label>
      <label><BilingualText value={bi('Location (English)', 'الموقع (إنجليزي)')} /><input value={draft.locationEn} onChange={e => setField('locationEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Location (Arabic)', 'الموقع (عربي)')} /><input value={draft.locationAr} onChange={e => setField('locationAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={e => setField('status', e.target.value)}><option value="scheduled">Scheduled | مجدول</option><option value="ongoing">Ongoing | جاري</option><option value="completed">Completed | مكتمل</option><option value="cancelled">Cancelled | ملغي</option></select></label>
    </div><div className="dialog-actions"><button className="admin-secondary-button" onClick={closeForm} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" onClick={() => void submitEvent()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Event', createLoading ? 'جارٍ الحفظ…' : 'حفظ الفعالية')} /></button></div></section></div>}
  </div>;
}
