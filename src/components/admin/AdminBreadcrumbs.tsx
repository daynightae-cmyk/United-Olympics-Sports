import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getPlayer, getSport } from '../../data/demo/selectors';
import { getGroup } from '../../data/demo/selectors';
import { BilingualText, bi } from '../bilingual/BilingualText';

const labels: Record<string, { en: string; ar: string }> = {
  sports: bi('Sports', 'الرياضات'), players: bi('Players', 'اللاعبون'), groups: bi('Training Groups', 'مجموعات التدريب'),
  parents: bi('Parents', 'أولياء الأمور'), coaches: bi('Coaches', 'المدربون'), programs: bi('Programs', 'البرامج'), schedules: bi('Schedules', 'الجداول'),
  attendance: bi('Attendance', 'الحضور'), performance: bi('Performance', 'الأداء'), countries: bi('Countries', 'الدول'), branches: bi('Branches', 'الفروع'),
  subscriptions: bi('Subscriptions', 'الاشتراكات'), payments: bi('Payments', 'المدفوعات'), reports: bi('Reports', 'التقارير'), content: bi('Content', 'المحتوى'), users: bi('Users & Roles', 'المستخدمون والصلاحيات'), settings: bi('Settings', 'الإعدادات'),
};

function segmentLabel(segment: string) {
  return labels[segment] ?? getSport(segment)?.name ?? (getPlayer(segment) ? { en: getPlayer(segment)!.nameEn, ar: getPlayer(segment)!.nameAr } : getGroup(segment)?.name) ?? bi(segment, segment);
}

export function AdminBreadcrumbs() {
  const segments = useLocation().pathname.split('/').filter(Boolean).slice(1);
  return <nav className="admin-breadcrumbs" aria-label="Breadcrumbs | مسار التنقل">
    <Link to="/admin"><Home /><BilingualText value={bi('Admin', 'الإدارة')} /></Link>
    {segments.map((segment, index) => {
      const to = `/admin/${segments.slice(0, index + 1).join('/')}`;
      return <span key={to}><ChevronRight /><Link to={to}><BilingualText value={segmentLabel(segment)} /></Link></span>;
    })}
  </nav>;
}
