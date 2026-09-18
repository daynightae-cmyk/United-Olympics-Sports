// Preview/demo mode guard.
//
// Standard preview data, preview auth bypass, demo routes, and demo links are
// local/visual-QA tools. They remain blocked on canonical production hosts.
//
// Client Showcase is a separate, temporary handoff mode requested by the owner.
// By default it activates only on the canonical customer-facing production
// domains, where portal surfaces are switched to synthetic preview data.
// It can be forced on elsewhere with VITE_UOS_CLIENT_SHOWCASE=true or disabled
// everywhere with VITE_UOS_CLIENT_SHOWCASE=false when real auth goes live.

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

export function clientShowcaseMode(): boolean {
  const raw = String(import.meta.env.VITE_UOS_CLIENT_SHOWCASE ?? '').trim().toLowerCase();
  if (['0', 'false', 'off', 'no'].includes(raw)) return false;
  if (['1', 'true', 'on', 'yes'].includes(raw)) return true;
  return isCanonicalProductionHost();
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
