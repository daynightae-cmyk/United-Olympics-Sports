import { Routes, Route } from 'react-router-dom';
import { ParentPortalOverviewPage } from '../pages/admin/ParentPortalOverviewPage';
import { ParentPortalChildrenPage } from '../pages/admin/ParentPortalChildrenPage';
import { ParentPortalSubscriptionsPage } from '../pages/admin/ParentPortalSubscriptionsPage';
import { ParentPortalDocumentsPage } from '../pages/admin/ParentPortalDocumentsPage';
import { ParentPortalMessagesPage } from '../pages/admin/ParentPortalMessagesPage';

export function ParentPortalRouter() {
  return <Routes>
    <Route index element={<ParentPortalOverviewPage />} />
    <Route path="children" element={<ParentPortalChildrenPage />} />
    <Route path="subscriptions" element={<ParentPortalSubscriptionsPage />} />
    <Route path="documents" element={<ParentPortalDocumentsPage />} />
    <Route path="messages" element={<ParentPortalMessagesPage />} />
  </Routes>;
}
