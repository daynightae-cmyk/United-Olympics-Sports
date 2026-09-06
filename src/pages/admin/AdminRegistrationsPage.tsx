import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useRegistrations, useCreateRegistration, usePlayers, usePrograms, useGroups } from '../../admin/data/adminHooks';

const emptyRegistrationDraft = { playerId: '', programId: '', groupId: '', status: 'pending' };

export function AdminRegistrationsPage() {
  const [query, setQuery] = useState('');
  const [program, setProgram] = useState('all');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(emptyRegistrationDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading } = useRegistrations({ page: 1, pageSize: 100 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 500 });
  const { data: programsData } = usePrograms({ page: 1, pageSize: 200 });
  const { data: groupsData } = useGroups({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreateRegistration();
  const players = playersData.items;
  const programs = programsData.items;
  const groups = groupsData.items;

  const registrations = useMemo(() => data?.items.filter(reg => {
    const player = players.find(p => p.id === reg.playerId);
    const matchesQuery = player ? `${player.nameEn} ${player.nameAr} ${reg.id}`.toLowerCase().includes(query.toLowerCase()) : reg.id.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (program === 'all' || reg.programId === program) && (status === 'all' || reg.status === status);
  }) ?? [], [data, query, program, status, players]);

  const availableGroups = useMemo(() => groups.filter(group => !draft.programId || group.programIds.includes(draft.programId)), [groups, draft.programId]);
  const setField = (field: keyof typeof emptyRegistrationDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const closeForm = () => { if (!createLoading) setShowForm(false); };
  const submitRegistration = async () => {
    if (!draft.playerId || !draft.programId) {
      setFormError('Player and program are required. | اللاعب والبرنامج مطلوبان.');
      return;
    }
    setFormError('');
    const now = new Date().toISOString();
    await create({
      playerId: draft.playerId,
      programId: draft.programId,
      groupId: draft.groupId || undefined,
      status: draft.status as 'pending' | 'confirmed' | 'cancelled' | 'waitlisted',
      requestedAt: now,
      confirmedAt: draft.status === 'confirmed' ? now : undefined,
    });
    setDraft(emptyRegistrationDraft);
    setShowForm(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Registrations', 'التسجيلات')} description={bi('Manage program registrations and enrollment status using Admin gateway records.', 'أدر تسجيلات البرامج وحالة التسجيل باستخدام سجلات بوابة الإدارة.')} actions={<button className="admin-primary-button" onClick={() => { setFormError(''); setShowForm(true); }}><Plus /><BilingualText value={bi('Add Registration', 'إضافة تسجيل')} /></button>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Registration saved to Preview data. No production backend write was made.', 'تم حفظ التسجيل في بيانات المعاينة. لم تتم كتابة بيانات في نظام إنتاجي.')} /></div>}
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Registrations | البحث عن التسجيلات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Registrations | البحث عن التسجيلات" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Program', 'البرنامج')} /><select value={program} onChange={event => setProgram(event.target.value)}><option value="all">All Programs | كل البرامج</option>{programs.map(item => <option key={item.id} value={item.id}>{item.name.en} | {item.name.ar}</option>)}</select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="pending">Pending | قيد الانتظار</option><option value="confirmed">Confirmed | مؤكد</option><option value="cancelled">Cancelled | ملغي</option><option value="waitlisted">Waitlisted | في قائمة الانتظار</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${registrations.length} preview records`, `${registrations.length} سجلات معاينة`)} /></span>
      </div>
    </section>
    {loading ? <div className="enterprise-empty" role="status"><ClipboardCheck size={28} /><BilingualText value={bi('Loading registrations…', 'جارٍ تحميل التسجيلات…')} /></div> : <>
      <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Registrations Directory | دليل التسجيلات</caption><thead><tr>{[bi('Registration ID', 'رقم التسجيل'), bi('Player', 'اللاعب'), bi('Program', 'البرنامج'), bi('Group', 'المجموعة'), bi('Status', 'الحالة'), bi('Requested', 'تاريخ الطلب'), bi('Confirmed', 'تاريخ التأكيد'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{registrations.map(reg => { const player = players.find(p => p.id === reg.playerId); const linkedProgram = programs.find(p => p.id === reg.programId); const group = reg.groupId ? groups.find(item => item.id === reg.groupId) : undefined; return <tr key={reg.id}><td><code>{reg.id}</code></td><td>{player ? <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /> : <code>{reg.playerId}</code>}</td><td>{linkedProgram ? <BilingualText value={linkedProgram.name} /> : <code>{reg.programId}</code>}</td><td>{group ? <BilingualText value={group.name} /> : <BilingualText value={bi('Not assigned', 'غير معين')} />}</td><td><StatusBadge active={reg.status === 'confirmed'} /></td><td>{new Date(reg.requestedAt).toLocaleDateString()}</td><td>{reg.confirmedAt ? new Date(reg.confirmedAt).toLocaleDateString() : <BilingualText value={bi('—', '—')} />}</td><td><Link className="row-action" to={`/admin/registrations/${reg.id}`} aria-label={`Open ${reg.id} | فتح ${reg.id}`}><ArrowRight /></Link></td></tr>; })}</tbody></table></section>
      <section className="player-mobile-list">{registrations.map(reg => { const player = players.find(p => p.id === reg.playerId); const linkedProgram = programs.find(p => p.id === reg.programId); return <article className="player-mobile-card" key={reg.id}><div className="mobile-player-head"><ClipboardCheck size={24} /><div><BilingualText value={{ en: reg.id, ar: reg.id }} /><StatusBadge active={reg.status === 'confirmed'} /></div></div><div className="mobile-player-meta"><span><BilingualText value={bi('Player', 'اللاعب')} />{player ? <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /> : <code>{reg.playerId}</code>}</span><span><BilingualText value={bi('Program', 'البرنامج')} />{linkedProgram ? <BilingualText value={linkedProgram.name} /> : <code>{reg.programId}</code>}</span><span><BilingualText value={bi('Status', 'الحالة')} /><BilingualText value={{ en: reg.status, ar: reg.status }} /></span></div><Link className="admin-link-button" to={`/admin/registrations/${reg.id}`}><BilingualText value={bi('Open Registration', 'فتح التسجيل')} /><ArrowRight /></Link></article>; })}</section>
    </>}
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add Registration | إضافة تسجيل" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add Registration', 'إضافة تسجيل')} /><small><BilingualText value={bi('Browser-persistent Preview record', 'سجل معاينة محفوظ في المتصفح')} /></small></div><button className="admin-icon-button" onClick={closeForm} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('Saving writes to the browser Preview store only.', 'الحفظ يكتب في مخزن المعاينة بالمتصفح فقط.')} /></div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="preview-form-grid">
      <label><BilingualText value={bi('Player', 'اللاعب')} /><select value={draft.playerId} onChange={e => setField('playerId', e.target.value)}><option value="">Select Player | اختر اللاعب</option>{players.map(p => <option key={p.id} value={p.id}>{p.nameEn} | {p.nameAr}</option>)}</select></label>
      <label><BilingualText value={bi('Program', 'البرنامج')} /><select value={draft.programId} onChange={e => { setField('programId', e.target.value); setField('groupId', ''); }}><option value="">Select Program | اختر البرنامج</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name.en} | {p.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Group (optional)', 'المجموعة (اختياري)')} /><select value={draft.groupId} onChange={e => setField('groupId', e.target.value)}><option value="">Not assigned | غير معين</option>{availableGroups.map(group => <option key={group.id} value={group.id}>{group.name.en} | {group.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={e => setField('status', e.target.value)}><option value="pending">Pending | قيد الانتظار</option><option value="confirmed">Confirmed | مؤكد</option><option value="waitlisted">Waitlisted | في قائمة الانتظار</option><option value="cancelled">Cancelled | ملغي</option></select></label>
    </div><div className="dialog-actions"><button className="admin-secondary-button" onClick={closeForm} disabled={createLoading}><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button className="admin-primary-button" onClick={() => void submitRegistration()} disabled={createLoading}><BilingualText value={bi(createLoading ? 'Saving…' : 'Save Registration', createLoading ? 'جارٍ الحفظ…' : 'حفظ التسجيل')} /></button></div></section></div>}
  </div>;
}
