import type { IncomingHttpHeaders } from 'node:http';

export interface ApiRequest {
  method?: string;
  url?: string;
  headers: IncomingHttpHeaders | Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getHeader(req: ApiRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function sendJson(res: ApiResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export function sendError(
  res: ApiResponse,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  sendJson(res, status, {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

export function assertMethod(req: ApiRequest, allowed: string[]): void {
  const method = (req.method || 'GET').toUpperCase();
  if (!allowed.includes(method)) {
    throw new ApiError(405, 'METHOD_NOT_ALLOWED', `Method ${method} is not allowed.`);
  }
}

function assertPayloadSize(value: string | Buffer | Record<string, unknown>, maxBytes: number): void {
  let bytes: number;

  if (typeof value === 'string') {
    bytes = Buffer.byteLength(value, 'utf8');
  } else if (Buffer.isBuffer(value)) {
    bytes = value.length;
  } else {
    try {
      bytes = Buffer.byteLength(JSON.stringify(value), 'utf8');
    } catch {
      throw new ApiError(400, 'INVALID_JSON', 'Request body must be JSON-serializable.');
    }
  }

  if (bytes > maxBytes) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }
}

export async function readJsonBody(req: ApiRequest, maxBytes = 256 * 1024): Promise<Record<string, unknown>> {
  if (req.body != null) {
    if (typeof req.body === 'string') {
      assertPayloadSize(req.body, maxBytes);
      try {
        const parsed = JSON.parse(req.body) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new ApiError(400, 'INVALID_JSON', 'JSON body must be an object.');
        }
        return parsed as Record<string, unknown>;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, 'INVALID_JSON', 'Request body contains invalid JSON.');
      }
    }

    if (Buffer.isBuffer(req.body)) {
      assertPayloadSize(req.body, maxBytes);
      return readJsonBody({ ...req, body: req.body.toString('utf8') }, maxBytes);
    }

    if (typeof req.body === 'object' && !Array.isArray(req.body)) {
      const body = req.body as Record<string, unknown>;
      assertPayloadSize(body, maxBytes);
      return body;
    }

    throw new ApiError(400, 'INVALID_JSON', 'JSON body must be an object.');
  }

  const stream = req as ApiRequest & AsyncIterable<Uint8Array | string>;
  if (typeof stream[Symbol.asyncIterator] !== 'function') return {};

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) {
      throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
    }
    chunks.push(buffer);
  }

  if (!chunks.length) return {};
  return readJsonBody({ ...req, body: Buffer.concat(chunks).toString('utf8') }, maxBytes);
}

export function normalizeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
