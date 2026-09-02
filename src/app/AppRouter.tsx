import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlayerPortalRouter } from '../portals/PlayerPortalRouter';
import { ParentPortalRouter } from '../portals/ParentPortalRouter';
import { CoachPortalRouter } from '../portals/CoachPortalRouter';
import { PublicSite } from '../pages/public/PublicSite';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/player/*" element={<PlayerPortalRouter />} />
        <Route path="/parent/*" element={<ParentPortalRouter />} />
        <Route path="/coach/*" element={<CoachPortalRouter />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  );
}
