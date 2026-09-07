import { ArrowRight, BriefcaseBusiness, Dumbbell, MapPin, Plus, ShieldCheck, Trophy, UsersRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranches, useCoaches, useCreateCoach, useGroups, useSports } from '../../admin/data/adminHooks';
import { PageHeader, UserAvatar } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseStatus, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const emptyDraft = { nameEn: '', nameAr: '', sportId: '', branchId: '', groupId: '', specializationEn: '', specializationAr: '' };

export function AdminCoachesPage() {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data: coachResult, loading, error } = useCoaches({ page: 1, pageSize: 200 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: branchResult } = useBranches({ page: 1, pageSize: 100 });
  const { data: groupResult } = useGroups({ page: 1, pageSize: 200 });
  const { create, loading: createLoading } = useCreateCoach();
  const coaches = coachResult.items;
  const sports = sportResult.items;
  const branches = branchResult.items;
  const groups = groupResult.items;
  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(() => coaches.filter((coach) => {
    const branchText = coach.branchIds.map((id) => branches.find((branch) => branch.id === id)?.name.en ?? id).join(' ');
    const sportText = coach.sportIds.map((id) => sports.find((sport) => sport.id === id)?.name.en ?? id).join(' ');
    return `${coach.nameEn} ${coach.nameAr} ${coach.id} ${branchText} ${sportText}`.toLowerCase().includes(normalizedQuery);
  }), [coaches, branches, sports, normalizedQuery]);

  const activeCoaches = coaches.filter((coach) => coach.status === 'active').length;
  const groupAssignments = coaches.reduce((sum, coach) => sum + coach.groupIds.length, 0);
  const sportCoverage = new Set(coaches.flatMap((coach) => coach.sportIds)).size;
  const setDraftField = (field: keyof typeof emptyDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const submitCoach = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim() || !draft.sportId) {
      setFormError('Coach names and at least one sport are required. | اسم المدرب باللغتين ورياضة واحدة على الأقل مطلوبة.');
      return;
    }
    setFormError('');
    await create({
      nameEn: draft.nameEn.trim(),
      nameAr: draft.nameAr.trim(),
      sportIds: [draft.sportId],
      branchIds: draft.branchId ? [draft.branchId] : [],
      groupIds: draft.groupId ? [draft.groupId] : [],
      playerCount: 0,
      specializations: draft.specializationEn.trim() || draft.specializationAr.trim() ? [{ en: draft.specializationEn.trim(), ar: draft.specializationAr.trim() }] : [],
      certifications: [],
      status: 'active',
    });
    setShowCreate(false);
    setDraft(emptyDraft);
    setSavedNotice(true);
  };

  return <div className="admin-page directory-v2-page directory-v2-coaches">
    <PageHeader icon={BriefcaseBusiness} eyebrow={bi('Coach Operations', 'عمليات المدربين')} title={bi('Coach Command Center', 'مركز قيادة المدربين')} description={bi('Gateway-backed coaching directory for assignments, sport coverage and roster reach.', 'دليل مدربين مدعوم ببوابة البيانات للتكليفات وتغطية الرياضات والوصول للاعبين.')} actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptyDraft); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Coach', 'إضافة مدرب')} /></button></div>} />

    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Coach saved to the browser preview store.', 'تم حفظ المدرب في مخزن المعاينة بالمتصفح.')} /></div>}

    {showCreate && <section className="admin-panel" aria-label="Create coach"><div className="panel-heading"><BilingualText value={bi('Create Coach', 'إنشاء مدرب')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div><div className="admin-form-grid">
      <label><BilingualText value={bi('Name (English)', 'الاسم بالإنجليزية')} /><input value={draft.nameEn} onChange={(event) => setDraftField('nameEn', event.target.value)} /></label>
      <label><BilingualText value={bi('Name (Arabic)', 'الاسم بالعربية')} /><input dir="rtl" value={draft.nameAr} onChange={(event) => setDraftField('nameAr', event.target.value)} /></label>
      <label><BilingualText value={bi('Sport', 'الرياضة')} /><select value={draft.sportId} onChange={(event) => { setDraftField('sportId', event.target.value); setDraftField('groupId', ''); }}><option value="">Select sport | اختر الرياضة</option>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Branch (optional)', 'الفرع (اختياري)')} /><select value={draft.branchId} onChange={(event) => setDraftField('branchId', event.target.value)}><option value="">No branch | بدون فرع</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.en} | {branch.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Group (optional)', 'المجموعة (اختياري)')} /><select value={draft.groupId} onChange={(event) => setDraftField('groupId', event.target.value)}><option value="">No group | بدون مجموعة</option>{groups.filter((group) => !draft.sportId || group.sportId === draft.sportId).map((group) => <option key={group.id} value={group.id}>{group.name.en} | {group.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Specialization (English)', 'التخصص بالإنجليزية')} /><input value={draft.specializationEn} onChange={(event) => setDraftField('specializationEn', event.target.value)} /></label>
      <label><BilingualText value={bi('Specialization (Arabic)', 'التخصص بالعربية')} /><input dir="rtl" value={draft.specializationAr} onChange={(event) => setDraftField('specializationAr', event.target.value)} /></label>
    </div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submitCoach()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Coach', 'حفظ المدرب')} /></button></div></section>}

    <section className="enterprise-kpi-grid directory-kpi-grid" aria-label="Coach overview | نظرة عامة على المدربين">
      <EnterpriseKpi icon={BriefcaseBusiness} label={bi('Coaches', 'المدربون')} value={coaches.length} detail={bi('Provider records', 'سجلات موفر البيانات')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Active profiles', 'الملفات النشطة')} value={activeCoaches} detail={bi('Current status', 'الحالة الحالية')} />
      <EnterpriseKpi icon={UsersRound} tone="blue" label={bi('Group assignments', 'تكليفات المجموعات')} value={groupAssignments} detail={bi('Linked training groups', 'المجموعات التدريبية المرتبطة')} />
      <EnterpriseKpi icon={Trophy} tone="orange" label={bi('Sport coverage', 'تغطية الرياضات')} value={sportCoverage} detail={bi('Distinct assigned sports', 'رياضات مختلفة مكلف بها المدربون')} />
    </section>

    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search coaches, IDs, branches or sports', 'البحث عن المدربين أو المعرفات أو الفروع أو الرياضات')} resultCount={bi(`${visible.length} coaches`, `${visible.length} مدربين`)} />

    {loading ? <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading coaches…', 'جارٍ تحميل المدربين…')} /></div> : error ? <div className="enterprise-empty" role="alert">{error.message}</div> : visible.length > 0 ? <section className="directory-card-grid" aria-label="Coach directory cards | بطاقات دليل المدربين">
      {visible.map((coach) => {
        const primaryBranch = branches.find((branch) => branch.id === coach.branchIds[0]);
        const primaryGroup = groups.find((group) => group.id === coach.groupIds[0]);
        return <article className="directory-card directory-card-coach" key={coach.id}>
          <div className="directory-card-glow" aria-hidden="true" />
          <header className="directory-card-header"><div className="directory-identity"><div className="directory-avatar"><UserAvatar name={coach.nameEn} large /></div><div><span className="directory-kicker"><BilingualText value={bi('Coach profile', 'ملف المدرب')} /></span><h2><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></h2><code>{coach.id}</code></div></div><EnterpriseStatus label={coach.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={coach.status === 'active' ? 'active' : 'neutral'} /></header>
          <div className="directory-metric-grid"><div><UsersRound size={16} /><span><BilingualText value={bi('Players', 'اللاعبون')} /><strong>{coach.playerCount}</strong></span></div><div><Dumbbell size={16} /><span><BilingualText value={bi('Groups', 'المجموعات')} /><strong>{coach.groupIds.length}</strong></span></div><div><MapPin size={16} /><span><BilingualText value={bi('Branches', 'الفروع')} /><strong>{coach.branchIds.length}</strong></span></div><div><Trophy size={16} /><span><BilingualText value={bi('Sports', 'الرياضات')} /><strong>{coach.sportIds.length}</strong></span></div></div>
          <section className="directory-card-section"><div className="directory-section-label"><BilingualText value={bi('Assigned sports', 'الرياضات المكلف بها')} /></div><div className="directory-chip-row">{coach.sportIds.map((sportId) => { const sport = sports.find((item) => item.id === sportId); return <span className="directory-chip directory-chip-gold" key={sportId}>{sport ? <BilingualText value={sport.name} /> : sportId}</span>; })}</div></section>
          <section className="directory-card-section"><div className="directory-section-label"><BilingualText value={bi('Specialization', 'التخصص')} /></div><div className="directory-chip-row">{coach.specializations.length > 0 ? coach.specializations.map((specialization, index) => <span className="directory-chip" key={`${coach.id}-specialization-${index}`}><BilingualText value={specialization} /></span>) : <span className="directory-muted"><BilingualText value={bi('No specialization recorded', 'لا يوجد تخصص مسجل')} /></span>}</div></section>
          <div className="directory-context-row"><div><small><BilingualText value={bi('Primary branch', 'الفرع الأساسي')} /></small><strong>{primaryBranch ? <BilingualText value={primaryBranch.name} /> : <BilingualText value={bi('Not assigned', 'غير محدد')} />}</strong></div><div><small><BilingualText value={bi('Primary group', 'المجموعة الأساسية')} /></small><strong>{primaryGroup ? <BilingualText value={primaryGroup.name} /> : <BilingualText value={bi('Not assigned', 'غير محددة')} />}</strong></div><div><small><BilingualText value={bi('Certifications', 'الشهادات')} /></small><strong>{coach.certifications.length}</strong></div></div>
          <footer className="directory-card-footer"><span className="directory-readiness"><ShieldCheck size={15} /><BilingualText value={bi('Gateway profile', 'ملف بوابة البيانات')} /></span><Link className="directory-open-button" to={`/admin/coaches/${coach.id}`}><BilingualText value={bi('Open coach profile', 'فتح ملف المدرب')} /><ArrowRight size={16} /></Link></footer>
        </article>;
      })}
    </section> : <EnterpriseEmpty title={bi('No coaches match', 'لا يوجد مدربون مطابقون')} description={bi('Try another coach name, ID, branch or sport.', 'جرب اسم مدرب أو معرفًا أو فرعًا أو رياضة أخرى.')} />}
  </div>;
}
