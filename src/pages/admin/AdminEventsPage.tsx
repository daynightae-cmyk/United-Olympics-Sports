import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../admin/data/adminHooks';

export function AdminEventsPage() {
  const [query, setQuery] = useState(''); const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [showForm, setShowForm] = useState(false); const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, loading, params, setParams, refetch } = useEvents({ page: 1, pageSize: 20 });
  const { create, loading: createLoading } = useCreateEvent();
  const { update, loading: updateLoading } = useUpdateEvent();
  const { delete: deleteFn, loading: deleteLoading } = useDeleteEvent();

  const events = useMemo(() => data?.items.filter(event => {
    const matchesQuery = `${event.title.en} ${event.title.ar} ${event.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (type === 'all' || event.type.en.toLowerCase() === type) && (status === 'all' || event.status === status);
  }) ?? [], [data, query, type, status]);

  const types = useMemo(() => [...new Set(data?.items.map(e => e.type.en) ?? [])], [data]);

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Events', 'الفعاليات')} description={bi('Preview of tournaments, camps and special events.', 'معاينة للبطولات والمعسكرات والفعاليات الخاصة.')} actions={<button className="admin-primary-button" onClick={() => setShowForm(true)}><Plus /><BilingualText value={bi('Add Event', 'إضافة فعالية')} /></button>} />
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Events | البحث عن الفعاليات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Events | البحث عن الفعاليات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Type', 'النوع')} /><select value={type} onChange={event => setType(event.target.value)}><option value="all">All Types | كل الأنواع</option>{types.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}</select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="scheduled">Scheduled | مجدول</option><option value="ongoing">Ongoing | جاري</option><option value="completed">Completed | مكتمل</option><option value="cancelled">Cancelled | ملغي</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${events.length} preview records`, `${events.length} سجلات تجريبية`)} /></span>
      </div>
    </section>
    <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Events Directory | دليل الفعاليات</caption><thead><tr>{[bi('Event', 'الفعالية'), bi('Type', 'النوع'), bi('Status', 'الحالة'), bi('Start Date', 'تاريخ البداية'), bi('End Date', 'تاريخ النهاية'), bi('Location', 'الموقع'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{events.map(event => <tr key={event.id}><td><CalendarDays size={16} /><BilingualText value={event.title} /></td><td><BilingualText value={event.type} /></td><td><StatusBadge active={event.status === 'ongoing'} /></td><td>{new Date(event.startDate).toLocaleDateString()}</td><td>{new Date(event.endDate).toLocaleDateString()}</td><td>{event.location && <BilingualText value={event.location} />}</td><td><Link className="row-action" to={`/admin/events/${event.id}`} aria-label={`Open ${event.title.en} | فتح ${event.title.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
    <section className="player-mobile-list">{events.map(event => <article className="player-mobile-card" key={event.id}><div className="mobile-player-head"><CalendarDays size={24} /><div><BilingualText value={event.title} /><StatusBadge active={event.status === 'ongoing'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Type', 'النوع')} /><BilingualText value={event.type} /></span><span><BilingualText value={bi('Date', 'التاريخ')} />{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span><span><BilingualText value={bi('Location', 'الموقع')} />{event.location && <BilingualText value={event.location} />}</span></div><Link className="admin-link-button" to={`/admin/events/${event.id}`}><BilingualText value={bi('Open Event', 'فتح الفعالية')} /><ArrowRight /></Link></article>)}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Event Preview Form | نموذج معاينة إضافة فعالية" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Event', 'إضافة فعالية')} /><small><BilingualText value={bi('Local Preview State Only', 'حالة معاينة محلية فقط')} /></small></div><button className="admin-icon-button" onClick={() => setShowForm(false)} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('This form does not save to a database. It prepares the future data-entry experience only.', 'هذا النموذج لا يحفظ في قاعدة بيانات. إنه يجهز تجربة إدخال البيانات المستقبلية فقط.')} /></div><div className="preview-form-grid"><label><BilingualText value={bi('Title', 'العنوان')} /><input placeholder="Event title | عنوان الفعالية" /></label><label><BilingualText value={bi('Type', 'النوع')} /><input placeholder="Tournament, Camp, etc. | بطولة، معسكر، إلخ" /></label><label><BilingualText value={bi('Start Date', 'تاريخ البداية')} /><input type="date" /></label><label><BilingualText value={bi('End Date', 'تاريخ النهاية')} /><input type="date" /></label><label><BilingualText value={bi('Location', 'الموقع')} /><input placeholder="Location | الموقع" /></label><label><BilingualText value={bi('Status', 'الحالة')} /><select><option value="scheduled">Scheduled | مجدول</option><option value="ongoing">Ongoing | جاري</option></select></label></div><button className="admin-secondary-button" onClick={() => setShowForm(false)}><BilingualText value={bi('Close Preview Form', 'إغلاق نموذج المعاينة')} /></button></section></div>}
  </div>;
}