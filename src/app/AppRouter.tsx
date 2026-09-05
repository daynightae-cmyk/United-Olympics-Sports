import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlayerPortalRouter } from '../portals/PlayerPortalRouter';
import { ParentPortalRouter } from '../portals/ParentPortalRouter';
import { CoachPortalRouter } from '../portals/CoachPortalRouter';
import { PublicSite } from '../pages/public/PublicSite';
import { BenchmarkShowcasePage } from '../pages/benchmark/BenchmarkShowcasePage';
import { UnitedAssistant } from '../assistant/UnitedAssistant';
import { UpdateToast } from '../platform/UpdateToast';

const StoreApp = lazy(() => import('../store/StoreApp').then((module) => ({ default: module.StoreApp })));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/benchmark" element={<BenchmarkShowcasePage />} />
        <Route path="/store/*" element={<Suspense fallback={<div role="status" aria-live="polite" className="ui-skeleton"><i /><i /><i /></div>}><StoreApp /></Suspense>} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/player/*" element={<PlayerPortalRouter />} />
        <Route path="/parent/*" element={<ParentPortalRouter />} />
        <Route path="/coach/*" element={<CoachPortalRouter />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
      <UnitedAssistant />
      <UpdateToast />
    </BrowserRouter>
  );
}
