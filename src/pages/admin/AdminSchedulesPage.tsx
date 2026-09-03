import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoSessions } from '../../data/demo/sessions';
import { getGroup, getSport } from '../../data/demo/selectors';

const weekStart = (() => {
  const earliest = new Date([...demoSessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]?.startsAt ?? Date.now());
  earliest.setUTCDate(earliest.getUTCDate() - earliest.getUTCDay());
  earliest.setUTCHours(0, 0, 0, 0);
  return earliest;
})();
const previewWeek = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(weekStart); date.setUTCDate(date.getUTCDate() + index); return date;
});
const conflictKeys = new Set(demoSessions.filter((session, index, all) => all.findIndex(item => item.startsAt === session.startsAt && item.groupId === session.groupId) !== index).map(session => `${session.startsAt}-${session.groupId}`));

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
      <div className="panel-heading"><div><BilingualText value={bi('Weekly Schedule Preview', 'معاينة الجدول الأسبوعي')} /><small><BilingualText value={bi('Verified preview fixtures only', 'بيانات المعاينة الموثقة فقط')} /></small></div><CalendarClock /></div>
      <div className="schedule-calendar-toolbar"><span><CalendarClock /><BilingualText value={bi(`${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })} — ${previewWeek.at(-1)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`, 'نطاق أسبوع المعاينة')} /></span><span className={conflictKeys.size ? 'has-conflict' : 'is-clear'}>{conflictKeys.size ? <AlertTriangle /> : <CheckCircle2 />}<BilingualText value={conflictKeys.size ? bi(`${conflictKeys.size} preview conflicts`, `${conflictKeys.size} تعارضات تجريبية`) : bi('No conflicts in preview data', 'لا توجد تعارضات في البيانات التجريبية')} /></span></div>
      <div className="schedule-week-scroller"><div className="schedule-week-grid">
        {previewWeek.map(day => { const dateKey = day.toISOString().slice(0, 10); const sessions = demoSessions.filter(session => session.startsAt.slice(0, 10) === dateKey); return <section className="schedule-day-column" key={dateKey}><header><strong>{day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</strong><span>{day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })}</span></header><div>{sessions.length ? sessions.map(s => { const sport = getSport(s.sportId); const group = getGroup(s.groupId); const conflict = conflictKeys.has(`${s.startsAt}-${s.groupId}`); return <article key={s.id} className={`schedule-session-card sport-${s.sportId} ${conflict ? 'conflict' : ''}`}>
          <div className="session-time">{conflict ? <AlertTriangle /> : <CalendarClock />}<span className="mono">{new Date(s.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span></div>
          <h4><Link to={`/admin/schedules/${s.id}`}><BilingualText value={sport?.name ?? bi('Sport Session', 'جلسة رياضية')} /></Link></h4>
          <div className="session-meta"><BilingualText value={group?.name ?? bi('Training Group', 'مجموعة التدريب')} /></div>
          <BilingualText value={s.status} className="session-status-copy" />
        </article>; }) : <div className="schedule-empty-day"><span>—</span><BilingualText value={bi('No preview sessions', 'لا توجد جلسات تجريبية')} /></div>}</div></section>; })}
      </div></div>
      <div className="schedule-legend"><span className="football"><i /><BilingualText value={bi('Football', 'كرة القدم')} /></span><span className="swimming"><i /><BilingualText value={bi('Swimming', 'السباحة')} /></span><span className="basketball"><i /><BilingualText value={bi('Basketball', 'كرة السلة')} /></span><span className="conflict"><i /><BilingualText value={bi('Conflict', 'تعارض')} /></span></div>
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
