import { CalendarCheck, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { AttendanceStatus } from '../../domain/contracts';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { formatBilingualDate } from '../../components/player/playerFormat';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerSectionHeader } from '../../components/player/PlayerUI';
import { getPlayerAttendanceStats } from '../../data/demo/selectors';

const statusLabels: Record<AttendanceStatus, { en: string; ar: string }> = {
  present: bi('Present', 'حاضر'),
  absent: bi('Absent', 'غائب'),
  late: bi('Late', 'متأخر'),
  excused: bi('Excused', 'بعذر'),
};

const statusIcons = { present: CheckCircle2, absent: XCircle, late: Clock3, excused: CalendarCheck };

export function PlayerAttendancePage() {
  const { player } = usePlayerPreview();
  if (!player) return null;
  const stats = getPlayerAttendanceStats(player.id);
  const records = player.attendanceRecords.slice().sort((a, b) => b.date.localeCompare(a.date));

  return <div className="player-page">
    <PlayerSectionHeader eyebrow={bi('Attendance', 'الحضور')} title={bi('Attendance Summary', 'ملخص الحضور')} description={bi('Attendance figures are calculated from the player’s existing preview attendance records. No live check-in is active.', 'يتم حساب أرقام الحضور من سجلات الحضور التجريبية الموجودة للاعب. لا يوجد تسجيل حضور مباشر مفعل.')} />
    <div className="attendance-summary-grid"><article><span><BilingualText value={bi('Sessions Scheduled', 'الحصص المجدولة')} /></span><strong>{stats.scheduled}</strong></article><article><span><BilingualText value={bi('Sessions Attended', 'الحصص المحضورة')} /></span><strong>{stats.attended}</strong></article><article><span><BilingualText value={bi('Attendance Rate', 'معدل الحضور')} /></span><strong>{stats.rate}%</strong></article></div>
    <section className="attendance-history"><header><h2><BilingualText value={bi('Recent Attendance', 'آخر سجلات الحضور')} /></h2><span><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span></header><div className="attendance-list">{records.map(record => { const Icon = statusIcons[record.status]; return <article key={record.id} className={`attendance-row status-${record.status}`}><span className="attendance-status-icon"><Icon aria-hidden="true" /></span><div><strong><BilingualText value={statusLabels[record.status]} /></strong><small><BilingualText value={formatBilingualDate(record.date)} /></small></div><span className="attendance-status-label"><BilingualText value={statusLabels[record.status]} /></span></article>; })}</div></section>
  </div>;
}
