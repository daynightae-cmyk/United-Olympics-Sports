import { Routes, Route } from 'react-router-dom';
import { PlayerPortalOverviewPage } from '../pages/admin/PlayerPortalOverviewPage';
import { PlayerPortalSchedulePage } from '../pages/admin/PlayerPortalSchedulePage';
import { PlayerPortalPerformancePage } from '../pages/admin/PlayerPortalPerformancePage';
import { PlayerPortalFeedbackPage } from '../pages/admin/PlayerPortalFeedbackPage';
import { PlayerPortalAchievementsPage } from '../pages/admin/PlayerPortalAchievementsPage';

export function PlayerPortalRouter() {
  return <Routes>
    <Route index element={<PlayerPortalOverviewPage />} />
    <Route path="schedule" element={<PlayerPortalSchedulePage />} />
    <Route path="performance" element={<PlayerPortalPerformancePage />} />
    <Route path="feedback" element={<PlayerPortalFeedbackPage />} />
    <Route path="achievements" element={<PlayerPortalAchievementsPage />} />
  </Routes>;
}
