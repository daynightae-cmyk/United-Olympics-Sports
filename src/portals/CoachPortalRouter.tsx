import { Routes, Route } from 'react-router-dom';
import { CoachPortalOverviewPage } from '../pages/portal/coach/CoachPortalOverviewPage';
import { CoachPortalSchedulePage } from '../pages/portal/coach/CoachPortalSchedulePage';
import { CoachPortalGroupsPage } from '../pages/portal/coach/CoachPortalGroupsPage';
import { CoachPortalEvaluationsPage } from '../pages/portal/coach/CoachPortalEvaluationsPage';
import { CoachPortalProfilePage } from '../pages/portal/coach/CoachPortalProfilePage';
import { CoachPortalPlayersPage } from '../pages/portal/coach/CoachPortalPlayersPage';
import { CoachPortalPlayerDetailPage } from '../pages/portal/coach/CoachPortalPlayerDetailPage';
import { CoachPortalGroupDetailPage } from '../pages/portal/coach/CoachPortalGroupDetailPage';
import { CoachPortalAttendancePage } from '../pages/portal/coach/CoachPortalAttendancePage';
import { CoachPortalProgramsPage } from '../pages/portal/coach/CoachPortalProgramsPage';
import { CoachPortalMessagesPage } from '../pages/portal/coach/CoachPortalMessagesPage';

export function CoachPortalRouter() {
  return <Routes>
    <Route index element={<CoachPortalOverviewPage />} />
    <Route path="schedule" element={<CoachPortalSchedulePage />} />
    <Route path="groups" element={<CoachPortalGroupsPage />} />
    <Route path="evaluations" element={<CoachPortalEvaluationsPage />} />
    <Route path="players" element={<CoachPortalPlayersPage />} />
    <Route path="players/:playerId" element={<CoachPortalPlayerDetailPage />} />
    <Route path="groups/:groupId" element={<CoachPortalGroupDetailPage />} />
    <Route path="attendance" element={<CoachPortalAttendancePage />} />
    <Route path="programs" element={<CoachPortalProgramsPage />} />
    <Route path="messages" element={<CoachPortalMessagesPage />} />
    <Route path="profile" element={<CoachPortalProfilePage />} />
  </Routes>;
}
