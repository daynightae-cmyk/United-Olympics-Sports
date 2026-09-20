import type { PortalAuthKind, PortalAuthProvider } from './PortalAuthPage';

/**
 * One production provider policy for every United Olympics Sports portal.
 *
 * Passkey/WebAuthn support remains available behind the authenticated setup
 * route, but it is not advertised here until the external Supabase project and
 * every portal account contract have been verified end to end. This keeps the
 * public sign-in surface truthful and consistent.
 */
export const PRODUCTION_PORTAL_AUTH_PROVIDERS = Object.freeze([
  'google',
] satisfies PortalAuthProvider[]);

export function portalAuthProviders(_portal: PortalAuthKind): readonly PortalAuthProvider[] {
  return PRODUCTION_PORTAL_AUTH_PROVIDERS;
}
