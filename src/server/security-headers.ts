import type { ApiResponse } from './http.ts';

export interface SecurityHeadersConfig {
  enableHsts?: boolean;
  cspConnectSrc?: string[];
}

export function applySecurityHeaders(res: ApiResponse, config?: SecurityHeadersConfig): void {
  // 1. Clickjacking Protection
  res.setHeader('X-Frame-Options', 'DENY');

  // 2. MIME type sniffing prevention
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 3. Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 5. Content Security Policy (allows Supabase, Firebase, Google, Vercel, fonts, images)
  const additionalConnect = config?.cspConnectSrc?.join(' ') || '';
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    `connect-src 'self' https://*.supabase.co https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com ${additionalConnect}`.trim(),
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // 6. HSTS (only enabled if specified or in production)
  if (config?.enableHsts) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}
