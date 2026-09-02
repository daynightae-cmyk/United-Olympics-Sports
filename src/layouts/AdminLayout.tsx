import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { bi } from '../components/bilingual/BilingualText';
import { getBranch, getCoach, getCountry, getGroup, getParent, getPlayer, getProgram, getSport } from '../data/demo/selectors';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminFutureModulePage } from '../pages/admin/AdminFutureModulePage';
import { AdminGroupDetailPage } from '../pages/admin/AdminGroupDetailPage';
import { AdminPlayerDetailPage } from '../pages/admin/AdminPlayerDetailPage';
import { AdminPlayersPage } from '../pages/admin/AdminPlayersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminSportDetailPage } from '../pages/admin/AdminSportDetailPage';
import { AdminSportsPage } from '../pages/admin/AdminSportsPage';
import { AdminCountriesPage } from '../pages/admin/AdminCountriesPage';
import { AdminCountryDetailPage } from '../pages/admin/AdminCountryDetailPage';
import { AdminBranchesPage } from '../pages/admin/AdminBranchesPage';
import { AdminBranchDetailPage } from '../pages/admin/AdminBranchDetailPage';
import { AdminProgramsPage } from '../pages/admin/AdminProgramsPage';
import { AdminProgramDetailPage } from '../pages/admin/AdminProgramDetailPage';
import { AdminParentsPage } from '../pages/admin/AdminParentsPage';
import { AdminParentDetailPage } from '../pages/admin/AdminParentDetailPage';
import { AdminCoachesPage } from '../pages/admin/AdminCoachesPage';
import { AdminCoachDetailPage } from '../pages/admin/AdminCoachDetailPage';
import { AdminSchedulesPage } from '../pages/admin/AdminSchedulesPage';
import { AdminSessionDetailPage } from '../pages/admin/AdminSessionDetailPage';
import { AdminAttendancePage } from '../pages/admin/AdminAttendancePage';
import { AdminPerformancePage } from '../pages/admin/AdminPerformancePage';
import { AdminSubscriptionsPage } from '../pages/admin/AdminSubscriptionsPage';
import { AdminSubscriptionDetailPage } from '../pages/admin/AdminSubscriptionDetailPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminPaymentDetailPage } from '../pages/admin/AdminPaymentDetailPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminContentPage } from '../pages/admin/AdminContentPage';
import { AdminContentDetailPage } from '../pages/admin/AdminContentDetailPage';
import { AdminCustomizationPage } from '../pages/admin/AdminCustomizationPage';
import { useUiSettings } from '../ui/theme/useUiSettings';
import '../styles/admin.css';

const routeLabels: Record<string, { en: string; ar: string }> = {
  sports: bi('Sports', 'الرياضات'), players: bi('Players', 'اللاعبون'), groups: bi('Training Groups', 'مجموعات التدريب'), parents: bi('Parents', 'أولياء الأمور'), coaches: bi('Coaches', 'المدربون'), programs: bi('Programs', 'البرامج'), schedules: bi('Schedules', 'الجداول'), attendance: bi('Attendance', 'الحضور'), performance: bi('Performance', 'الأداء'), countries: bi('Countries', 'الدول'), branches: bi('Branches', 'الفروع'), subscriptions: bi('Subscriptions', 'الاشتراكات'), payments: bi('Payments', 'المدفوعات'), reports: bi('Reports', 'التقارير'), content: bi('Content', 'المحتوى'), users: bi('Users & Roles', 'المستخدمون والصلاحيات'), settings: bi('Settings', 'الإعدادات'),
};

function usePageTitle() {
  const location = useLocation();
  return useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean).slice(1);
    const last = segments.at(-1);
    if (!last) return bi('Dashboard', 'لوحة التحكم');
    const player = getPlayer(last); if (player) return { en: player.nameEn, ar: player.nameAr };
    const sport = getSport(last); if (sport) return sport.name;
    const group = getGroup(last); if (group) return group.name;
    const country = getCountry(last); if (country) return country.name;
    const branch = getBranch(last); if (branch) return branch.name;
    const coach = getCoach(last); if (coach) return { en: coach.nameEn, ar: coach.nameAr };
    const parent = getParent(last); if (parent) return { en: parent.nameEn, ar: parent.nameAr };
    const program = getProgram(last); if (program) return program.name;
    return routeLabels[last] ?? bi('Super Admin', 'الإدارة الرئيسية');
  }, [location.pathname]);
}

export function AdminLayout() {
  const { sidebarDefault, setSetting, density, fontScale } = useUiSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(sidebarDefault === 'collapsed');
  const title = usePageTitle();

  useEffect(() => { setCollapsed(sidebarDefault === 'collapsed'); }, [sidebarDefault]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''} density-${density} font-${fontScale}`}>
    <AdminSidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onCollapse={() => { const nextCollapsed = !collapsed; setCollapsed(nextCollapsed); setSetting('sidebarDefault', nextCollapsed ? 'collapsed' : 'expanded'); }} />
    {sidebarOpen && <button type="button" className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation | إغلاق القائمة" />}
    <div className="admin-workspace"><AdminTopbar title={title} onMenu={() => setSidebarOpen(true)} /><main className="admin-main"><AdminBreadcrumbs /><Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="sports" element={<AdminSportsPage />} />
      <Route path="sports/:sportId/groups/:groupId" element={<AdminGroupDetailPage />} />
      <Route path="sports/:sportId/groups" element={<AdminSportDetailPage />} />
      <Route path="sports/:sportId" element={<AdminSportDetailPage />} />
      <Route path="players" element={<AdminPlayersPage />} />
      <Route path="players/:playerId" element={<AdminPlayerDetailPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
      <Route path="countries" element={<AdminCountriesPage />} />
      <Route path="countries/:countryId" element={<AdminCountryDetailPage />} />
      <Route path="branches" element={<AdminBranchesPage />} />
      <Route path="branches/:branchId" element={<AdminBranchDetailPage />} />
      <Route path="programs" element={<AdminProgramsPage />} />
      <Route path="programs/:programId" element={<AdminProgramDetailPage />} />
      <Route path="parents" element={<AdminParentsPage />} />
      <Route path="parents/:parentId" element={<AdminParentDetailPage />} />
      <Route path="coaches" element={<AdminCoachesPage />} />
      <Route path="coaches/:coachId" element={<AdminCoachDetailPage />} />
      <Route path="schedules" element={<AdminSchedulesPage />} />
      <Route path="schedules/:sessionId" element={<AdminSessionDetailPage />} />
      <Route path="attendance" element={<AdminAttendancePage />} />
      <Route path="performance" element={<AdminPerformancePage />} />
      <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
      <Route path="subscriptions/:subscriptionId" element={<AdminSubscriptionDetailPage />} />
      <Route path="payments" element={<AdminPaymentsPage />} />
      <Route path="payments/:paymentId" element={<AdminPaymentDetailPage />} />
      <Route path="reports" element={<AdminReportsPage />} />
      <Route path="customization" element={<AdminCustomizationPage />} />
      <Route path="content" element={<AdminContentPage />} />
      <Route path="content/:contentId" element={<AdminContentDetailPage />} />
      {Object.keys(routeLabels).filter((path) => !['sports','players','settings','countries','branches','programs','parents','coaches','schedules','attendance','performance','subscriptions','payments','reports','content'].includes(path)).map((path) => <Route key={path} path={path} element={<AdminFutureModulePage />} />)}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes></main></div>
  </div>;
}
