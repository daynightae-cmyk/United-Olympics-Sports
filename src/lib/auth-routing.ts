// Pure authentication routing helpers.
//
// Dependency-free so executable Node tests can validate redirect safety without
// importing Firebase/Supabase browser clients.

const SAFE_RETURN_BASE = 'https://uos.invalid';

export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (typeof value !== 'string' || !value) return fallback;
  if (value !== value.trim()) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.includes('\\\\') || /%5c/i.test(value)) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  try {
    const resolved = new URL(value, SAFE_RETURN_BASE);
    if (resolved.origin !== SAFE_RETURN_BASE) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
