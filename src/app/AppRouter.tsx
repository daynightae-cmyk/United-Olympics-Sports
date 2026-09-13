import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { UnitedAssistant } from '../assistant/UnitedAssistant';
import { UpdateToast } from '../platform/UpdateToast';
import { OlympicRouteTransition } from '../components/navigation/OlympicRouteTransition';
import { OlympicLuxurySplash } from '../components/splash/OlympicLuxurySplash';
import { AuthCallbackPage } from '../components/auth/AuthCallbackPage';
import { PortalLoginRoute } from '../components/auth/PortalLoginRoute';

const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const PlayerPortalRouter = lazy(() => import('../portals/PlayerPortalRouter').then((module) => ({ default: module.PlayerPortalRouter })));
const ParentPortalRouter = lazy(() => import('../portals/ParentPortalRouter').then((module) => ({ default: module.ParentPortalRouter })));
const CoachPortalRouter = lazy(() => import('../portals/CoachPortalRouter').then((module) => ({ default: module.CoachPortalRouter })));
const AdminAccessGate = lazy(() => import('../portals/admin/AdminAccessGate').then((module) => ({ default: module.AdminAccessGate })));
const PublicExperience = lazy(() => import('../pages/public/PublicExperience').then((module) => ({ default: module.PublicExperience })));
const BenchmarkShowcasePage = lazy(() => import('../pages/benchmark/BenchmarkShowcasePage').then((module) => ({ default: module.BenchmarkShowcasePage })));
const StoreApp = lazy(() => import('../store/StoreApp').then((module) => ({ default: module.StoreApp })));

function RouteFallback() {
  return (
    <div data-route-loading="true" role="status" aria-live="polite" aria-busy="true" className="ui-skeleton">
      <span>Loading United Olympics Sports… | جاري التحميل</span>
      <i />
      <i />
      <i />
    </div>
  );
}

function InternalProductUtilities() {
  const { pathname } = useLocation();
  const isInternalRoute = /^\/(admin|player|parent|coach|store)(\/|$)/.test(pathname);
  return isInternalRoute ? <><UnitedAssistant /><UpdateToast /></> : null;
}

const isBenchmarkEnabled = import.meta.env.DEV === true;

export function AppRouter() {
  return (
    <BrowserRouter>
      <OlympicLuxurySplash />
      <OlympicRouteTransition />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {isBenchmarkEnabled && <Route path="/benchmark" element={<BenchmarkShowcasePage />} />}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin/login" element={<PortalLoginRoute portal="admin" />} />
          <Route path="/store/login" element={<PortalLoginRoute portal="store" />} />
          <Route path="/store/*" element={<StoreApp />} />
          <Route path="/admin/*" element={<AdminAccessGate><AdminLayout /></AdminAccessGate>} />
          <Route path="/player/*" element={<PlayerPortalRouter />} />
          <Route path="/parent/*" element={<ParentPortalRouter />} />
          <Route path="/coach/*" element={<CoachPortalRouter />} />
          <Route path="*" element={<PublicExperience />} />
        </Routes>
      </Suspense>
      <InternalProductUtilities />
    </BrowserRouter>
  );
}
