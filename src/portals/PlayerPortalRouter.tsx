import { Routes, Route } from 'react-router-dom';
import { PlayerPortalOverviewPage } from '../pages/portal/player/PlayerPortalOverviewPage';
import { PlayerPortalSchedulePage } from '../pages/portal/player/PlayerPortalSchedulePage';
import { PlayerPortalPerformancePage } from '../pages/portal/player/PlayerPortalPerformancePage';
import { PlayerPortalFeedbackPage } from '../pages/portal/player/PlayerPortalFeedbackPage';
import { PlayerPortalAchievementsPage } from '../pages/portal/player/PlayerPortalAchievementsPage';
import { PlayerPortalAttendancePage } from '../pages/portal/player/PlayerPortalAttendancePage';
import { PlayerPortalDocumentsPage } from '../pages/portal/player/PlayerPortalDocumentsPage';
import { PlayerPortalProfilePage } from '../pages/portal/player/PlayerPortalProfilePage';

export function PlayerPortalRouter() {
  return <Routes>
    <Route index element={<PlayerPortalOverviewPage />} />
    <Route path="schedule" element={<PlayerPortalSchedulePage />} />
    <Route path="performance" element={<PlayerPortalPerformancePage />} />
    <Route path="feedback" element={<PlayerPortalFeedbackPage />} />
    <Route path="achievements" element={<PlayerPortalAchievementsPage />} />
    <Route path="attendance" element={<PlayerPortalAttendancePage />} />
    <Route path="documents" element={<PlayerPortalDocumentsPage />} />
    <Route path="profile" element={<PlayerPortalProfilePage />} />
  </Routes>;
}
