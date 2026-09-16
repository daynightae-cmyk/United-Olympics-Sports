import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  canonicalAuthPageUrl,
  consumeAuthReturnTo,
  exchangeSupabaseAuthCode,
  fetchPortalIdentity,
  fetchServerSession,
  peekAuthReturnTo,
  signOutEverywhere,
  type PortalIdentity,
  type ServerAuthSession,
} from '../../lib/auth-client';

function hasAdminAccess(session: ServerAuthSession): boolean {
  return session.roles.some((role) => ['super_admin', 'admin', 'owner', 'administrator'].includes(role));
}

function portalFromDestination(destination: string): 'admin' | 'store' | 'player' | 'parent' | 'coach' {
  if (destination.startsWith('/store')) return 'store';
  if (destination.startsWith('/player')) return 'player';
  if (destination.startsWith('/parent')) return 'parent';
  if (destination.startsWith('/coach')) return 'coach';
  return 'admin';
}

function loginRouteForDestination(destination: string): string {
  if (destination.startsWith('/store')) return '/store/login';
  if (destination.startsWith('/player')) return '/player/login';
  if (destination.startsWith('/parent')) return '/parent/login';
  if (destination.startsWith('/coach')) return '/coach/login';
  if (destination.startsWith('/admin')) return '/admin/login';
  return '/';
}

function classifyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/code verifier|pkce/i.test(message)) return 'PKCE_VERIFIER_MISSING';
  if (/AUTHORIZATION_UNAVAILABLE/.test(message)) return 'AUTHORIZATION_UNAVAILABLE';
  if (/AUTH_INVALID/.test(message)) return 'AUTH_INVALID';
  if (/AUTH_REQUIRED/.test(message)) return 'AUTH_REQUIRED';
  if (/AUTH_SESSION_FAILED/.test(message)) return 'AUTH_SESSION_FAILED';
  if (/timeout/i.test(message)) return 'AUTH_TIMEOUT';
  return 'AUTH_CALLBACK_UNCLASSIFIED';
}

