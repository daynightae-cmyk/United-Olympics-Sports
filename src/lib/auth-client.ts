import { auth, googleSignIn, logout as firebaseLogout } from './firebase';
import { supabase } from './supabase';
import { fetchJsonWithRuntimeTimeout, withRuntimeTimeout, withRuntimeTimeoutGuarded } from './runtime-timeout';
import { createAsyncExclusiveRunner, shouldClearLateSession } from './late-session-guard';

const RETURN_TO_KEY = 'uos:auth:return-to';
const AUTH_RUNTIME_TIMEOUT_MS = 10_000;
const PASSKEY_RUNTIME_TIMEOUT_MS = 60_000;
const PRODUCTION_AUTH_APEX_HOST = 'unitedolympicsports.store';
const PRODUCTION_AUTH_CANONICAL_HOST = 'www.unitedolympicsports.store';

export type ClientAuthProvider = 'supabase' | 'firebase';

export type ServerAuthSession = {
  uid: string;
  provider: ClientAuthProvider;
  email?: string;
  roles: string[];
  scopes: string[];
};

export type PortalBindings = {
  playerIds: string[];
  guardianIds: string[];
  guardianPlayerIds: string[];
  coachIds: string[];
  coachGroupIds: string[];
  coachPlayerIds: string[];
};

export type PortalIdentity = {
  identity: {
    uid: string;
    provider: ClientAuthProvider;
    email?: string;
  };
  roles: string[];
  scopes: string[];
  bindings: PortalBindings;
};

export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

/**
 * Supabase PKCE stores the code verifier in browser storage, which is scoped to
 * the exact origin. Production currently resolves auth callbacks on the `www`
 * host, so authentication must start on that same host. Otherwise an apex → www
 * redirect can strand the verifier on the apex origin and make the code exchange
 * fail even though Google has already created the Supabase user.
 */
export function canonicalAuthPageUrl(href: string): string | null {
  const url = new URL(href);
  if (url.hostname !== PRODUCTION_AUTH_APEX_HOST) return null;
  url.hostname = PRODUCTION_AUTH_CANONICAL_HOST;
  url.protocol = 'https:';
  url.port = '';
  return url.toString();
}

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && typeof window.PublicKeyCredential !== 'undefined'
    && typeof navigator !== 'undefined'
    && !!navigator.credentials;
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isPasskeySupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function beginSupabaseGoogleOAuth(returnTo = '/'): Promise<void> {
  const safeDestination = safeReturnTo(returnTo);
  sessionStorage.setItem(RETURN_TO_KEY, safeDestination);
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { data, error } = await withRuntimeTimeout(
    'supabase-google-oauth-start',
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    }),
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (error || !data.url) {
    throw error ?? new Error('Supabase did not return an OAuth redirect URL.');
  }
  window.location.assign(data.url);
}

let supabasePasswordAttemptSeq = 0;
const withSupabaseSessionMutation = createAsyncExclusiveRunner();

export async function signInWithSupabasePassword(email: string, password: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) throw new Error('PASSWORD_CREDENTIALS_REQUIRED');

  // supabase-js password sign-in is not cancellable: a response that arrives
  // after the deadline would persist a session via internal storage while the
  // UI already reported failure. The late-settlement guard removes that stray
  // local session, but never a session created by a newer attempt: a retry
  // (or a passkey/Google sign-in) that lands first owns the current session,
  // so cleanup proceeds only while this attempt is still the latest one and
  // the persisted token is the late response's own token.
  const attemptId = ++supabasePasswordAttemptSeq;
  const attempt = withSupabaseSessionMutation(() => supabase.auth.signInWithPassword({ email: normalizedEmail, password }));
  const { data, error } = await withRuntimeTimeoutGuarded(
    'supabase-password-sign-in',
    attempt,
    AUTH_RUNTIME_TIMEOUT_MS,
    (result) => {
      if (result.status !== 'fulfilled' || result.value.error || !result.value.data.session) return;
      const lateAccessToken = result.value.data.session.access_token;
      void withSupabaseSessionMutation(async () => {
        const { data: current } = await supabase.auth.getSession();
        if (shouldClearLateSession(attemptId, supabasePasswordAttemptSeq, lateAccessToken, current.session?.access_token)) {
          await supabase.auth.signOut({ scope: 'local' });
        }
      }).catch(() => undefined);
    },
  );

  if (error || !data.session?.access_token) {
    throw error ?? new Error('PASSWORD_SESSION_MISSING');
  }

  return data.session.access_token;
}

