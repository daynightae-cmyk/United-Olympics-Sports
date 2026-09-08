import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../lib/auth-client';

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const previewAccess = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>(previewAccess ? 'allowed' : 'checking');

  useEffect(() => {
    if (previewAccess) {
      setStatus('allowed');
      return;
    }

    let active = true;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (active) setStatus('denied');
          return;
        }
        const response = await fetch('/api?route=admin-whoami', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setStatus(response.ok ? 'allowed' : 'denied');
      } catch {
        if (active) setStatus('denied');
      }
    })();

    return () => { active = false; };
  }, [previewAccess]);

  if (status === 'checking') {
    return (
      <div className="ui-skeleton" role="status" aria-live="polite" aria-busy="true" data-admin-auth-check="true">
        Checking server-side access… | جارٍ التحقق من الصلاحية الخادمية…
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
