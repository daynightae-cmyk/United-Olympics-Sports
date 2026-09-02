import { ShieldCheck, CalendarClock, TrendingUp, Award, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function PlayerPortalOverviewPage() {
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Player Portal', 'بوابة اللاعب')} title={bi('Overview', 'نظرة عامة')} description={bi('Player portal architecture: schedule, attendance, performance, feedback, achievements, documents, profile.', 'هيكل بوابة اللاعب: الجدول، الحضور، الأداء، الملاحظات، الإنجازات، الوثائق، الملف الشخصي.')} />
    <div className="admin-grid-cards">
      <section className="admin-preview-card"><CalendarClock size={24} /><h3><BilingualText value={bi('Schedule', 'الجدول')} /></h3><Link to="/player/schedule" className="admin-link-button"><BilingualText value={bi('Open Schedule', 'فتح الجدول')} /></Link></section>
      <section className="admin-preview-card"><TrendingUp size={24} /><h3><BilingualText value={bi('Performance', 'الأداء')} /></h3><Link to="/player/performance" className="admin-link-button"><BilingualText value={bi('Open Performance', 'فتح الأداء')} /></Link></section>
      <section className="admin-preview-card"><Award size={24} /><h3><BilingualText value={bi('Achievements', 'الإنجازات')} /></h3><Link to="/player/achievements" className="admin-link-button"><BilingualText value={bi('Open Achievements', 'فتح الإنجازات')} /></Link></section>
      <section className="admin-preview-card"><FileText size={24} /><h3><BilingualText value={bi('Documents', 'الوثائق')} /></h3><Link to="#" className="admin-link-button"><BilingualText value={bi('Open Documents', 'فتح الوثائق')} /></Link></section>
      <section className="admin-preview-card"><User size={24} /><h3><BilingualText value={bi('Profile', 'الملف الشخصي')} /></h3><Link to="#" className="admin-link-button"><BilingualText value={bi('Open Profile', 'فتح الملف الشخصي')} /></Link></section>
    </div>
  </div>;
}
