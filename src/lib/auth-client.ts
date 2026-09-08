import { auth, googleSignIn, logout as firebaseLogout } from './firebase';
import { supabase } from './supabase';

const RETURN_TO_KEY = 'uos:auth:return-to';

export type ClientAuthProvider = 'supabase' | 'firebase';

export type ServerAuthSession = {
  uid: string;
  provider: ClientAuthProvider;
  email?: string;
  roles: string[];
  scopes: string[];
};

export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export async function beginSupabaseGoogleOAuth(returnTo = '/'): Promise<void> {
  const safeDestination = safeReturnTo(returnTo);
  sessionStorage.setItem(RETURN_TO_KEY, safeDestination);
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    throw error ?? new Error('Supabase did not return an OAuth redirect URL.');
  }
  window.location.assign(data.url);
}

export function consumeAuthReturnTo(fallback = '/'): string {
  const stored = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  return safeReturnTo(stored, fallback);
}

export async function exchangeSupabaseAuthCode(code: string): Promise<string> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session?.access_token) {
    throw error ?? new Error('Supabase OAuth code exchange did not create a session.');
  }
  return data.session.access_token;
}

export async function firebaseGoogleFallbackToken(): Promise<string> {
  const credential = await googleSignIn();
  return credential.user.getIdToken();
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;
  if (auth.currentUser) return auth.currentUser.getIdToken();
  return null;
}

export async function fetchServerSession(token?: string): Promise<ServerAuthSession> {
  const accessToken = token ?? await getAccessToken();
  if (!accessToken) throw new Error('AUTH_REQUIRED');

  const response = await fetch('/api?route=auth-session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json().catch(() => null) as { session?: ServerAuthSession; error?: { code?: string } } | null;
  if (!response.ok || !payload?.session) {
    throw new Error(payload?.error?.code || 'AUTH_SESSION_FAILED');
  }
  return payload.session;
}

export async function signOutEverywhere(): Promise<void> {
  await Promise.allSettled([
    supabase.auth.signOut(),
    firebaseLogout(),
  ]);
}
