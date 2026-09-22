/**
 * Capture Player Reference QA script
 * Captures the required visual matrix for /player/home:
 * - 1440x900 — Dark — LTR
 * - 1440x900 — Light — RTL
 * - 768x1024 — Dark — LTR
 * - 768x1024 — Light — RTL
 * - 390x844 — Dark — RTL
 * - 390x844 — Light — LTR
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const phase = process.argv[2] || 'before';
const OUTPUT_DIR = path.resolve(`qa/artifacts/player-reference-fidelity/${phase}`);
const settingsKey = 'uos:ui-settings:v1';

const TARGETS = [
  { name: '1440x900-dark-ltr', width: 1440, height: 900, theme: 'dark', dir: 'ltr' },
  { name: '1440x900-light-rtl', width: 1440, height: 900, theme: 'light', dir: 'rtl' },
  { name: '768x1024-dark-ltr', width: 768, height: 1024, theme: 'dark', dir: 'ltr' },
  { name: '768x1024-light-rtl', width: 768, height: 1024, theme: 'light', dir: 'rtl' },
  { name: '390x844-dark-rtl', width: 390, height: 844, theme: 'dark', dir: 'rtl' },
  { name: '390x844-light-ltr', width: 390, height: 844, theme: 'light', dir: 'ltr' },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) return true;
    } catch {
      // retry
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

  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  console.log(`Starting Vite dev server on port ${PORT}...`);
  const server = spawn(process.execPath, [viteBin, '--port', String(PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_UOS_ADMIN_PREVIEW: 'true' },
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  let browser = null;

  try {
    await waitForServer(BASE_URL);
    console.log(`Preview server ready at ${BASE_URL}`);

    browser = await chromium.launch({ headless: true });

    for (const target of TARGETS) {
      console.log(`Capturing ${target.name} (${target.width}x${target.height}, ${target.theme}, ${target.dir})...`);
      const context = await browser.newContext({
        viewport: { width: target.width, height: target.height },
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
              motion: 'reduced',
              fontScale: 'default',
              sidebarDefault: 'expanded',
            })
          );
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
          sessionStorage.setItem('uos:luxury-splash-seen', 'true');
          sessionStorage.setItem('uos:splash-seen', 'true');
          if (dir === 'rtl') {
            document.addEventListener('DOMContentLoaded', () => {
              document.documentElement?.setAttribute('dir', 'rtl');
            }, { once: true });
          }
        },
        { theme: target.theme, dir: target.dir, key: settingsKey }
      );

      const page = await context.newPage();
      await page.goto(`${BASE_URL}/player/home`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(OUTPUT_DIR, `${target.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot to ${screenshotPath}`);

      await context.close();
    }
    console.log(`All ${phase} screenshots captured successfully!`);
  } finally {
    if (browser) await browser.close();
    if (server.pid) killProcessTree(server.pid);
  }
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
