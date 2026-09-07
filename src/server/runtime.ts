export interface RuntimeReadiness {
  databaseConfigured: boolean;
  authVerificationConfigured: boolean;
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

export function authAdministrativeActionsConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

export function getRuntimeReadiness(): RuntimeReadiness {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0715083591';
  const paymentConfigured = anyPresent(['PAYMENTS_PROVIDER']);
  const paymentWebhookConfigured = allPresent(['PAYMENTS_PROVIDER', 'PAYMENTS_WEBHOOK_SECRET']);

  return {
    databaseConfigured: databaseConfigured(),
    authVerificationConfigured: Boolean(projectId),
    authAdministrativeActionsConfigured: authAdministrativeActionsConfigured(),
    paymentConfigured,
    paymentWebhookConfigured,
    smsConfigured: anyPresent(['SMS_PROVIDER']),
  };
}
