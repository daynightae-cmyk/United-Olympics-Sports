import { useEffect } from 'react';
import { PortalAuthPage, type PortalAuthKind, type PortalAuthNotice, type PortalAuthProvider } from './PortalAuthPage';
import { bi } from '../bilingual/BilingualText';
import {
  beginSupabaseGoogleOAuth,
  canonicalAuthPageUrl,
  fetchServerSession,
  isPlatformAuthenticatorAvailable,
  signInWithSupabasePasskey,
  signOutEverywhere,
} from '../../lib/auth-client';

const destinations: Record<PortalAuthKind, string> = {
  admin: '/admin',
  store: '/store/account',
  player: '/player/home',
  parent: '/parent',
  coach: '/coach',
};

function passkeyFailureNotice(error: unknown, biometric: boolean): PortalAuthNotice {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : '';
  const message = error instanceof Error ? error.message : '';

  if (code === 'passkey_disabled' || message.includes('passkey_disabled')) {
    return {
      tone: 'info',
      message: bi(
        'Passkey authentication is wired in the app but must be enabled in Supabase Authentication → Passkeys before first use.',
        'تم ربط مفاتيح المرور داخل التطبيق، ويلزم تفعيلها من Supabase Authentication ← Passkeys قبل أول استخدام.',
      ),
    };
  }

  if (message === 'PASSKEY_UNSUPPORTED') {
    return {
      tone: 'info',
      message: bi(
        'This browser or page cannot use passkeys. Use a modern browser over HTTPS.',
        'هذا المتصفح أو الصفحة لا يدعم مفاتيح المرور. استخدم متصفحًا حديثًا عبر HTTPS.',
      ),
    };
  }

  if (code === 'webauthn_credential_not_found') {
    return {
      tone: 'info',
      message: bi(
        'No matching passkey is registered for this account. Sign in with Google once, then set up a passkey.',
        'لا يوجد مفتاح مرور مطابق لهذا الحساب. سجّل الدخول عبر Google مرة واحدة ثم أضف مفتاح مرور.',
      ),
    };
  }

  if (code === 'webauthn_verification_failed') {
    return {
      tone: 'error',
      message: bi(
        'The device could not verify this passkey. Try again or use Google sign-in.',
        'تعذر على الجهاز التحقق من مفتاح المرور. أعد المحاولة أو استخدم تسجيل Google.',
      ),
    };
  }

  if (message.includes('NotAllowedError') || message.toLowerCase().includes('cancel')) {
    return {
      tone: 'info',
      message: bi(
        biometric ? 'Biometric verification was cancelled or timed out.' : 'Passkey sign-in was cancelled or timed out.',
        biometric ? 'تم إلغاء التحقق بالبصمة أو انتهت مهلته.' : 'تم إلغاء تسجيل الدخول بمفتاح المرور أو انتهت مهلته.',
      ),
    };
  }

  return {
    tone: 'error',
    message: bi(
      biometric
        ? 'Biometric sign-in could not be completed. Use your passkey or Google sign-in.'
        : 'Passkey sign-in could not be completed. Use Google sign-in or try again.',
      biometric
        ? 'تعذر إكمال تسجيل الدخول بالبصمة. استخدم مفتاح المرور أو تسجيل Google.'
        : 'تعذر إكمال تسجيل الدخول بمفتاح المرور. استخدم Google أو أعد المحاولة.',
    ),
  };
}

export function PortalLoginRoute({ portal }: { portal: PortalAuthKind }) {
  const canonicalTarget = typeof window === 'undefined' ? null : canonicalAuthPageUrl(window.location.href);

  useEffect(() => {
    if (canonicalTarget) window.location.replace(canonicalTarget);
  }, [canonicalTarget]);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider === 'google') {
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
    }

    if (provider === 'passkey' || provider === 'biometric') {
      const biometric = provider === 'biometric';
      if (biometric && !(await isPlatformAuthenticatorAvailable())) {
        return {
          tone: 'info',
          message: bi(
            'A local biometric authenticator is not available in this browser. Use Passkey to choose another trusted authenticator.',
            'لا يتوفر مُصدّق حيوي محلي في هذا المتصفح. استخدم مفتاح المرور لاختيار وسيلة موثوقة أخرى.',
          ),
        };
      }

      try {
        const accessToken = await signInWithSupabasePasskey();
        await fetchServerSession(accessToken);
        window.location.assign(destinations[portal]);
        return null;
      } catch (error) {
        await signOutEverywhere().catch(() => undefined);
        return passkeyFailureNotice(error, biometric);
      }
    }

    return {
      tone: 'info',
      message: bi(
        'This provider is not configured in the current production authentication flow.',
        'موفّر المصادقة هذا غير مهيأ في مسار المصادقة الإنتاجي الحالي.',
      ),
    };
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
