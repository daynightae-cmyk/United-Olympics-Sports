export interface RuntimeReadiness {
  databaseConfigured: boolean;
  authVerificationConfigured: boolean;
  supabaseAuthConfigured: boolean;
  firebaseAuthConfigured: boolean;
  authAdministrativeActionsConfigured: boolean;
  paymentConfigured: boolean;
  paymentWebhookConfigured: boolean;
  smsConfigured: boolean;
}

function anyPresent(names: string[]): boolean {
  return names.some((name) => Boolean(process.env[name]?.trim()));
}

function allPresent(names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

export function databaseConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() ||
      (allPresent(['SQL_HOST', 'SQL_DB_NAME']) &&
        anyPresent(['SQL_USER', 'SQL_ADMIN_USER']) &&
        anyPresent(['SQL_PASSWORD', 'SQL_ADMIN_PASSWORD'])),
  );
}

export function supabaseAuthConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim()
    || process.env.VITE_SUPABASE_URL?.trim()
    || 'https://olmbezzzqavgjwydlfey.supabase.co';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
    || 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';
  return Boolean(url && publishableKey);
}

export function firebaseAuthConfigured(): boolean {
  return Boolean(process.env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0715083591');
}

export function authAdministrativeActionsConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

export function getRuntimeReadiness(): RuntimeReadiness {
  const supabaseConfigured = supabaseAuthConfigured();
  const firebaseConfigured = firebaseAuthConfigured();
  const paymentConfigured = anyPresent(['PAYMENTS_PROVIDER']);
  const paymentWebhookConfigured = allPresent(['PAYMENTS_PROVIDER', 'PAYMENTS_WEBHOOK_SECRET']);

  return {
    databaseConfigured: databaseConfigured(),
    authVerificationConfigured: supabaseConfigured || firebaseConfigured,
    supabaseAuthConfigured: supabaseConfigured,
    firebaseAuthConfigured: firebaseConfigured,
    authAdministrativeActionsConfigured: authAdministrativeActionsConfigured(),
    paymentConfigured,
    paymentWebhookConfigured,
    smsConfigured: anyPresent(['SMS_PROVIDER']),
  };
}
