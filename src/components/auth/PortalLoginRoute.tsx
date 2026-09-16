import { useEffect } from 'react';
import { PortalAuthPage, type PortalAuthKind, type PortalAuthNotice, type PortalAuthProvider } from './PortalAuthPage';
import { bi } from '../bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, canonicalAuthPageUrl } from '../../lib/auth-client';

const destinations: Record<PortalAuthKind, string> = {
  admin: '/admin',
  store: '/store/account',
  player: '/player/home',
  parent: '/parent',
  coach: '/coach',
};

export function PortalLoginRoute({ portal }: { portal: PortalAuthKind }) {
  const canonicalTarget = typeof window === 'undefined' ? null : canonicalAuthPageUrl(window.location.href);

  useEffect(() => {
    if (canonicalTarget) window.location.replace(canonicalTarget);
  }, [canonicalTarget]);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider !== 'google') {
      return {
        tone: 'info',
        message: bi(
          'This provider is not configured in the current production authentication flow.',
          'موفّر المصادقة هذا غير مهيأ في مسار المصادقة الإنتاجي الحالي.',
        ),
      };
    }

    try {
      await beginSupabaseGoogleOAuth(destinations[portal]);
      return null;
    } catch {
      return {
        tone: 'error',
        message: bi(
          'Supabase Google sign-in could not start. The callback page can use the Firebase fallback when needed.',
          'تعذر بدء تسجيل Google عبر Supabase. يمكن لصفحة العودة استخدام Firebase الاحتياطي عند الحاجة.',
        ),
      };
    }
  };

  if (canonicalTarget) {
    return (
      <main className="portal-auth" data-portal={portal}>
        <section className="portal-auth-panel" style={{ margin: '10vh auto', maxWidth: 620 }}>
          <div className="portal-auth-card" role="status" aria-live="polite">
            Securing sign-in origin… | جارٍ توحيد نطاق تسجيل الدخول الآمن…
          </div>
        </section>
      </main>
    );
  }

  return <PortalAuthPage portal={portal} onProvider={handleProvider} />;
}
