import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim()
  || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL?.trim() : undefined)
  || 'https://olmbezzzqavgjwydlfey.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY = (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim()
  || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() : undefined)
  || 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    experimental: {
      passkey: true,
    },
  },
});
