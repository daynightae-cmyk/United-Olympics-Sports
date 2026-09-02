import { Routes, Route } from 'react-router-dom';
import { CoachPortalOverviewPage } from '../pages/admin/CoachPortalOverviewPage';
import { CoachPortalSchedulePage } from '../pages/admin/CoachPortalSchedulePage';
import { CoachPortalGroupsPage } from '../pages/admin/CoachPortalGroupsPage';
import { CoachPortalEvaluationsPage } from '../pages/admin/CoachPortalEvaluationsPage';

export function CoachPortalRouter() {
  return <Routes>
    <Route index element={<CoachPortalOverviewPage />} />
    <Route path="schedule" element={<CoachPortalSchedulePage />} />
    <Route path="groups" element={<CoachPortalGroupsPage />} />
    <Route path="evaluations" element={<CoachPortalEvaluationsPage />} />
  </Routes>;
}
