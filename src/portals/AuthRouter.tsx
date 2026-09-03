import { Routes, Route } from 'react-router-dom';
import { AuthLoginPage } from '../pages/auth/AuthLoginPage';
import { AuthRegisterPage } from '../pages/auth/AuthRegisterPage';
import { AuthResetPage } from '../pages/auth/AuthResetPage';

export function AuthRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthLoginPage />} />
      <Route path="/login" element={<AuthLoginPage />} />
      <Route path="/register" element={<AuthRegisterPage />} />
      <Route path="/reset" element={<AuthResetPage />} />
    </Routes>
  );
}
