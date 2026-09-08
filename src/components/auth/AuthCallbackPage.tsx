import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  consumeAuthReturnTo,
  exchangeSupabaseAuthCode,
  fetchPortalIdentity,
  fetchServerSession,
  firebaseGoogleFallbackToken,
  signOutEverywhere,
  type PortalIdentity,
  type ServerAuthSession,
} from '../../lib/auth-client';

function hasAdminAccess(session: ServerAuthSession): boolean {
  return session.roles.some((role) => ['super_admin', 'admin', 'owner', 'administrator'].includes(role));
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
  const [state, setState] = useState<'working' | 'denied' | 'error'>('working');
  const [message, setMessage] = useState('Completing secure sign-in…');
  const code = params.get('code');
  const providerError = params.get('error_description') || params.get('error');

  const finish = async (token: string) => {
    const session = await fetchServerSession(token);
    const destination = consumeAuthReturnTo('/');

    if (destination.startsWith('/admin')) {
      if (!hasAdminAccess(session)) {
        await signOutEverywhere().catch(() => undefined);
        setState('denied');
        setMessage('Your identity is verified, but this account has no server-side Admin role.');
        return;
      }
      navigate(destination, { replace: true });
      return;
    }

    if (/^\/(player|parent|coach)(\/|$)/.test(destination)) {
      const portal = await fetchPortalIdentity(token);
      if (!persistSinglePortalBinding(destination, portal)) {
        await signOutEverywhere().catch(() => undefined);
        setState('denied');
        setMessage('Your identity is verified, but it does not have exactly one server-side record binding for the requested portal.');
        return;
      }
    }

    navigate(destination, { replace: true });
  };

  useEffect(() => {
    if (providerError) {
      setState('error');
      setMessage(providerError);
      return;
    }
    if (!code) {
      setState('error');
      setMessage('The OAuth callback did not include an authorization code.');
      return;
    }

    let active = true;
    void exchangeSupabaseAuthCode(code)
      .then((token) => active ? finish(token) : undefined)
      .catch((error: unknown) => {
        if (!active) return;
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Supabase OAuth callback failed.');
      });
    return () => { active = false; };
  }, [code, providerError]);

  const useFirebaseFallback = async () => {
    setState('working');
    setMessage('Checking Firebase fallback identity…');
    try {
      const token = await firebaseGoogleFallbackToken();
      await finish(token);
    } catch (error: unknown) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Firebase fallback sign-in failed.');
    }
  };

  if (params.get('next')?.startsWith('//')) return <Navigate to="/" replace />;

  return (
    <main className="portal-auth" data-portal="admin">
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
              تم التحقق من الهوية، لكن لا يوجد ربط خادمي وحيد وصالح للسجل أو الدور المطلوب. نجاح Google وحده لا يمنح صلاحية أي بوابة.
            </div>
          ) : null}
          {state === 'error' ? (
            <button className="portal-auth-submit" type="button" onClick={() => void useFirebaseFallback()}>
              Try Firebase Google fallback | جرّب Google عبر Firebase الاحتياطي
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
