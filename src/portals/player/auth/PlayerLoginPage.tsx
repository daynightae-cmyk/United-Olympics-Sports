import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../../lib/auth-client';
import { productionAuthGateway } from './PlayerAuthGateway';

const PLAYER_SESSION_KEY = 'uos:player-portal:session';
const PLAYER_ACTIVE_ID_KEY = 'uos:player-portal:active-id';
const PLAYER_AUTH_KEY = 'uos:player-portal:auth';
const demoRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_PORTAL_DEMO === 'true';

function readPlayerProductionSession(): { playerId: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PLAYER_SESSION_KEY);
    const activeId = window.localStorage.getItem(PLAYER_ACTIVE_ID_KEY);
    if (!raw || !activeId) return null;
    const provider = (JSON.parse(raw) as { provider?: string }).provider;
    if (provider !== 'production') return null;
    return { playerId: activeId };
  } catch {
    return null;
  }
}

function clearPlayerProductionSession() {
  try {
    window.localStorage.removeItem(PLAYER_SESSION_KEY);
    window.localStorage.removeItem(PLAYER_ACTIVE_ID_KEY);
    window.localStorage.setItem(PLAYER_AUTH_KEY, 'false');
  } catch { /* storage may be unavailable */ }
}

function SafeDemoLink() {
  if (!demoRuntime) return null;
  return (
    <div className="portal-auth-preview" data-safe-demo-link="player">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Safe product demo', 'عرض تجريبي آمن')} /></span>
        <span className="portal-auth-preview-badge">Demo</span>
      </div>
      <p><BilingualText value={bi(
        'Opens a synthetic player showcase. It does not read production or admin records.',
        'يفتح عرض لاعب ببيانات صناعية فقط ولا يقرأ سجلات الإنتاج أو الإدارة.',
      )} /></p>
      <Link className="button secondary" to="/demo/player"><BilingualText value={bi('Open player demo', 'فتح عرض اللاعب')} /></Link>
    </div>
  );
}

export function PlayerLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      const persisted = readPlayerProductionSession();
      if (!persisted) return;
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('AUTH_REQUIRED');
        const portal = await fetchPortalIdentity(token);
        if (!active) return;
        if (portal.bindings.playerIds.length === 1 && portal.bindings.playerIds[0] === persisted.playerId) {
          navigate('/player/home', { replace: true });
          return;
        }
        clearPlayerProductionSession();
        void signOutEverywhere().catch(() => undefined);
      } catch {
        if (active) clearPlayerProductionSession();
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider === 'google') {
      try {
        await beginSupabaseGoogleOAuth('/player/home');
        return null;
      } catch {
        return {
          tone: 'error',
          message: bi('Google sign-in could not start. Please try again.', 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.'),
        };
      }
    }

    if (provider !== 'apple') {
      return {
        tone: 'info',
        message: bi('This sign-in method is not available yet.', 'طريقة تسجيل الدخول هذه غير متاحة بعد.'),
      };
    }

    const result = await productionAuthGateway.signInWithApple();
    if (result.success && result.data?.playerId) {
      navigate('/player/home');
      return null;
    }

    return {
      tone: 'info',
      message: result.error
        ? { en: result.error.messageEn, ar: result.error.messageAr }
        : bi('Apple sign-in is not available yet.', 'تسجيل الدخول عبر Apple غير متاح بعد.'),
    };
  };

  return <PortalAuthPage portal="player" extraContent={<SafeDemoLink />} onProvider={handleProvider} />;
}
