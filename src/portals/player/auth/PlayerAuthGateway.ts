import { fetchPortalIdentity, firebaseGoogleFallbackToken, signOutEverywhere } from '../../../lib/auth-client';
import { fetchJsonWithRuntimeTimeout, withRuntimeTimeout } from '../../../lib/runtime-timeout';
import { supabase } from '../../../lib/supabase';

const PLAYER_AUTH_TIMEOUT_MS = 10_000;
type OtpErrorBody = { error?: { code?: string; message?: string } };

async function postOtpEndpoint(path: '/api/v1/auth/phone/request' | '/api/v1/auth/phone/verify', payload: Record<string, string>) {
  const { response, payload: data } = await fetchJsonWithRuntimeTimeout<Record<string, unknown> & OtpErrorBody>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, PLAYER_AUTH_TIMEOUT_MS);
  return { status: response.status, ok: response.ok, data };
}

function otpFailure(code: string | undefined, fallbackEn: string, fallbackAr: string) {
  return {
    success: false as const,
    error: {
      code: code || 'OTP_FAILED',
      messageEn: fallbackEn,
      messageAr: fallbackAr,
    },
  };
}

export interface PlayerAuthSession {
  userId: string;
  playerId?: string;
  email?: string;
  phone?: string;
  provider: 'production' | 'preview';
  createdAt: string;
}

export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    messageEn: string;
    messageAr: string;
  };
}

export interface PlayerAuthGateway {
  getSession(): Promise<PlayerAuthSession | null>;
  signInWithGoogle(): Promise<AuthResult<PlayerAuthSession>>;
  signInWithApple(): Promise<AuthResult<PlayerAuthSession>>;
  requestPhoneOtp(phone: string): Promise<AuthResult<{ requestedAt: string }>>;
  verifyPhoneOtp(phone: string, otp: string): Promise<AuthResult<PlayerAuthSession>>;
  signOut(): Promise<void>;
  isProductionConfigured(): boolean;
}

function clearProductionSession(): void {
  localStorage.removeItem('uos:player-portal:session');
  localStorage.removeItem('uos:player-portal:active-id');
  localStorage.setItem('uos:player-portal:auth', 'false');
}

/**
 * Production identity is verified by the shared auth layer, then the server
 * must bind that canonical UID to exactly one active Player record. Google
 * success alone never creates a Player Portal session.
 */
export class ProductionPlayerAuthGateway implements PlayerAuthGateway {
  isProductionConfigured(): boolean {
    return true;
  }

  async getSession(): Promise<PlayerAuthSession | null> {
    const raw = localStorage.getItem('uos:player-portal:session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as PlayerAuthSession;
      if (session?.provider === 'production' && session.playerId) return session;
      return null;
    } catch {
      return null;
    }
  }

