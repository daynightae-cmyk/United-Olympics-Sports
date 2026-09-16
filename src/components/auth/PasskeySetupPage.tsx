import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Fingerprint, KeyRound, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BilingualText, bi } from '../bilingual/BilingualText';
import {
  deleteSupabasePasskey,
  fetchServerSession,
  getAccessToken,
  isPasskeySupported,
  isPlatformAuthenticatorAvailable,
  listSupabasePasskeys,
  registerSupabasePasskey,
  safeReturnTo,
} from '../../lib/auth-client';

type PasskeyRow = {
  id: string;
  friendlyName: string;
  createdAt: string | null;
  lastUsedAt: string | null;
};

type PageState = 'loading' | 'ready' | 'unauthenticated' | 'error';

type Notice = {
  tone: 'info' | 'error' | 'success';
  message: { en: string; ar: string };
};

function normalizePasskeys(value: unknown): PasskeyRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || !row.id) return [];
    return [{
      id: row.id,
      friendlyName: typeof row.friendly_name === 'string'
        ? row.friendly_name
        : typeof row.friendlyName === 'string'
          ? row.friendlyName
          : 'Passkey',
      createdAt: typeof row.created_at === 'string'
        ? row.created_at
        : typeof row.createdAt === 'string'
          ? row.createdAt
          : null,
      lastUsedAt: typeof row.last_used_at === 'string'
        ? row.last_used_at
        : typeof row.lastUsedAt === 'string'
          ? row.lastUsedAt
          : null,
    }];
  });
}

function loginRouteFor(target: string): string {
  if (target.startsWith('/player')) return '/player/login';
  if (target.startsWith('/parent')) return '/parent/login';
  if (target.startsWith('/coach')) return '/coach/login';
  if (target.startsWith('/store')) return '/store/login';
  return '/admin/login';
}

