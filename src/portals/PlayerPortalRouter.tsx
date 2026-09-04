import '../styles/player-portal.css';
import '../styles/player-portal-chatgpt-black-gold.css';
import '../styles/player-portal-final.css';
import React, { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PlayerSessionProvider } from './player/PlayerSessionContext';
import { PlayerPortalShell } from './player/PlayerPortalShell';
import { PlayerProtectedRoute } from './player/PlayerProtectedRoute';
import { PlayerPortalErrorBoundary } from './player/components/PlayerPortalErrorBoundary';
import { PlayerRouteLoader } from './player/components/PlayerRouteLoader';

const load = <T extends Record<string, ComponentType>>(factory: () => Promise<T>, key: keyof T) =>
  lazy(() => factory().then((module) => ({ default: module[key] })));

const PlayerLoginPage = load(() => import('./player/auth/PlayerLoginPage'), 'PlayerLoginPage');
const PlayerPhoneAuthPage = load(() => import('./player/auth/PlayerPhoneAuthPage'), 'PlayerPhoneAuthPage');
const PlayerVerifyOtpPage = load(() => import('./player/auth/PlayerVerifyOtpPage'), 'PlayerVerifyOtpPage');
const PlayerPortalOverviewPage = load(() => import('../pages/portal/player/PlayerPortalOverviewPage'), 'PlayerPortalOverviewPage');
const PlayerPortalSchedulePage = load(() => import('../pages/portal/player/PlayerPortalSchedulePage'), 'PlayerPortalSchedulePage');
const PlayerPortalSessionDetailPage = load(() => import('../pages/portal/player/PlayerPortalSessionDetailPage'), 'PlayerPortalSessionDetailPage');
const PlayerPortalAttendancePage = load(() => import('../pages/portal/player/PlayerPortalAttendancePage'), 'PlayerPortalAttendancePage');
const PlayerPortalPerformancePage = load(() => import('../pages/portal/player/PlayerPortalPerformancePage'), 'PlayerPortalPerformancePage');
const PlayerPortalAchievementsPage = load(() => import('../pages/portal/player/PlayerPortalAchievementsPage'), 'PlayerPortalAchievementsPage');
const PlayerPortalFeedbackPage = load(() => import('../pages/portal/player/PlayerPortalFeedbackPage'), 'PlayerPortalFeedbackPage');
const PlayerPortalSubscriptionPage = load(() => import('../pages/portal/player/PlayerPortalSubscriptionPage'), 'PlayerPortalSubscriptionPage');
const PlayerPortalPaymentsPage = load(() => import('../pages/portal/player/PlayerPortalPaymentsPage'), 'PlayerPortalPaymentsPage');
const PlayerPortalDocumentsPage = load(() => import('../pages/portal/player/PlayerPortalDocumentsPage'), 'PlayerPortalDocumentsPage');
const PlayerPortalMessagesPage = load(() => import('../pages/portal/player/PlayerPortalMessagesPage'), 'PlayerPortalMessagesPage');
const PlayerPortalNotificationsPage = load(() => import('../pages/portal/player/PlayerPortalNotificationsPage'), 'PlayerPortalNotificationsPage');
const PlayerPortalProfilePage = load(() => import('../pages/portal/player/PlayerPortalProfilePage'), 'PlayerPortalProfilePage');
const PlayerPortalSettingsPage = load(() => import('../pages/portal/player/PlayerPortalSettingsPage'), 'PlayerPortalSettingsPage');
const PlayerPortalNotFoundPage = load(() => import('../pages/portal/player/PlayerPortalNotFoundPage'), 'PlayerPortalNotFoundPage');

function LazyRoute({ Component }: { Component: ComponentType }) {
  return <Suspense fallback={<PlayerRouteLoader />}><Component /></Suspense>;
}

function PortalShellLayout() {
  return (
    <PlayerProtectedRoute>
      <PlayerPortalErrorBoundary>
        <PlayerPortalShell><Outlet /></PlayerPortalShell>
      </PlayerPortalErrorBoundary>
    </PlayerProtectedRoute>
  );
}

export function PlayerPortalRouter() {
  return (
    <PlayerSessionProvider>
      <Routes>
        <Route path="login" element={<LazyRoute Component={PlayerLoginPage} />} />
        <Route path="auth/phone" element={<LazyRoute Component={PlayerPhoneAuthPage} />} />
        <Route path="auth/verify" element={<LazyRoute Component={PlayerVerifyOtpPage} />} />
        <Route path="phone" element={<Navigate to="../auth/phone" replace />} />
        <Route path="otp" element={<Navigate to="../auth/verify" replace />} />
        <Route element={<PortalShellLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<LazyRoute Component={PlayerPortalOverviewPage} />} />
          <Route path="schedule" element={<LazyRoute Component={PlayerPortalSchedulePage} />} />
          <Route path="schedule/:sessionId" element={<LazyRoute Component={PlayerPortalSessionDetailPage} />} />
          <Route path="session/:sessionId" element={<LazyRoute Component={PlayerPortalSessionDetailPage} />} />
          <Route path="attendance" element={<LazyRoute Component={PlayerPortalAttendancePage} />} />
          <Route path="performance" element={<LazyRoute Component={PlayerPortalPerformancePage} />} />
          <Route path="achievements" element={<LazyRoute Component={PlayerPortalAchievementsPage} />} />
          <Route path="feedback" element={<LazyRoute Component={PlayerPortalFeedbackPage} />} />
          <Route path="subscription" element={<LazyRoute Component={PlayerPortalSubscriptionPage} />} />
          <Route path="payments" element={<LazyRoute Component={PlayerPortalPaymentsPage} />} />
          <Route path="documents" element={<LazyRoute Component={PlayerPortalDocumentsPage} />} />
          <Route path="messages" element={<LazyRoute Component={PlayerPortalMessagesPage} />} />
          <Route path="notifications" element={<LazyRoute Component={PlayerPortalNotificationsPage} />} />
          <Route path="profile" element={<LazyRoute Component={PlayerPortalProfilePage} />} />
          <Route path="settings" element={<LazyRoute Component={PlayerPortalSettingsPage} />} />
          <Route path="*" element={<LazyRoute Component={PlayerPortalNotFoundPage} />} />
        </Route>
      </Routes>
    </PlayerSessionProvider>
  );
}
