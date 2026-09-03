import { ArrowRight, Filter, Search, SlidersHorizontal, X, ShieldCheck, Clock, UserRound, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAuditActivity } from '../../admin/data/adminHooks';

export function AdminAuditActivityPage() {
  const [query, setQuery] = useState(''); const [entityType, setEntityType] = useState('all'); const [action, setAction] = useState('all'); const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, loading, params, setParams, refetch } = useAuditActivity({ page: 1, pageSize: 50 });

  const activities = useMemo(() => data?.items.filter(act => {
    const matchesQuery = `${act.action.en} ${act.action.ar} ${act.entityType.en} ${act.entityType.ar} ${act.actorName.en} ${act.actorName.ar} ${act.entityId}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (entityType === 'all' || act.entityType.en.toLowerCase() === entityType) && (action === 'all' || act.action.en.toLowerCase() === action);
  }) ?? [], [data, query, entityType, action]);

  const entityTypes = useMemo(() => [...new Set(data?.items.map(a => a.entityType.en) ?? [])], [data]);
  const actions = useMemo(() => [...new Set(data?.items.map(a => a.action.en) ?? [])], [data]);

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Insights & Governance', 'الرؤى والحوكمة')} title={bi('Audit Activity', 'سجل النشاط')} description={bi('Preview of administrative audit trail for governance and compliance.', 'معاينة لسجل التدقيق الإداري للحوكمة والامتثال.')} />
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Audit Activity | البحث في سجل النشاط</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Audit Activity | البحث في سجل النشاط" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Entity Type', 'نوع الكيان')} /><select value={entityType} onChange={event => setEntityType(event.target.value)}><option value="all">All Types | كل الأنواع</option>{entityTypes.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}</select></label>
        <label><BilingualText value={bi('Action', 'الإجراء')} /><select value={action} onChange={event => setAction(event.target.value)}><option value="all">All Actions | كل الإجراءات</option>{actions.map(a => <option key={a} value={a.toLowerCase()}>{a}</option>)}</select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${activities.length} preview records`, `${activities.length} سجلات تجريبية`)} /></span>
      </div>
    </section>
    <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Audit Activity Directory | دليل سجل النشاط</caption><thead><tr>{[bi('Time', 'الوقت'), bi('Actor', 'الفاعل'), bi('Action', 'الإجراء'), bi('Entity Type', 'نوع الكيان'), bi('Entity ID', 'معرف الكيان'), bi('Details', 'التفاصيل'), bi('IP', 'عنوان IP')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{activities.map(act => <tr key={act.id}><td><Clock size={16} />{new Date(act.timestamp).toLocaleString()}</td><td><UserRound size={16} /><BilingualText value={act.actorName} /></td><td><BilingualText value={act.action} /></td><td><BilingualText value={act.entityType} /></td><td><code>{act.entityId}</code></td><td><BilingualText value={act.details} /></td><td><code>{act.ip || '—'}</code></td></tr>)}</tbody></table></section>
    <section className="player-mobile-list">{activities.map(act => <article className="player-mobile-card" key={act.id}><div className="mobile-player-head"><Activity size={24} /><div><BilingualText value={act.action} /><span className="timestamp">{new Date(act.timestamp).toLocaleString()}</span></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Actor', 'الفاعل')} /><BilingualText value={act.actorName} /></span><span><BilingualText value={bi('Entity', 'الكيان')} /><BilingualText value={act.entityType} /></span><span><BilingualText value={bi('Details', 'التفاصيل')} /><BilingualText value={act.details} /></span></div><Link className="admin-link-button" to={`/admin/audit-activity/${act.id}`}><BilingualText value={bi('View Details', 'عرض التفاصيل')} /><ArrowRight /></Link></article>)}</section>
  </div>;
}