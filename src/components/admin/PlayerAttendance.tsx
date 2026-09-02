import { CalendarCheck, CalendarClock, Clock3, Percent } from 'lucide-react';
import type { Player } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { StatCard } from './AdminUI';

const attendanceLabels = {
  present: bi('Present', 'حاضر'), absent: bi('Absent', 'غائب'), late: bi('Late', 'متأخر'), excused: bi('Excused', 'بعذر'),
};

export function PlayerAttendance({ player }: { player: Player }) {
  const scheduled = player.attendanceSummary?.scheduled ?? 0; const attended = player.attendanceSummary?.attended ?? 0; const rate = scheduled ? Math.round((attended / scheduled) * 100) : 0;
  return <div className="attendance-view"><section className="admin-stat-grid compact"><StatCard label={bi('Sessions Scheduled', 'الحصص المجدولة')} value={scheduled} icon={CalendarClock} /><StatCard label={bi('Sessions Attended', 'الحصص المحضورة')} value={attended} icon={CalendarCheck} /><StatCard label={bi('Attendance Rate', 'معدل الحضور')} value={`${rate}%`} icon={Percent} /></section><section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Recent Attendance', 'آخر الحضور')} /><small><BilingualText value={bi('Preview records · no QR verification', 'سجلات تجريبية · دون تحقق QR')} /></small></div><Clock3 /></div><div className="attendance-list">{player.attendanceRecords.map(record => <article key={record.id}><time>{record.date}</time><span className={`attendance-status ${record.status}`}><BilingualText value={attendanceLabels[record.status]} /></span></article>)}</div></section></div>;
}
