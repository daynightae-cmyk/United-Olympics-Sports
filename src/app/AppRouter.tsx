import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UnitedAssistant } from '../assistant/UnitedAssistant';
import { UpdateToast } from '../platform/UpdateToast';
import { OlympicRouteTransition } from '../components/navigation/OlympicRouteTransition';
import { OlympicLuxurySplash } from '../components/splash/OlympicLuxurySplash';
import { AuthCallbackPage } from '../components/auth/AuthCallbackPage';
import { PasskeySetupPage } from '../components/auth/PasskeySetupPage';
import { PortalLoginRoute } from '../components/auth/PortalLoginRoute';
import { clientShowcaseMode, previewModeAllowed } from '../lib/preview-guard';

const AdminLayout = lazy(() => import('../layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const PlayerPortalRouter = lazy(() => import('../portals/PlayerPortalRouter').then((module) => ({ default: module.PlayerPortalRouter })));
const ParentPortalRouter = lazy(() => import('../portals/ParentPortalRouter').then((module) => ({ default: module.ParentPortalRouter })));
const CoachPortalRouter = lazy(() => import('../portals/CoachPortalRouter').then((module) => ({ default: module.CoachPortalRouter })));
const AdminAccessGate = lazy(() => import('../portals/admin/AdminAccessGate').then((module) => ({ default: module.AdminAccessGate })));
const PublicExperience = lazy(() => import('../pages/public/PublicExperience').then((module) => ({ default: module.PublicExperience })));
const BenchmarkShowcasePage = lazy(() => import('../pages/benchmark/BenchmarkShowcasePage').then((module) => ({ default: module.BenchmarkShowcasePage })));
const PortalDemoPage = lazy(() => import('../pages/demo/PortalDemoPage').then((module) => ({ default: module.PortalDemoPage })));
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
  const isPortalAuthRoute = /^\/(admin|player|parent|coach|store)\/login\/?$/.test(pathname);
  return isInternalRoute && !isPortalAuthRoute ? <><UnitedAssistant /><UpdateToast /></> : null;
}

const isBenchmarkEnabled = import.meta.env.DEV === true;
// Demo routes are blocked on canonical production hosts even when the flag
// is set (see preview-guard); elsewhere the flag enables local/preview QA.
const isSafeDemoEnabled = previewModeAllowed(import.meta.env.VITE_UOS_PORTAL_DEMO === 'true');

export function AppRouter() {
  const showcase = clientShowcaseMode();

  return (
    <BrowserRouter>
      <OlympicLuxurySplash />
      <OlympicRouteTransition />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {isBenchmarkEnabled && <Route path="/benchmark" element={<BenchmarkShowcasePage />} />}
          {isSafeDemoEnabled && <Route path="/demo/:portal" element={<PortalDemoPage />} />}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/passkeys" element={<PasskeySetupPage />} />
          <Route path="/admin/login" element={showcase ? <Navigate to="/admin" replace /> : <PortalLoginRoute portal="admin" />} />
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
