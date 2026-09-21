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

export function classifyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (/code verifier|pkce/i.test(message)) return 'PKCE_VERIFIER_MISSING';
  if (/PORTAL_BINDING_UNAVAILABLE/.test(message)) return 'PORTAL_BINDING_UNAVAILABLE';
  if (/PORTAL_RECORD_NOT_LINKED/.test(message)) return 'PORTAL_RECORD_NOT_LINKED';
  if (/ACCESS_DENIED/.test(message)) return 'ACCESS_DENIED';
  if (/AUTHORIZATION_UNAVAILABLE/.test(message)) return 'AUTHORIZATION_UNAVAILABLE';
  if (/AUTH_INVALID/.test(message)) return 'AUTH_INVALID';
  if (/AUTH_REQUIRED/.test(message)) return 'AUTH_REQUIRED';
  if (/AUTH_SESSION_FAILED/.test(message)) return 'AUTH_SESSION_FAILED';
  if (/timeout/i.test(message)) return 'AUTH_TIMEOUT';
  return 'AUTH_CALLBACK_UNCLASSIFIED';
}

export type PortalBindingResult =
  | { ok: true; code?: undefined }
  | { ok: false; code: 'PORTAL_RECORD_NOT_LINKED' | 'PORTAL_RECORD_AMBIGUOUS' };

