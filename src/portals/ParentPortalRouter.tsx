import { Routes, Route } from 'react-router-dom';
import { ParentPortalOverviewPage } from '../pages/portal/parent/ParentPortalOverviewPage';
import { ParentPortalChildrenPage } from '../pages/portal/parent/ParentPortalChildrenPage';
import { ParentPortalSubscriptionsPage } from '../pages/portal/parent/ParentPortalSubscriptionsPage';
import { ParentPortalDocumentsPage } from '../pages/portal/parent/ParentPortalDocumentsPage';
import { ParentPortalMessagesPage } from '../pages/portal/parent/ParentPortalMessagesPage';
import { ParentPortalProfilePage } from '../pages/portal/parent/ParentPortalProfilePage';
import { ParentPortalSchedulePage } from '../pages/portal/parent/ParentPortalSchedulePage';
import { ParentPortalPerformancePage } from '../pages/portal/parent/ParentPortalPerformancePage';
import { ParentPortalFeedbackPage } from '../pages/portal/parent/ParentPortalFeedbackPage';
import { ParentPortalPaymentsPage } from '../pages/portal/parent/ParentPortalPaymentsPage';
import { PortalLayout } from '../layouts/PortalLayout';

export function ParentPortalRouter() {
  return <PortalLayout portal="parent"><Routes>
    <Route index element={<ParentPortalOverviewPage />} />
    <Route path="children" element={<ParentPortalChildrenPage />} />
    <Route path="subscriptions" element={<ParentPortalSubscriptionsPage />} />
    <Route path="documents" element={<ParentPortalDocumentsPage />} />
    <Route path="messages" element={<ParentPortalMessagesPage />} />
    <Route path="schedule" element={<ParentPortalSchedulePage />} />
    <Route path="performance" element={<ParentPortalPerformancePage />} />
    <Route path="feedback" element={<ParentPortalFeedbackPage />} />
    <Route path="payments" element={<ParentPortalPaymentsPage />} />
    <Route path="profile" element={<ParentPortalProfilePage />} />
  </Routes></PortalLayout>;
}
