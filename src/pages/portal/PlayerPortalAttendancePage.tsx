import { CheckSquare } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
export function PlayerPortalAttendancePage() { return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Attendance', 'بوابة اللاعب | الحضور')} title={bi('Attendance', 'الحضور')} description={bi('Player attendance tracking.', 'تتبع حضور اللاعب.')} /><div className="admin-preview-card"><CheckSquare size={32} /><h3><BilingualText value={bi('Attendance', 'الحضور')} /></h3></div></div>; }
