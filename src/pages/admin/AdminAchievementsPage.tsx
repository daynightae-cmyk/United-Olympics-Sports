import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, Award } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAchievements, useCreateAchievement, usePlayers, useGroups } from '../../admin/data/adminHooks';

const emptyAchievementDraft = {
  titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', categoryEn: '', categoryAr: '',
  playerId: '', groupId: '', awardedAt: '', status: 'awarded',
};

export function AdminAchievementsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(emptyAchievementDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading } = useAchievements({ page: 1, pageSize: 100 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 500 });
  const { data: groupsData } = useGroups({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreateAchievement();
  const players = playersData.items;
  const groups = groupsData.items;

  const achievements = useMemo(() => data?.items.filter(ach => {
    const player = ach.playerId ? players.find(p => p.id === ach.playerId) : null;
    const matchesQuery = `${ach.title.en} ${ach.title.ar} ${player?.nameEn ?? ''} ${player?.nameAr ?? ''} ${ach.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'all' || ach.category.en.toLowerCase() === category) && (status === 'all' || ach.status === status);
  }) ?? [], [data, query, category, status, players]);
  const categories = useMemo(() => [...new Set(data?.items.map(a => a.category.en) ?? [])], [data]);

  const setField = (field: keyof typeof emptyAchievementDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeForm = () => { if (!createLoading) setShowForm(false); };
  const submitAchievement = async () => {
    if (!draft.titleEn.trim() || !draft.titleAr.trim() || !draft.categoryEn.trim() || !draft.categoryAr.trim() || !draft.awardedAt) {
      setFormError('Title, category, and award date are required. | العنوان والفئة وتاريخ المنح مطلوبة.');
      return;
    }
    setFormError('');
    await create({
      title: { en: draft.titleEn.trim(), ar: draft.titleAr.trim() },
      description: { en: draft.descriptionEn.trim(), ar: draft.descriptionAr.trim() },
      category: { en: draft.categoryEn.trim(), ar: draft.categoryAr.trim() },
      playerId: draft.playerId || undefined,
      groupId: draft.groupId || undefined,
      awardedAt: new Date(`${draft.awardedAt}T00:00:00`).toISOString(),
      status: draft.status as 'awarded' | 'pending' | 'revoked',
    });
    setDraft(emptyAchievementDraft);
    setShowForm(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievements', 'الإنجازات')} description={bi('Manage player and group achievements and awards from Admin gateway records.', 'أدر إنجازات وجوائز اللاعبين والمجموعات من سجلات بوابة الإدارة.')} actions={<button className="admin-primary-button" onClick={() => { setFormError(''); setShowForm(true); }}><Plus /><BilingualText value={bi('Add Achievement', 'إضافة إنجاز')} /></button>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Achievement saved to Preview data. No production backend write was made.', 'تم حفظ الإنجاز في بيانات المعاينة. لم تتم كتابة بيانات في نظام إنتاجي.')} /></div>}
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Achievements | البحث عن الإنجازات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Achievements | البحث عن الإنجازات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Category', 'الفئة')} /><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All Categories | كل الفئات</option>{categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}</select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="awarded">Awarded | ممنوح</option><option value="pending">Pending | قيد الانتظار</option><option value="revoked">Revoked | ملغي</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${achievements.length} preview records`, `${achievements.length} سجلات معاينة`)} /></span>
      </div>
    </section>
    {loading ? <div className="enterprise-empty" role="status"><Award size={28} /><BilingualText value={bi('Loading achievements…', 'جارٍ تحميل الإنجازات…')} /></div> : <>
      <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Achievements Directory | دليل الإنجازات</caption><thead><tr>{[bi('Achievement', 'الإنجاز'), bi('Category', 'الفئة'), bi('Player', 'اللاعب'), bi('Group', 'المجموعة'), bi('Status', 'الحالة'), bi('Awarded', 'تاريخ المنح'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{achievements.map(ach => { const player = ach.playerId ? players.find(p => p.id === ach.playerId) : null; const group = ach.groupId ? groups.find(g => g.id === ach.groupId) : null; return <tr key={ach.id}><td><Award size={16} /><BilingualText value={ach.title} /></td><td><BilingualText value={ach.category} /></td><td>{player ? <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /> : <BilingualText value={bi('—', '—')} />}</td><td>{group ? <BilingualText value={group.name} /> : <BilingualText value={bi('—', '—')} />}</td><td><StatusBadge active={ach.status === 'awarded'} /></td><td>{new Date(ach.awardedAt).toLocaleDateString()}</td><td><Link className="row-action" to={`/admin/achievements/${ach.id}`} aria-label={`Open ${ach.title.en} | فتح ${ach.title.ar}`}><ArrowRight /></Link></td></tr>; })}</tbody></table></section>
      <section className="player-mobile-list">{achievements.map(ach => { const player = ach.playerId ? players.find(p => p.id === ach.playerId) : null; return <article className="player-mobile-card" key={ach.id}><div className="mobile-player-head"><Award size={24} /><div><BilingualText value={ach.title} /><StatusBadge active={ach.status === 'awarded'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Category', 'الفئة')} /><BilingualText value={ach.category} /></span><span><BilingualText value={bi('Player', 'اللاعب')} />{player ? <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /> : <BilingualText value={bi('—', '—')} />}</span><span><BilingualText value={bi('Awarded', 'تاريخ المنح')} />{new Date(ach.awardedAt).toLocaleDateString()}</span></div><Link className="admin-link-button" to={`/admin/achievements/${ach.id}`}><BilingualText value={bi('Open Achievement', 'فتح الإنجاز')} /><ArrowRight /></Link></article>; })}</section>
    </>}
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Achievement | إضافة إنجاز" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Achievement', 'إضافة إنجاز')} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button className="admin-icon-button" onClick={closeForm} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving writes to the browser Preview store only.', 'الحفظ يكتب في مخزن المعاينة بالمتصفح فقط.')} /></div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid">
      <label><BilingualText value={bi('Title (English)', 'العنوان (إنجليزي)')} /><input value={draft.titleEn} onChange={e => setField('titleEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Title (Arabic)', 'العنوان (عربي)')} /><input value={draft.titleAr} onChange={e => setField('titleAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Category (English)', 'الفئة (إنجليزي)')} /><input value={draft.categoryEn} onChange={e => setField('categoryEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Category (Arabic)', 'الفئة (عربي)')} /><input value={draft.categoryAr} onChange={e => setField('categoryAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Description (English)', 'الوصف (إنجليزي)')} /><textarea rows={3} value={draft.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Description (Arabic)', 'الوصف (عربي)')} /><textarea rows={3} value={draft.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Player (optional)', 'اللاعب (اختياري)')} /><select value={draft.playerId} onChange={e => setField('playerId', e.target.value)}><option value="">None | لا شيء</option>{players.map(p => <option key={p.id} value={p.id}>{p.nameEn} | {p.nameAr}</option>)}</select></label>
      <label><BilingualText value={bi('Group (optional)', 'المجموعة (اختياري)')} /><select value={draft.groupId} onChange={e => setField('groupId', e.target.value)}><option value="">None | لا شيء</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name.en} | {g.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Award date', 'تاريخ المنح')} /><input type="date" value={draft.awardedAt} onChange={e => setField('awardedAt', e.target.value)} /></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={e => setField('status', e.target.value)}><option value="awarded">Awarded | ممنوح</option><option value="pending">Pending | قيد الانتظار</option><option value="revoked">Revoked | ملغي</option></select></label>
    </div><div className="dialog-actions"><button className="admin-secondary-button" onClick={closeForm} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" onClick={() => void submitAchievement()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Achievement', createLoading ? 'جارٍ الحفظ…' : 'حفظ الإنجاز')} /></button></div></section></div>}
  </div>;
}
