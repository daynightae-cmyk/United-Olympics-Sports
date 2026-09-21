import {
  ApiError,
  assertMethod,
  readJsonBody,
  type ApiRequest,
  type ApiResponse,
} from '../http.js';
import { hydrateSportMindContext } from './sportmind-context.js';
import { getSportsAiProvider } from './provider.js';
import type { SportMindRequest, SportMindStreamChunk } from './types.js';

export async function sportmindHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  assertMethod(req, ['POST']);

  const body = await readJsonBody(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    throw new ApiError(400, 'MESSAGE_REQUIRED', 'A non-empty message is required.');
  }

  const input: SportMindRequest = {
    message,
    conversationId: typeof body.conversationId === 'string' ? body.conversationId : undefined,
    locale: body.locale === 'ar' ? 'ar' : 'en',
    currentRoute: typeof body.currentRoute === 'string' ? body.currentRoute : undefined,
    requestedContext:
      typeof body.requestedContext === 'object' && body.requestedContext !== null
        ? (body.requestedContext as SportMindRequest['requestedContext'])
        : undefined,
  };

  const context = await hydrateSportMindContext(req, input);
  const provider = getSportsAiProvider();

  // Set streaming headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const writer = res as unknown as {
    write?: (chunk: string) => boolean;
    flushHeaders?: () => void;
  };

  if (typeof writer.flushHeaders === 'function') {
    writer.flushHeaders();
  }

  const sendSse = (chunk: SportMindStreamChunk): void => {
    const payload = `data: ${JSON.stringify(chunk)}\n\n`;
    if (typeof writer.write === 'function') {
      writer.write(payload);
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    for await (const chunk of provider.generateStream(context, input, controller.signal)) {
      sendSse(chunk);
    }
  } catch (err) {
    console.error('SportMind stream error:', err);
    sendSse({
      type: 'error',
      error: {
        code: 'STREAM_ERROR',
        message: 'An error occurred while generating the intelligence response.',
      },
    });
  } finally {
    clearTimeout(timeoutId);
    res.end();
  }
}
