import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import { PortalLayout } from '../layouts/PortalLayout';
import { BilingualText } from '../components/bilingual/BilingualText';

const PlayerPortalOverviewPage = lazy(() => import('../pages/portal/player/PlayerPortalOverviewPage').then(m => ({ default: m.PlayerPortalOverviewPage })));
const PlayerPortalSchedulePage = lazy(() => import('../pages/portal/player/PlayerPortalSchedulePage').then(m => ({ default: m.PlayerPortalSchedulePage })));
const PlayerPortalPerformancePage = lazy(() => import('../pages/portal/player/PlayerPortalPerformancePage').then(m => ({ default: m.PlayerPortalPerformancePage })));
const PlayerPortalFeedbackPage = lazy(() => import('../pages/portal/player/PlayerPortalFeedbackPage').then(m => ({ default: m.PlayerPortalFeedbackPage })));
const PlayerPortalAchievementsPage = lazy(() => import('../pages/portal/player/PlayerPortalAchievementsPage').then(m => ({ default: m.PlayerPortalAchievementsPage })));
const PlayerPortalAttendancePage = lazy(() => import('../pages/portal/player/PlayerPortalAttendancePage').then(m => ({ default: m.PlayerPortalAttendancePage })));
const PlayerPortalDocumentsPage = lazy(() => import('../pages/portal/player/PlayerPortalDocumentsPage').then(m => ({ default: m.PlayerPortalDocumentsPage })));
const PlayerPortalProfilePage = lazy(() => import('../pages/portal/player/PlayerPortalProfilePage').then(m => ({ default: m.PlayerPortalProfilePage })));

function LazyRoute({ Component }: { Component: ComponentType }) {
  return <Suspense fallback={<div className="admin-preview-card" style={{ padding: 32, textAlign: 'center' }}><BilingualText value={{ en: 'Loading...', ar: 'جارٍ التحميل...' }} /></div>}><Component /></Suspense>;
}

export function PlayerPortalRouter() {
  return <PortalLayout portal="player"><Routes>
    <Route index element={<LazyRoute Component={PlayerPortalOverviewPage} />} />
    <Route path="schedule" element={<LazyRoute Component={PlayerPortalSchedulePage} />} />
    <Route path="performance" element={<LazyRoute Component={PlayerPortalPerformancePage} />} />
    <Route path="feedback" element={<LazyRoute Component={PlayerPortalFeedbackPage} />} />
    <Route path="achievements" element={<LazyRoute Component={PlayerPortalAchievementsPage} />} />
    <Route path="attendance" element={<LazyRoute Component={PlayerPortalAttendancePage} />} />
    <Route path="documents" element={<LazyRoute Component={PlayerPortalDocumentsPage} />} />
    <Route path="profile" element={<LazyRoute Component={PlayerPortalProfilePage} />} />
  </Routes></PortalLayout>;
}