export function persistSinglePortalBinding(destination: string, portal: PortalIdentity): PortalBindingResult {
  const now = new Date().toISOString();

  if (destination.startsWith('/player')) {
    if (portal.bindings.playerIds.length === 0) return { ok: false, code: 'PORTAL_RECORD_NOT_LINKED' };
    if (portal.bindings.playerIds.length !== 1) return { ok: false, code: 'PORTAL_RECORD_AMBIGUOUS' };
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
    return { ok: true };
  }

  if (destination.startsWith('/parent')) {
    if (portal.bindings.guardianIds.length === 0) return { ok: false, code: 'PORTAL_RECORD_NOT_LINKED' };
    if (portal.bindings.guardianIds.length !== 1) return { ok: false, code: 'PORTAL_RECORD_AMBIGUOUS' };
    localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify({
      parentId: portal.bindings.guardianIds[0],
      provider: 'production',
      createdAt: now,
      authorizedPlayerIds: portal.bindings.guardianPlayerIds,
    }));
    return { ok: true };
  }

  if (destination.startsWith('/coach')) {
    if (portal.bindings.coachIds.length === 0) return { ok: false, code: 'PORTAL_RECORD_NOT_LINKED' };
    if (portal.bindings.coachIds.length !== 1) return { ok: false, code: 'PORTAL_RECORD_AMBIGUOUS' };
    localStorage.setItem('uos:coach-portal:session:v1', JSON.stringify({
      coachId: portal.bindings.coachIds[0],
      provider: 'production',
      createdAt: now,
    }));
    sessionStorage.removeItem('uos:coach-portal:preview-session:v1');
    return { ok: true };
  }

  return { ok: true };
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Do not allow apex → www switching after PKCE has already started with a code,
  // to avoid stranding the code verifier on the apex origin.
  const canonicalTarget = typeof window === 'undefined' || params.has('code')
    ? null
    : canonicalAuthPageUrl(window.location.href);
  const destinationHint = peekAuthReturnTo('/');
  const portal = portalFromDestination(destinationHint);
  const retryRoute = loginRouteForDestination(destinationHint);
  const [state, setState] = useState<'working' | 'denied' | 'not-linked' | 'error'>('working');
  const [errorCode, setErrorCode] = useState<string | null>(null);
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
        setErrorCode('ACCESS_DENIED');
        setMessage('Your account is verified, but it does not have access to this portal. | تم التحقق من حسابك، لكنه لا يملك صلاحية دخول هذه البوابة.');
        return;
      }
      navigate(destination, { replace: true });
      return;
    }

    if (/^\/(player|parent|coach)(\/|$)/.test(destination)) {
      const portalIdentity = await fetchPortalIdentity(token);
      const bindingResult = persistSinglePortalBinding(destination, portalIdentity);
      if (!bindingResult.ok) {
        await signOutEverywhere().catch(() => undefined);
        setState(bindingResult.code === 'PORTAL_RECORD_NOT_LINKED' ? 'not-linked' : 'denied');
        setErrorCode(bindingResult.code);
        setMessage(
          bindingResult.code === 'PORTAL_RECORD_NOT_LINKED'
            ? 'Your account is verified, but it is not linked to an active player, parent, or coach record for this portal. Please contact administration. | تم التحقق من حسابك، لكنه غير مرتبط بسجل نشط للاعب أو ولي أمر أو مدرب لهذه البوابة. يرجى التواصل مع الإدارة.'
            : 'Your account is verified, but it is not linked to exactly one valid record for this portal. | تم التحقق من حسابك، لكنه غير مرتبط بسجل واحد صالح لهذه البوابة.',
        );
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
      setErrorCode('PROVIDER_ERROR');
      setMessage('Sign-in was not completed. Please try again. | لم يكتمل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      return;
    }
    if (!code) {
      setState('error');
      setErrorCode('AUTH_REQUIRED');
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
        const classifiedCode = classifyAuthError(error);
        console.error('OAuth callback exchange failed', { code: classifiedCode });
        setState('error');
        setErrorCode(classifiedCode);
        setMessage(
          classifiedCode === 'PKCE_VERIFIER_MISSING'
            ? 'The sign-in code verifier is missing or expired. Please start sign-in again from this domain. | رمز التحقق من تسجيل الدخول مفقود أو منتهي الصلاحية. يرجى إعادة تسجيل الدخول من هذا النطاق.'
            : 'Google verified the account, but the secure browser session could not be completed. Restart sign-in from this same domain. | تحقق Google من الحساب، لكن تعذر إكمال جلسة المتصفح الآمنة. أعد تسجيل الدخول من نفس هذا النطاق.',
        );
        return;
      }

      try {
        await finish(token);
      } catch (error) {
        if (!active) return;
        const classifiedCode = classifyAuthError(error);
        console.error('OAuth callback server session failed', { code: classifiedCode });
        await signOutEverywhere().catch(() => undefined);
        setErrorCode(classifiedCode);

        if (classifiedCode === 'AUTHORIZATION_UNAVAILABLE') {
          setState('error');
          setMessage('Your Google identity is verified, but the authorization service is temporarily unavailable. | تم التحقق من هوية Google، لكن خدمة الصلاحيات غير متاحة مؤقتًا.');
        } else if (classifiedCode === 'PORTAL_BINDING_UNAVAILABLE') {
          setState('error');
          setMessage('Your Google identity is verified, but the portal data service is temporarily unavailable. Please try again shortly. | تم التحقق من هوية Google، لكن خدمة بيانات البوابة غير متاحة مؤقتًا. يرجى المحاولة بعد قليل.');
        } else if (classifiedCode === 'PORTAL_RECORD_NOT_LINKED') {
          setState('not-linked');
          setMessage('Your account is verified, but it is not linked to an active record for this portal. Please contact administration. | تم التحقق من حسابك، لكنه غير مرتبط بسجل نشط لهذه البوابة. يرجى التواصل مع الإدارة.');
        } else if (classifiedCode === 'ACCESS_DENIED') {
          setState('denied');
          setMessage('Your account is verified, but it does not have permission to access this portal. | تم التحقق من حسابك، لكنه لا يملك صلاحية لدخول هذه البوابة.');
        } else if (classifiedCode === 'AUTH_INVALID') {
          setState('error');
          setMessage('The sign-in token is invalid or expired. Please sign in again. | رمز المصادقة غير صالح أو منتهي الصلاحية. يرجى تسجيل الدخول مرة أخرى.');
        } else if (classifiedCode === 'AUTH_REQUIRED') {
          setState('error');
          setMessage('A valid sign-in token is required. Please sign in again. | رمز تسجيل دخول صالح مطلوب. يرجى تسجيل الدخول مرة أخرى.');
        } else if (classifiedCode === 'AUTH_TIMEOUT') {
          setState('error');
          setMessage('The sign-in operation timed out. Please try again. | انتهت مهلة عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        } else {
          setState('error');
          setMessage('Your Google identity is verified, but the application session could not be established. | تم التحقق من هوية Google، لكن تعذر إنشاء جلسة التطبيق.');
        }
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
        <div className="portal-auth-card" data-error-code={errorCode || undefined}>
          <div className="portal-auth-identity">
            <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports" style={{ width: 112, height: 112, objectFit: 'contain' }} />
            <ShieldCheck aria-hidden="true" />
            <h1>Secure authentication | المصادقة الآمنة</h1>
            <p>{message}</p>
          </div>
          {state === 'not-linked' ? (
            <div className="portal-auth-notice is-info" role="status" style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--portal-auth-gold-strong)' }}>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>ACCOUNT VERIFIED — PORTAL ACCESS NOT LINKED</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, opacity: 0.9 }}>
                الحساب موثق — لم يتم ربط صلاحية البوابة
                <br />
                Your Google identity is verified, but this account is not associated with an active portal record. Please contact the sports program administration to link your profile.
                <br />
                تم التحقق من هوية Google بنجاح، ولكن هذا الحساب غير مرتبط بعد بسجل بوابة نشط. يرجى التواصل مع إدارة البرامج الرياضية لربط ملفك.
              </p>
            </div>
          ) : null}
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
