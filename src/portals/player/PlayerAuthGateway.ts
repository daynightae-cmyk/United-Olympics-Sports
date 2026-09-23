export type PlayerAuthMode = 'production' | 'preview';

export type PlayerAuthSession = {
  playerId: string;
  mode: PlayerAuthMode;
};

export interface PlayerAuthGateway {
  readonly mode: PlayerAuthMode;
  signInWithGoogle(): Promise<PlayerAuthSession>;
  signInWithApple(): Promise<PlayerAuthSession>;
  requestPhoneOtp(phone: string): Promise<void>;
  verifyPhoneOtp(phone: string, code: string): Promise<PlayerAuthSession>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<PlayerAuthSession | null>;
}

const unavailable = () => Promise.reject(new Error('AUTH_SERVICE_UNAVAILABLE'));

export class ProductionAuthGateway implements PlayerAuthGateway {
  readonly mode = 'production' as const;
  signInWithGoogle = unavailable;
  signInWithApple = unavailable;
  requestPhoneOtp = unavailable;
  verifyPhoneOtp = unavailable;
  async signOut() { /* The production identity provider will invalidate the session. */ }
  async getCurrentSession() { return null; }
}

const PREVIEW_SESSION_KEY = 'uos:player-preview-session:v1';

export class PreviewAuthGateway implements PlayerAuthGateway {
  readonly mode = 'preview' as const;
  constructor(private readonly playerId: string) {}
  signInWithGoogle = unavailable;
  signInWithApple = unavailable;
  requestPhoneOtp = unavailable;
  verifyPhoneOtp = unavailable;
  async signOut() { window.sessionStorage.removeItem(PREVIEW_SESSION_KEY); }
  async getCurrentSession(): Promise<PlayerAuthSession | null> {
    return window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === this.playerId ? { playerId: this.playerId, mode: 'preview' } : null;
  }
  async startPreview(): Promise<PlayerAuthSession> {
    window.sessionStorage.setItem(PREVIEW_SESSION_KEY, this.playerId);
    return { playerId: this.playerId, mode: 'preview' };
  }
}
