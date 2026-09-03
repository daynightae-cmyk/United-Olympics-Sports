import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlayerPortalRouter } from '../portals/PlayerPortalRouter';
import { ParentPortalRouter } from '../portals/ParentPortalRouter';
import { CoachPortalRouter } from '../portals/CoachPortalRouter';
import { PublicSite } from '../pages/public/PublicSite';
import { PublicNotFoundPage } from '../pages/public/PublicNotFoundPage';

const publicRoutes = [
  '/',
  '/about',
  '/sports',
  '/sports/football',
  '/sports/swimming',
  '/sports/basketball',
  '/sports/tennis',
  '/sports/gymnastics',
  '/sports/martial-arts',
  '/programs',
  '/programs/:programSlug',
  '/coaches',
  '/contact',
] as const;

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/player/*" element={<PlayerPortalRouter />} />
        <Route path="/parent/*" element={<ParentPortalRouter />} />
        <Route path="/coach/*" element={<CoachPortalRouter />} />
        {publicRoutes.map((path) => <Route key={path} path={path} element={<PublicSite />} />)}
        <Route path="*" element={<PublicNotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
