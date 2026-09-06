import { ArrowRight, BarChart3, FolderCog, Plus, ShieldCheck, Trophy, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoaches, useCreateProgram, useCreateSport, useGroups, usePlayers, usePrograms, useSports } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseSelect, EnterpriseStatus, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { UiPreviewState } from '../../components/ui/UiPrimitives';
import { Sports3DIcon } from '../../design/sports3d';
import { getSportPreviewMedia } from '../../data/media';

const knownSportIds = new Set(['football', 'basketball', 'swimming', 'tennis', 'gymnastics', 'martial-arts']);
const emptySportDraft = { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', ageGroupEn: '', ageGroupAr: '', icon: 'trophy' };
const emptyProgramDraft = { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', sportId: '', ageGroupEn: '', ageGroupAr: '', levelEn: '', levelAr: '' };

function ModalShell({ title, onClose, children }: { title: { en: string; ar: string }; onClose: () => void; children: React.ReactNode }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="admin-modal" role="dialog" aria-modal="true" aria-label={`${title.en} | ${title.ar}`} onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={title} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving writes to Preview data in this browser only; it does not claim a production backend write.', 'الحفظ يكتب في بيانات المعاينة بهذا المتصفح فقط؛ ولا يدعي الكتابة في نظام خلفي إنتاجي.')} /></div>{children}</section></div>;
}

export function AdminSportsPage() {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptySportDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading, error } = useSports({ page: 1, pageSize: 200 });
  const { data: groupsData } = useGroups({ page: 1, pageSize: 500 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 1000 });
  const { data: coachesData } = useCoaches({ page: 1, pageSize: 500 });
  const { data: programsData } = usePrograms({ page: 1, pageSize: 500 });
  const { create, loading: createLoading } = useCreateSport();
  const sports = (data?.items ?? []).filter(sport => `${sport.name.en} ${sport.name.ar}`.toLowerCase().includes(query.toLowerCase()));
  const setField = (field: keyof typeof emptySportDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeCreate = () => { if (!createLoading) setShowCreate(false); };
  const submit = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim()) { setFormError('Sport name is required in both languages. | اسم الرياضة مطلوب باللغتين.'); return; }
    setFormError('');
    const ageGroups = draft.ageGroupEn.trim() || draft.ageGroupAr.trim() ? [{ en: draft.ageGroupEn.trim(), ar: draft.ageGroupAr.trim() }] : [];
    await create({ name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() }, description: { en: draft.descriptionEn.trim(), ar: draft.descriptionAr.trim() }, ageGroups, programIds: [], icon: draft.icon.trim() || 'trophy', status: 'active' });
    setDraft(emptySportDraft); setShowCreate(false); setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={Trophy} eyebrow={bi('Sports Management Center', 'مركز إدارة الرياضات')} title={bi('Sports', 'الرياضات')} description={bi('Manage sport identity, programs, groups, coaches and athlete reach from one Admin data source.', 'أدر هوية الرياضة والبرامج والمجموعات والمدربين وانتشار الرياضيين من مصدر بيانات إدارة واحد.')} actions={<div className="admin-header-actions"><PreviewNotice /><button className="admin-primary-button" onClick={() => { setFormError(''); setShowCreate(true); }}><Plus /><BilingualText value={bi('Add Sport', 'إضافة رياضة')} /></button></div>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Sport saved to Preview data.', 'تم حفظ الرياضة في بيانات المعاينة.')} /></div>}
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search sports', 'البحث عن الرياضات')} resultCount={bi(`${sports.length} sports`, `${sports.length} رياضات`)} />
    {loading && <div className="enterprise-panel"><UiPreviewState title={bi('Loading sports', 'جارٍ تحميل الرياضات')} description={bi('Reading the Admin data gateway.', 'جارٍ قراءة بوابة بيانات الإدارة.')} /></div>}
    {error && <div className="enterprise-panel"><UiPreviewState title={bi('Sports unavailable', 'تعذر عرض الرياضات')} description={bi('The Admin data gateway returned an error.', 'أعادت بوابة بيانات الإدارة خطأً.')} /></div>}
    {!loading && !error && <section className="enterprise-grid-3">{sports.map(sport => {
      const groups = groupsData.items.filter(group => group.sportId === sport.id);
      const players = playersData.items.filter(player => player.sportId === sport.id);
      const coaches = coachesData.items.filter(coach => coach.sportIds.includes(sport.id));
      const programs = programsData.items.filter(program => program.sportId === sport.id);
      const media = getSportPreviewMedia(sport.id);
      return <article className="enterprise-panel organization-card" key={sport.id}>{media && <img className="organization-card-media" src={media.url} alt={`${media.altEn} | ${media.altAr}`} />}<div className="organization-card-head"><span className="portal-card-icon">{knownSportIds.has(sport.id) ? <Sports3DIcon sport={sport.id as 'football' | 'basketball' | 'swimming' | 'tennis' | 'gymnastics' | 'martial-arts'} size="sm" decorative /> : <Trophy size={20} />}</span><EnterpriseStatus label={sport.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={sport.status === 'active' ? 'active' : 'muted'} /></div><h2><BilingualText value={sport.name} /></h2><p><BilingualText value={sport.description} /></p><div className="organization-stat-grid"><span><UsersRound size={13} /><BilingualText value={bi('Players', 'اللاعبون')} /><strong>{players.length}</strong></span><span><ShieldCheck size={13} /><BilingualText value={bi('Coaches', 'المدربون')} /><strong>{coaches.length}</strong></span><span><FolderCog size={13} /><BilingualText value={bi('Programs', 'البرامج')} /><strong>{programs.length}</strong></span><span><BarChart3 size={13} /><BilingualText value={bi('Groups', 'المجموعات')} /><strong>{groups.length}</strong></span></div><Link className="admin-link-button" to={`/admin/sports/${sport.id}`}><BilingualText value={bi('Open sport cockpit', 'فتح مركز الرياضة')} /><ArrowRight size={14} /></Link></article>;
    })}</section>}
    {!loading && !error && !sports.length && <EnterpriseEmpty title={bi('No sports match', 'لا تطابق أي رياضات')} description={bi('Try a different search term.', 'جرب مصطلح بحث آخر.')} />}
    {showCreate && <ModalShell title={bi('Add Sport', 'إضافة رياضة')} onClose={closeCreate}>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid"><label><BilingualText value={bi('Name (English)', 'الاسم (إنجليزي)')} /><input value={draft.nameEn} onChange={e => setField('nameEn', e.target.value)} /></label><label><BilingualText value={bi('Name (Arabic)', 'الاسم (عربي)')} /><input value={draft.nameAr} onChange={e => setField('nameAr', e.target.value)} /></label><label><BilingualText value={bi('Description (English)', 'الوصف (إنجليزي)')} /><textarea rows={3} value={draft.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} /></label><label><BilingualText value={bi('Description (Arabic)', 'الوصف (عربي)')} /><textarea rows={3} value={draft.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} /></label><label><BilingualText value={bi('Initial age group (English)', 'الفئة العمرية الأولية (إنجليزي)')} /><input value={draft.ageGroupEn} onChange={e => setField('ageGroupEn', e.target.value)} placeholder="U12" /></label><label><BilingualText value={bi('Initial age group (Arabic)', 'الفئة العمرية الأولية (عربي)')} /><input value={draft.ageGroupAr} onChange={e => setField('ageGroupAr', e.target.value)} placeholder="تحت 12" /></label><label><BilingualText value={bi('Icon key', 'مفتاح الأيقونة')} /><input value={draft.icon} onChange={e => setField('icon', e.target.value)} /></label></div><div className="dialog-actions"><button className="admin-secondary-button" disabled={createLoading} onClick={closeCreate}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Sport', createLoading ? 'جارٍ الحفظ…' : 'حفظ الرياضة')} /></button></div></ModalShell>}
  </div>;
}

export function AdminProgramsPage() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyProgramDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading, error } = usePrograms({ page: 1, pageSize: 300 });
  const { data: sportsData } = useSports({ page: 1, pageSize: 200 });
  const { data: groupsData } = useGroups({ page: 1, pageSize: 500 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 1000 });
  const { create, loading: createLoading } = useCreateProgram();
  const sports = sportsData.items;
  const programs = (data?.items ?? []).filter(program => (sportFilter === 'all' || program.sportId === sportFilter) && `${program.name.en} ${program.name.ar}`.toLowerCase().includes(query.toLowerCase()));
  const setField = (field: keyof typeof emptyProgramDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeCreate = () => { if (!createLoading) setShowCreate(false); };
  const submit = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim() || !draft.sportId || !draft.levelEn.trim() || !draft.levelAr.trim()) { setFormError('Program name, sport, and level are required. | اسم البرنامج والرياضة والمستوى مطلوبة.'); return; }
    setFormError('');
    const ageGroups = draft.ageGroupEn.trim() || draft.ageGroupAr.trim() ? [{ en: draft.ageGroupEn.trim(), ar: draft.ageGroupAr.trim() }] : [];
    await create({ name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() }, sportId: draft.sportId, description: { en: draft.descriptionEn.trim(), ar: draft.descriptionAr.trim() }, ageGroups, level: { en: draft.levelEn.trim(), ar: draft.levelAr.trim() }, status: 'active' });
    setDraft(emptyProgramDraft); setShowCreate(false); setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={FolderCog} eyebrow={bi('Program Management', 'إدارة البرامج')} title={bi('Programs', 'البرامج')} description={bi('Connect sports, groups, levels and athlete development through live Admin gateway records.', 'اربط الرياضات والمجموعات والمستويات وتطور الرياضيين عبر سجلات بوابة الإدارة الحية.')} actions={<div className="admin-header-actions"><PreviewNotice /><button className="admin-primary-button" onClick={() => { setFormError(''); setShowCreate(true); }}><Plus /><BilingualText value={bi('Add Program', 'إضافة برنامج')} /></button></div>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Program saved to Preview data and linked to its sport.', 'تم حفظ البرنامج في بيانات المعاينة وربطه بالرياضة المحددة.')} /></div>}
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search programs', 'البحث عن البرامج')} filters={<EnterpriseSelect label={bi('Sport', 'الرياضة')} value={sportFilter} onChange={setSportFilter} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...sports.map(item => ({ value: item.id, label: item.name }))]} />} resultCount={bi(`${programs.length} programs`, `${programs.length} برامج`)} />
    {loading && <div className="enterprise-panel"><UiPreviewState title={bi('Loading programs', 'جارٍ تحميل البرامج')} description={bi('Reading the Admin data gateway.', 'جارٍ قراءة بوابة بيانات الإدارة.')} /></div>}
    {error && <div className="enterprise-panel"><UiPreviewState title={bi('Programs unavailable', 'تعذر عرض البرامج')} description={bi('The Admin data gateway returned an error.', 'أعادت بوابة بيانات الإدارة خطأً.')} /></div>}
    {!loading && !error && <section className="enterprise-grid-3">{programs.map(program => {
      const groups = groupsData.items.filter(group => group.programIds.includes(program.id));
      const groupIds = new Set(groups.map(group => group.id));
      const players = playersData.items.filter(player => player.programId === program.id || (player.groupId ? groupIds.has(player.groupId) : false));
      const sport = sports.find(item => item.id === program.sportId);
      return <article className="enterprise-panel organization-card" key={program.id}><div className="organization-card-head"><span className="portal-card-icon"><FolderCog size={18} /></span><EnterpriseStatus label={program.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={program.status === 'active' ? 'active' : 'muted'} /></div><h2><BilingualText value={program.name} /></h2><p><BilingualText value={program.description} /></p><div className="program-pill-list">{program.ageGroups.map((ageGroup, index) => <span key={`${ageGroup.en}-${index}`}><BilingualText value={ageGroup} /></span>)}</div><div className="organization-stat-grid"><span><Trophy size={13} /><BilingualText value={bi('Sport', 'الرياضة')} /><strong>{sport?.name.en ?? program.sportId}</strong></span><span><UsersRound size={13} /><BilingualText value={bi('Groups', 'المجموعات')} /><strong>{groups.length}</strong></span><span><UsersRound size={13} /><BilingualText value={bi('Players', 'اللاعبون')} /><strong>{players.length}</strong></span><span><BarChart3 size={13} /><BilingualText value={bi('Level', 'المستوى')} /><strong>{program.level.en}</strong></span></div><Link className="admin-link-button" to={`/admin/programs/${program.id}`}><BilingualText value={bi('Open program cockpit', 'فتح مركز البرنامج')} /><ArrowRight size={14} /></Link></article>;
    })}</section>}
    {!loading && !error && !programs.length && <EnterpriseEmpty title={bi('No programs match', 'لا تطابق أي برامج')} description={bi('Reset the sport filter or search term.', 'أعد ضبط فلتر الرياضة أو مصطلح البحث.')} />}
    {showCreate && <ModalShell title={bi('Add Program', 'إضافة برنامج')} onClose={closeCreate}>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid"><label><BilingualText value={bi('Name (English)', 'الاسم (إنجليزي)')} /><input value={draft.nameEn} onChange={e => setField('nameEn', e.target.value)} /></label><label><BilingualText value={bi('Name (Arabic)', 'الاسم (عربي)')} /><input value={draft.nameAr} onChange={e => setField('nameAr', e.target.value)} /></label><label><BilingualText value={bi('Sport', 'الرياضة')} /><select value={draft.sportId} onChange={e => setField('sportId', e.target.value)}><option value="">Select Sport | اختر الرياضة</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label><label><BilingualText value={bi('Level (English)', 'المستوى (إنجليزي)')} /><input value={draft.levelEn} onChange={e => setField('levelEn', e.target.value)} placeholder="Foundation" /></label><label><BilingualText value={bi('Level (Arabic)', 'المستوى (عربي)')} /><input value={draft.levelAr} onChange={e => setField('levelAr', e.target.value)} placeholder="أساسي" /></label><label><BilingualText value={bi('Age group (English)', 'الفئة العمرية (إنجليزي)')} /><input value={draft.ageGroupEn} onChange={e => setField('ageGroupEn', e.target.value)} placeholder="U12" /></label><label><BilingualText value={bi('Age group (Arabic)', 'الفئة العمرية (عربي)')} /><input value={draft.ageGroupAr} onChange={e => setField('ageGroupAr', e.target.value)} placeholder="تحت 12" /></label><label><BilingualText value={bi('Description (English)', 'الوصف (إنجليزي)')} /><textarea rows={3} value={draft.descriptionEn} onChange={e => setField('descriptionEn', e.target.value)} /></label><label><BilingualText value={bi('Description (Arabic)', 'الوصف (عربي)')} /><textarea rows={3} value={draft.descriptionAr} onChange={e => setField('descriptionAr', e.target.value)} /></label></div><div className="dialog-actions"><button className="admin-secondary-button" disabled={createLoading} onClick={closeCreate}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Program', createLoading ? 'جارٍ الحفظ…' : 'حفظ البرنامج')} /></button></div></ModalShell>}
  </div>;
}
