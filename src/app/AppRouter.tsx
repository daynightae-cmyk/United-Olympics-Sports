import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlayerPortalRouter } from '../portals/PlayerPortalRouter';
import { ParentPortalRouter } from '../portals/ParentPortalRouter';
import { CoachPortalRouter } from '../portals/CoachPortalRouter';
import { PublicExperience } from '../pages/public/PublicExperience';
import { BenchmarkShowcasePage } from '../pages/benchmark/BenchmarkShowcasePage';
import { UnitedAssistant } from '../assistant/UnitedAssistant';
import { UpdateToast } from '../platform/UpdateToast';
import { PortalAuthPage } from '../components/auth/PortalAuthPage';
import { OlympicRouteTransition } from '../components/navigation/OlympicRouteTransition';
import { OlympicLuxurySplash } from '../components/splash/OlympicLuxurySplash';

const StoreApp = lazy(() => import('../store/StoreApp').then((module) => ({ default: module.StoreApp })));

function InternalProductUtilities() {
  const { pathname } = useLocation();
  const isInternalRoute = /^\/(admin|player|parent|coach|store)(\/|$)/.test(pathname);
  return isInternalRoute ? <><UnitedAssistant /><UpdateToast /></> : null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <OlympicLuxurySplash />
      <OlympicRouteTransition />
      <Routes>
        <Route path="/benchmark" element={<BenchmarkShowcasePage />} />
        <Route path="/admin/login" element={<PortalAuthPage portal="admin" />} />
        <Route path="/store/login" element={<PortalAuthPage portal="store" />} />
        <Route path="/store/*" element={<Suspense fallback={<div role="status" aria-live="polite" className="ui-skeleton"><i /><i /><i /></div>}><StoreApp /></Suspense>} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/player/*" element={<PlayerPortalRouter />} />
        <Route path="/parent/*" element={<ParentPortalRouter />} />
        <Route path="/coach/*" element={<CoachPortalRouter />} />
        <Route path="*" element={<PublicExperience />} />
      </Routes>
      <InternalProductUtilities />
    </BrowserRouter>
  );
}
