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
    <div className="admin-table-preview">
      <table>
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
