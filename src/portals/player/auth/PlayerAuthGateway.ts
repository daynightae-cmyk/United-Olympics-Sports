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
 * ProductionPlayerAuthGateway
 * Communicates with real production auth endpoints or services.
 */
export class ProductionPlayerAuthGateway implements PlayerAuthGateway {
  isProductionConfigured(): boolean {
    return true; // We now have Firebase Auth
  }

  async getSession(): Promise<PlayerAuthSession | null> {
    const raw = localStorage.getItem('uos:player-portal:session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      if (session && session.provider === 'production') {
        return session;
      }
      return null;
    } catch {
      return null;
    }
  }

  async signInWithGoogle(): Promise<AuthResult<PlayerAuthSession>> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const session: PlayerAuthSession = {
        userId: user.uid,
        email: user.email ?? undefined,
        provider: 'production',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('uos:player-portal:session', JSON.stringify(session));
      localStorage.setItem('uos:player-portal:auth', 'true');
      
      return { success: true, data: session };
    } catch (e: any) {
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          messageEn: e.message || 'Google authentication failed.',
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
    await firebaseSignOut(auth).catch(() => {});
    localStorage.removeItem('uos:player-portal:session');
    localStorage.setItem('uos:player-portal:auth', 'false');
  }
}

/**
 * PreviewPlayerAuthGateway
 * Explicitly manages preview/demo athlete sessions with clear separation from production.
 */
export class PreviewPlayerAuthGateway implements PlayerAuthGateway {
  isProductionConfigured(): boolean {
    return false;
  }

  async getSession(): Promise<PlayerAuthSession | null> {
    const raw = localStorage.getItem('uos:player-portal:session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      if (session && session.provider === 'preview') {
        return session;
      }
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
    localStorage.setItem('uos:player-portal:auth', 'false');
  }
}

export const productionAuthGateway = new ProductionPlayerAuthGateway();
export const previewAuthGateway = new PreviewPlayerAuthGateway();