export async function signInWithSupabasePasskey(): Promise<string> {
  if (!isPasskeySupported()) throw new Error('PASSKEY_UNSUPPORTED');

  const { data, error } = await withRuntimeTimeout(
    'supabase-passkey-sign-in',
    withSupabaseSessionMutation(() => supabase.auth.signInWithPasskey()),
    PASSKEY_RUNTIME_TIMEOUT_MS,
  );
  if (error || !data.session?.access_token) {
    throw error ?? new Error('PASSKEY_SESSION_MISSING');
  }
  return data.session.access_token;
}

export async function registerSupabasePasskey() {
  if (!isPasskeySupported()) throw new Error('PASSKEY_UNSUPPORTED');
  const { data, error } = await withRuntimeTimeout(
    'supabase-passkey-register',
    supabase.auth.registerPasskey(),
    PASSKEY_RUNTIME_TIMEOUT_MS,
  );
  if (error || !data) throw error ?? new Error('PASSKEY_REGISTRATION_FAILED');
  return data;
}

export async function listSupabasePasskeys() {
  const { data, error } = await withRuntimeTimeout(
    'supabase-passkey-list',
    supabase.auth.passkey.list(),
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (error) throw error;
  return data ?? [];
}

export async function deleteSupabasePasskey(passkeyId: string): Promise<void> {
  if (!passkeyId) throw new Error('PASSKEY_ID_REQUIRED');
  const { error } = await withRuntimeTimeout(
    'supabase-passkey-delete',
    supabase.auth.passkey.delete({ passkeyId }),
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (error) throw error;
}

export function peekAuthReturnTo(fallback = '/'): string {
  const stored = sessionStorage.getItem(RETURN_TO_KEY);
  return safeReturnTo(stored, fallback);
}

export function consumeAuthReturnTo(fallback = '/'): string {
  const stored = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  return safeReturnTo(stored, fallback);
}

export async function exchangeSupabaseAuthCode(code: string): Promise<string> {
  const { data, error } = await withRuntimeTimeout(
    'supabase-auth-code-exchange',
    withSupabaseSessionMutation(() => supabase.auth.exchangeCodeForSession(code)),
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (error || !data.session?.access_token) {
    throw error ?? new Error('Supabase OAuth code exchange did not create a session.');
  }
  return data.session.access_token;
}

export async function firebaseGoogleFallbackToken(): Promise<string> {
  const credential = await withRuntimeTimeout('firebase-google-sign-in', googleSignIn(), AUTH_RUNTIME_TIMEOUT_MS);
  return withRuntimeTimeout('firebase-id-token', credential.user.getIdToken(), AUTH_RUNTIME_TIMEOUT_MS);
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await withRuntimeTimeout('supabase-session-read', supabase.auth.getSession(), AUTH_RUNTIME_TIMEOUT_MS);
  if (data.session?.access_token) return data.session.access_token;
  if (auth.currentUser) return withRuntimeTimeout('firebase-id-token', auth.currentUser.getIdToken(), AUTH_RUNTIME_TIMEOUT_MS);
  return null;
}

export async function fetchServerSession(token?: string): Promise<ServerAuthSession> {
  const accessToken = token ?? await getAccessToken();
  if (!accessToken) throw new Error('AUTH_REQUIRED');

  const { response, payload } = await fetchJsonWithRuntimeTimeout<{ session?: ServerAuthSession; error?: { code?: string } }>(
    '/api?route=auth-session',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (!response.ok || !payload?.session) {
    throw new Error(payload?.error?.code || 'AUTH_SESSION_FAILED');
  }
  return payload.session;
}

export async function fetchPortalIdentity(token?: string): Promise<PortalIdentity> {
  const accessToken = token ?? await getAccessToken();
  if (!accessToken) throw new Error('AUTH_REQUIRED');

  const { response, payload } = await fetchJsonWithRuntimeTimeout<
    (PortalIdentity & { ok?: boolean }) | { error?: { code?: string } }
  >(
    '/api?route=portal-whoami',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    AUTH_RUNTIME_TIMEOUT_MS,
  );
  if (!response.ok || !payload || !('bindings' in payload)) {
    const code = payload && 'error' in payload ? payload.error?.code : undefined;
    throw new Error(code || 'PORTAL_BINDING_FAILED');
  }
  return payload;
}

export async function signOutEverywhere(): Promise<void> {
  await Promise.allSettled([
    withRuntimeTimeout('supabase-sign-out', supabase.auth.signOut(), AUTH_RUNTIME_TIMEOUT_MS),
    withRuntimeTimeout('firebase-sign-out', firebaseLogout(), AUTH_RUNTIME_TIMEOUT_MS),
  ]);
}
