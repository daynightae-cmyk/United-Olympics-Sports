import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import { PlayerSessionProvider } from './player/PlayerSessionContext';
import { PlayerLoginPage } from './player/auth/PlayerLoginPage';
import { PlayerPortalShell } from './player/PlayerPortalShell';
import { PlayerProtectedRoute } from './player/PlayerProtectedRoute';
import { BilingualText } from '../components/bilingual/BilingualText';
import { PlayerPortalNotFoundPage } from '../pages/portal/player/PlayerPortalNotFoundPage';

const PlayerPortalOverviewPage = lazy(() => import('../pages/portal/player/PlayerPortalOverviewPage').then(m => ({ default: m.PlayerPortalOverviewPage })));
const PlayerPortalSchedulePage = lazy(() => import('../pages/portal/player/PlayerPortalSchedulePage').then(m => ({ default: m.PlayerPortalSchedulePage })));
const PlayerPortalSessionDetailPage = lazy(() => import('../pages/portal/player/PlayerPortalSessionDetailPage').then(m => ({ default: m.PlayerPortalSessionDetailPage })));
const PlayerPortalPerformancePage = lazy(() => import('../pages/portal/player/PlayerPortalPerformancePage').then(m => ({ default: m.PlayerPortalPerformancePage })));
const PlayerPortalFeedbackPage = lazy(() => import('../pages/portal/player/PlayerPortalFeedbackPage').then(m => ({ default: m.PlayerPortalFeedbackPage })));
const PlayerPortalAchievementsPage = lazy(() => import('../pages/portal/player/PlayerPortalAchievementsPage').then(m => ({ default: m.PlayerPortalAchievementsPage })));
const PlayerPortalAttendancePage = lazy(() => import('../pages/portal/player/PlayerPortalAttendancePage').then(m => ({ default: m.PlayerPortalAttendancePage })));
const PlayerPortalDocumentsPage = lazy(() => import('../pages/portal/player/PlayerPortalDocumentsPage').then(m => ({ default: m.PlayerPortalDocumentsPage })));
const PlayerPortalMessagesPage = lazy(() => import('../pages/portal/player/PlayerPortalMessagesPage').then(m => ({ default: m.PlayerPortalMessagesPage })));
const PlayerPortalNotificationsPage = lazy(() => import('../pages/portal/player/PlayerPortalNotificationsPage').then(m => ({ default: m.PlayerPortalNotificationsPage })));
const PlayerPortalSubscriptionPage = lazy(() => import('../pages/portal/player/PlayerPortalSubscriptionPage').then(m => ({ default: m.PlayerPortalSubscriptionPage })));
const PlayerPortalPaymentsPage = lazy(() => import('../pages/portal/player/PlayerPortalPaymentsPage').then(m => ({ default: m.PlayerPortalPaymentsPage })));
const PlayerPortalSettingsPage = lazy(() => import('../pages/portal/player/PlayerPortalSettingsPage').then(m => ({ default: m.PlayerPortalSettingsPage })));
const PlayerPortalProfilePage = lazy(() => import('../pages/portal/player/PlayerPortalProfilePage').then(m => ({ default: m.PlayerPortalProfilePage })));

function LazyRoute({ Component }: { Component: ComponentType }) {
  return (
    <Suspense
      fallback={
        <div data-route-loading="true" role="status" aria-live="polite" aria-busy="true" className="athlete-glass-card" style={{ padding: 32, textAlign: 'center', margin: 24 }}>
          <BilingualText value={{ en: 'Loading…', ar: 'جارٍ التحميل…' }} />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

function LegacyPlayerSessionRedirect() {
  const { sessionId } = useParams();
  return <Navigate to={sessionId ? `/player/schedule/${sessionId}` : '/player/schedule'} replace />;
}

export function PlayerPortalRouter() {
  return (
    <PlayerSessionProvider>
      <Routes>
        <Route path="login" element={<PlayerLoginPage />} />

        {/* Legacy auth URLs remain renderable while phone/OTP production auth is not configured. */}
        <Route path="auth/phone" element={<PlayerLoginPage />} />
        <Route path="auth/verify" element={<PlayerLoginPage />} />
        <Route path="otp" element={<PlayerLoginPage />} />
        <Route path="phone" element={<Navigate to="/player/login" replace />} />
        <Route path="verify" element={<Navigate to="/player/login" replace />} />

        <Route
          path="*"
          element={
            <PlayerProtectedRoute>
              <PlayerPortalShell>
                <Routes>
                  <Route index element={<Navigate to="/player/home" replace />} />
                  <Route path="home" element={<LazyRoute Component={PlayerPortalOverviewPage} />} />
                  <Route path="schedule" element={<LazyRoute Component={PlayerPortalSchedulePage} />} />
                  <Route path="schedule/:sessionId" element={<LazyRoute Component={PlayerPortalSessionDetailPage} />} />
                  <Route path="session/:sessionId" element={<LegacyPlayerSessionRedirect />} />
                  <Route path="performance" element={<LazyRoute Component={PlayerPortalPerformancePage} />} />
                  <Route path="feedback" element={<LazyRoute Component={PlayerPortalFeedbackPage} />} />
                  <Route path="achievements" element={<LazyRoute Component={PlayerPortalAchievementsPage} />} />
                  <Route path="attendance" element={<LazyRoute Component={PlayerPortalAttendancePage} />} />
                  <Route path="documents" element={<LazyRoute Component={PlayerPortalDocumentsPage} />} />
                  <Route path="messages" element={<LazyRoute Component={PlayerPortalMessagesPage} />} />
                  <Route path="notifications" element={<LazyRoute Component={PlayerPortalNotificationsPage} />} />
                  <Route path="subscription" element={<LazyRoute Component={PlayerPortalSubscriptionPage} />} />
                  <Route path="payments" element={<LazyRoute Component={PlayerPortalPaymentsPage} />} />
                  <Route path="profile" element={<LazyRoute Component={PlayerPortalProfilePage} />} />
                  <Route path="settings" element={<LazyRoute Component={PlayerPortalSettingsPage} />} />
                  <Route path="*" element={<PlayerPortalNotFoundPage />} />
                </Routes>
              </PlayerPortalShell>
            </PlayerProtectedRoute>
          }
        />
      </Routes>
    </PlayerSessionProvider>
  );
}
