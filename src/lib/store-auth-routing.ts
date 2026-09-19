// Pure store-auth routing helpers.
//
// Dependency-free on purpose: these are imported by browser components
// (AppRouter, PortalLoginRoute) AND by node executable tests, so this module
// must never import firebase, supabase, react, or CSS.

export const STORE_ACCOUNT_FALLBACK = '/store/account';

// Store routes rendered behind StoreAccountBoundary (see StoreApp). Public
// store routes such as /store/cart and /store/checkout are intentionally
// excluded: they must never become post-sign-in redirect targets.
const STORE_ACCOUNT_PATHS: ReadonlySet<string> = new Set([
  '/store/account',
  '/store/orders',
  '/store/wishlist',
  '/store/addresses',
  '/store/payment-methods',
  '/store/notifications',
  '/store/settings',
]);

const STORE_ORDER_DETAIL_PATTERN = /^\/store\/order\/[^/?#]+$/;

/** Matches /store/login with or without a trailing slash. React Router serves
 * both from the same route, but location.pathname preserves the slash. */
export function isStoreAuthPath(pathname: string): boolean {
  return pathname === '/store/login' || pathname === '/store/login/';
}

/**
 * Resolves where a store sign-in should land. Accepts only protected store
 * account destinations previously stored in router state by
 * StoreAccountRuntime; every other value (public store routes, external URLs,
 * protocol-relative URLs, non-strings) falls back to /store/account.
 */
export function resolveStorePostSignInDestination(from: unknown, fallback = STORE_ACCOUNT_FALLBACK): string {
  if (typeof from !== 'string') return fallback;
  if (STORE_ACCOUNT_PATHS.has(from)) return from;
  if (STORE_ORDER_DETAIL_PATTERN.test(from)) return from;
  return fallback;
}
