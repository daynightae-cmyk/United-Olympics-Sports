import { CheckSquare } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoPlayers } from '../../data/demo/players';

export function AdminAttendancePage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Training Operations', 'العمليات التدريبية')}
      title={bi('Attendance', 'الحضور')}
      description={bi('Player attendance tracking preview.', 'معاينة تتبع حضور اللاعبين.')}
    />
    <div className="admin-table-preview">
      <table>
        <thead><tr><th><BilingualText value={bi('Player', 'اللاعب')} /></th><th><BilingualText value={bi('Scheduled', 'المجدول')} /></th><th><BilingualText value={bi('Attended', 'الحضور')} /></th></tr></thead>
        <tbody>
          {demoPlayers.slice(0, 6).map(p => (
            <tr key={p.id}>
              <td><BilingualText value={{ en: p.nameEn, ar: p.nameAr }} /></td>
              <td><StatusBadge active={true} /></td>
              <td><span className="mono">{p.attendanceSummary?.attended ?? 0} / {p.attendanceSummary?.scheduled ?? 0}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}
