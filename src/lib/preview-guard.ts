// Preview/demo mode guard.
//
// Preview data, preview auth bypass, demo routes, and demo links are
// local/visual-QA tools. They must work in development and in explicit
// preview-QA builds (production builds served on loopback/preview hosts
// with VITE_UOS_* flags set), but they must NEVER activate on the
// canonical production hosts — even if a preview flag is misconfigured
// in the production deployment environment.
//
// The check is hostname-based on purpose: window.location.hostname is
// browser truth and cannot be enabled by a leaked env flag alone. Only
// exact canonical hosts are blocked; preview deployments, loopback, and
// LAN QA hosts keep working.

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

// Central gate: call with the explicit VITE_UOS_* flag value.
export function previewModeAllowed(explicitFlag: boolean): boolean {
  if (isCanonicalProductionHost()) return false;
  return import.meta.env.DEV || explicitFlag;
}
