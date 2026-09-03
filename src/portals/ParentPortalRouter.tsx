import { lazy, Suspense, type ComponentType } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { PortalLayout } from '../layouts/PortalLayout';
import { PortalErrorBoundary, PortalNotFoundPage, PortalRouteLoader } from '../components/portal/PortalRouteState';

const load = <T extends Record<string, ComponentType>>(factory: () => Promise<T>, key: keyof T) =>
  lazy(() => factory().then((module) => ({ default: module[key] })));

const ParentPortalOverviewPage = load(() => import('../pages/portal/parent/ParentPortalOverviewPage'), 'ParentPortalOverviewPage');
const ParentPortalChildrenPage = load(() => import('../pages/portal/parent/ParentPortalChildrenPage'), 'ParentPortalChildrenPage');
const ParentPortalChildDetailPage = load(() => import('../pages/portal/parent/ParentPortalChildDetailPage'), 'ParentPortalChildDetailPage');
const ParentPortalSubscriptionsPage = load(() => import('../pages/portal/parent/ParentPortalSubscriptionsPage'), 'ParentPortalSubscriptionsPage');
const ParentPortalDocumentsPage = load(() => import('../pages/portal/parent/ParentPortalDocumentsPage'), 'ParentPortalDocumentsPage');
const ParentPortalMessagesPage = load(() => import('../pages/portal/parent/ParentPortalMessagesPage'), 'ParentPortalMessagesPage');
const ParentPortalProfilePage = load(() => import('../pages/portal/parent/ParentPortalProfilePage'), 'ParentPortalProfilePage');
const ParentPortalSchedulePage = load(() => import('../pages/portal/parent/ParentPortalSchedulePage'), 'ParentPortalSchedulePage');
const ParentPortalPerformancePage = load(() => import('../pages/portal/parent/ParentPortalPerformancePage'), 'ParentPortalPerformancePage');
const ParentPortalFeedbackPage = load(() => import('../pages/portal/parent/ParentPortalFeedbackPage'), 'ParentPortalFeedbackPage');
const ParentPortalPaymentsPage = load(() => import('../pages/portal/parent/ParentPortalPaymentsPage'), 'ParentPortalPaymentsPage');

function ParentShellLayout() {
  return (
    <PortalErrorBoundary portal="parent">
      <PortalLayout portal="parent">
        <Suspense fallback={<PortalRouteLoader portal="parent" />}><Outlet /></Suspense>
      </PortalLayout>
    </PortalErrorBoundary>
  );
}

export function ParentPortalRouter() {
  return (
    <Routes>
      <Route element={<ParentShellLayout />}>
        <Route index element={<ParentPortalOverviewPage />} />
        <Route path="children" element={<ParentPortalChildrenPage />} />
        <Route path="children/:childId" element={<ParentPortalChildDetailPage />} />
        <Route path="subscriptions" element={<ParentPortalSubscriptionsPage />} />
        <Route path="documents" element={<ParentPortalDocumentsPage />} />
        <Route path="messages" element={<ParentPortalMessagesPage />} />
        <Route path="schedule" element={<ParentPortalSchedulePage />} />
        <Route path="performance" element={<ParentPortalPerformancePage />} />
        <Route path="feedback" element={<ParentPortalFeedbackPage />} />
        <Route path="payments" element={<ParentPortalPaymentsPage />} />
        <Route path="profile" element={<ParentPortalProfilePage />} />
        <Route path="*" element={<PortalNotFoundPage portal="parent" />} />
      </Route>
    </Routes>
  );
}
