export type IdentityProviderType = 'supabase' | 'firebase';

export interface IdentitySubject {
  provider: IdentityProviderType;
  rawSubject: string;
  normalizedUid: string;
  email?: string;
  phone?: string;
}

/**
 * Normalizes phone numbers into standard E.164 format.
 * Examples:
 *   "0501234567" (UAE) -> "+971501234567"
 *   "+971 50 123 4567" -> "+971501234567"
 */
export function normalizePhoneNumber(raw: string, defaultCountryCode = '971'): string | null {
  if (!raw || typeof raw !== 'string') return null;

  // Remove spaces, dashes, parentheses
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (!cleaned) return null;

  // If starts with +, ensure digits only after +
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (!/^\d{8,15}$/.test(digits)) return null;
    return `+${digits}`;
  }

  // If starts with 00, replace with +
  if (cleaned.startsWith('00')) {
    const digits = cleaned.slice(2);
    if (!/^\d{8,15}$/.test(digits)) return null;
    return `+${digits}`;
  }

  // If starts with 0 (local national prefix), replace with default country code
  if (cleaned.startsWith('0')) {
    const digits = cleaned.slice(1);
    const full = `${defaultCountryCode}${digits}`;
    if (!/^\d{8,15}$/.test(full)) return null;
    return `+${full}`;
  }

  // Otherwise assume country code was provided without +
  if (/^\d{8,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Validates a returnTo URL for OAuth redirect safety to prevent open redirects.
 */
export function validateSafeReturnTo(returnTo: string | undefined | null, defaultTarget = '/portal/overview'): string {
  if (!returnTo || typeof returnTo !== 'string') return defaultTarget;
  const trimmed = returnTo.trim();

  // Allow relative URLs starting with / (but not // which can be protocol-relative)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'unitedolympicssports.com' ||
      hostname.endsWith('.unitedolympicssports.com') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {
      return trimmed;
    }
  } catch {
    // Malformed URL
  }

  return defaultTarget;
}

/**
 * Maps provider tokens to unified internal IdentitySubject representations.
 */
export function mapProviderSubject(provider: IdentityProviderType, subject: string, email?: string, phone?: string): IdentitySubject {
  const normalizedUid = provider === 'supabase' ? `supabase:${subject}` : subject;
  return {
    provider,
    rawSubject: subject,
    normalizedUid,
    ...(email ? { email: email.toLowerCase().trim() } : {}),
    ...(phone ? { phone: normalizePhoneNumber(phone) || phone } : {}),
  };
}
