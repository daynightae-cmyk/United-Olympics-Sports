import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../../../lib/firebase';

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

/**
 * Firebase can authenticate the Google identity, but the Player Portal still
 * requires an explicit backend mapping from that identity to one athlete
 * record. Until that mapping exists, no production Player session is issued.
 */
export class ProductionPlayerAuthGateway implements PlayerAuthGateway {
  isProductionConfigured(): boolean {
    return false;
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
      const result = await signInWithPopup(auth, googleProvider);
      await firebaseSignOut(auth).catch(() => undefined);
      localStorage.removeItem('uos:player-portal:session');
      localStorage.removeItem('uos:player-portal:active-id');
      localStorage.setItem('uos:player-portal:auth', 'false');

      return {
        success: false,
        error: {
          code: 'PLAYER_BINDING_UNCONFIGURED',
          messageEn: `Google verified ${result.user.email ?? 'the account'}, but no production athlete-account binding service is connected yet. No Player Portal session was created.`,
          messageAr: 'تم التحقق من حساب Google، لكن خدمة ربط الحساب بسجل لاعب إنتاجي غير متصلة حتى الآن. لم يتم إنشاء جلسة لبوابة اللاعب.',
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google authentication failed.';
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          messageEn: message,
          messageAr: 'فشلت عملية المصادقة عبر Google.',
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

  async requestPhoneOtp(_phone: string): Promise<AuthResult<{ requestedAt: string }>> {
    return {
      success: false,
      error: {
        code: 'SMS_GATEWAY_UNCONFIGURED',
        messageEn: 'Phone verification requires authentication service integration.',
        messageAr: 'يتطلب التحقق عبر الهاتف ربط خدمة المصادقة.',
      },
    };
  }

  async verifyPhoneOtp(_phone: string, _otp: string): Promise<AuthResult<PlayerAuthSession>> {
    return {
      success: false,
      error: {
        code: 'SMS_GATEWAY_UNCONFIGURED',
        messageEn: 'Phone verification requires authentication service integration.',
        messageAr: 'يتطلب التحقق عبر الهاتف ربط خدمة المصادقة.',
      },
    };
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth).catch(() => undefined);
    localStorage.removeItem('uos:player-portal:session');
    localStorage.removeItem('uos:player-portal:active-id');
    localStorage.setItem('uos:player-portal:auth', 'false');
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
