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

export async function fetchWithRuntimeTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      throw new RuntimeTimeoutError(operationName(input), timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches and consumes a JSON response under one AbortController deadline.
 * The controller remains active until response.json() finishes, so a server
 * that sends headers and then stalls the body cannot leave portal/account
 * runtime state loading indefinitely.
 */
export async function fetchJsonWithRuntimeTimeout<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<{ response: Response; payload: T | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    let payload: T | null = null;
    try {
      payload = await response.json() as T;
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) {
        throw new RuntimeTimeoutError(operationName(input), timeoutMs);
      }
      payload = null;
    }
    return { response, payload };
  } catch (error) {
    if (error instanceof RuntimeTimeoutError) throw error;
    if (controller.signal.aborted || isAbortError(error)) {
      throw new RuntimeTimeoutError(operationName(input), timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}