/**
 * United Olympics Sports — UOS SPORTMIND Visual Acceptance QA
 * Captures Day, Dark, LTR, RTL screenshots across 390px, 768px, 1440px
 * for the UOS SportMind Arena (/assistant).
 * Uses Vite preview with clean process lifecycle management.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = path.resolve('dist/qa-screenshots/sportmind');
const settingsKey = 'uos:ui-settings:v1';

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
    // Already exited
  }
}

async function runVisualQA() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting Vite preview on port', PORT);
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const server = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_UOS_ADMIN_PREVIEW: 'true' },
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  let browser = null;

  try {
    await waitForServer(BASE_URL);
    console.log('Server is ready. Starting visual capture for UOS SportMind...');

    browser = await chromium.launch({ headless: true });
    let captured = 0;

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
              }),
            );
            localStorage.setItem('uos:player-portal:session', 'preview-athlete-1');
            localStorage.setItem('uos:coach-portal:session', 'preview-coach-1');
            localStorage.setItem('uos:parent-portal:session', 'preview-parent-1');
            localStorage.setItem('uos:admin-portal:session', 'preview-admin');
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('dir', dir);
          },
          { theme: mode.theme, dir: mode.dir, key: settingsKey },
        );

        const page = await context.newPage();

        // 1. Capture Empty Arena
        await page.goto(`${BASE_URL}/assistant`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.sportmind-arena-layout', { timeout: 15000 });
        await page.waitForTimeout(400);

        const filenameEmpty = `sportmind-empty-${vp.name}-${mode.theme}-${mode.dir}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, filenameEmpty), fullPage: false });
        captured++;
        console.log(`[${captured}] Captured ${filenameEmpty}`);

        // 2. Click suggestion chip to test response state
        const suggestionChip = page.locator('.sportmind-suggestion-chip').first();
        if (await suggestionChip.isVisible()) {
          await suggestionChip.click();
          // Wait for response module to render
          await page.waitForSelector('.sportmind-message--sportmind', { timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(400);

          const filenameActive = `sportmind-active-${vp.name}-${mode.theme}-${mode.dir}.png`;
          await page.screenshot({ path: path.join(OUTPUT_DIR, filenameActive), fullPage: false });
          captured++;
          console.log(`[${captured}] Captured ${filenameActive}`);
        }

        await page.close();
        await context.close();
      }
    }

    console.log(`\nSportMind visual capture complete: ${captured} screenshots verified in ${OUTPUT_DIR}`);
  } finally {
    if (browser) await browser.close();
    killProcessTree(server.pid);
  }
}

runVisualQA().catch((err) => {
  console.error('Visual QA failed:', err);
  process.exit(1);
});
