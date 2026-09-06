import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Admin preview access is explicit. Development and CI may opt into the
 * preview workspace, while an ordinary production build stays closed until a
 * real role-aware authentication provider is connected.
 */
export function AdminAccessGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const previewAccess = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';

  if (!previewAccess) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
