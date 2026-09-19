// Preview/demo mode guard.
//
// Standard preview data, preview auth bypass, demo routes, and demo links are
// local/visual-QA tools. They remain blocked on canonical production hosts.
//
// Client Showcase is a separate, temporary handoff mode requested by the owner.
// It is explicit opt-in ONLY: VITE_UOS_CLIENT_SHOWCASE=true enables it,
// anything else (unset, false, any other value) disables it everywhere.
// Canonical production hosts NEVER imply showcase mode: production defaults to
// real auth/data or a truthful unavailable state.

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

/** Pure explicit-opt-in parser: only truthy flag literals enable showcase. */
export function parseClientShowcaseFlag(raw: unknown): boolean {
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (['0', 'false', 'off', 'no'].includes(normalized)) return false;
  return ['1', 'true', 'on', 'yes'].includes(normalized);
}

export function clientShowcaseMode(): boolean {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return parseClientShowcaseFlag(viteEnv?.VITE_UOS_CLIENT_SHOWCASE);
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
