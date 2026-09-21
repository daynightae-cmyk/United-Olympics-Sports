/**
 * United Olympics Sports — UOS SPORTMIND Visual Acceptance QA
 * Captures Day, Dark, LTR, RTL screenshots across 390px, 768px, 1440px
 * for the UOS SportMind Arena (/assistant).
 * Uses Vite preview with clean process lifecycle management.
 * Uncompromising verification gate:
 * - Fresh directory clean on every run (no stale PNG reuse)
 * - Strict assertion of 24 captured screenshots or exit 1
 * - Zero uncaught pageerror / console.error allowance
 * - Horizontal overflow verification (scrollWidth <= clientWidth + 1)
 * - Response state verification (SSE streaming finish, no error, single canonical response)
 * - JSON evidence manifest generation
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

function killProcessTree(server) {
  if (!server || !server.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        // Not a process group leader
      }
      try {
        process.kill(server.pid, 'SIGKILL');
      } catch {
        // Already exited
      }
    }
  } catch {
    // Already exited
  }
  try {
    server.kill('SIGKILL');
  } catch {
    // Already exited
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const dims = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (dims.scrollWidth > dims.clientWidth + 1) {
    throw new Error(
      `Horizontal overflow detected in [${label}]: scrollWidth (${dims.scrollWidth}) > clientWidth + 1 (${dims.clientWidth + 1})`
    );
  }
}

async function runVisualQA() {
  // 1. MUST clean and recreate dist/qa-screenshots/sportmind on every run
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Starting Vite preview on port', PORT);
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const server = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_UOS_ADMIN_PREVIEW: 'true' },
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  let browser = null;
  const manifestEntries = [];

  try {
    await waitForServer(BASE_URL);
    console.log('Server is ready. Starting visual capture for UOS SportMind...');

    browser = await chromium.launch({ headless: true });
    let captured = 0;

    for (const vp of VIEWPORTS) {
      for (const mode of MODES) {
        const label = `${vp.name}-${mode.theme}-${mode.dir}`;
        console.log(`\n--- Running scenario: ${label} ---`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: 'reduce',
        });

        // Mock SSE stream endpoint to ensure deterministic, fully verifiable responses
        await context.route('**/api/v1/sportmind', async (route) => {
          const sseBody = [
            `data: {"type":"thinking","thinkingState":{"en":"Analyzing athletic records...","ar":"تحليل السجلات الرياضية..."}}\n\n`,
            `data: {"type":"delta","delta":"Here is your verified athletic guidance for "}\n\n`,
            `data: {"type":"delta","delta":"training progressions and upcoming sessions."}\n\n`,
            `data: {"type":"module","module":{"id":"mod-qa-1","type":"INSIGHT","title":{"en":"Athletic Guidance","ar":"إرشادات رياضية"},"body":{"en":"Training schedule and drills are calibrated for optimal performance.","ar":"جدول التدريب والتمارين معايرة لأفضل أداء."}}}\n\n`,
            `data: {"type":"done"}\n\n`,
          ].join('');

          await route.fulfill({
            status: 200,
            contentType: 'text/event-stream; charset=utf-8',
            headers: {
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
            body: sseBody,
          });
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
            sessionStorage.setItem('uos:luxury-splash-seen', 'true');
            sessionStorage.setItem('uos:splash-seen', 'true');
            window.addEventListener('DOMContentLoaded', () => {
              if (document.documentElement) {
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.setAttribute('dir', dir);
              }
            });
          },
          { theme: mode.theme, dir: mode.dir, key: settingsKey },
        );

        const page = await context.newPage();
        const pageErrors = [];

        // Error listeners to catch any unhandled exception or console.error
        page.on('pageerror', (err) => {
          console.error(`[PageError] [${label}]:`, err.message);
          pageErrors.push(`pageerror: ${err.message}`);
        });

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            if (text.includes('fonts.gstatic.com') || text.includes('downloadable font')) return;
            console.error(`[ConsoleError] [${label}]:`, text);
            pageErrors.push(`console.error: ${text}`);
          }
        });

        // 1. Capture Empty Arena
        const filenameEmpty = `sportmind-empty-${vp.name}-${mode.theme}-${mode.dir}.png`;
        const filePathEmpty = path.join(OUTPUT_DIR, filenameEmpty);

        await page.goto(`${BASE_URL}/assistant`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.locator('.sportmind-arena-layout').waitFor({ state: 'visible', timeout: 15000 });
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]));
        await page.waitForTimeout(400);

        // Verify horizontal overflow for empty arena
        await assertNoHorizontalOverflow(page, `empty-${label}`);

        await page.screenshot({ path: filePathEmpty, fullPage: false, timeout: 15000, animations: 'disabled' });
        captured++;
        const statEmpty = fs.statSync(filePathEmpty);
        manifestEntries.push({
          filename: filenameEmpty,
          viewport: vp.name,
          theme: mode.theme,
          dir: mode.dir,
          state: 'empty',
          sizeBytes: statEmpty.size,
        });
        console.log(`[${captured}/24] Captured ${filenameEmpty} (${statEmpty.size} bytes)`);

        // 2. Click suggestion chip to test response state
        const filenameActive = `sportmind-active-${vp.name}-${mode.theme}-${mode.dir}.png`;
        const filePathActive = path.join(OUTPUT_DIR, filenameActive);

        const suggestionChip = page.locator('.sportmind-suggestion-chip').first();
        await suggestionChip.waitFor({ state: 'visible', timeout: 10000 });
        await suggestionChip.click();

        // Wait for assistant message to appear
        await page.locator('.sportmind-message--sportmind').first().waitFor({ state: 'visible', timeout: 15000 });

        // Wait for streaming indicator to disappear (streaming finished)
        await page.locator('.sportmind-message--streaming').waitFor({ state: 'detached', timeout: 15000 });

        // Verify no error core exists
        const errorCoreCount = await page.locator('.sportmind-core--error').count();
        if (errorCoreCount > 0) {
          throw new Error(`SportMind core entered error state on [${label}]`);
        }

        // Verify no permanent thinking bar remains
        const thinkingCount = await page.locator('.sportmind-thinking-bar').count();
        if (thinkingCount > 0) {
          throw new Error(`SportMind permanent thinking bar remained on [${label}]`);
        }

        // Verify that the assistant produces exactly one canonical answer
        const assistantMsgCount = await page.locator('.sportmind-message--sportmind').count();
        if (assistantMsgCount !== 1) {
          throw new Error(`Expected exactly 1 assistant response message, found ${assistantMsgCount} on [${label}]`);
        }

        // Verify horizontal overflow for active arena
        await assertNoHorizontalOverflow(page, `active-${label}`);

        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]));
        await page.waitForTimeout(400);

        await page.screenshot({ path: filePathActive, fullPage: false, timeout: 15000, animations: 'disabled' });
        captured++;
        const statActive = fs.statSync(filePathActive);
        manifestEntries.push({
          filename: filenameActive,
          viewport: vp.name,
          theme: mode.theme,
          dir: mode.dir,
          state: 'active',
          sizeBytes: statActive.size,
        });
        console.log(`[${captured}/24] Captured ${filenameActive} (${statActive.size} bytes)`);

        // Check for any page/console errors during the scenario
        if (pageErrors.length > 0) {
          throw new Error(`QA failed due to page errors on ${label}:\n${pageErrors.join('\n')}`);
        }

        await page.close();
        await context.close();
      }
    }

    // Write JSON manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      totalScreenshots: captured,
      expectedScreenshots: 24,
      status: captured === 24 ? 'PASS' : 'FAIL',
      viewports: VIEWPORTS.map((v) => v.name),
      modes: MODES.map((m) => `${m.theme}-${m.dir}`),
      files: manifestEntries,
      metrics: {
        overflowViolations: 0,
        pageErrors: 0,
        consoleErrors: 0,
        responsesVerified: 12,
      },
    };

    const manifestPath = path.join(OUTPUT_DIR, 'sportmind-visual-evidence.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`\nGenerated SportMind visual evidence manifest at ${manifestPath}`);

    // Strict assertion: must have 24 screenshots
    if (captured !== 24) {
      throw new Error(`Visual QA failed: expected 24 screenshots, captured ${captured}`);
    }

    console.log(`\nSportMind visual capture complete: all ${captured} screenshots verified in ${OUTPUT_DIR}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    killProcessTree(server);
  }
}

runVisualQA()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Visual QA failed:', err);
    process.exit(1);
  });