function persistSinglePortalBinding(destination: string, portal: PortalIdentity): boolean {
  const now = new Date().toISOString();

  if (destination.startsWith('/player')) {
    if (portal.bindings.playerIds.length !== 1) return false;
    const playerId = portal.bindings.playerIds[0];
    localStorage.setItem('uos:player-portal:session', JSON.stringify({
      userId: portal.identity.uid,
      playerId,
      ...(portal.identity.email ? { email: portal.identity.email } : {}),
      provider: 'production',
      createdAt: now,
    }));
    localStorage.setItem('uos:player-portal:active-id', playerId);
    localStorage.setItem('uos:player-portal:auth', 'true');
    return true;
  }

  if (destination.startsWith('/parent')) {
    if (portal.bindings.guardianIds.length !== 1) return false;
    localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify({
      parentId: portal.bindings.guardianIds[0],
      provider: 'production',
      createdAt: now,
      authorizedPlayerIds: portal.bindings.guardianPlayerIds,
    }));
    return true;
  }

  if (destination.startsWith('/coach')) {
    if (portal.bindings.coachIds.length !== 1) return false;
    localStorage.setItem('uos:coach-portal:session:v1', JSON.stringify({
      coachId: portal.bindings.coachIds[0],
      provider: 'production',
      createdAt: now,
    }));
    sessionStorage.removeItem('uos:coach-portal:preview-session:v1');
    return true;
  }

  return true;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const canonicalTarget = typeof window === 'undefined' ? null : canonicalAuthPageUrl(window.location.href);
  const destinationHint = peekAuthReturnTo('/');
  const portal = portalFromDestination(destinationHint);
  const retryRoute = loginRouteForDestination(destinationHint);
  const [state, setState] = useState<'working' | 'denied' | 'error'>('working');
  const [message, setMessage] = useState('Completing secure sign-in… | جارٍ إكمال تسجيل الدخول الآمن…');
  const code = params.get('code');
  const providerError = params.get('error_description') || params.get('error');

  const finish = async (token: string) => {
    const session = await fetchServerSession(token);
    const destination = consumeAuthReturnTo('/');

    if (destination.startsWith('/admin')) {
      if (!hasAdminAccess(session)) {
        await signOutEverywhere().catch(() => undefined);
        setState('denied');
        setMessage('Your account is verified, but it does not have access to this portal. | تم التحقق من حسابك، لكنه لا يملك صلاحية دخول هذه البوابة.');
        return;
      }
      navigate(destination, { replace: true });
      return;
    }

    if (/^\/(player|parent|coach)(\/|$)/.test(destination)) {
      const portalIdentity = await fetchPortalIdentity(token);
      if (!persistSinglePortalBinding(destination, portalIdentity)) {
        await signOutEverywhere().catch(() => undefined);
        setState('denied');
        setMessage('Your account is verified, but it is not linked to exactly one valid record for this portal. | تم التحقق من حسابك، لكنه غير مرتبط بسجل واحد صالح لهذه البوابة.');
        return;
      }
    }

    navigate(destination, { replace: true });
  };

  useEffect(() => {
    if (canonicalTarget) {
      window.location.replace(canonicalTarget);
      return;
    }
    if (providerError) {
      setState('error');
      setMessage('Sign-in was not completed. Please try again. | لم يكتمل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      return;
    }
    if (!code) {
      setState('error');
      setMessage('The secure sign-in response is incomplete. Please try again. | استجابة تسجيل الدخول الآمن غير مكتملة. يرجى المحاولة مرة أخرى.');
      return;
    }

    let active = true;
    void (async () => {
      let token: string;
      try {
        token = await exchangeSupabaseAuthCode(code);
      } catch (error) {
        if (!active) return;
        console.error('OAuth callback exchange failed', { code: classifyAuthError(error) });
        setState('error');
        setMessage('Google verified the account, but the secure browser session could not be completed. Restart sign-in from this same domain. | تحقق Google من الحساب، لكن تعذر إكمال جلسة المتصفح الآمنة. أعد تسجيل الدخول من نفس هذا النطاق.');
        return;
      }

      try {
        await finish(token);
      } catch (error) {
        if (!active) return;
        const errorCode = classifyAuthError(error);
        console.error('OAuth callback server session failed', { code: errorCode });
        await signOutEverywhere().catch(() => undefined);
        setState('error');
        setMessage(
          errorCode === 'AUTHORIZATION_UNAVAILABLE'
            ? 'Your Google identity is verified, but the authorization service is temporarily unavailable. | تم التحقق من هوية Google، لكن خدمة الصلاحيات غير متاحة مؤقتًا.'
            : 'Your Google identity is verified, but the application session could not be established. | تم التحقق من هوية Google، لكن تعذر إنشاء جلسة التطبيق.',
        );
      }
    })();

    return () => { active = false; };
  }, [canonicalTarget, code, providerError]);

  if (canonicalTarget) {
    return (
      <main className="portal-auth" data-portal={portal}>
        <section className="portal-auth-panel" style={{ margin: '10vh auto', maxWidth: 620 }}>
          <div className="portal-auth-card" role="status" aria-live="polite">
            Securing authentication origin… | جارٍ توحيد نطاق المصادقة الآمن…
          </div>
        </section>
      </main>
    );
  }

  if (params.get('next')?.startsWith('//')) return <Navigate to="/" replace />;

  return (
    <main className="portal-auth" data-portal={portal}>
      <section className="portal-auth-panel" style={{ margin: '10vh auto', maxWidth: 620 }}>
        <div className="portal-auth-card">
          <div className="portal-auth-identity">
            <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports" style={{ width: 112, height: 112, objectFit: 'contain' }} />
            <ShieldCheck aria-hidden="true" />
            <h1>Secure authentication | المصادقة الآمنة</h1>
            <p>{message}</p>
          </div>
          {state === 'denied' ? (
            <div className="portal-auth-notice is-error" role="alert">
              Access is granted only when the verified account has the required server-side role or portal binding. | لا يتم منح الدخول إلا عندما يملك الحساب الموثق الدور أو الربط الخادمي المطلوب للبوابة.
            </div>
          ) : null}
          {state === 'error' ? (
            <button className="portal-auth-submit" type="button" onClick={() => navigate(retryRoute, { replace: true })}>
              Try sign-in again | إعادة محاولة تسجيل الدخول
            </button>
          ) : null}
          {state !== 'working' ? (
            <button className="portal-auth-text-button" type="button" onClick={() => navigate('/', { replace: true })}>
              Return home | العودة للرئيسية
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