function describeError(error: unknown): Notice {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : '';
  const message = error instanceof Error ? error.message : '';

  if (code === 'passkey_disabled' || message.includes('passkey_disabled')) {
    return {
      tone: 'info',
      message: bi(
        'Passkey support is installed in the application. Enable Passkey authentication in Supabase Authentication → Passkeys to complete service activation.',
        'دعم مفاتيح المرور مركّب داخل التطبيق. فعّل Passkey authentication من Supabase Authentication ← Passkeys لإكمال تفعيل الخدمة.',
      ),
    };
  }
  if (code === 'webauthn_credential_exists') {
    return {
      tone: 'info',
      message: bi('This authenticator is already registered to your account.', 'وسيلة التحقق هذه مسجلة بالفعل في حسابك.'),
    };
  }
  if (code === 'too_many_passkeys') {
    return {
      tone: 'info',
      message: bi('This account has reached the maximum number of passkeys.', 'وصل هذا الحساب إلى الحد الأقصى لعدد مفاتيح المرور.'),
    };
  }
  if (message === 'PASSKEY_UNSUPPORTED') {
    return {
      tone: 'error',
      message: bi('Passkeys require a supported browser on a secure HTTPS page.', 'تحتاج مفاتيح المرور إلى متصفح مدعوم وصفحة HTTPS آمنة.'),
    };
  }
  if (message.includes('NotAllowedError') || message.toLowerCase().includes('cancel')) {
    return {
      tone: 'info',
      message: bi('The passkey prompt was cancelled or timed out.', 'تم إلغاء نافذة مفتاح المرور أو انتهت مهلتها.'),
    };
  }
  return {
    tone: 'error',
    message: bi('Passkey operation could not be completed safely. Please try again.', 'تعذر إكمال عملية مفتاح المرور بأمان. يرجى المحاولة مرة أخرى.'),
  };
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export function PasskeySetupPage() {
  const [searchParams] = useSearchParams();
  const returnTo = useMemo(() => safeReturnTo(searchParams.get('returnTo'), '/admin'), [searchParams]);
  const loginRoute = useMemo(() => loginRouteFor(returnTo), [returnTo]);
  const [state, setState] = useState<PageState>('loading');
  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [platformBiometric, setPlatformBiometric] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setNotice(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setState('unauthenticated');
        return;
      }
      await fetchServerSession(accessToken);
      const rows = await listSupabasePasskeys();
      setPasskeys(normalizePasskeys(rows));
      setState('ready');
    } catch (error) {
      setNotice(describeError(error));
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
    void isPlatformAuthenticatorAvailable().then(setPlatformBiometric);
  }, [load]);

  const register = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await registerSupabasePasskey();
      const rows = await listSupabasePasskeys();
      setPasskeys(normalizePasskeys(rows));
      setState('ready');
      setNotice({
        tone: 'success',
        message: bi(
          'Passkey registered. Future sign-ins can use this trusted authenticator.',
          'تم تسجيل مفتاح المرور. يمكن استخدام وسيلة التحقق الموثوقة هذه في عمليات الدخول القادمة.',
        ),
      });
    } catch (error) {
      setNotice(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this passkey? | حذف مفتاح المرور هذا؟')) return;
    setBusy(true);
    setNotice(null);
    try {
      await deleteSupabasePasskey(id);
      setPasskeys((current) => current.filter((item) => item.id !== id));
      setNotice({ tone: 'success', message: bi('Passkey removed.', 'تم حذف مفتاح المرور.') });
    } catch (error) {
      setNotice(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  const authStyle = { '--portal-auth-image': 'url("/media/sports/football/football-05-teamwork.webp")' } as CSSProperties;

  return (
    <main className="portal-auth" data-portal="admin" style={authStyle}>
      <div className="portal-auth-atmosphere" aria-hidden="true" />
      <section className="portal-auth-panel" style={{ margin: '6vh auto', maxWidth: 720, justifySelf: 'center' }}>
        <div className="portal-auth-card">
          <div className="portal-auth-identity">
            <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports" />
            <h2><BilingualText value={bi('Passkeys & Biometric Security', 'مفاتيح المرور والأمان بالبصمة')} /></h2>
            <p className="portal-auth-supporting">
              <BilingualText value={bi(
                'Your fingerprint, Face ID, Windows Hello PIN or other biometric proof stays on your device. United Olympics Sports stores only the passkey public credential through Supabase Auth.',
                'تبقى بصمتك أو Face ID أو Windows Hello PIN أو وسيلة التحقق الحيوية داخل جهازك. تخزن يونايتد أوليمبيكس سبورت بيانات مفتاح المرور العامة فقط عبر Supabase Auth.',
              )} />
            </p>
          </div>

          {notice ? (
            <div className={`portal-auth-notice ${notice.tone === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">
              <ShieldCheck aria-hidden="true" />
              <BilingualText value={notice.message} />
            </div>
          ) : null}

          {state === 'loading' ? (
            <div className="portal-auth-entry-note" data-route-loading="true" role="status">
              <RefreshCw aria-hidden="true" />
              <BilingualText value={bi('Checking your secure session…', 'جارٍ التحقق من جلستك الآمنة…')} />
            </div>
          ) : null}

          {state === 'unauthenticated' ? (
            <div data-route-terminal="unauthenticated">
              <div className="portal-auth-entry-note">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <BilingualText value={bi('Sign in once before registering a passkey.', 'سجّل الدخول مرة واحدة قبل تسجيل مفتاح مرور.')} />
                  <Link to={loginRoute}><BilingualText value={bi('Open secure sign-in', 'فتح تسجيل الدخول الآمن')} /></Link>
                </div>
              </div>
            </div>
          ) : null}

          {(state === 'ready' || state === 'error') ? (
            <div data-route-terminal={state}>
              <div className="portal-auth-entry-note">
                {platformBiometric ? <Fingerprint aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
                <div>
                  <BilingualText value={platformBiometric
                    ? bi('This device reports a local biometric/platform authenticator.', 'يُبلغ هذا الجهاز عن توفر وسيلة تحقق حيوية/محلية.')
                    : bi('A platform biometric authenticator was not detected. Other passkeys may still work.', 'لم يتم اكتشاف وسيلة تحقق حيوية محلية. يمكن أن تستمر مفاتيح مرور أخرى في العمل.')} />
                  <div style={{ marginTop: 8 }}>
                    <button className="portal-auth-submit" type="button" disabled={busy || !isPasskeySupported()} onClick={() => void register()}>
                      <KeyRound aria-hidden="true" />
                      <BilingualText value={bi('Add a passkey / device biometric', 'إضافة مفتاح مرور / بصمة الجهاز')} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="portal-auth-divider"><span><BilingualText value={bi('Registered passkeys', 'مفاتيح المرور المسجلة')} /></span></div>

              {passkeys.length === 0 ? (
                <p className="portal-auth-provider-state"><BilingualText value={bi('No passkeys registered yet.', 'لا توجد مفاتيح مرور مسجلة حتى الآن.')} /></p>
              ) : passkeys.map((passkey) => (
                <div className="portal-auth-entry-note" key={passkey.id}>
                  <KeyRound aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', color: 'var(--portal-auth-text)' }}>{passkey.friendlyName}</strong>
                    <small style={{ display: 'block', marginTop: 4 }}>
                      Created: {formatDate(passkey.createdAt)} · Last used: {formatDate(passkey.lastUsedAt)}
                    </small>
                  </div>
                  <button className="portal-auth-password-toggle" type="button" disabled={busy} onClick={() => void remove(passkey.id)} aria-label="Remove passkey | حذف مفتاح المرور">
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              ))}

              <div className="portal-auth-entry-note">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <BilingualText value={bi('Security setup complete when at least one passkey is registered.', 'يكتمل إعداد الأمان عند تسجيل مفتاح مرور واحد على الأقل.')} />
                  <Link to={returnTo}><BilingualText value={bi('Return to portal', 'العودة إلى البوابة')} /></Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
