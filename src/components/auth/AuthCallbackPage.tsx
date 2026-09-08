import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  consumeAuthReturnTo,
  exchangeSupabaseAuthCode,
  fetchServerSession,
  firebaseGoogleFallbackToken,
  type ServerAuthSession,
} from '../../lib/auth-client';

function canEnter(destination: string, session: ServerAuthSession): boolean {
  if (session.roles.includes('super_admin') || session.roles.includes('admin')) return true;
  if (destination.startsWith('/admin')) return false;
  if (destination.startsWith('/coach')) return session.roles.includes('coach');
  if (destination.startsWith('/parent')) return session.roles.includes('parent');
  if (destination.startsWith('/player')) return session.roles.includes('player');
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
    if (!canEnter(destination, session)) {
      setState('denied');
      setMessage('Your identity is verified, but this account has no server-side role for the requested portal.');
      return;
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
              تم التحقق من الهوية، لكن لا توجد صلاحية خادمية لهذه البوابة. نجاح Google وحده لا يمنح صلاحية الإدارة.
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
