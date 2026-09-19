// Preview/demo mode guard.
//
// Standard preview data, preview auth bypass, demo routes, and demo links are
// local/visual-QA tools. They remain blocked on canonical production hosts.
//
// Client Showcase is a separate, temporary handoff mode. It is NEVER inferred
// from the production hostname: production defaults to real auth/data (or a
// truthful unavailable state) unless the deployment explicitly opts in with
// VITE_UOS_CLIENT_SHOWCASE=true.

const CANONICAL_PRODUCTION_HOSTS = [
  'unitedolympicsports.store',
  'www.unitedolympicsports.store',
  'unitedolympicssports.com',
  'www.unitedolympicssports.com',
] as const;

export function isCanonicalProductionHost(hostname?: string): boolean {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : ''))
    .trim()
    .toLowerCase();
  if (!host) return false;
  return (CANONICAL_PRODUCTION_HOSTS as readonly string[]).includes(host);
}

/**
 * Pure Client Showcase resolver used by executable production-isolation tests.
 * Hostname is deliberately irrelevant: showcase is explicit opt-in only.
 */
export function resolveClientShowcaseMode(rawFlag: unknown): boolean {
  const raw = String(rawFlag ?? '').trim().toLowerCase();
  return ['1', 'true', 'on', 'yes'].includes(raw);
}

export function clientShowcaseMode(): boolean {
  // Optional chaining keeps this callable outside Vite (node tests), where
  // import.meta.env is undefined: unset flag means showcase off.
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return resolveClientShowcaseMode(viteEnv?.VITE_UOS_CLIENT_SHOWCASE);
}

// Central standard-preview gate: call with the explicit VITE_UOS_* flag value.
export function previewModeAllowed(explicitFlag: boolean): boolean {
  if (isCanonicalProductionHost()) return false;
  return import.meta.env.DEV || explicitFlag;
}

// Portal surfaces can opt into the owner's temporary Client Showcase mode
// without weakening the standard production preview guard above.
export function portalPreviewModeAllowed(explicitFlag: boolean): boolean {
  return clientShowcaseMode() || previewModeAllowed(explicitFlag);
}
