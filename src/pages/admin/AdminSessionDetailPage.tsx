import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoSessions } from '../../data/demo/sessions';

export function AdminSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = demoSessions.find(s => s.id === sessionId);
  if (!session) return <div className="admin-page"><PageHeader eyebrow={bi('Not Found', 'غير موجود')} title={bi('Session not found', 'الجلسة غير موجودة')} description={bi('-', '-')} /></div>;
  return <div className="admin-page">
    <Link to="/admin/schedules" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Schedules', 'العودة للجداول')} /></Link>
    <PageHeader eyebrow={bi('Training Operations', 'العمليات التدريبية')} title={bi('Session', 'الجلسة')} description={bi(session.id, session.id)} />
    <div className="admin-detail-grid">
      <section className="admin-detail-card">
        <h3><CalendarClock size={18} /> <BilingualText value={bi('Overview', 'نظرة عامة')} /></h3>
        <p><strong><BilingualText value={bi('Sport', 'الرياضة')} /></strong> {session.sportId}</p>
        <p><strong><BilingualText value={bi('Group', 'المجموعة')} /></strong> {session.groupId}</p>
        <p><strong><BilingualText value={bi('Starts', 'يبدأ')} /></strong> {session.startsAt}</p>
        <p><strong><BilingualText value={bi('Status', 'الحالة')} /></strong> <BilingualText value={session.status} /></p>
      </section>
    </div>
  </div>;
}
