import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const PlayerPortalRouter = lazy(() => import('../portals/PlayerPortalRouter').then((module) => ({ default: module.PlayerPortalRouter })));
const ParentPortalRouter = lazy(() => import('../portals/ParentPortalRouter').then((module) => ({ default: module.ParentPortalRouter })));
const CoachPortalRouter = lazy(() => import('../portals/CoachPortalRouter').then((module) => ({ default: module.CoachPortalRouter })));
const PublicSite = lazy(() => import('../pages/public/PublicSite').then((module) => ({ default: module.PublicSite })));
const PublicNotFoundPage = lazy(() => import('../pages/public/PublicNotFoundPage').then((module) => ({ default: module.PublicNotFoundPage })));

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

function AppRouteLoader() {
  return (
    <div className="portal-route-state portal-route-loading" role="status" aria-live="polite">
      <div className="portal-route-state__copy">
        <strong>Loading interface · جارٍ تحميل الواجهة</strong>
        <span>United Olympics Sports · يونايتد أوليمبيكس سبورت</span>
      </div>
      <div className="portal-route-skeleton" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppRouteLoader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/player/*" element={<PlayerPortalRouter />} />
          <Route path="/parent/*" element={<ParentPortalRouter />} />
          <Route path="/coach/*" element={<CoachPortalRouter />} />
          {publicRoutes.map((path) => <Route key={path} path={path} element={<PublicSite />} />)}
          <Route path="*" element={<PublicNotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
