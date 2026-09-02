import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PublicSite } from '../pages/public/PublicSite';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  );
}
