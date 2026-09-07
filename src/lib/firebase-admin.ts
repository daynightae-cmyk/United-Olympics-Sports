import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

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

if (!getApps().length) {
  const serviceAccount = serviceAccountFromEnv();
  const useApplicationDefault = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() || firebaseConfig.projectId,
    ...(serviceAccount
      ? { credential: cert(serviceAccount) }
      : useApplicationDefault
        ? { credential: applicationDefault() }
        : {}),
  });
}

export const adminAuth = getAuth();
