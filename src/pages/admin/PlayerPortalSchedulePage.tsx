import { CalendarClock } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function PlayerPortalSchedulePage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Schedule', 'بوابة اللاعب | الجدول')} title={bi('Schedule', 'الجدول')} description={bi('Player schedule preview.', 'معاينة جدول اللاعب.')} /><div className="admin-preview-card"><CalendarClock size={32} /><h3><BilingualText value={bi('Player Schedule', 'جدول اللاعب')} /></h3></div></div>;
}
