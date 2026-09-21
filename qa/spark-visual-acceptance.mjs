/**
 * United Olympics Sports — SPARK Visual Acceptance QA
 * Captures Day, Dark, LTR, and RTL screenshots across 390px, 768px, 1440px
 * for representative routes: Admin, Player, Parent, Coach, Store, Auth.
 * Uses vite preview with seeded sessions for accurate visual verification.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = path.resolve('dist/qa-screenshots');
const settingsKey = 'uos:ui-settings:v1';

const ROUTES = [
  { name: 'admin', path: '/admin' },
  { name: 'player', path: '/player/home' },
  { name: 'parent', path: '/parent' },
  { name: 'coach', path: '/coach/home' },
  { name: 'store', path: '/store' },
  { name: 'auth', path: '/admin/login' },
];

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

const MODES = [
  { theme: 'light', dir: 'ltr' },
  { theme: 'dark', dir: 'ltr' },
  { theme: 'light', dir: 'rtl' },
  { theme: 'dark', dir: 'rtl' },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) return true;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    // Process may have already exited
  }
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const onlyMissing = process.argv.includes('--only-missing');
  const routeArg = process.argv.find((a) => a.startsWith('--route='));
  const routeFilter = routeArg ? routeArg.split('=')[1].split(',') : null;
  const activeRoutes = routeFilter ? ROUTES.filter((r) => routeFilter.includes(r.name)) : ROUTES;

  const viteBin = path.resolve('node_modules/vite/bin/vite.js');

  console.log('Starting Vite preview server on port', PORT);
  const server = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  let browser = null;

  try {
    await waitForServer(BASE_URL);
    console.log('Server is up at', BASE_URL);

    browser = await chromium.launch({ headless: true });
    let count = 0;
    const total = VIEWPORTS.length * MODES.length * activeRoutes.length;

    for (const vp of VIEWPORTS) {
      for (const mode of MODES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: 'reduce',
        });

        await context.addInitScript(
          ({ theme, dir, key }) => {
            localStorage.setItem(
              key,
              JSON.stringify({
                appearance: theme,
                bilingualOrder: dir === 'rtl' ? 'ar-first' : 'en-first',
                density: 'comfortable',
                motion: 'system',
                fontScale: 'default',
                sidebarDefault: 'expanded',
              })
            );

            // Seed preview sessions
            localStorage.setItem(
              'uos:player-portal:session',
              JSON.stringify({
                userId: 'preview-user-player-demo-001',
                playerId: 'player-demo-001',
                provider: 'preview',
                createdAt: new Date().toISOString(),
              })
            );
            localStorage.setItem('uos:player-portal:active-id', 'player-demo-001');
            localStorage.setItem('uos:player-portal:auth', 'true');

            localStorage.setItem(
              'uos:parent-portal:session:v1',
              JSON.stringify({
                parentId: 'parent-preview-01',
                provider: 'preview',
                createdAt: new Date().toISOString(),
              })
            );

            sessionStorage.setItem('uos:coach-portal:preview-session:v1', 'coach-preview-01');
            sessionStorage.setItem('uos:luxury-splash-seen', 'true');
            sessionStorage.setItem('uos:splash-seen', 'true');
          },
          { theme: mode.theme, dir: mode.dir, key: settingsKey }
        );

        for (const route of activeRoutes) {
          count++;
          const screenshotName = `${route.name}_${vp.name}_${mode.theme}_${mode.dir}.png`;
          const filePath = path.join(OUTPUT_DIR, screenshotName);

          if (onlyMissing && fs.existsSync(filePath)) {
            console.log(`[${count}/${total}] ${route.name} / ${vp.name} / ${mode.theme} / ${mode.dir} (Cached, skipping)`);
            continue;
          }

          const page = await context.newPage();
          try {
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await page.locator('#root').waitFor({ state: 'attached', timeout: 5000 }).catch(() => undefined);

            // Wait for lazy suspense fallbacks to detach
            await page
              .locator('[data-route-loading="true"], .portal-route-loader, .cgpt-route-loader, .ui-skeleton')
              .waitFor({ state: 'detached', timeout: 6000 })
              .catch(() => undefined);

            // Wait for route-specific surface readiness
            const readySelector =
              {
                admin: '#admin-command-page, .admin-main',
                player: '.player-portal-shell, .player-page, main',
                parent: '.parent-portal, .parent-overview-page, main',
                coach: '#coach-overview-page, .coach-page, main',
                store: '.store-page, .store-shell, main',
                auth: '.admin-auth-page, .auth-page, main',
              }[route.name] || 'main, #root';

            await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 6000 }).catch(() => undefined);
            await page.waitForTimeout(400);

            await page.screenshot({ path: filePath, fullPage: false });
            console.log(`[${count}/${total}] ${route.name} / ${vp.name} / ${mode.theme} / ${mode.dir} -> ${screenshotName}`);
          } catch (e) {
            console.warn(`[${count}/${total}] Error capturing ${screenshotName}:`, e.message);
          } finally {
            await page.close().catch(() => {});
          }
        }

        await context.close().catch(() => {});
      }
    }

    console.log(`QA Visual Acceptance finished: ${count} of ${total} targets processed in ${OUTPUT_DIR}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (server && server.pid) {
      killProcessTree(server.pid);
      server.kill();
    }
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('QA Visual Acceptance failed:', err);
    process.exit(1);
  });
