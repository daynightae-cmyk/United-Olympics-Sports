import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoaches, useCreateSession, useGroups, useSessions, useSports } from '../../admin/data/adminHooks';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const emptyDraft = { sportId: '', groupId: '', coachId: '', startsAt: '' };

export function AdminSchedulesPage() {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data: sessionResult, loading, error } = useSessions({ page: 1, pageSize: 500 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: groupResult } = useGroups({ page: 1, pageSize: 300 });
  const { data: coachResult } = useCoaches({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreateSession();
  const sessions = sessionResult.items;
  const sports = sportResult.items;
  const groups = groupResult.items;
  const coaches = coachResult.items;

  const visibleSessions = useMemo(() => sessions.filter(session => {
    const sport = sports.find(item => item.id === session.sportId);
    const group = groups.find(item => item.id === session.groupId);
    return `${session.id} ${sport?.name.en ?? ''} ${sport?.name.ar ?? ''} ${group?.name.en ?? ''} ${group?.name.ar ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [sessions, sports, groups, query]);

  const weekStart = useMemo(() => {
    const earliest = new Date([...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]?.startsAt ?? Date.now());
    earliest.setUTCDate(earliest.getUTCDate() - earliest.getUTCDay());
    earliest.setUTCHours(0, 0, 0, 0);
    return earliest;
  }, [sessions]);
  const previewWeek = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setUTCDate(date.getUTCDate() + index); return date; }), [weekStart]);
  const conflictKeys = useMemo(() => {
    const counts = new Map<string, number>();
    sessions.forEach(session => { const key = `${session.startsAt}-${session.groupId}`; counts.set(key, (counts.get(key) ?? 0) + 1); });
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
  }, [sessions]);

  const setDraftField = (field: keyof typeof emptyDraft, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const submit = async () => {
    if (!draft.sportId || !draft.groupId || !draft.startsAt) {
      setFormError('Sport, group and start time are required. | الرياضة والمجموعة ووقت البداية مطلوبة.');
      return;
    }
    const selectedGroup = groups.find(group => group.id === draft.groupId);
    if (!selectedGroup || selectedGroup.sportId !== draft.sportId) {
      setFormError('The selected group must belong to the selected sport. | يجب أن تنتمي المجموعة المختارة إلى الرياضة المختارة.');
      return;
    }
    setFormError('');
    await create({
      sportId: draft.sportId,
      groupId: draft.groupId,
      startsAt: new Date(draft.startsAt).toISOString(),
      status: bi('Scheduled', 'مجدولة'),
      coachIds: draft.coachId ? [draft.coachId] : [],
    });
    setDraft(emptyDraft);
    setShowCreate(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Training Operations', 'العمليات التدريبية')} title={bi('Schedules', 'الجداول')} description={bi('Gateway-backed training schedule with conflict visibility and persistent preview CRUD.', 'جدول تدريب مدفوع ببوابة البيانات مع إظهار التعارضات وعمليات CRUD مستمرة في المعاينة.')} actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptyDraft); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Session', 'إضافة جلسة')} /></button></div>} />

    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Session saved to the browser preview store.', 'تم حفظ الجلسة في مخزن المعاينة بالمتصفح.')} /></div>}

    {showCreate && <section className="admin-panel" aria-label="Create session"><div className="panel-heading"><BilingualText value={bi('Create Training Session', 'إنشاء جلسة تدريب')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div><div className="admin-form-grid">
      <label><BilingualText value={bi('Sport', 'الرياضة')} /><select value={draft.sportId} onChange={e => { setDraftField('sportId', e.target.value); setDraftField('groupId', ''); setDraftField('coachId', ''); }}><option value="">Select sport | اختر الرياضة</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name.en} | {sport.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Group', 'المجموعة')} /><select value={draft.groupId} onChange={e => setDraftField('groupId', e.target.value)}><option value="">Select group | اختر المجموعة</option>{groups.filter(group => !draft.sportId || group.sportId === draft.sportId).map(group => <option key={group.id} value={group.id}>{group.name.en} | {group.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Coach (optional)', 'المدرب (اختياري)')} /><select value={draft.coachId} onChange={e => setDraftField('coachId', e.target.value)}><option value="">No coach | بدون مدرب</option>{coaches.filter(coach => !draft.sportId || coach.sportIds.includes(draft.sportId)).map(coach => <option key={coach.id} value={coach.id}>{coach.nameEn} | {coach.nameAr}</option>)}</select></label>
      <label><BilingualText value={bi('Starts At', 'وقت البداية')} /><input type="datetime-local" value={draft.startsAt} onChange={e => setDraftField('startsAt', e.target.value)} /></label>
    </div>{formError && <p role="alert" className="form-error">{formError}</p>}<div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Session', 'حفظ الجلسة')} /></button></div></section>}

    <section className="player-filter-bar" aria-label="Schedule filters | فلاتر الجداول"><label className="filter-search"><span className="sr-only">Search schedules</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sessions... | البحث عن الجلسات..." /></label><span className="result-count"><BilingualText value={bi(`${visibleSessions.length} sessions`, `${visibleSessions.length} جلسة`)} /></span></section>

    {loading ? <div className="admin-panel" role="status"><BilingualText value={bi('Loading schedule…', 'جارٍ تحميل الجدول…')} /></div> : error ? <div className="admin-panel" role="alert">{error.message}</div> : <>
      <section className="schedule-calendar-preview admin-panel" aria-label="Schedule calendar preview | معاينة التقويم">
        <div className="panel-heading"><div><BilingualText value={bi('Weekly Schedule', 'الجدول الأسبوعي')} /><small><BilingualText value={bi('Current provider records', 'سجلات موفر البيانات الحالي')} /></small></div><CalendarClock /></div>
        <div className="schedule-calendar-toolbar"><span><CalendarClock /><BilingualText value={bi(`${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })} — ${previewWeek.at(-1)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`, 'نطاق الأسبوع الحالي')} /></span><span className={conflictKeys.size ? 'has-conflict' : 'is-clear'}>{conflictKeys.size ? <AlertTriangle /> : <CheckCircle2 />}<BilingualText value={conflictKeys.size ? bi(`${conflictKeys.size} conflicts`, `${conflictKeys.size} تعارضات`) : bi('No conflicts', 'لا توجد تعارضات')} /></span></div>
        <div className="schedule-week-scroller"><div className="schedule-week-grid">{previewWeek.map(day => { const dateKey = day.toISOString().slice(0, 10); const daySessions = visibleSessions.filter(session => session.startsAt.slice(0, 10) === dateKey); return <section className="schedule-day-column" key={dateKey}><header><strong>{day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</strong><span>{day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })}</span></header><div>{daySessions.length ? daySessions.map(session => { const sport = sports.find(item => item.id === session.sportId); const group = groups.find(item => item.id === session.groupId); const conflict = conflictKeys.has(`${session.startsAt}-${session.groupId}`); return <article key={session.id} className={`schedule-session-card sport-${session.sportId} ${conflict ? 'conflict' : ''}`}><div className="session-time">{conflict ? <AlertTriangle /> : <CalendarClock />}<span className="mono">{new Date(session.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span></div><h4><Link to={`/admin/schedules/${session.id}`}><BilingualText value={sport?.name ?? bi('Sport Session', 'جلسة رياضية')} /></Link></h4><div className="session-meta"><BilingualText value={group?.name ?? bi('Training Group', 'مجموعة التدريب')} /></div><BilingualText value={session.status} className="session-status-copy" /></article>; }) : <div className="schedule-empty-day"><span>—</span><BilingualText value={bi('No sessions', 'لا توجد جلسات')} /></div>}</div></section>; })}</div></div>
      </section>

      <div className="schedule-table-preview admin-panel"><table className="player-table"><thead><tr><th><BilingualText value={bi('Session', 'الجلسة')} /></th><th><BilingualText value={bi('Sport', 'الرياضة')} /></th><th><BilingualText value={bi('Group', 'المجموعة')} /></th><th><BilingualText value={bi('Starts', 'يبدأ')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th></tr></thead><tbody>{visibleSessions.map(session => { const sport = sports.find(item => item.id === session.sportId); const group = groups.find(item => item.id === session.groupId); return <tr key={session.id}><td><Link to={`/admin/schedules/${session.id}`} className="admin-link-button"><BilingualText value={{ en: `Session ${session.id}`, ar: `جلسة ${session.id}` }} /><ArrowRight size={14} /></Link></td><td><BilingualText value={sport?.name ?? bi(session.sportId, session.sportId)} /></td><td><BilingualText value={group?.name ?? bi(session.groupId, session.groupId)} /></td><td><span className="mono">{session.startsAt}</span></td><td><StatusBadge active={session.status.en.toLowerCase() !== 'cancelled'} /></td></tr>; })}</tbody></table></div>
    </>}
  </div>;
}
