import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, ShieldCheck, Trash2 } from 'lucide-react';
import { useCoaches, useDeleteSession, useGroup, useSession, useSport, useUpdateSession } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AdminSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { item: session, loading, error } = useSession(sessionId);
  const { item: sport } = useSport(session?.sportId);
  const { item: group } = useGroup(session?.groupId);
  const { data: coachResult } = useCoaches({ page: 1, pageSize: 300 });
  const { update, loading: updateLoading } = useUpdateSession();
  const { delete: deleteSession, loading: deleteLoading } = useDeleteSession();
  const [startsAt, setStartsAt] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => { if (session) setStartsAt(toLocalInput(session.startsAt)); }, [session]);

  if (loading) return <FuturePanel title={bi('Loading session', 'جارٍ تحميل الجلسة')} description={bi('Reading the training session from the Admin data gateway.', 'جارٍ قراءة جلسة التدريب من بوابة بيانات الإدارة.')} />;
  if (error || !session) return <FuturePanel title={bi('Session not found', 'الجلسة غير موجودة')} description={bi('The requested session is not available in the current data provider.', 'الجلسة المطلوبة غير متاحة في موفر البيانات الحالي.')} />;

  const coaches = coachResult.items.filter(coach => session.coachIds.includes(coach.id));
  const busy = updateLoading || deleteLoading;
  const cancelled = session.status.en.toLowerCase() === 'cancelled';

  const saveTime = async () => {
    if (!startsAt) return;
    await update(session.id, { startsAt: new Date(startsAt).toISOString() });
    setSavedNotice(true);
  };
  const toggleStatus = async () => {
    await update(session.id, { status: cancelled ? bi('Scheduled', 'مجدولة') : bi('Cancelled', 'ملغاة') });
    setSavedNotice(true);
  };
  const remove = async () => { if (busy) return; await deleteSession(session.id); navigate('/admin/schedules'); };

  return <div className="admin-page">
    <Link to="/admin/schedules" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Schedules', 'العودة للجداول')} /></Link>
    <PageHeader eyebrow={bi('Training Operations', 'العمليات التدريبية')} title={bi('Session', 'الجلسة')} description={bi(session.id, session.id)} actions={<div className="admin-header-actions"><StatusBadge active={!cancelled} /><button type="button" className="admin-secondary-button" disabled={busy} onClick={() => void toggleStatus()}><BilingualText value={cancelled ? bi('Reopen Session', 'إعادة فتح الجلسة') : bi('Cancel Session', 'إلغاء الجلسة')} /></button><button type="button" className="admin-danger-button" disabled={busy} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>} />

    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Session updated in the browser preview store.', 'تم تحديث الجلسة في مخزن المعاينة بالمتصفح.')} /></div>}

    <div className="admin-detail-grid">
      <section className="admin-detail-card">
        <h3><CalendarClock size={18} /> <BilingualText value={bi('Overview', 'نظرة عامة')} /></h3>
        <p><strong><BilingualText value={bi('Sport', 'الرياضة')} /></strong> {sport ? <Link to={`/admin/sports/${sport.id}`}><BilingualText value={sport.name} /></Link> : session.sportId}</p>
        <p><strong><BilingualText value={bi('Group', 'المجموعة')} /></strong> {group ? <Link to={`/admin/sports/${session.sportId}/groups/${group.id}`}><BilingualText value={group.name} /></Link> : session.groupId}</p>
        <p><strong><BilingualText value={bi('Starts', 'يبدأ')} /></strong> {new Date(session.startsAt).toLocaleString()}</p>
        <p><strong><BilingualText value={bi('Status', 'الحالة')} /></strong> <BilingualText value={session.status} /></p>
      </section>

      <section className="admin-detail-card">
        <h3><ShieldCheck size={18} /> <BilingualText value={bi('Assigned Coaches', 'المدربون المكلفون')} /></h3>
        {coaches.length ? <div className="linked-player-list">{coaches.map(coach => <Link key={coach.id} to={`/admin/coaches/${coach.id}`}><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></Link>)}</div> : <p><BilingualText value={bi('No coaches assigned.', 'لا يوجد مدربون مكلفون.')} /></p>}
      </section>

      <section className="admin-detail-card">
        <h3><CalendarClock size={18} /> <BilingualText value={bi('Reschedule', 'إعادة الجدولة')} /></h3>
        <label className="admin-field"><BilingualText value={bi('Starts At', 'وقت البداية')} /><input type="datetime-local" value={startsAt} onChange={event => setStartsAt(event.target.value)} /></label>
        <button type="button" className="admin-primary-button" disabled={busy || !startsAt} onClick={() => void saveTime()}><BilingualText value={updateLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Time', 'حفظ الوقت')} /></button>
      </section>
    </div>
  </div>;
}
