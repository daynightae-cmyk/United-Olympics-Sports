import { ChevronLeft, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { adminIconRegistry, type AdminIconKey } from '../../ui/icons/iconRegistry';
import { BilingualText, bi } from '../bilingual/BilingualText';

type NavItem = { to: string; exact?: boolean; label: { en: string; ar: string }; icon: AdminIconKey };
const sections: Array<{ title: { en: string; ar: string }; items: NavItem[] }> = [
  { title: bi('Operations', 'العمليات'), items: [
    { to: '/admin', exact: true, label: bi('Dashboard', 'لوحة التحكم'), icon: 'dashboard' },
    { to: '/admin/sports', label: bi('Sports', 'الرياضات'), icon: 'sports' },
    { to: '/admin/groups', label: bi('Training Groups / Teams', 'الفرق / مجموعات التدريب'), icon: 'groups' },
    { to: '/admin/players', label: bi('Players', 'اللاعبون'), icon: 'players' },
    { to: '/admin/parents', label: bi('Parents', 'أولياء الأمور'), icon: 'parents' },
    { to: '/admin/coaches', label: bi('Coaches', 'المدربون'), icon: 'coaches' },
    { to: '/admin/programs', label: bi('Programs', 'البرامج'), icon: 'programs' },
    { to: '/admin/schedules', label: bi('Schedules', 'الجداول'), icon: 'schedules' },
    { to: '/admin/attendance', label: bi('Attendance', 'الحضور'), icon: 'attendance' },
    { to: '/admin/performance', label: bi('Performance', 'الأداء'), icon: 'performance' },
  ] },
  { title: bi('Organization', 'المؤسسة'), items: [
    { to: '/admin/countries', label: bi('Countries', 'الدول'), icon: 'countries' },
    { to: '/admin/branches', label: bi('Branches', 'الفروع'), icon: 'branches' },
  ] },
  { title: bi('Finance', 'المالية'), items: [
    { to: '/admin/subscriptions', label: bi('Subscriptions', 'الاشتراكات'), icon: 'subscriptions' },
    { to: '/admin/payments', label: bi('Payments', 'المدفوعات'), icon: 'payments' },
    { to: '/admin/reports', label: bi('Reports', 'التقارير'), icon: 'reports' },
  ] },
  { title: bi('System', 'النظام'), items: [
    { to: '/admin/content', label: bi('Content', 'المحتوى'), icon: 'content' },
    { to: '/admin/users', label: bi('Users & Roles', 'المستخدمون والصلاحيات'), icon: 'users' },
    { to: '/admin/settings', label: bi('Settings', 'الإعدادات'), icon: 'settings' },
  ] },
];

type Props = { open: boolean; collapsed: boolean; onClose: () => void; onCollapse: () => void };
export function AdminSidebar({ open, collapsed, onClose, onCollapse }: Props) {
  return <aside className={`admin-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label="Admin navigation | تنقل الإدارة">
    <div className="admin-brand">
      <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
      <div className="admin-brand-copy"><strong>United Olympics Sports</strong><span lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</span><BilingualText value={bi('Super Admin', 'الإدارة الرئيسية')} /></div>
      <button type="button" className="admin-icon-button mobile-only" onClick={onClose} aria-label="Close navigation | إغلاق القائمة"><X aria-hidden="true" /></button>
    </div>
    <nav className="admin-nav">{sections.map((section) => <section className="admin-nav-section" key={section.title.en}>
      <BilingualText value={section.title} className="admin-nav-heading" />
      {section.items.map((item) => { const Icon = adminIconRegistry[item.icon]; return <NavLink key={item.to} to={item.to} end={item.exact} onClick={onClose} title={`${item.label.en} | ${item.label.ar}`}><Icon aria-hidden="true" /><BilingualText value={item.label} /></NavLink>; })}
    </section>)}</nav>
    <button type="button" className="sidebar-collapse desktop-only" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar | توسيع القائمة الجانبية' : 'Collapse sidebar | طي القائمة الجانبية'}><ChevronLeft aria-hidden="true" /><BilingualText value={collapsed ? bi('Expand', 'توسيع') : bi('Collapse', 'طي القائمة')} /></button>
  </aside>;
}
