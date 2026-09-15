export class RuntimeTimeoutError extends Error {
  constructor(public readonly operation: string, public readonly timeoutMs: number) {
    super(`${operation} timed out after ${timeoutMs}ms`);
    this.name = 'RuntimeTimeoutError';
  }
}

export async function withRuntimeTimeout<T>(
  operation: string,
  work: Promise<T>,
  timeoutMs = 10_000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new RuntimeTimeoutError(operation, timeoutMs)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function operationName(input: RequestInfo | URL): string {
  return typeof input === 'string' ? input : input instanceof URL ? input.toString() : 'fetch';
}

const BODY_METHODS = new Set<PropertyKey>(['arrayBuffer', 'blob', 'formData', 'json', 'text']);

/**
 * Fetches with a deadline that remains active through body consumption.
 * Returning headers is not treated as completion: json/text/blob/etc. retain
 * the same AbortController until the body is fully consumed. This prevents a
 * response that stalls after headers from leaving portal/account loaders alive.
 */
export async function fetchWithRuntimeTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const name = operationName(input);
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => controller.abort(), timeoutMs);
  const clearDeadline = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return new Proxy(response, {
      get(target, property) {
        if (BODY_METHODS.has(property)) {
          const method = Reflect.get(target, property, target);
          return async (...args: unknown[]) => {
            try {
              return await method.apply(target, args);
            } catch (error) {
              if (controller.signal.aborted || isAbortError(error)) {
                throw new RuntimeTimeoutError(name, timeoutMs);
              }
              throw error;
            } finally {
              clearDeadline();
            }
          };
        }
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  } catch (error) {
    clearDeadline();
    if (controller.signal.aborted || isAbortError(error)) {
      throw new RuntimeTimeoutError(name, timeoutMs);
    }
    throw error;
  }
}

/**
 * Convenience wrapper that performs fetch + JSON body consumption under one
 * explicit deadline and returns both the HTTP response metadata and payload.
 */
export async function fetchJsonWithRuntimeTimeout<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<{ response: Response; payload: T | null }> {
  const response = await fetchWithRuntimeTimeout(input, init, timeoutMs);
  let payload: T | null = null;
  try {
    payload = await response.json() as T;
  } catch (error) {
    if (error instanceof RuntimeTimeoutError) throw error;
    payload = null;
  }
  return { response, payload };
}