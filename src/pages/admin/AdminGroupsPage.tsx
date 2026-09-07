import { useMemo, useState } from 'react';
import { ArrowRight, Dumbbell, FolderCog, Plus, Search, ShieldCheck, UsersRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreateGroup, useGroups, usePrograms, useSports } from '../../admin/data/adminHooks';
import { PageHeader, StatCard, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const emptyDraft = { nameEn: '', nameAr: '', sportId: '', ageEn: '', ageAr: '', levelEn: '', levelAr: '', programId: '' };

export function AdminGroupsPage() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data: groupResult, loading, error } = useGroups({ page: 1, pageSize: 100 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: programResult } = usePrograms({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateGroup();
  const groups = groupResult.items;
  const sports = sportResult.items;
  const programs = programResult.items;

  const filteredGroups = useMemo(() => groups.filter(group => {
    const sport = sports.find(item => item.id === group.sportId);
    const haystack = `${group.name.en} ${group.name.ar} ${group.id} ${sport?.name.en ?? ''} ${sport?.name.ar ?? ''}`.toLowerCase();
    return (sportFilter === 'all' || group.sportId === sportFilter) && haystack.includes(query.trim().toLowerCase());
  }), [groups, query, sportFilter, sports]);

  const linkedPlayers = groups.reduce((total, group) => total + group.playerCount, 0);
  const coachRefs = groups.reduce((total, group) => total + group.coachCount, 0);
  const programRefs = new Set(groups.flatMap(group => group.programIds)).size;

  const setDraftField = (field: keyof typeof emptyDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const submit = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim() || !draft.sportId || !draft.ageEn.trim() || !draft.ageAr.trim() || !draft.levelEn.trim() || !draft.levelAr.trim()) {
      setFormError('Names, sport, age group and level are required. | الاسم والرياضة والفئة العمرية والمستوى مطلوبة.');
      return;
    }
    setFormError('');
    await create({
      name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() },
      sportId: draft.sportId,
      ageGroup: { en: draft.ageEn.trim(), ar: draft.ageAr.trim() },
      level: { en: draft.levelEn.trim(), ar: draft.levelAr.trim() },
      playerCount: 0,
      coachCount: 0,
      programIds: draft.programId ? [draft.programId] : [],
      status: 'active',
    });
    setDraft(emptyDraft);
    setShowCreate(false);
    setSavedNotice(true);
  };

  return <div className="admin-page groups-workspace">
    <PageHeader
      icon={Dumbbell}
      eyebrow={bi('Training Operations', 'عمليات التدريب')}
      title={bi('Training Groups / Teams', 'الفرق / مجموعات التدريب')}
      description={bi('Manage sport-specific groups, linked rosters, programs and coaching coverage through the Admin data gateway.', 'أدر المجموعات الخاصة بكل رياضة والقوائم والبرامج وتغطية التدريب عبر بوابة بيانات الإدارة.')}
      actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => setShowCreate(true)}><Plus size={16} /><BilingualText value={bi('Add Group', 'إضافة مجموعة')} /></button></div>}
    />

    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Group saved to the browser preview store.', 'تم حفظ المجموعة في مخزن المعاينة بالمتصفح.')} /></div>}

    {showCreate && <section className="admin-panel" aria-label="Create training group">
      <div className="panel-heading"><BilingualText value={bi('Create Training Group', 'إنشاء مجموعة تدريب')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div>
      <div className="admin-form-grid">
        <label><BilingualText value={bi('Name (English)', 'الاسم بالإنجليزية')} /><input value={draft.nameEn} onChange={e => setDraftField('nameEn', e.target.value)} /></label>
        <label><BilingualText value={bi('Name (Arabic)', 'الاسم بالعربية')} /><input value={draft.nameAr} onChange={e => setDraftField('nameAr', e.target.value)} /></label>
        <label><BilingualText value={bi('Sport', 'الرياضة')} /><select value={draft.sportId} onChange={e => setDraftField('sportId', e.target.value)}><option value="">Select sport | اختر الرياضة</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label>
        <label><BilingualText value={bi('Program', 'البرنامج')} /><select value={draft.programId} onChange={e => setDraftField('programId', e.target.value)}><option value="">No program | بدون برنامج</option>{programs.filter(program => !draft.sportId || program.sportId === draft.sportId).map(program => <option key={program.id} value={program.id}>{program.name.en} | {program.name.ar}</option>)}</select></label>
        <label><BilingualText value={bi('Age Group (English)', 'الفئة العمرية بالإنجليزية')} /><input value={draft.ageEn} onChange={e => setDraftField('ageEn', e.target.value)} /></label>
        <label><BilingualText value={bi('Age Group (Arabic)', 'الفئة العمرية بالعربية')} /><input value={draft.ageAr} onChange={e => setDraftField('ageAr', e.target.value)} /></label>
        <label><BilingualText value={bi('Level (English)', 'المستوى بالإنجليزية')} /><input value={draft.levelEn} onChange={e => setDraftField('levelEn', e.target.value)} /></label>
        <label><BilingualText value={bi('Level (Arabic)', 'المستوى بالعربية')} /><input value={draft.levelAr} onChange={e => setDraftField('levelAr', e.target.value)} /></label>
      </div>
      {formError && <p role="alert" className="form-error">{formError}</p>}
      <div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Group', 'حفظ المجموعة')} /></button></div>
    </section>}

    <section className="admin-stat-grid compact">
      <StatCard label={bi('Groups', 'المجموعات')} value={groups.length} icon={UsersRound} />
      <StatCard label={bi('Linked Players', 'اللاعبون المرتبطون')} value={linkedPlayers} icon={UsersRound} />
      <StatCard label={bi('Coach Assignments', 'تكليفات المدربين')} value={coachRefs} icon={ShieldCheck} />
      <StatCard label={bi('Program Links', 'روابط البرامج')} value={programRefs} icon={FolderCog} />
    </section>

    <section className="player-filter-bar groups-filter-bar" aria-label="Group filters | فلاتر المجموعات">
      <label className="filter-search"><Search /><span className="sr-only">Search groups | البحث في المجموعات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search groups... | البحث في المجموعات..." /></label>
      <label className="groups-sport-filter"><BilingualText value={bi('Sport', 'الرياضة')} /><select value={sportFilter} onChange={event => setSportFilter(event.target.value)}><option value="all">All Sports | كل الرياضات</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label>
      <span className="result-count"><BilingualText value={bi(`${filteredGroups.length} groups shown`, `عرض ${filteredGroups.length} مجموعات`)} /></span>
    </section>

    <section className="groups-table-shell" aria-label="Training groups table | جدول مجموعات التدريب" aria-busy={loading}>
      <div className="groups-table-heading"><div><BilingualText value={bi('Group Directory', 'دليل المجموعات')} /><small><BilingualText value={bi('Counts are derived from gateway relationships.', 'الأعداد مشتقة من علاقات بوابة البيانات.')} /></small></div></div>
      {loading ? <div className="groups-empty" role="status"><BilingualText value={bi('Loading groups…', 'جارٍ تحميل المجموعات…')} /></div> : error ? <div className="groups-empty" role="alert">{error.message}</div> : <>
        <div className="groups-desktop-table"><table className="player-table groups-table"><thead><tr>
          <th><BilingualText value={bi('Group / Code', 'المجموعة / الرمز')} /></th><th><BilingualText value={bi('Sport', 'الرياضة')} /></th><th><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></th><th><BilingualText value={bi('Level', 'المستوى')} /></th><th><BilingualText value={bi('Coaches', 'المدربون')} /></th><th><BilingualText value={bi('Roster', 'القائمة')} /></th><th><BilingualText value={bi('Programs', 'البرامج')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th><th><BilingualText value={bi('Actions', 'الإجراءات')} /></th>
        </tr></thead><tbody>{filteredGroups.map(group => { const sport = sports.find(item => item.id === group.sportId); return <tr key={group.id}>
          <td><strong><BilingualText value={group.name} /></strong><small className="mono">{group.id}</small></td><td>{sport ? <BilingualText value={sport.name} /> : group.sportId}</td><td><BilingualText value={group.ageGroup} /></td><td><span className="groups-level"><BilingualText value={group.level} /></span></td><td>{group.coachCount}</td><td><strong>{group.playerCount}</strong></td><td>{group.programIds.length}</td><td><StatusBadge active={group.status === 'active'} /></td><td><Link className="row-action" to={`/admin/sports/${group.sportId}/groups/${group.id}`} aria-label={`Open ${group.name.en} | فتح ${group.name.ar}`}><ArrowRight /></Link></td>
        </tr>; })}</tbody></table></div>
        <div className="groups-mobile-list">{filteredGroups.map(group => { const sport = sports.find(item => item.id === group.sportId); return <article key={group.id} className="group-mobile-card"><header><div><strong><BilingualText value={group.name} /></strong><small className="mono">{group.id}</small></div><StatusBadge active={group.status === 'active'} /></header><dl><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <BilingualText value={sport.name} /> : group.sportId}</dd></div><div><dt><BilingualText value={bi('Roster', 'القائمة')} /></dt><dd>{group.playerCount}</dd></div><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{group.coachCount}</dd></div></dl><Link className="admin-link-button" to={`/admin/sports/${group.sportId}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /><ArrowRight /></Link></article>; })}</div>
        {!filteredGroups.length && <div className="groups-empty"><Search /><BilingualText value={bi('No groups match these filters.', 'لا توجد مجموعات تطابق هذه الفلاتر.')} /></div>}
      </>}
    </section>
  </div>;
}
