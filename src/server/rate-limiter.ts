import { ApiError, getHeader, type ApiRequest, type ApiResponse } from './http.ts';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> | RateLimitResult;
  reset?(key: string): Promise<void> | void;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private windows = new Map<string, number[]>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs: number;

  constructor(cleanupIntervalMs = 60_000) {
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  public consume(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    this.maybeCleanup(now, windowMs);

    const windowStart = now - windowMs;
    const timestamps = this.windows.get(key) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestValid = validTimestamps[0];
      const resetAt = oldestValid + windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
      this.windows.set(key, validTimestamps);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt,
        retryAfterSeconds,
      };
    }

    validTimestamps.push(now);
    this.windows.set(key, validTimestamps);

    const remaining = Math.max(0, limit - validTimestamps.length);
    const oldestTimestamp = validTimestamps[0];
    const resetAt = oldestTimestamp + windowMs;

    return {
      allowed: true,
      limit,
      remaining,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  public reset(key: string): void {
    this.windows.delete(key);
  }

  private maybeCleanup(now: number, windowMs: number): void {
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;

    const threshold = now - windowMs * 2;
    for (const [key, timestamps] of this.windows.entries()) {
      const active = timestamps.filter((t) => t > threshold);
      if (active.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, active);
      }
    }
  }
}

export class RateLimiter {
  private store: RateLimitStore;

  constructor(store?: RateLimitStore) {
    this.store = store || new MemoryRateLimitStore();
  }

  public async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    return this.store.consume(key, limit, windowMs);
  }

  public async assertAllowed(
    key: string,
    limit: number,
    windowMs: number,
    actionName = 'action',
  ): Promise<RateLimitResult> {
    const result = await this.consume(key, limit, windowMs);
    if (!result.allowed) {
      throw new ApiError(
        429,
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded for ${actionName}. Please retry in ${result.retryAfterSeconds} seconds.`,
        {
          limit: result.limit,
          remaining: result.remaining,
          retryAfterSeconds: result.retryAfterSeconds,
        },
      );
    }
    return result;
  }
}

export const defaultRateLimiter = new RateLimiter();

/**
 * Extracts a client IP safely from request headers or socket.
 */
export function getClientIp(req: ApiRequest): string {
  const cfIp = getHeader(req, 'cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const realIp = getHeader(req, 'x-real-ip');
  if (realIp) return realIp.trim();

  const forwardedFor = getHeader(req, 'x-forwarded-for');
  if (forwardedFor) {
    // Left-most address is client address in X-Forwarded-For
    const ips = forwardedFor.split(',');
    if (ips.length > 0) {
      const clientIp = ips[0].trim();
      if (clientIp) return clientIp;
    }
  }

  const socketRemoteAddress = (req as unknown as { socket?: { remoteAddress?: string } })?.socket?.remoteAddress;
  if (socketRemoteAddress) return socketRemoteAddress.trim();

  return '127.0.0.1';
}

/**
 * Validates honeypot fields commonly targeted by spam scripts.
 * Returns true if clean (no bot detected), false if honeypot was triggered.
 */
export function validateHoneypot(body: Record<string, unknown>, honeypotKeys: string[] = ['website', 'hp', 'address_line2_confirm']): boolean {
  for (const key of honeypotKeys) {
    const val = body[key];
    if (val != null && typeof val === 'string' && val.trim().length > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Attaches standard rate limiting headers (RateLimit-* & Retry-After) to an ApiResponse.
 */
export function applyRateLimitHeaders(res: ApiResponse, result: RateLimitResult): void {
  res.setHeader('RateLimit-Limit', result.limit.toString());
  res.setHeader('RateLimit-Remaining', result.remaining.toString());
  res.setHeader('RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
  if (!result.allowed && result.retryAfterSeconds > 0) {
    res.setHeader('Retry-After', result.retryAfterSeconds.toString());
  }
}
