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

export type LateSettledResult<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason?: unknown };

/**
 * Races work against a deadline like withRuntimeTimeout, but keeps cleanup
 * attached to the original request: when the deadline wins, a late settlement
 * of the still-running work is reported to onLateSettle instead of being
 * silently dropped. Used by password sign-in so a delayed successful response
 * cannot leave a persisted session behind after the UI reported failure.
 */
export async function withRuntimeTimeoutGuarded<T>(
  operation: string,
  work: Promise<T>,
  timeoutMs = 10_000,
  onLateSettle?: (result: LateSettledResult<T>) => void,
): Promise<T> {
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (onLateSettle) {
    void work.then(
      (value) => { if (timedOut) onLateSettle({ status: 'fulfilled', value }); },
      (reason) => { if (timedOut) onLateSettle({ status: 'rejected', reason }); },
    );
  }
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          reject(new RuntimeTimeoutError(operation, timeoutMs));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function operationName(input: RequestInfo | URL): string {
  return typeof input === 'string' ? input : input instanceof URL ? input.toString() : 'fetch';
}

const BODY_METHODS = new Set<PropertyKey>(['arrayBuffer', 'blob', 'formData', 'json', 'text']);

/**
 * Fetches with a deadline that remains active through body consumption.
 * Caller cancellation and the internal deadline are both preserved. Only the
 * internal deadline is translated into RuntimeTimeoutError; caller aborts keep
 * their original abort error/reason.
 */
export async function fetchWithRuntimeTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const callerSignal = init.signal;
  const name = operationName(input);
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardCallerAbort = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) forwardCallerAbort();
    else callerSignal.addEventListener('abort', forwardCallerAbort, { once: true });
  }

  const clearDeadline = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    callerSignal?.removeEventListener('abort', forwardCallerAbort);
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
              if (timedOut) throw new RuntimeTimeoutError(name, timeoutMs);
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
    if (timedOut) throw new RuntimeTimeoutError(name, timeoutMs);
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
  try {
    return { response, payload: await response.json() as T };
  } catch (error) {
    if (error instanceof RuntimeTimeoutError) throw error;
    return { response, payload: null };
  }
}
