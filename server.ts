import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { dispatchRoute } from './src/server/routes.ts';

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  const route = (key: string) => async (req: Request, res: Response) => {
    await dispatchRoute(key, req, res);
  };

  app.get('/api/v1/health', route('health'));
  app.post('/auth/session', route('auth-session'));
  app.post('/auth/revoke', route('auth-revoke'));
  app.get('/api/v1/admin/whoami', route('admin-whoami'));
  app.post('/public/enquiries', route('public-enquiries'));
  app.post('/api/v1/requests/sports', route('sport-request'));
  app.get('/api/v1/catalog', route('catalog'));

  app.all(['/api/*', '/auth/*', '/public/*'], route('unknown'));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        let template = await fs.promises.readFile(path.resolve('index.html'), 'utf8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`United Olympics Sports server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});
