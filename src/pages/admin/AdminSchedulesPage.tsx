import { ArrowRight, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoSessions } from '../../data/demo/sessions';

export function AdminSchedulesPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Training Operations', 'العمليات التدريبية')}
      title={bi('Schedules', 'الجداول')}
      description={bi('Training session schedule preview.', 'معاينة جدول جلسات التدريب.')}
    />
    <section className="player-filter-bar" aria-label="Schedule filters | فلاتر الجداول">
      <label className="filter-search"><span className="sr-only">Search schedules</span><input placeholder="Search sessions... | البحث عن الجلسات..." /></label>
      <span className="result-count"><BilingualText value={bi(`${demoSessions.length} preview sessions`, `${demoSessions.length} جلسة تجريبية`)} /></span>
    </section>
    <section className="schedule-calendar-preview admin-panel" aria-label="Schedule calendar preview | معاينة التقويم">
      <div className="panel-heading"><BilingualText value={bi('Weekly Schedule Preview', 'معاينة الجدول الأسبوعي')} /><CalendarClock /></div>
      <div className="schedule-day-grid">
        {demoSessions.slice(0, 5).map(s => (
          <article key={s.id} className="schedule-session-card">
            <div className="session-time"><CalendarClock size={16} /><span className="mono">{new Date(s.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <h4><Link to={`/admin/schedules/${s.id}`}><BilingualText value={{ en: 'Session ' + s.id, ar: 'جلسة ' + s.id }} /></Link></h4>
            <div className="session-meta"><span><BilingualText value={bi('Sport', 'الرياضة')} />: <span className="mono">{s.sportId}</span></span><span><BilingualText value={bi('Group', 'المجموعة')} />: <span className="mono">{s.groupId}</span></span></div>
            <StatusBadge active={true} />
          </article>
        ))}
      </div>
    </section>
    <div className="schedule-table-preview admin-panel">
      <table className="player-table">
        <thead><tr><th><BilingualText value={bi('Session', 'الجلسة')} /></th><th><BilingualText value={bi('Sport', 'الرياضة')} /></th><th><BilingualText value={bi('Group', 'المجموعة')} /></th><th><BilingualText value={bi('Starts', 'يبدأ')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th></tr></thead>
        <tbody>
          {demoSessions.map(s => (
            <tr key={s.id}>
              <td><Link to={`/admin/schedules/${s.id}`} className="admin-link-button"><BilingualText value={{ en: 'Session ' + s.id, ar: 'جلسة ' + s.id }} /><ArrowRight size={14} /></Link></td>
              <td><BilingualText value={bi('Sport', 'رياضة')} /> {s.sportId}</td>
              <td><BilingualText value={{ en: s.groupId, ar: s.groupId }} /></td>
              <td><span className="mono">{s.startsAt}</span></td>
              <td><StatusBadge active={true} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}
