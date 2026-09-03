import { CheckSquare, Clock } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';

export function PlayerPortalAttendancePage() {
  const player = demoPlayers[0];
  const attendance = player.attendanceSummary ?? { attended: 0, scheduled: 0 };
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Attendance', 'بوابة اللاعب | الحضور')}
        title={bi('Attendance', 'الحضور')}
        description={bi('Truthful attendance preview with no fabricated sessions.', 'معاينة حضور صادقة بدون جلسات مختلقة.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section className="admin-stat-grid compact" aria-label="Attendance stats">
        <article className="admin-stat-card">
          <strong>{attendance.attended ?? '—'}</strong>
          <span><CheckSquare size={14} /><BilingualText value={bi('Attended', 'حاضر')} /></span>
        </article>
        <article className="admin-stat-card">
          <strong>{attendance.scheduled ?? '—'}</strong>
          <span><Clock size={14} /><BilingualText value={bi('Scheduled', 'مجدول')} /></span>
        </article>
        <article className="admin-stat-card">
          <strong>{'—'}</strong>
          <span><BilingualText value={bi('Rate', 'المعدل')} /></span>
        </article>
      </section>
      <section aria-label="Attendance note">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Attendance records are preview-only and intentionally incomplete until verified.', 'سجلات الحضور تجريبية فقط ومقصودة غير مكتملة حتى التحقق.')} />
          </p>
        </div>
      </section>
    </div>
  );
}
