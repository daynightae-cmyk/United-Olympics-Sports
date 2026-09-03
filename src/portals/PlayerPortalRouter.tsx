import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import { PortalLayout } from '../layouts/PortalLayout';
import { BilingualText } from '../components/bilingual/BilingualText';
import { PlayerSessionProvider } from './player/PlayerSessionContext';
import { PlayerAuthPage } from '../pages/portal/player/PlayerAuthPage';
import { PlayerPortalMessagesPage, PlayerPortalNotificationsPage, PlayerPortalPaymentsPage, PlayerPortalSettingsPage, PlayerPortalSubscriptionPage, PlayerSessionDetailPage } from '../pages/portal/player/PlayerPortalWorkspaces';

const PlayerPortalOverviewPage = lazy(() => import('../pages/portal/player/PlayerPortalOverviewPage').then(m => ({ default: m.PlayerPortalOverviewPage })));
const PlayerPortalSchedulePage = lazy(() => import('../pages/portal/player/PlayerPortalSchedulePage').then(m => ({ default: m.PlayerPortalSchedulePage })));
const PlayerPortalPerformancePage = lazy(() => import('../pages/portal/player/PlayerPortalPerformancePage').then(m => ({ default: m.PlayerPortalPerformancePage })));
const PlayerPortalFeedbackPage = lazy(() => import('../pages/portal/player/PlayerPortalFeedbackPage').then(m => ({ default: m.PlayerPortalFeedbackPage })));
const PlayerPortalAchievementsPage = lazy(() => import('../pages/portal/player/PlayerPortalAchievementsPage').then(m => ({ default: m.PlayerPortalAchievementsPage })));
const PlayerPortalAttendancePage = lazy(() => import('../pages/portal/player/PlayerPortalAttendancePage').then(m => ({ default: m.PlayerPortalAttendancePage })));
const PlayerPortalDocumentsPage = lazy(() => import('../pages/portal/player/PlayerPortalDocumentsPage').then(m => ({ default: m.PlayerPortalDocumentsPage })));
const PlayerPortalProfilePage = lazy(() => import('../pages/portal/player/PlayerPortalProfilePage').then(m => ({ default: m.PlayerPortalProfilePage })));

function LazyRoute({ Component }: { Component: ComponentType }) {
  return <Suspense fallback={<div className="player-skeleton" aria-label="Loading player content | جارٍ تحميل محتوى اللاعب"><i/><i/><i/></div>}><Component /></Suspense>;
}

export function PlayerPortalRouter() {
  return <PlayerSessionProvider><Routes>
    <Route path="login" element={<PlayerAuthPage />} />
    <Route path="auth/phone" element={<PlayerAuthPage initialStep="phone" />} />
    <Route path="auth/verify" element={<PlayerAuthPage initialStep="verify" />} />
    <Route path="*" element={<PortalLayout portal="player"><Routes>
    <Route index element={<LazyRoute Component={PlayerPortalOverviewPage} />} />
    <Route path="home" element={<LazyRoute Component={PlayerPortalOverviewPage} />} />
    <Route path="schedule" element={<LazyRoute Component={PlayerPortalSchedulePage} />} />
    <Route path="performance" element={<LazyRoute Component={PlayerPortalPerformancePage} />} />
    <Route path="feedback" element={<LazyRoute Component={PlayerPortalFeedbackPage} />} />
    <Route path="achievements" element={<LazyRoute Component={PlayerPortalAchievementsPage} />} />
    <Route path="attendance" element={<LazyRoute Component={PlayerPortalAttendancePage} />} />
    <Route path="documents" element={<LazyRoute Component={PlayerPortalDocumentsPage} />} />
    <Route path="profile" element={<LazyRoute Component={PlayerPortalProfilePage} />} />
    <Route path="subscription" element={<LazyRoute Component={PlayerPortalSubscriptionPage} />} />
    <Route path="payments" element={<LazyRoute Component={PlayerPortalPaymentsPage} />} />
    <Route path="messages" element={<LazyRoute Component={PlayerPortalMessagesPage} />} />
    <Route path="notifications" element={<LazyRoute Component={PlayerPortalNotificationsPage} />} />
    <Route path="settings" element={<LazyRoute Component={PlayerPortalSettingsPage} />} />
    <Route path="schedule/:sessionId" element={<LazyRoute Component={PlayerSessionDetailPage} />} />
  </Routes></PortalLayout>} />
  </Routes></PlayerSessionProvider>;
}
