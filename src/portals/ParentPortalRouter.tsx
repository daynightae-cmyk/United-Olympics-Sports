import '../styles/parent-portal-final.css';
import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PortalLayout } from '../layouts/PortalLayout';
import { PortalErrorBoundary, PortalNotFoundPage, PortalRouteLoader } from '../components/portal/PortalRouteState';
import { readParentSession } from './parent/parentData';

const load = <T extends Record<string, ComponentType>>(factory: () => Promise<T>, key: keyof T) =>
  lazy(() => factory().then((module) => ({ default: module[key] })));

const ParentLoginPage = load(() => import('./parent/ParentLoginPage'), 'ParentLoginPage');
const ParentPortalOverviewPage = load(() => import('../pages/portal/parent/ParentPortalOverviewPage'), 'ParentPortalOverviewPage');
const ParentPortalChildrenPage = load(() => import('../pages/portal/parent/ParentPortalChildrenPage'), 'ParentPortalChildrenPage');
const ParentPortalChildDetailPage = load(() => import('../pages/portal/parent/ParentPortalChildDetailPage'), 'ParentPortalChildDetailPage');
const ParentPortalSubscriptionsPage = load(() => import('../pages/portal/parent/ParentPortalSubscriptionsPage'), 'ParentPortalSubscriptionsPage');
const ParentPortalDocumentsPage = load(() => import('../pages/portal/parent/ParentPortalDocumentsPage'), 'ParentPortalDocumentsPage');
const ParentPortalMessagesPage = load(() => import('../pages/portal/parent/ParentPortalMessagesPage'), 'ParentPortalMessagesPage');
const ParentPortalProfilePage = load(() => import('../pages/portal/parent/ParentPortalProfilePage'), 'ParentPortalProfilePage');
const ParentPortalSchedulePage = load(() => import('../pages/portal/parent/ParentPortalSchedulePage'), 'ParentPortalSchedulePage');
const ParentPortalAttendancePage = load(() => import('../pages/portal/parent/ParentPortalAttendancePage'), 'ParentPortalAttendancePage');
const ParentPortalPerformancePage = load(() => import('../pages/portal/parent/ParentPortalPerformancePage'), 'ParentPortalPerformancePage');
const ParentPortalFeedbackPage = load(() => import('../pages/portal/parent/ParentPortalFeedbackPage'), 'ParentPortalFeedbackPage');
const ParentPortalPaymentsPage = load(() => import('../pages/portal/parent/ParentPortalPaymentsPage'), 'ParentPortalPaymentsPage');
const ParentPortalNotificationsPage = load(() => import('../pages/portal/parent/ParentPortalNotificationsPage'), 'ParentPortalNotificationsPage');
const ParentPortalSettingsPage = load(() => import('../pages/portal/parent/ParentPortalSettingsPage'), 'ParentPortalSettingsPage');

function ParentProtectedRoute({ children }: { children: React.ReactNode }) {
  return readParentSession() ? children : <Navigate to="/parent/login" replace />;
}

function ParentShellLayout() {
  return (
    <ParentProtectedRoute>
      <PortalErrorBoundary portal="parent">
        <PortalLayout portal="parent">
          <Suspense fallback={<PortalRouteLoader portal="parent" />}><Outlet /></Suspense>
        </PortalLayout>
      </PortalErrorBoundary>
    </ParentProtectedRoute>
  );
}

function LazyLogin() { return <Suspense fallback={<PortalRouteLoader portal="parent" />}><ParentLoginPage /></Suspense>; }

export function ParentPortalRouter() {
  return (
    <Routes>
      <Route path="login" element={<LazyLogin />} />
      <Route element={<ParentShellLayout />}>
        <Route index element={<ParentPortalOverviewPage />} />
        <Route path="children" element={<ParentPortalChildrenPage />} />
        <Route path="children/:childId" element={<ParentPortalChildDetailPage />} />
        <Route path="schedule" element={<ParentPortalSchedulePage />} />
        <Route path="attendance" element={<ParentPortalAttendancePage />} />
        <Route path="performance" element={<ParentPortalPerformancePage />} />
        <Route path="feedback" element={<ParentPortalFeedbackPage />} />
        <Route path="subscriptions" element={<ParentPortalSubscriptionsPage />} />
        <Route path="payments" element={<ParentPortalPaymentsPage />} />
        <Route path="documents" element={<ParentPortalDocumentsPage />} />
        <Route path="messages" element={<ParentPortalMessagesPage />} />
        <Route path="notifications" element={<ParentPortalNotificationsPage />} />
        <Route path="profile" element={<ParentPortalProfilePage />} />
        <Route path="settings" element={<ParentPortalSettingsPage />} />
        <Route path="*" element={<PortalNotFoundPage portal="parent" />} />
      </Route>
    </Routes>
  );
}