  async signInWithGoogle(): Promise<AuthResult<PlayerAuthSession>> {
    try {
      const token = await firebaseGoogleFallbackToken();
      const portal = await fetchPortalIdentity(token);
      if (portal.bindings.playerIds.length !== 1) {
        await signOutEverywhere().catch(() => undefined);
        clearProductionSession();
        const missing = portal.bindings.playerIds.length === 0;
        return {
          success: false,
          error: {
            code: missing ? 'PLAYER_BINDING_NOT_FOUND' : 'PLAYER_BINDING_AMBIGUOUS',
            messageEn: missing
              ? 'Google verified the account, but it is not linked to an active Player record.'
              : 'This identity is linked to more than one Player record. An administrator must resolve the account binding before sign-in.',
            messageAr: missing
              ? 'تم التحقق من حساب Google، لكنه غير مرتبط بسجل لاعب نشط.'
              : 'هذه الهوية مرتبطة بأكثر من سجل لاعب. يجب على المسؤول معالجة ربط الحساب قبل تسجيل الدخول.',
          },
        };
      }

      const playerId = portal.bindings.playerIds[0];
      const session: PlayerAuthSession = {
        userId: portal.identity.uid,
        playerId,
        ...(portal.identity.email ? { email: portal.identity.email } : {}),
        provider: 'production',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('uos:player-portal:session', JSON.stringify(session));
      localStorage.setItem('uos:player-portal:active-id', playerId);
      localStorage.setItem('uos:player-portal:auth', 'true');
      return { success: true, data: session };
    } catch (error: unknown) {
      clearProductionSession();
      const message = error instanceof Error ? error.message : 'Google authentication failed.';
      return {
        success: false,
        error: {
          code: message || 'AUTH_FAILED',
          messageEn: message,
          messageAr: 'فشلت المصادقة أو تعذر التحقق من ربط حساب اللاعب.',
        },
      };
    }
  }

  async signInWithApple(): Promise<AuthResult<PlayerAuthSession>> {
    return {
      success: false,
      error: {
        code: 'AUTH_SERVICE_UNCONFIGURED',
        messageEn: 'Apple authentication service is not configured in this environment.',
        messageAr: 'خدمة تسجيل الدخول عبر Apple غير مهيأة في هذه البيئة.',
      },
    };
  }

  async requestPhoneOtp(phone: string): Promise<AuthResult<{ requestedAt: string }>> {
    try {
      const { status, ok } = await postOtpEndpoint('/api/v1/auth/phone/request', { phone });
      if (!ok) {
        if (status === 429) {
          return otpFailure('RATE_LIMIT_EXCEEDED', 'Too many code requests. Please retry later.', 'طلبات كثيرة لرمز التحقق. حاول لاحقًا.');
        }
        if (status === 503) {
          return otpFailure('SMS_GATEWAY_UNCONFIGURED', 'SMS delivery is not enabled. Please use Google sign-in.', 'خدمة الرسائل غير مفعلة. استخدم تسجيل الدخول عبر Google.');
        }
        return otpFailure('OTP_REQUEST_FAILED', 'Verification code could not be sent right now.', 'تعذر إرسال رمز التحقق الآن.');
      }
      return { success: true, data: { requestedAt: new Date().toISOString() } };
    } catch {
      return otpFailure('OTP_REQUEST_FAILED', 'Verification code could not be sent right now.', 'تعذر إرسال رمز التحقق الآن.');
    }
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<AuthResult<PlayerAuthSession>> {
    try {
      const { status, ok, data } = await postOtpEndpoint('/api/v1/auth/phone/verify', { phone, code: otp });
      if (!ok) {
        if (status === 429) {
          return otpFailure('RATE_LIMIT_EXCEEDED', 'Too many attempts. Request a new code later.', 'محاولات كثيرة. اطلب رمزًا جديدًا لاحقًا.');
        }
        return otpFailure('OTP_INVALID', 'Verification code is invalid or expired.', 'رمز التحقق غير صالح أو منتهي.');
      }
      const session = data?.session as { access_token?: string; refresh_token?: string | null } | undefined;
      if (!session?.access_token) {
        return otpFailure('OTP_INVALID', 'Verification did not return a session.', 'لم يُرجع التحقق جلسة صالحة.');
      }
      const { error: sessionError } = await withRuntimeTimeout(
        'supabase-player-session-activate',
        supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token ?? '',
        }),
        PLAYER_AUTH_TIMEOUT_MS,
      );
      if (sessionError) {
        return otpFailure('AUTH_SESSION_FAILED', sessionError.message, 'تعذر إنشاء الجلسة.');
      }
      const portal = await fetchPortalIdentity(session.access_token);
      if (portal.bindings.playerIds.length !== 1) {
        await signOutEverywhere().catch(() => undefined);
        clearProductionSession();
        const missing = portal.bindings.playerIds.length === 0;
        return otpFailure(
          missing ? 'PLAYER_BINDING_NOT_FOUND' : 'PLAYER_BINDING_AMBIGUOUS',
          missing
            ? 'Phone verified, but it is not linked to an active Player record.'
            : 'This identity is linked to more than one Player record. An administrator must resolve the binding.',
          missing
            ? 'تم التحقق من الهاتف، لكنه غير مرتبط بسجل لاعب نشط.'
            : 'هذه الهوية مرتبطة بأكثر من سجل لاعب. يجب على المسؤول معالجة الربط.',
        );
      }
      const playerId = portal.bindings.playerIds[0];
      const playerSession: PlayerAuthSession = {
        userId: portal.identity.uid,
        playerId,
        ...(portal.identity.email ? { email: portal.identity.email } : {}),
        ...(phone ? { phone } : {}),
        provider: 'production',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('uos:player-portal:session', JSON.stringify(playerSession));
      localStorage.setItem('uos:player-portal:active-id', playerId);
      localStorage.setItem('uos:player-portal:auth', 'true');
      return { success: true, data: playerSession };
    } catch {
      clearProductionSession();
      return otpFailure('OTP_INVALID', 'Verification code is invalid or expired.', 'رمز التحقق غير صالح أو منتهي.');
    }
  }

  async signOut(): Promise<void> {
    await signOutEverywhere();
    clearProductionSession();
  }
}

/** Explicit preview sessions are separated from production authentication. */
export class PreviewPlayerAuthGateway implements PlayerAuthGateway {
  isProductionConfigured(): boolean {
    return false;
  }

