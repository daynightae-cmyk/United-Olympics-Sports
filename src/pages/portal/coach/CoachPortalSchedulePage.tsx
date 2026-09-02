import { Award } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
export function CoachPortalSchedulePage() { return <div className="admin-page"><PageHeader eyebrow={bi('Coach Portal | Schedule', 'بوابة المدرب | الجدول')} title={bi('Schedule', 'الجدول')} description={bi('Coach schedule.', 'جدول المدرب.')} /><div className="admin-preview-card"><Award size={32} /><h3><BilingualText value={bi('Coach Schedule', 'جدول المدرب')} /></h3></div></div>; }
