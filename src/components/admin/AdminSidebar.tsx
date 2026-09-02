import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, CalendarDays, ChevronLeft, CircleDollarSign, ClipboardCheck, CreditCard, Dumbbell, FileBarChart, FolderCog, Gauge, Globe2, LayoutDashboard, Medal, Settings, ShieldCheck, Trophy, UserRoundCog, Users, X } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';

const sections = [
  { title: bi('Operations', 'العمليات'), items: [
    { to: '/admin', exact: true, label: bi('Dashboard', 'لوحة التحكم'), icon: LayoutDashboard },
    { to: '/admin/sports', label: bi('Sports', 'الرياضات'), icon: Trophy },
    { to: '/admin/groups', label: bi('Training Groups / Teams', 'الفرق / مجموعات التدريب'), icon: Dumbbell },
    { to: '/admin/players', label: bi('Players', 'اللاعبون'), icon: Medal },
    { to: '/admin/parents', label: bi('Parents', 'أولياء الأمور'), icon: Users },
    { to: '/admin/coaches', label: bi('Coaches', 'المدربون'), icon: ShieldCheck },
    { to: '/admin/programs', label: bi('Programs', 'البرامج'), icon: FolderCog },
    { to: '/admin/schedules', label: bi('Schedules', 'الجداول'), icon: CalendarDays },
    { to: '/admin/attendance', label: bi('Attendance', 'الحضور'), icon: ClipboardCheck },
    { to: '/admin/performance', label: bi('Performance', 'الأداء'), icon: BarChart3 },
  ] },
  { title: bi('Organization', 'المؤسسة'), items: [
    { to: '/admin/countries', label: bi('Countries', 'الدول'), icon: Globe2 },
    { to: '/admin/branches', label: bi('Branches', 'الفروع'), icon: Building2 },
  ] },
  { title: bi('Finance', 'المالية'), items: [
    { to: '/admin/subscriptions', label: bi('Subscriptions', 'الاشتراكات'), icon: CreditCard },
    { to: '/admin/payments', label: bi('Payments', 'المدفوعات'), icon: CircleDollarSign },
    { to: '/admin/reports', label: bi('Reports', 'التقارير'), icon: FileBarChart },
  ] },
  { title: bi('System', 'النظام'), items: [
    { to: '/admin/content', label: bi('Content', 'المحتوى'), icon: Gauge },
    { to: '/admin/users', label: bi('Users & Roles', 'المستخدمون والصلاحيات'), icon: UserRoundCog },
    { to: '/admin/settings', label: bi('Settings', 'الإعدادات'), icon: Settings },
  ] },
];

type Props = { open: boolean; collapsed: boolean; onClose: () => void; onCollapse: () => void };

export function AdminSidebar({ open, collapsed, onClose, onCollapse }: Props) {
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label="Admin navigation | تنقل الإدارة">
      <div className="admin-brand">
        <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
        <div className="admin-brand-copy">
          <strong>United Olympics Sports</strong><span lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</span>
          <BilingualText value={bi('Super Admin', 'الإدارة الرئيسية')} />
        </div>
        <button className="admin-icon-button mobile-only" onClick={onClose} aria-label="Close navigation | إغلاق القائمة"><X /></button>
      </div>
      <nav className="admin-nav">
        {sections.map(section => <section className="admin-nav-section" key={section.title.en}>
          <BilingualText value={section.title} className="admin-nav-heading" />
          {section.items.map(item => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={item.to} end={item.exact} onClick={onClose} title={`${item.label.en} | ${item.label.ar}`}><Icon /><BilingualText value={item.label} /></NavLink>;
          })}
        </section>)}
      </nav>
      <button className="sidebar-collapse desktop-only" onClick={onCollapse}><ChevronLeft /><BilingualText value={collapsed ? bi('Expand', 'توسيع') : bi('Collapse', 'طي القائمة')} /></button>
    </aside>
  );
}
