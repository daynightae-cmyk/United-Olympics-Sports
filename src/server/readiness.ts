import { getPool, databaseConfigured } from '../db/index.ts';
import { supabaseAuthConfigured, firebaseAuthConfigured, authAdministrativeActionsConfigured } from './runtime.ts';

export type DependencyStage = 'not_configured' | 'configured' | 'reachable' | 'verified' | 'operational';
export type DependencyStatus = 'PASS' | 'PARTIAL' | 'BLOCKED' | 'FAIL' | 'NOT_CONFIGURED';

export interface DependencyEvidence {
  stage: DependencyStage;
  status: DependencyStatus;
  checkedAt: string;
  latencyMs?: number;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SystemReadinessReport {
  ok: boolean;
  service: string;
  status: 'ok' | 'degraded' | 'not_ready';
  productionReady: boolean;
  checkedAt: string;
  dependencies: {
    database: DependencyEvidence;
    authVerification: DependencyEvidence;
    authAdministrativeActions: DependencyEvidence;
    payments: DependencyEvidence;
    paymentWebhook: DependencyEvidence;
    sms: DependencyEvidence;
  };
}

const BOUNDED_TIMEOUT_MS = 2000;

export async function checkDatabaseReadiness(): Promise<DependencyEvidence> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();

  if (!databaseConfigured()) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'DATABASE_URL or SQL credentials not configured in environment.',
      metadata: { configured: false },
    };
  }

  try {
    const pool = getPool();
    const queryPromise = pool.query('select 1 as live, count(*)::int as table_count from information_schema.tables where table_schema = $1', ['public']);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_PROBE_TIMEOUT')), BOUNDED_TIMEOUT_MS),
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;
    const tableCount = Number(result.rows[0]?.table_count || 0);

    if (tableCount > 0) {
      return {
        stage: 'operational',
        status: 'PASS',
        checkedAt,
        latencyMs,
        metadata: { tablesDiscovered: tableCount },
      };
    }

    return {
      stage: 'verified',
      status: 'PARTIAL',
      checkedAt,
      latencyMs,
      reason: 'Database reachable but no schema tables discovered. Migration required.',
      metadata: { tablesDiscovered: 0 },
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      stage: 'configured',
      status: 'FAIL',
      checkedAt,
      latencyMs,
      reason: `Database connection probe failed: ${message}`,
      metadata: { configured: true },
    };
  }
}

export async function checkAuthVerificationReadiness(fetchImpl: typeof fetch = fetch): Promise<DependencyEvidence> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();

  const isSupabaseConfigured = supabaseAuthConfigured();
  const isFirebaseConfigured = firebaseAuthConfigured();

  if (!isSupabaseConfigured && !isFirebaseConfigured) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'Neither Supabase nor Firebase authentication is configured.',
      metadata: { supabase: false, firebase: false },
    };
  }

  // Attempt bounded reachability probe against Supabase auth health endpoint
  if (isSupabaseConfigured) {
    const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || 'https://olmbezzzqavgjwydlfey.supabase.co';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), BOUNDED_TIMEOUT_MS);
      const res = await fetchImpl(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const latencyMs = Date.now() - start;
      if (res.ok) {
        return {
          stage: 'operational',
          status: 'PASS',
          checkedAt,
          latencyMs,
          metadata: { primaryProvider: 'supabase', verified: true },
        };
      }
      return {
        stage: 'reachable',
        status: 'PARTIAL',
        checkedAt,
        latencyMs,
        reason: `Supabase auth health responded with HTTP ${res.status}`,
        metadata: { primaryProvider: 'supabase', httpStatus: res.status },
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);
      return {
        stage: 'configured',
        status: 'PARTIAL',
        checkedAt,
        latencyMs,
        reason: `Supabase auth probe failed (${message}); token verification client configured`,
        metadata: { primaryProvider: 'supabase', error: message },
      };
    }
  }

  return {
    stage: 'verified',
    status: 'PASS',
    checkedAt,
    latencyMs: Date.now() - start,
    metadata: { primaryProvider: 'firebase', verified: true },
  };
}

export function checkAuthAdminReadiness(): DependencyEvidence {
  const checkedAt = new Date().toISOString();
  const configured = authAdministrativeActionsConfigured();
  if (!configured) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'Administrative service account credentials not configured in environment.',
      metadata: { hasServiceAccount: false },
    };
  }
  return {
    stage: 'configured',
    status: 'PASS',
    checkedAt,
    metadata: { hasServiceAccount: true },
  };
}

export function checkPaymentsReadiness(): DependencyEvidence {
  const checkedAt = new Date().toISOString();
  const provider = process.env.PAYMENTS_PROVIDER?.trim();
  if (!provider) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'PAYMENTS_PROVIDER not set in environment.',
      metadata: { configured: false },
    };
  }

  const webhookSecret = process.env.PAYMENTS_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return {
      stage: 'configured',
      status: 'PARTIAL',
      checkedAt,
      reason: 'PAYMENTS_PROVIDER is set but PAYMENTS_WEBHOOK_SECRET is missing.',
      metadata: { provider, webhookConfigured: false },
    };
  }

  // Notice: environment variables alone DO NOT grant operational status!
  return {
    stage: 'verified',
    status: 'PARTIAL',
    checkedAt,
    reason: 'Payment provider configured with webhook secret; live sandbox intent verification pending.',
    metadata: { provider, webhookConfigured: true },
  };
}

export function checkPaymentWebhookReadiness(): DependencyEvidence {
  const checkedAt = new Date().toISOString();
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'PAYMENTS_WEBHOOK_SECRET not set in environment.',
      metadata: { configured: false },
    };
  }
  return {
    stage: 'configured',
    status: 'PASS',
    checkedAt,
    metadata: { configured: true },
  };
}

export function checkSmsReadiness(): DependencyEvidence {
  const checkedAt = new Date().toISOString();
  const provider = process.env.SMS_PROVIDER?.trim();
  if (!provider) {
    return {
      stage: 'not_configured',
      status: 'BLOCKED',
      checkedAt,
      reason: 'SMS_PROVIDER not configured in environment.',
      metadata: { configured: false },
    };
  }
  return {
    stage: 'configured',
    status: 'PARTIAL',
    checkedAt,
    reason: `SMS provider '${provider}' configured; delivery gateway pending credential activation.`,
    metadata: { provider },
  };
}

export async function evaluateSystemReadiness(fetchImpl: typeof fetch = fetch): Promise<SystemReadinessReport> {
  const checkedAt = new Date().toISOString();

  const [database, authVerification] = await Promise.all([
    checkDatabaseReadiness(),
    checkAuthVerificationReadiness(fetchImpl),
  ]);

  const authAdministrativeActions = checkAuthAdminReadiness();
  const payments = checkPaymentsReadiness();
  const paymentWebhook = checkPaymentWebhookReadiness();
  const sms = checkSmsReadiness();

  // productionReady MUST NOT become true merely from environment variable presence!
  // Requires explicit operational stages for core dependencies.
  const productionReady =
    database.stage === 'operational' &&
    authVerification.stage === 'operational' &&
    payments.stage === 'operational';

  const allOperational = productionReady && sms.stage === 'operational';

  return {
    ok: true,
    service: 'united-olympics-sports',
    status: allOperational ? 'ok' : 'degraded',
    productionReady,
    checkedAt,
    dependencies: {
      database,
      authVerification,
      authAdministrativeActions,
      payments,
      paymentWebhook,
      sms,
    },
  };
}
