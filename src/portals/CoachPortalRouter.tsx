import { lazy, Suspense, type ComponentType } from 'react';
import { Outlet, Route, Routes, Navigate } from 'react-router-dom';
import { PortalLayout } from '../layouts/PortalLayout';
import { PortalErrorBoundary, PortalNotFoundPage, PortalRouteLoader } from '../components/portal/PortalRouteState';
import { CoachSessionProvider } from './coach/CoachSessionContext';
import { CoachProtectedRoute } from './coach/CoachProtectedRoute';
import { CoachLoginPage } from './coach/CoachLoginPage';

const load = <T extends Record<string, ComponentType>>(factory: () => Promise<T>, key: keyof T) =>
  lazy(() => factory().then((module) => ({ default: module[key] })));

const CoachPortalOverviewPage = load(() => import('../pages/portal/coach/CoachPortalOverviewPage'), 'CoachPortalOverviewPage');
const CoachPortalSchedulePage = load(() => import('../pages/portal/coach/CoachPortalSchedulePage'), 'CoachPortalSchedulePage');
const CoachPortalGroupsPage = load(() => import('../pages/portal/coach/CoachPortalGroupsPage'), 'CoachPortalGroupsPage');
const CoachPortalEvaluationsPage = load(() => import('../pages/portal/coach/CoachPortalEvaluationsPage'), 'CoachPortalEvaluationsPage');
const CoachPortalProfilePage = load(() => import('../pages/portal/coach/CoachPortalProfilePage'), 'CoachPortalProfilePage');
const CoachPortalPlayersPage = load(() => import('../pages/portal/coach/CoachPortalPlayersPage'), 'CoachPortalPlayersPage');
const CoachPortalPlayerDetailPage = load(() => import('../pages/portal/coach/CoachPortalPlayerDetailPage'), 'CoachPortalPlayerDetailPage');
const CoachPortalGroupDetailPage = load(() => import('../pages/portal/coach/CoachPortalGroupDetailPage'), 'CoachPortalGroupDetailPage');
const CoachPortalAttendancePage = load(() => import('../pages/portal/coach/CoachPortalAttendancePage'), 'CoachPortalAttendancePage');
const CoachSessionProgramsPage = load(() => import('../pages/portal/coach/CoachSessionProgramsPage'), 'CoachSessionProgramsPage');
const CoachSessionMessagesPage = load(() => import('../pages/portal/coach/CoachSessionMessagesPage'), 'CoachSessionMessagesPage');

function CoachShellLayout() {
  return (
    <PortalErrorBoundary portal="coach">
      <PortalLayout portal="coach">
        <Suspense fallback={<PortalRouteLoader portal="coach" />}><Outlet /></Suspense>
      </PortalLayout>
    </PortalErrorBoundary>
  );
}

export function CoachPortalRouter() {
  return (
    <CoachSessionProvider>
      <Routes>
        <Route path="login" element={<CoachLoginPage />} />
        <Route
          path="*"
          element={
            <CoachProtectedRoute>
              <Routes>
                <Route element={<CoachShellLayout />}>
                  <Route index element={<Navigate to="home" replace />} />
                  <Route path="home" element={<CoachPortalOverviewPage />} />
                  <Route path="schedule" element={<CoachPortalSchedulePage />} />
                  <Route path="groups" element={<CoachPortalGroupsPage />} />
                  <Route path="evaluations" element={<CoachPortalEvaluationsPage />} />
                  <Route path="players" element={<CoachPortalPlayersPage />} />
                  <Route path="players/:playerId" element={<CoachPortalPlayerDetailPage />} />
                  <Route path="groups/:groupId" element={<CoachPortalGroupDetailPage />} />
                  <Route path="attendance" element={<CoachPortalAttendancePage />} />
                  <Route path="programs" element={<CoachSessionProgramsPage />} />
                  <Route path="messages" element={<CoachSessionMessagesPage />} />
                  <Route path="profile" element={<CoachPortalProfilePage />} />
                  <Route path="*" element={<PortalNotFoundPage portal="coach" />} />
                </Route>
              </Routes>
            </CoachProtectedRoute>
          }
        />
      </Routes>
    </CoachSessionProvider>
  );
}
