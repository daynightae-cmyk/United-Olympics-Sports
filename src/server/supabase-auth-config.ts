export const DEFAULT_AUTH_SUPABASE_URL = 'https://olmbezzzqavgjwydlfey.supabase.co';
export const DEFAULT_AUTH_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

export type SupabaseAuthConfig = {
  url: string;
  publishableKey: string;
};

/**
 * Authentication and data-plane integrations are intentionally separated.
 *
 * Vercel/Supabase integrations can inject generic SUPABASE_URL variables for a
 * database project. Those variables must never silently retarget bearer-token
 * verification away from the Supabase project used by the browser auth client.
 *
 * AUTH_SUPABASE_* is the explicit server override. VITE_SUPABASE_* is the same
 * public Auth project used by the browser. Generic SUPABASE_* values are
 * deliberately ignored here and remain available to data/database integrations.
 */
export function getSupabaseAuthConfig(env: NodeJS.ProcessEnv = process.env): SupabaseAuthConfig {
  const url = env.AUTH_SUPABASE_URL?.trim()
    || env.VITE_SUPABASE_URL?.trim()
    || DEFAULT_AUTH_SUPABASE_URL;
  const publishableKey = env.AUTH_SUPABASE_PUBLISHABLE_KEY?.trim()
    || env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
    || DEFAULT_AUTH_SUPABASE_PUBLISHABLE_KEY;

  return {
    url: url.replace(/\/+$/, ''),
    publishableKey,
  };
}
