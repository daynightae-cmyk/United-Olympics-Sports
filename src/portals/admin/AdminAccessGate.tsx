import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../lib/auth-client';
import { previewModeAllowed } from '../../lib/preview-guard';

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  // Preview access is blocked on canonical production hosts even when the
  // flag is set (see preview-guard); elsewhere it enables local/preview QA.
  const previewAccess = previewModeAllowed(import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true');
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
