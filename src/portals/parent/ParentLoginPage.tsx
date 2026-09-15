import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../lib/auth-client';
import { clearParentSession, readParentSession, startParentProduction } from './parentData';

// Safe demo links are dev-only. Production builds never render them,
// even if the demo flag is misconfigured in the deployment environment.
const demoRuntime = !import.meta.env.PROD && (import.meta.env.DEV || import.meta.env.VITE_UOS_PORTAL_DEMO === 'true');

function SafeDemoLink() {
  if (!demoRuntime) return null;
  return (
    <div className="portal-auth-preview" data-safe-demo-link="parent">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Safe product demo', 'عرض تجريبي آمن')} /></span>
        <span className="portal-auth-preview-badge">Demo</span>
      </div>
      <p><BilingualText value={bi(
        'Uses synthetic family data only. It never lists real guardian or player records.',
        'يستخدم بيانات أسرية صناعية فقط ولا يعرض سجلات حقيقية لأولياء الأمور أو اللاعبين.',
      )} /></p>
      <Link className="button secondary" to="/demo/parent"><BilingualText value={bi('Open family demo', 'فتح عرض الأسرة')} /></Link>
    </div>
  );
}

export function ParentLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      const persisted = readParentSession();
      if (!persisted || persisted.provider !== 'production') return;
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('AUTH_REQUIRED');
        const portal = await fetchPortalIdentity(token);
        if (!active) return;
        if (portal.bindings.guardianIds.length === 1 && portal.bindings.guardianIds[0] === persisted.parentId) {
          startParentProduction(portal.bindings.guardianIds[0], portal.bindings.guardianPlayerIds);
          navigate('/parent', { replace: true });
          return;
        }
        clearParentSession();
        void signOutEverywhere().catch(() => undefined);
      } catch {
        if (active) clearParentSession();
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider !== 'google') {
      return {
        tone: 'info',
        message: bi('This sign-in method is not available yet.', 'طريقة تسجيل الدخول هذه غير متاحة بعد.'),
      };
    }

    try {
      await beginSupabaseGoogleOAuth('/parent');
      return null;
    } catch {
      return {
        tone: 'error',
        message: bi('Google sign-in could not start. Please try again.', 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.'),
      };
    }
  };

  return <PortalAuthPage portal="parent" extraContent={<SafeDemoLink />} onProvider={handleProvider} />;
}
