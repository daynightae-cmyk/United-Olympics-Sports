import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../lib/auth-client';

const COACH_PRODUCTION_SESSION_KEY = 'uos:coach-portal:session:v1';
// Safe demo links are dev-only. Production builds never render them,
// even if the demo flag is misconfigured in the deployment environment.
const demoRuntime = !import.meta.env.PROD && (import.meta.env.DEV || import.meta.env.VITE_UOS_PORTAL_DEMO === 'true');

function readCoachProductionSession(): { coachId: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COACH_PRODUCTION_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { provider?: string; coachId?: string };
    if (session.provider !== 'production' || typeof session.coachId !== 'string' || !session.coachId) return null;
    return { coachId: session.coachId };
  } catch {
    return null;
  }
}

function clearCoachProductionSession() {
  try { window.localStorage.removeItem(COACH_PRODUCTION_SESSION_KEY); } catch { /* storage may be unavailable */ }
}

function SafeDemoLink() {
  if (!demoRuntime) return null;
  return (
    <div className="portal-auth-preview" data-safe-demo-link="coach">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Safe product demo', 'عرض تجريبي آمن')} /></span>
        <span className="portal-auth-preview-badge">Demo</span>
      </div>
      <p><BilingualText value={bi(
        'Uses synthetic coaching data only. No production roster or admin query is executed.',
        'يستخدم بيانات تدريب صناعية فقط ولا ينفذ استعلامات قوائم الإنتاج أو الإدارة.',
      )} /></p>
      <Link className="button secondary" to="/demo/coach"><BilingualText value={bi('Open coach demo', 'فتح عرض المدرب')} /></Link>
    </div>
  );
}

export function CoachLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      const persisted = readCoachProductionSession();
      if (!persisted) return;
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('AUTH_REQUIRED');
        const portal = await fetchPortalIdentity(token);
        if (!active) return;
        if (portal.bindings.coachIds.length === 1 && portal.bindings.coachIds[0] === persisted.coachId) {
          navigate('/coach/home', { replace: true });
          return;
        }
        clearCoachProductionSession();
        void signOutEverywhere().catch(() => undefined);
      } catch {
        if (active) clearCoachProductionSession();
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
      await beginSupabaseGoogleOAuth('/coach/home');
      return null;
    } catch {
      return {
        tone: 'error',
        message: bi('Google sign-in could not start. Please try again.', 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.'),
      };
    }
  };

  return <PortalAuthPage portal="coach" extraContent={<SafeDemoLink />} onProvider={handleProvider} />;
}
