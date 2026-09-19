import type { ApiResponse } from './http.js';

export interface SecurityHeadersConfig {
  enableHsts?: boolean;
  cspConnectSrc?: string[];
  cspScriptSrc?: string[];
  cspFrameSrc?: string[];
  cspImgSrc?: string[];
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
  // Base lists are additive-only across callers: the shared helper owns the
  // canonical policy, callers append environment-specific sources via config.
  const joinExtra = (values?: string[]) => (values?.join(' ') || '');
  const additionalConnect = joinExtra(config?.cspConnectSrc);
  const additionalScript = joinExtra(config?.cspScriptSrc);
  const additionalFrame = joinExtra(config?.cspFrameSrc);
  const additionalImg = joinExtra(config?.cspImgSrc);
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://js.stripe.com ${additionalScript}`.trim().replace(/\s+/g, ' '),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: https: blob: ${additionalImg}`.trim().replace(/\s+/g, ' '),
    `connect-src 'self' https://*.supabase.co https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com https://api.stripe.com https://r.stripe.com https://m.stripe.network ${additionalConnect}`.trim().replace(/\s+/g, ' '),
    `frame-src 'self' https://accounts.google.com https://js.stripe.com https://hooks.stripe.com ${additionalFrame}`.trim().replace(/\s+/g, ' '),
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
