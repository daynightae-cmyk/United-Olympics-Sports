import { ArrowRight, Languages, Mail, Phone, Plus, ShieldCheck, UserRoundCheck, UsersRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateParent, useParents, usePlayers } from '../../admin/data/adminHooks';
import { PageHeader, UserAvatar } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseStatus, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const hasUsefulContact = (value?: string) => Boolean(value && value.trim() && value.trim() !== '-');
const emptyDraft = { nameEn: '', nameAr: '', playerId: '', preferredLanguage: 'ar' as 'ar' | 'en', phone: '', email: '' };

export function AdminParentsPage() {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data: parentResult, loading, error } = useParents({ page: 1, pageSize: 200 });
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreateParent();
  const parents = parentResult.items;
  const players = playerResult.items;
  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(() => parents.filter(parent => {
    const childText = parent.playerIds.map(id => {
      const player = players.find(item => item.id === id);
      return player ? `${player.nameEn} ${player.nameAr} ${player.id}` : id;
    }).join(' ');
    return `${parent.nameEn} ${parent.nameAr} ${parent.id} ${parent.email ?? ''} ${parent.phone ?? ''} ${childText}`.toLowerCase().includes(normalizedQuery);
  }), [parents, players, normalizedQuery]);

  const activeParents = parents.filter(parent => parent.status === 'active').length;
  const linkedPlayers = new Set(parents.flatMap(parent => parent.playerIds)).size;
  const arabicPreference = parents.filter(parent => parent.preferredLanguage === 'ar').length;
  const setDraftField = <K extends keyof typeof emptyDraft>(field: K, value: (typeof emptyDraft)[K]) => setDraft(current => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!draft.nameEn.trim() || !draft.nameAr.trim()) {
      setFormError('Parent names in English and Arabic are required. | اسم ولي الأمر بالإنجليزية والعربية مطلوب.');
      return;
    }
    setFormError('');
    await create({
      nameEn: draft.nameEn.trim(),
      nameAr: draft.nameAr.trim(),
      playerIds: draft.playerId ? [draft.playerId] : [],
      playerCount: draft.playerId ? 1 : 0,
      preferredLanguage: draft.preferredLanguage,
      status: 'active',
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
    });
    setDraft(emptyDraft);
    setShowCreate(false);
    setSavedNotice(true);
  };

  return <div className="admin-page directory-v2-page directory-v2-parents">
    <PageHeader
      icon={UserRoundCheck}
      eyebrow={bi('Family Relationship Center', 'مركز علاقات الأسر')}
      title={bi('Parents & Guardians', 'أولياء الأمور')}
      description={bi('Gateway-backed family directory for linked athletes, communication preferences and contact readiness.', 'دليل أسر مدفوع ببوابة البيانات للاعبين المرتبطين وتفضيلات التواصل وجاهزية الاتصال.')}
      actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptyDraft); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Parent', 'إضافة ولي أمر')} /></button></div>}
    />

    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Parent saved to the browser preview store.', 'تم حفظ ولي الأمر في مخزن المعاينة بالمتصفح.')} /></div>}

    {showCreate && <section className="admin-panel" aria-label="Create parent">
      <div className="panel-heading"><BilingualText value={bi('Create Parent / Guardian', 'إنشاء ولي أمر')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div>
      <div className="admin-form-grid">
        <label><BilingualText value={bi('Name (English)', 'الاسم بالإنجليزية')} /><input value={draft.nameEn} onChange={e => setDraftField('nameEn', e.target.value)} /></label>
        <label><BilingualText value={bi('Name (Arabic)', 'الاسم بالعربية')} /><input dir="rtl" value={draft.nameAr} onChange={e => setDraftField('nameAr', e.target.value)} /></label>
        <label><BilingualText value={bi('Linked Player (optional)', 'اللاعب المرتبط (اختياري)')} /><select value={draft.playerId} onChange={e => setDraftField('playerId', e.target.value)}><option value="">No player | بدون لاعب</option>{players.map(player => <option key={player.id} value={player.id}>{player.nameEn} | {player.nameAr}</option>)}</select></label>
        <label><BilingualText value={bi('Preferred Language', 'اللغة المفضلة')} /><select value={draft.preferredLanguage} onChange={e => setDraftField('preferredLanguage', e.target.value as 'ar' | 'en')}><option value="ar">العربية</option><option value="en">English</option></select></label>
        <label><BilingualText value={bi('Phone', 'الهاتف')} /><input value={draft.phone} onChange={e => setDraftField('phone', e.target.value)} placeholder="+971…" /></label>
        <label><BilingualText value={bi('Email', 'البريد الإلكتروني')} /><input type="email" value={draft.email} onChange={e => setDraftField('email', e.target.value)} /></label>
      </div>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Parent', 'حفظ ولي الأمر')} /></button></div>
    </section>}

    <section className="enterprise-kpi-grid directory-kpi-grid" aria-label="Parent overview | نظرة عامة على أولياء الأمور">
      <EnterpriseKpi icon={UserRoundCheck} label={bi('Parents', 'أولياء الأمور')} value={parents.length} detail={bi('Current provider records', 'سجلات موفر البيانات الحالي')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Active profiles', 'الملفات النشطة')} value={activeParents} detail={bi('Current status', 'الحالة الحالية')} />
      <EnterpriseKpi icon={UsersRound} tone="blue" label={bi('Linked athletes', 'اللاعبون المرتبطون')} value={linkedPlayers} detail={bi('Unique player relationships', 'علاقات لاعبين فريدة')} />
      <EnterpriseKpi icon={Languages} tone="orange" label={bi('Arabic preference', 'تفضيل العربية')} value={arabicPreference} detail={bi('Preferred communication language', 'لغة التواصل المفضلة')} />
    </section>

    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search parents, IDs or linked athletes', 'البحث عن أولياء الأمور أو المعرفات أو اللاعبين المرتبطين')} resultCount={bi(`${visible.length} parents`, `${visible.length} أولياء أمور`)} />

    {loading ? <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family profiles…', 'جارٍ تحميل ملفات الأسر…')} /></div> : error ? <div className="enterprise-empty" role="alert">{error.message}</div> : visible.length > 0 ? <section className="directory-card-grid" aria-label="Parent directory cards | بطاقات دليل أولياء الأمور">
      {visible.map(parent => {
        const children = parent.playerIds.map(id => players.find(player => player.id === id)).filter(Boolean);
        const phoneReady = hasUsefulContact(parent.phone);
        const emailReady = hasUsefulContact(parent.email);
        const contactReady = phoneReady || emailReady;
        return <article className="directory-card directory-card-parent" key={parent.id}>
          <div className="directory-card-glow" aria-hidden="true" />
          <header className="directory-card-header"><div className="directory-identity"><div className="directory-avatar"><UserAvatar name={parent.nameEn} large /></div><div><span className="directory-kicker"><BilingualText value={bi('Family profile', 'ملف الأسرة')} /></span><h2><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></h2><code>{parent.id}</code></div></div><EnterpriseStatus label={parent.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={parent.status === 'active' ? 'active' : 'neutral'} /></header>
          <div className="directory-family-banner"><div className="directory-family-icon"><UsersRound size={19} /></div><div><small><BilingualText value={bi('Linked athletes', 'اللاعبون المرتبطون')} /></small><strong>{children.length}</strong></div><span className="directory-language-pill"><Languages size={14} /><BilingualText value={parent.preferredLanguage === 'ar' ? bi('Arabic preferred', 'العربية مفضلة') : bi('English preferred', 'الإنجليزية مفضلة')} /></span></div>
          <section className="directory-card-section"><div className="directory-section-label"><BilingualText value={bi('Children / Athletes', 'الأبناء / اللاعبون')} /></div><div className="directory-child-list">{children.length ? children.map(child => child && <div className="directory-child" key={child.id}><span className="directory-child-avatar">{child.nameEn.slice(0, 1)}</span><span><strong><BilingualText value={{ en: child.nameEn, ar: child.nameAr }} /></strong><small>{child.id}</small></span></div>) : <span className="directory-muted"><BilingualText value={bi('No linked athletes', 'لا يوجد لاعبون مرتبطون')} /></span>}</div></section>
          <section className="directory-card-section directory-contact-section"><div className="directory-section-label"><BilingualText value={bi('Contact readiness', 'جاهزية التواصل')} /></div><div className="directory-contact-grid"><div className={phoneReady ? 'is-ready' : 'is-missing'}><Phone size={15} /><span><small><BilingualText value={bi('Phone', 'الهاتف')} /></small><strong>{phoneReady ? parent.phone : <BilingualText value={bi('Not provided', 'غير مضاف')} />}</strong></span></div><div className={emailReady ? 'is-ready' : 'is-missing'}><Mail size={15} /><span><small><BilingualText value={bi('Email', 'البريد الإلكتروني')} /></small><strong>{emailReady ? parent.email : <BilingualText value={bi('Not provided', 'غير مضاف')} />}</strong></span></div></div></section>
          <footer className="directory-card-footer"><span className={`directory-readiness ${contactReady ? '' : 'is-warning'}`}><ShieldCheck size={15} /><BilingualText value={contactReady ? bi('Contact channel available', 'قناة تواصل متاحة') : bi('Contact details pending', 'بيانات التواصل قيد الاستكمال')} /></span><Link className="directory-open-button" to={`/admin/parents/${parent.id}`}><BilingualText value={bi('Open family profile', 'فتح ملف الأسرة')} /><ArrowRight size={16} /></Link></footer>
        </article>;
      })}
    </section> : <EnterpriseEmpty title={bi('No parents match', 'لا يوجد أولياء أمور مطابقون')} description={bi('Try another parent name, ID or linked athlete.', 'جرب اسم ولي أمر أو معرفًا أو لاعبًا مرتبطًا آخر.')} />}
  </div>;
}
