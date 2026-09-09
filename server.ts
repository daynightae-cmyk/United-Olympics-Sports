import express, { type Request, type Response, type Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { dispatchApi } from './src/server/routes.ts';

export interface AppOptions {
  enableVite?: boolean;
}

export async function createApp(options: AppOptions = {}): Promise<Express> {
  const app = express();
  const enableVite = options.enableVite ?? (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test');

  app.disable('x-powered-by');

  // Security Headers (P1 / Section 22)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.googleusercontent.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  app.use(express.json({ limit: '256kb' }));

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
