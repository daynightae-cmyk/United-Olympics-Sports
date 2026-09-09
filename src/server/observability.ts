import { randomUUID } from 'node:crypto';
import type { ApiRequest } from './http.ts';

export interface StructuredLogEntry {
  timestamp: string;
  requestId: string;
  correlationId: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  actorId?: string;
  tenantScope?: {
    organizationId?: string;
    branchId?: string;
  };
  errorClass?: string;
  errorMessage?: string;
}

const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_FIELDS = new Set([
  'password',
  'otp',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'authorization',
  'secret',
  'privatekey',
  'private_key',
  'cardnumber',
  'cvv',
]);

export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_FIELDS.has(lowerKey)) {
      result[key] = REDACTED_VALUE;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export class RequestLogger {
  private entries: StructuredLogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  logRequest(entry: StructuredLogEntry): void {
    if (this.entries.length >= this.maxEntries) {
      this.entries.shift();
    }
    this.entries.push(entry);

    // Also output structured JSON in production / dev console
    const serialized = JSON.stringify(entry);
    if (entry.statusCode >= 500) {
      console.error(`[HTTP 5xx] ${serialized}`);
    } else if (entry.statusCode === 429) {
      console.warn(`[HTTP 429 RATE_LIMIT] ${serialized}`);
    } else if (entry.statusCode === 401 || entry.statusCode === 403) {
      console.warn(`[HTTP 4xx AUTH] ${serialized}`);
    } else {
      // Normal info log
      if (process.env.DEBUG_HTTP) {
        console.log(`[HTTP] ${serialized}`);
      }
    }
  }

  getRecentLogs(count = 50): StructuredLogEntry[] {
    return this.entries.slice(-count);
  }

  clear(): void {
    this.entries = [];
  }
}

export const defaultRequestLogger = new RequestLogger();

export function createRequestTracker(req: ApiRequest) {
  const startTime = Date.now();
  const requestId = randomUUID();
  const correlationHeader = req.headers['x-correlation-id'] || req.headers['x-request-id'];
  const correlationId = (Array.isArray(correlationHeader) ? correlationHeader[0] : correlationHeader) || requestId;
  const method = req.method || 'GET';
  const route = req.url || '/';

  return {
    requestId,
    correlationId,
    complete(statusCode: number, actorId?: string, error?: Error, tenantScope?: { organizationId?: string; branchId?: string }): StructuredLogEntry {
      const durationMs = Date.now() - startTime;
      const entry: StructuredLogEntry = {
        timestamp: new Date().toISOString(),
        requestId,
        correlationId,
        method,
        route,
        statusCode,
        durationMs,
        actorId,
        tenantScope,
        errorClass: error ? error.constructor.name : undefined,
        errorMessage: error ? error.message : undefined,
      };

      defaultRequestLogger.logRequest(entry);
      return entry;
    },
  };
}
