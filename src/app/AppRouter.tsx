import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlayerLayout } from '../layouts/PlayerLayout';
import { PublicExperienceLayout } from '../layouts/PublicExperienceLayout';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/player/*" element={<PlayerLayout />} />
        <Route path="*" element={<PublicExperienceLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
