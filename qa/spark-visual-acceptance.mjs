/**
 * United Olympics Sports — SPARK Visual Acceptance QA
 * Captures Day, Dark, and RTL screenshots across 390px, 768px, 1440px
 * for representative routes: Admin, Player, Parent, Coach, Store, Auth.
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = path.resolve('dist/qa-screenshots');
const settingsKey = 'uos:ui-settings:v1';

const ROUTES = [
  { name: 'admin', path: '/admin' },
  { name: 'player', path: '/player/home' },
  { name: 'parent', path: '/parent/home' },
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

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting Vite preview server on port', PORT);
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  try {
    await waitForServer(BASE_URL);
    console.log('Server is up at', BASE_URL);

    const browser = await chromium.launch({ headless: true });
    let count = 0;

    for (const vp of VIEWPORTS) {
      for (const mode of MODES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
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
          },
          { theme: mode.theme, dir: mode.dir, key: settingsKey }
        );

        const page = await context.newPage();

        for (const route of ROUTES) {
          try {
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
          } catch {
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
          }
          await page.waitForTimeout(300);

          const screenshotName = `${route.name}_${vp.name}_${mode.theme}_${mode.dir}.png`;
          const filePath = path.join(OUTPUT_DIR, screenshotName);

          await page.screenshot({ path: filePath, fullPage: false });
          count++;
          console.log(`[${count}] Saved: ${screenshotName}`);
        }

        await context.close();
      }
    }

    await browser.close();
    console.log(`QA Visual Acceptance completed: ${count} screenshots captured in ${OUTPUT_DIR}`);
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error('QA Visual Acceptance failed:', err);
  process.exit(1);
});
