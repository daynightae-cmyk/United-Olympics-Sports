import type { ServiceAccount } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

function serviceAccountFromEnv(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    return parsed;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
  }
}

let initPromise: Promise<void> | null = null;

function ensureAdminApp(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      // firebase-admin (and its jwks-rsa/jose graph) is incompatible with some
      // serverless loaders at module-evaluation time, so every value import
      // stays lazy: importing this module must never throw, and must never
      // require administrative credentials for unrelated routes (e.g. health).
      // A loader-level failure surfaces here (inside the caller's try/catch)
      // instead of at function boot.
      const adminApp = await import('firebase-admin/app');
      await import('firebase-admin/auth');
      if (!adminApp.getApps().length) {
        const serviceAccount = serviceAccountFromEnv();
        const useApplicationDefault = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
        adminApp.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID?.trim() || firebaseConfig.projectId,
          ...(serviceAccount
            ? { credential: adminApp.cert(serviceAccount) }
            : useApplicationDefault
              ? { credential: adminApp.applicationDefault() }
              : {}),
        });
      }
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

/**
 * Returns the Firebase Admin auth client, initializing the app on first use.
 * Rejects (never throws synchronously) when credentials are invalid or the
 * admin SDK cannot load in the current runtime; callers must fail closed.
 */
export async function getAdminAuth(): Promise<Auth> {
  await ensureAdminApp();
  const { getAuth } = await import('firebase-admin/auth');
  return getAuth();
}