  async getSession(): Promise<PlayerAuthSession | null> {
    const raw = localStorage.getItem('uos:player-portal:session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as PlayerAuthSession;
      if (session?.provider === 'preview' && session.playerId) return session;
      return null;
    } catch {
      return null;
    }
  }

  async signInWithGoogle(): Promise<AuthResult<PlayerAuthSession>> {
    return {
      success: false,
      error: {
        code: 'PREVIEW_MODE',
        messageEn: 'Google sign-in is disabled in preview mode. Use "Enter Preview Athlete Mode".',
        messageAr: 'تسجيل الدخول عبر Google معطل في وضع المعاينة. استخدم "الدخول إلى وضع المعاينة".',
      },
    };
  }

  async signInWithApple(): Promise<AuthResult<PlayerAuthSession>> {
    return {
      success: false,
      error: {
        code: 'PREVIEW_MODE',
        messageEn: 'Apple sign-in is disabled in preview mode. Use "Enter Preview Athlete Mode".',
        messageAr: 'تسجيل الدخول عبر Apple معطل في وضع المعاينة. استخدم "الدخول إلى وضع المعاينة".',
      },
    };
  }

  async requestPhoneOtp(_phone: string): Promise<AuthResult<{ requestedAt: string }>> {
    return {
      success: false,
      error: {
        code: 'PREVIEW_PHONE_UNAVAILABLE',
        messageEn: 'Phone verification requires authentication service integration.',
        messageAr: 'يتطلب التحقق عبر الهاتف ربط خدمة المصادقة.',
      },
    };
  }

  async verifyPhoneOtp(_phone: string, _otp: string): Promise<AuthResult<PlayerAuthSession>> {
    return {
      success: false,
      error: {
        code: 'PREVIEW_PHONE_UNAVAILABLE',
        messageEn: 'Phone verification requires authentication service integration.',
        messageAr: 'يتطلب التحقق عبر الهاتف ربط خدمة المصادقة.',
      },
    };
  }

  async enterPreviewMode(playerId: string): Promise<AuthResult<PlayerAuthSession>> {
    if (!playerId) {
      return {
        success: false,
        error: {
          code: 'PREVIEW_PLAYER_REQUIRED',
          messageEn: 'Select an available preview athlete first.',
          messageAr: 'اختر لاعب معاينة متاحًا أولاً.',
        },
      };
    }
    const session: PlayerAuthSession = {
      userId: `preview-user-${playerId}`,
      playerId,
      provider: 'preview',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('uos:player-portal:session', JSON.stringify(session));
    localStorage.setItem('uos:player-portal:auth', 'true');
    localStorage.setItem('uos:player-portal:active-id', playerId);
    return { success: true, data: session };
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('uos:player-portal:session');
    localStorage.removeItem('uos:player-portal:active-id');
    localStorage.setItem('uos:player-portal:auth', 'false');
  }
}

export const productionAuthGateway = new ProductionPlayerAuthGateway();
export const previewAuthGateway = new PreviewPlayerAuthGateway();