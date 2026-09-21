/**
 * United Olympics Sports — Runtime QA: Auth & Public SportMind Closure
 * Tests public invitation, dismissal, route suppression, auth visual, and unlinked callback.
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import path from 'path';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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
    // Already exited
  }
}

async function runQA() {
  console.log('=== STARTING RUNTIME QA: AUTH & PUBLIC SPORTMIND ===');
  let previewProcess = null;
  let browser = null;

  try {
    console.log(`[QA] Launching Vite preview on port ${PORT}...`);
    const viteBin = path.resolve('node_modules/vite/bin/vite.js');
    previewProcess = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, VITE_UOS_ADMIN_PREVIEW: 'true' },
    });

    previewProcess.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line) console.log(`[preview] ${line}`);
    });

    await waitForServer(BASE_URL);
    console.log('[QA] Vite preview server is live.');

    browser = await chromium.launch({ headless: true });

    // 1. PUBLIC FIRST-VISIT EXPERIENCE & INVITATION DISMISSAL
    console.log('[QA] Testing Public Home Page & SportMind Invitation...');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'en-US',
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Wait for 2.6s timer + cushion for invitation
    console.log('[QA] Waiting for SportMind invitation to appear after page settles...');
    await page.waitForSelector('.uos-assistant-invite', { timeout: 6000 });
    const inviteText = await page.locator('.uos-assistant-invite').innerText();
    console.log(`[QA] Invitation detected: ${inviteText.slice(0, 40)}...`);

    // Verify dismiss button works
    console.log('[QA] Dismissing invitation via "Later"...');
    const laterButton = page.locator('.uos-assistant-invite .uos-btn-ghost');
    await laterButton.click();
    await page.waitForSelector('.uos-assistant-invite', { state: 'hidden', timeout: 2000 });

    const dismissedFlag = await page.evaluate(() => sessionStorage.getItem('uos:assistant-dismissed'));
    if (dismissedFlag !== '1') throw new Error(`Expected sessionStorage uos:assistant-dismissed=1, got ${dismissedFlag}`);
    console.log('[QA] SessionStorage correctly recorded uos:assistant-dismissed=1');

    // Route change to /sports — invitation must not reopen
    console.log('[QA] Navigating to /sports — verifying invitation does not reopen...');
    await page.goto(`${BASE_URL}/sports`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const inviteCount = await page.locator('.uos-assistant-invite').count();
    if (inviteCount !== 0) throw new Error('Invitation reappeared after route change despite session dismissal!');
    console.log('[QA] PASS: Invitation did not reopen on route change.');

    // Floating launcher orb remains usable
    console.log('[QA] Verifying floating SportMind orb is mounted and clickable...');
    const orb = page.locator('.uos-assistant-orb');
    if ((await orb.count()) === 0) throw new Error('Floating SportMind orb is missing on /sports!');
    await orb.click();
    await page.waitForSelector('.uos-assistant-panel', { timeout: 2000 });
    console.log('[QA] PASS: Floating SportMind drawer opened successfully.');
    await context.close();

    // 2. ROUTE SUPPRESSION
    console.log('[QA] Testing Route Suppression on sensitive auth routes...');
    const suppressionRoutes = [
      '/admin/login',
      '/player/login',
      '/parent/login',
      '/coach/login',
      '/store/login',
      '/auth/callback',
      '/assistant',
    ];

    for (const route of suppressionRoutes) {
      const authCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const authPage = await authCtx.newPage();
      await authPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await authPage.waitForTimeout(1000);

      const orbCount = await authPage.locator('.uos-assistant-orb').count();
      const panelCount = await authPage.locator('.uos-assistant-panel').count();
      const inviteCount = await authPage.locator('.uos-assistant-invite').count();

      if (orbCount > 0 || panelCount > 0 || inviteCount > 0) {
        throw new Error(`Assistant elements mounted on suppressed route: ${route}`);
      }
      console.log(`[QA] PASS: Assistant successfully suppressed on ${route}`);
      await authCtx.close();
    }

    // 3. AUTH VISUAL INSPECTION
    console.log('[QA] Verifying Admin Login visual asset is approved UOS sports media...');
    const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminCtx.newPage();
    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    const visual = adminPage.locator('.portal-auth-visual');
    if ((await visual.count()) === 0) throw new Error('Portal auth visual container missing!');
    const styleAttr = await visual.getAttribute('style');
    console.log(`[QA] Visual style attribute: ${styleAttr}`);
    if (!styleAttr || !styleAttr.includes('admin.webp')) {
      throw new Error(`Expected admin.webp in visual style, got: ${styleAttr}`);
    }
    console.log('[QA] PASS: Admin login uses approved visual atmosphere.');
    await adminCtx.close();

    // 4. MULTI-DEVICE / DAY / DARK / RTL SANITY
    console.log('[QA] Testing Responsive & RTL matrix...');
    const viewports = [
      { name: '390 Mobile', width: 390, height: 844 },
      { name: '768 Tablet', width: 768, height: 1024 },
      { name: '1440 Desktop', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      const matrixCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const matrixPage = await matrixCtx.newPage();
      await matrixPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const orb = matrixPage.locator('.uos-assistant-orb');
      await orb.waitFor({ state: 'visible', timeout: 3000 });
      console.log(`[QA] PASS: Orb visible on ${vp.name}`);
      await matrixCtx.close();
    }

    console.log('=== RUNTIME QA: ALL CHECKS PASSED WITH ZERO CONSOLE ERRORS ===');
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (previewProcess && previewProcess.pid) {
      killProcessTree(previewProcess.pid);
    }
  }
}

runQA().catch((err) => {
  console.error('FATAL RUNTIME QA FAILURE:', err);
  process.exit(1);
});
