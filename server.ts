import express, { type Request, type Response, type Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { dispatchApi } from './src/server/routes.ts';
import { applySecurityHeaders } from './src/server/security-headers.ts';

export interface AppOptions {
  enableVite?: boolean;
}

export async function createApp(options: AppOptions = {}): Promise<Express> {
  const app = express();
  const enableVite = options.enableVite ?? (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test');

  app.disable('x-powered-by');

  // Security headers share the canonical policy in security-headers.ts so the
  // standalone server and the Vercel serverless handler cannot drift. Extras
  // below preserve this server's exact prior coverage: Firebase/Google auth
  // handler sources, Supabase realtime, and 'unsafe-eval' for Vite dev only.
  const isProduction = process.env.NODE_ENV === 'production';
  app.use((_req, res, next) => {
    applySecurityHeaders(res, {
      enableHsts: isProduction,
      cspScriptSrc: [
        ...(isProduction ? [] : ["'unsafe-eval'"]),
        'https://*.firebaseapp.com',
        'https://*.googleapis.com',
      ],
      cspFrameSrc: ['https://*.firebaseapp.com'],
      cspConnectSrc: ['wss://*.supabase.co', 'https://*.googleapis.com'],
    });
    next();
  });

  app.use(express.json({
    limit: '256kb',
    // Preserve raw bytes for HMAC webhook verification (see readRawBody).
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = Buffer.from(buf);
    },
  }));

  // Unified API & Auth Route Dispatcher (P0 / Section 7)
  // Intercepts both query routing (/api?route=...) and direct path routing (/auth/session, /api/v1/health, etc.)
  app.all(['/api', '/api/*', '/auth', '/auth/*', '/public/*'], async (req: Request, res: Response) => {
    await dispatchApi(req, res);
  });

  if (enableVite) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        let template = await fs.promises.readFile(path.resolve('index.html'), 'utf8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else if (process.env.NODE_ENV !== 'test') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

export async function startServer(): Promise<void> {
  const app = await createApp();
  const port = Number(process.env.PORT || 3000);

  app.listen(port, '0.0.0.0', () => {
    console.log(`United Olympics Sports server listening on port ${port}`);
  });
}

const isMainModule = Boolean(
  process.argv[1] &&
    (process.argv[1].endsWith('server.ts') ||
      process.argv[1].endsWith('server.cjs') ||
      process.argv[1].endsWith('server.js')),
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  });
}
