import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { bi } from '../components/bilingual/BilingualText';
import { getGroup, getPlayer, getSport } from '../data/demo/selectors';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminFutureModulePage } from '../pages/admin/AdminFutureModulePage';
import { AdminGroupDetailPage } from '../pages/admin/AdminGroupDetailPage';
import { AdminPlayerDetailPage } from '../pages/admin/AdminPlayerDetailPage';
import { AdminPlayersPage } from '../pages/admin/AdminPlayersPage';
import { AdminSportDetailPage } from '../pages/admin/AdminSportDetailPage';
import { AdminSportsPage } from '../pages/admin/AdminSportsPage';
import '../styles/admin.css';

const routeLabels: Record<string, { en: string; ar: string }> = {
  sports: bi('Sports', 'الرياضات'), players: bi('Players', 'اللاعبون'), groups: bi('Training Groups', 'مجموعات التدريب'), parents: bi('Parents', 'أولياء الأمور'), coaches: bi('Coaches', 'المدربون'), programs: bi('Programs', 'البرامج'), schedules: bi('Schedules', 'الجداول'), attendance: bi('Attendance', 'الحضور'), performance: bi('Performance', 'الأداء'), countries: bi('Countries', 'الدول'), branches: bi('Branches', 'الفروع'), subscriptions: bi('Subscriptions', 'الاشتراكات'), payments: bi('Payments', 'المدفوعات'), reports: bi('Reports', 'التقارير'), content: bi('Content', 'المحتوى'), users: bi('Users & Roles', 'المستخدمون والصلاحيات'), settings: bi('Settings', 'الإعدادات'),
};

function usePageTitle() {
  const location = useLocation();
  return useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean).slice(1); const last = segments.at(-1);
    if (!last) return bi('Dashboard', 'لوحة التحكم');
    const player = getPlayer(last); if (player) return { en: player.nameEn, ar: player.nameAr };
    const sport = getSport(last); if (sport) return sport.name;
    const group = getGroup(last); if (group) return group.name;
    return routeLabels[last] ?? bi('Super Admin', 'الإدارة الرئيسية');
  }, [location.pathname]);
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const title = usePageTitle();
  return <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <AdminSidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onCollapse={() => setCollapsed(!collapsed)} />
    {sidebarOpen && <button className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation | إغلاق القائمة" />}
    <div className="admin-workspace"><AdminTopbar title={title} onMenu={() => setSidebarOpen(true)} /><main className="admin-main"><AdminBreadcrumbs /><Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="sports" element={<AdminSportsPage />} />
      <Route path="sports/:sportId/groups/:groupId" element={<AdminGroupDetailPage />} />
      <Route path="sports/:sportId/groups" element={<AdminSportDetailPage />} />
      <Route path="sports/:sportId" element={<AdminSportDetailPage />} />
      <Route path="players" element={<AdminPlayersPage />} />
      <Route path="players/:playerId" element={<AdminPlayerDetailPage />} />
      {Object.keys(routeLabels).filter(path => !['sports', 'players'].includes(path)).map(path => <Route key={path} path={path} element={<AdminFutureModulePage />} />)}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes></main></div>
  </div>;
}
