import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, Medal, Award } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from '../../admin/data/adminHooks';
import { demoPlayers } from '../../data/demo/players';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';

export function AdminAchievementsPage() {
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('all'); const [status, setStatus] = useState('all'); const [showForm, setShowForm] = useState(false); const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, loading, params, setParams, refetch } = useAchievements({ page: 1, pageSize: 20 });
  const { create, loading: createLoading } = useCreateAchievement();
  const { update, loading: updateLoading } = useUpdateAchievement();
  const { delete: deleteFn, loading: deleteLoading } = useDeleteAchievement();

  const achievements = useMemo(() => data?.items.filter(ach => {
    const player = ach.playerId ? demoPlayers.find(p => p.id === ach.playerId) : null;
    const matchesQuery = player ? `${player.nameEn} ${player.nameAr} ${ach.id}`.toLowerCase().includes(query.toLowerCase()) : ach.id.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'all' || ach.category.en.toLowerCase() === category) && (status === 'all' || ach.status === status);
  }) ?? [], [data, query, category, status]);

  const categories = useMemo(() => [...new Set(data?.items.map(a => a.category.en) ?? [])], [data]);

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievements', 'الإنجازات')} description={bi('Preview of player and group achievements and awards.', 'معاينة لإنجازات وجوائز اللاعبين والمجموعات.')} actions={<button className="admin-primary-button" onClick={() => setShowForm(true)}><Plus /><BilingualText value={bi('Add Achievement', 'إضافة إنجاز')} /></button>} />
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Achievements | البحث عن الإنجازات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Achievements | البحث عن الإنجازات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Category', 'الفئة')} /><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All Categories | كل الفئات</option>{categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}</select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="awarded">Awarded | ممنوح</option><option value="pending">Pending | قيد الانتظار</option><option value="revoked">Revoked | ملغي</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${achievements.length} preview records`, `${achievements.length} سجلات تجريبية`)} /></span>
      </div>
    </section>
    <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Achievements Directory | دليل الإنجازات</caption><thead><tr>{[bi('Achievement', 'الإنجاز'), bi('Category', 'الفئة'), bi('Player', 'اللاعب'), bi('Group', 'المجموعة'), bi('Status', 'الحالة'), bi('Awarded', 'تاريخ المنح'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{achievements.map(ach => { const player = ach.playerId ? demoPlayers.find(p => p.id === ach.playerId) : null; const group = ach.groupId ? demoTrainingGroups.find(g => g.id === ach.groupId) : null; return <tr key={ach.id}><td><Award size={16} /><BilingualText value={ach.title} /></td><td><BilingualText value={ach.category} /></td><td>{player && <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />}</td><td>{group && <BilingualText value={group.name} />}</td><td><StatusBadge active={ach.status === 'awarded'} /></td><td>{new Date(ach.awardedAt).toLocaleDateString()}</td><td><Link className="row-action" to={`/admin/achievements/${ach.id}`} aria-label={`Open ${ach.title.en} | فتح ${ach.title.ar}`}><ArrowRight /></Link></td></tr>; })}</tbody></table></section>
    <section className="player-mobile-list">{achievements.map(ach => { const player = ach.playerId ? demoPlayers.find(p => p.id === ach.playerId) : null; const group = ach.groupId ? demoTrainingGroups.find(g => g.id === ach.groupId) : null; return <article className="player-mobile-card" key={ach.id}><div className="mobile-player-head"><Award size={24} /><div><BilingualText value={ach.title} /><StatusBadge active={ach.status === 'awarded'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Category', 'الفئة')} /><BilingualText value={ach.category} /></span><span><BilingualText value={bi('Player', 'اللاعب')} />{player && <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />}</span><span><BilingualText value={bi('Awarded', 'تاريخ المنح')} />{new Date(ach.awardedAt).toLocaleDateString()}</span></div><Link className="admin-link-button" to={`/admin/achievements/${ach.id}`}><BilingualText value={bi('Open Achievement', 'فتح الإنجاز')} /><ArrowRight /></Link></article>; })}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Achievement Preview Form | نموذج معاينة إضافة إنجاز" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Achievement', 'إضافة إنجاز')} /><small><BilingualText value={bi('Local Preview State Only', 'حالة معاينة محلية فقط')} /></small></div><button className="admin-icon-button" onClick={() => setShowForm(false)} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('This form does not save to a database. It prepares the future data-entry experience only.', 'هذا النموذج لا يحفظ في قاعدة بيانات. إنه يجهز تجربة إدخال البيانات المستقبلية فقط.')} /></div><div className="preview-form-grid"><label><BilingualText value={bi('Title', 'العنوان')} /><input placeholder="Achievement title | عنوان الإنجاز" /></label><label><BilingualText value={bi('Category', 'الفئة')} /><input placeholder="Category | الفئة" /></label><label><BilingualText value={bi('Player (optional)', 'اللاعب (اختياري)')} /><select><option value="">None | لا شيء</option>{demoPlayers.map(p => <option key={p.id} value={p.id}>{p.nameEn} | {p.nameAr}</option>)}</select></label><label><BilingualText value={bi('Group (optional)', 'المجموعة (اختياري)')} /><select><option value="">None | لا شيء</option>{demoTrainingGroups.map(g => <option key={g.id} value={g.id}>{g.name.en} | {g.name.ar}</option>)}</select></label></div><button className="admin-secondary-button" onClick={() => setShowForm(false)}><BilingualText value={bi('Close Preview Form', 'إغلاق نموذج المعاينة')} /></button></section></div>}
  </div>;
}