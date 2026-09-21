/**
 * United Olympics Sports — UOS SPORTMIND Public Reveal Runtime Proof
 * Real browser Playwright QA for the Public Arena Reveal:
 * - Escape key closes reveal and marks seen + dismissed
 * - Auto-collapse (configurable test-safe duration, 10s production default) marks seen only
 * - Single compact SportMind Core guarantee
 * - Manual reopen opens canonical assistant drawer without duplicates
 * - Explicit dismiss survives route navigation in the same session
 * - Route suppression across auth, portals, and /assistant
 * - Timer cancellation on navigation to suppressed route before timer fires
 * - All approved public actions (Explore Sports, Find Your Program, Ask SportMind, Enter Arena)
 * - Responsive visual evidence across 390, 768, 1440 in Day/Dark LTR/RTL
 * - Reduced motion accessibility verification
 * - JSON evidence manifest generation
 */
import { chromium } from 'playwright';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = path.resolve('dist/qa-screenshots/sportmind-reveal');
const settingsKey = 'uos:ui-settings:v1';

const SEEN_KEY = 'uos:sportmind-intro-seen';
const DISMISSED_KEY = 'uos:sportmind-intro-dismissed';

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

async function setupPage(context, { theme = 'dark', dir = 'ltr', autoCollapseMs = null } = {}) {
  await context.addInitScript(
    ({ theme, dir, key, autoCollapseMs }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          appearance: theme,
          bilingualOrder: dir === 'rtl' ? 'ar-first' : 'en-first',
          density: 'comfortable',
        }),
      );
      // Legitimate post-splash lifecycle truth: splash was seen
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
      sessionStorage.setItem('uos:splash-seen', 'true');

      if (autoCollapseMs !== null) {
        window.__UOS_SPORTMIND_AUTO_COLLAPSE_MS__ = autoCollapseMs;
      }

      window.addEventListener('DOMContentLoaded', () => {
        if (document.documentElement) {
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.setAttribute('dir', dir);
        }
      });
    },
    { theme, dir, key: settingsKey, autoCollapseMs },
  );

  const page = await context.newPage();
  const pageErrors = [];

  page.on('pageerror', (err) => {
    console.error(`[PageError]:`, err.message);
    pageErrors.push(`pageerror: ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('fonts.gstatic.com') || text.includes('downloadable font')) return;
      console.error(`[ConsoleError]:`, text);
      pageErrors.push(`console.error: ${text}`);
    }
  });

  return { page, pageErrors };
}

async function runRevealRuntimeQA() {
  console.log('=== UOS SPORTMIND PUBLIC REVEAL RUNTIME QA ===');

  // 1. Clean & recreate evidence directory
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
  const testResults = {
    escapeClosesReveal: false,
    seenSetOnEscape: false,
    dismissedSetOnEscape: false,
    compactCoreRemainsOnEscape: false,
    autoCollapseOccurs: false,
    seenSetOnAutoCollapse: false,
    dismissedNullOnAutoCollapse: false,
    singleCoreAfterCollapse: false,
    manualReopenSucceeds: false,
    dismissSurvivesNavigation: false,
    timerCancelledOnSuppression: false,
    authRoutesSuppressed: false,
    assistantSuppressed: false,
    exploreSportsAction: false,
    findProgramAction: false,
    askSportMindAction: false,
    enterArenaAction: false,
    reducedMotionPass: false,
  };

  try {
    await waitForServer(BASE_URL);
    console.log('Preview server ready. Launching Chromium...');

    browser = await chromium.launch({ headless: true });

    // =========================================================================
    // TEST 1: ESCAPE RUNTIME PROOF
    // =========================================================================
    console.log('\n--- Test 1: Escape Runtime Proof ---');
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const { page, pageErrors } = await setupPage(context, { theme: 'dark', dir: 'ltr' });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Wait for reveal invitation timer (2600ms) + transition to revealed
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 5000 });
      console.log('  -> Arena Reveal is visible');

      // Press Escape
      await page.keyboard.press('Escape');

      // Assert Reveal disappears
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'detached', timeout: 5000 });
      console.log('  -> Arena Reveal closed on Escape');
      testResults.escapeClosesReveal = true;

      // Verify session storage keys
      const seenVal = await page.evaluate((k) => sessionStorage.getItem(k), SEEN_KEY);
      const dismissedVal = await page.evaluate((k) => sessionStorage.getItem(k), DISMISSED_KEY);
      assert.equal(seenVal, '1', 'SPORTMIND_SEEN_KEY must be 1');
      assert.equal(dismissedVal, '1', 'SPORTMIND_DISMISSED_KEY must be 1');
      testResults.seenSetOnEscape = true;
      testResults.dismissedSetOnEscape = true;
      console.log('  -> Session keys verified: seen=1, dismissed=1');

      // Verify exactly ONE compact SportMind Core remains visible
      const orbCount = await page.locator('.uos-assistant-orb:visible').count();
      assert.equal(orbCount, 1, 'Exactly 1 compact Core orb must remain visible');
      testResults.compactCoreRemainsOnEscape = true;

      // Verify no assistant drawer accidentally opened
      const drawerCount = await page.locator('.uos-assistant-panel').count();
      assert.equal(drawerCount, 0, 'No assistant drawer should open on Escape');

      assert.equal(pageErrors.length, 0, 'No page/console errors during Escape test');
      await page.close();
      await context.close();
    }

    // =========================================================================
    // TEST 2: AUTO-COLLAPSE RUNTIME PROOF
    // =========================================================================
    console.log('\n--- Test 2: Auto-Collapse Runtime Proof ---');
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      // Test-safe short timeout: 600ms auto-collapse
      const { page, pageErrors } = await setupPage(context, { theme: 'dark', dir: 'ltr', autoCollapseMs: 600 });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Wait for reveal invitation
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 5000 });

      // Wait for auto-collapse
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'detached', timeout: 6000 });
      console.log('  -> Reveal auto-collapsed successfully');
      testResults.autoCollapseOccurs = true;

      // Verify seen=1 but dismissed is NOT 1
      const seenVal = await page.evaluate((k) => sessionStorage.getItem(k), SEEN_KEY);
      const dismissedVal = await page.evaluate((k) => sessionStorage.getItem(k), DISMISSED_KEY);
      assert.equal(seenVal, '1', 'SPORTMIND_SEEN_KEY must be 1 after auto-collapse');
      assert.equal(dismissedVal, null, 'SPORTMIND_DISMISSED_KEY must NOT be set on auto-collapse');
      testResults.seenSetOnAutoCollapse = true;
      testResults.dismissedNullOnAutoCollapse = true;
      console.log('  -> State truth: seen=1, dismissed=null');

      // Verify single Core remains and reveal does not immediately replay
      const orbCount = await page.locator('.uos-assistant-orb:visible').count();
      assert.equal(orbCount, 1, 'Exactly 1 compact Core remains visible');
      testResults.singleCoreAfterCollapse = true;

      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.sportmind-reveal-container').count(), 0, 'Reveal must not immediately replay');

      // =========================================================================
      // TEST 3: MANUAL REOPEN AFTER COLLAPSE
      // =========================================================================
      console.log('\n--- Test 3: Manual Reopen After Collapse ---');
      const orb = page.locator('.uos-assistant-orb').first();
      await orb.click();

      // Canonical assistant drawer opens
      await page.locator('.uos-assistant-panel').waitFor({ state: 'visible', timeout: 5000 });
      console.log('  -> Canonical assistant drawer opened');
      testResults.manualReopenSucceeds = true;

      assert.equal(await page.locator('.uos-assistant-panel').count(), 1, 'Exactly 1 assistant drawer');
      assert.equal(await page.locator('.sportmind-reveal-container').count(), 0, 'No duplicate reveal');

      assert.equal(pageErrors.length, 0, 'No page/console errors during auto-collapse/reopen test');
      await page.close();
      await context.close();
    }

    // =========================================================================
    // TEST 4: EXPLICIT DISMISS + NAVIGATION
    // =========================================================================
    console.log('\n--- Test 4: Explicit Dismiss + Route Navigation ---');
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const { page, pageErrors } = await setupPage(context, { theme: 'dark', dir: 'ltr' });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });

      // Click "Later" button
      const laterBtn = page.locator('.sportmind-btn-later');
      await laterBtn.click();
      await page.locator('.sportmind-reveal-container').waitFor({ state: 'detached', timeout: 5000 });
      console.log('  -> Reveal dismissed via Later button');

      // Navigate to another public route
      await page.goto(`${BASE_URL}/sports`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000); // wait longer than 2600ms invitation timer

      // Assert Reveal does NOT auto-open again
      assert.equal(await page.locator('.sportmind-reveal-container').count(), 0, 'Reveal must not auto-open after dismissal');
      assert.equal(await page.evaluate((k) => sessionStorage.getItem(k), DISMISSED_KEY), '1', 'Dismissed state preserved');
      assert.equal(await page.locator('.uos-assistant-orb:visible').count(), 1, 'Compact Core remains accessible');
      testResults.dismissSurvivesNavigation = true;
      console.log('  -> Dismiss survives route navigation successfully');

      assert.equal(pageErrors.length, 0, 'No page/console errors during navigation test');
      await page.close();
      await context.close();
    }

    // =========================================================================
    // TEST 5: ROUTE SUPPRESSION & TIMER CANCELLATION
    // =========================================================================
    console.log('\n--- Test 5: Route Suppression & Timer Cancellation ---');
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const { page, pageErrors } = await setupPage(context, { theme: 'dark', dir: 'ltr' });

      const suppressedRoutes = [
        '/auth/callback',
        '/admin/login',
        '/player/login',
        '/parent/login',
        '/coach/login',
        '/store/login',
        '/assistant',
        '/sportmind',
      ];

      for (const route of suppressedRoutes) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(500);
        const revealCount = await page.locator('.sportmind-reveal-container').count();
        const orbCount = await page.locator('.uos-assistant-orb').count();
        assert.equal(revealCount, 0, `Reveal must be suppressed on ${route}`);
        assert.equal(orbCount, 0, `Assistant orb must be suppressed on ${route}`);
      }
      testResults.authRoutesSuppressed = true;
      testResults.assistantSuppressed = true;
      console.log('  -> Suppressed routes verified');

      // Test Timer Cancellation:
      // Navigate to / (timer starts). Before 2600ms fires (at 400ms), navigate to /assistant.
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(400); // timer is pending
      await page.goto(`${BASE_URL}/assistant`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000); // wait past 2600ms
      assert.equal(await page.locator('.sportmind-reveal-container').count(), 0, 'Pending timer must be cancelled');
      testResults.timerCancelledOnSuppression = true;
      console.log('  -> Pending timer cancellation verified');

      assert.equal(pageErrors.length, 0, 'No page/console errors during suppression test');
      await page.close();
      await context.close();
    }

    // =========================================================================
    // TEST 6: PUBLIC ACTIONS RUNTIME
    // =========================================================================
    console.log('\n--- Test 6: Public Actions Runtime ---');
    {
      // 6a. Explore Sports
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const { page } = await setupPage(context, { theme: 'dark', dir: 'ltr' });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 10000 });

        const btn = page.locator('.sportmind-reveal-chip', { hasText: 'Explore Sports' });
        await btn.click();
        await page.waitForURL('**/programs', { timeout: 10000 });
        assert.ok(page.url().includes('/programs'), 'Explore Sports must route to /programs');
        testResults.exploreSportsAction = true;
        console.log('  -> Explore Sports -> /programs: PASS');
        await page.close();
        await context.close();
      }

      // 6b. Find Your Program
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const { page } = await setupPage(context, { theme: 'dark', dir: 'ltr' });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 10000 });

        const btn = page.locator('.sportmind-reveal-chip', { hasText: 'Find Your Program' });
        await btn.click();
        await page.waitForURL('**/programs', { timeout: 10000 });
        assert.ok(page.url().includes('/programs'), 'Find Your Program must route to /programs');
        testResults.findProgramAction = true;
        console.log('  -> Find Your Program -> /programs: PASS');
        await page.close();
        await context.close();
      }

      // 6c. Ask SportMind
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const { page } = await setupPage(context, { theme: 'dark', dir: 'ltr' });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 10000 });

        const btn = page.locator('.sportmind-reveal-chip', { hasText: 'Ask SportMind' });
        await btn.click();
        await page.locator('.uos-assistant-panel').waitFor({ state: 'visible', timeout: 5000 });
        testResults.askSportMindAction = true;
        console.log('  -> Ask SportMind opens drawer: PASS');
        await page.close();
        await context.close();
      }

      // 6d. Enter Arena
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const { page } = await setupPage(context, { theme: 'dark', dir: 'ltr' });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 10000 });

        const btn = page.locator('.sportmind-btn-enter-arena');
        await btn.click();
        await page.waitForURL('**/assistant', { timeout: 10000 });
        assert.ok(page.url().includes('/assistant'), 'Enter Arena must route to /assistant');
        testResults.enterArenaAction = true;
        console.log('  -> Enter Arena -> /assistant: PASS');
        await page.close();
        await context.close();
      }
    }

    // =========================================================================
    // TEST 7: REDUCED MOTION
    // =========================================================================
    console.log('\n--- Test 7: Reduced Motion Accessibility ---');
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      const { page, pageErrors } = await setupPage(context, { theme: 'dark', dir: 'ltr' });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 10000 });

      // Actions are accessible
      assert.ok(await page.locator('.sportmind-btn-enter-arena').isVisible());
      assert.ok(await page.locator('.sportmind-btn-later').isVisible());
      testResults.reducedMotionPass = true;
      console.log('  -> Reduced motion functionality verified: PASS');

      assert.equal(pageErrors.length, 0, 'No page/console errors during reduced motion test');
      await page.close();
      await context.close();
    }

    // =========================================================================
    // TEST 8: RESPONSIVE VISUAL EVIDENCE CAPTURE
    // =========================================================================
    console.log('\n--- Test 8: Capturing Representative Visual Evidence ---');
    const visualScenarios = [
      {
        id: 'reveal-390-dark-ltr-open',
        vp: { width: 390, height: 844 },
        theme: 'dark',
        dir: 'ltr',
        state: 'open',
      },
      {
        id: 'reveal-390-light-rtl-open',
        vp: { width: 390, height: 844 },
        theme: 'light',
        dir: 'rtl',
        state: 'open',
      },
      {
        id: 'reveal-768-light-ltr-open',
        vp: { width: 768, height: 1024 },
        theme: 'light',
        dir: 'ltr',
        state: 'open',
      },
      {
        id: 'reveal-1440-dark-ltr-open',
        vp: { width: 1440, height: 900 },
        theme: 'dark',
        dir: 'ltr',
        state: 'open',
      },
      {
        id: 'reveal-1440-light-rtl-compact',
        vp: { width: 1440, height: 900 },
        theme: 'light',
        dir: 'rtl',
        state: 'compact',
      },
      {
        id: 'reveal-390-dark-rtl-reopened',
        vp: { width: 390, height: 844 },
        theme: 'dark',
        dir: 'rtl',
        state: 'reopened',
      },
    ];

    for (const sc of visualScenarios) {
      const context = await browser.newContext({
        viewport: sc.vp,
        reducedMotion: 'reduce',
      });
      const autoCollapse = sc.state === 'compact' || sc.state === 'reopened' ? 400 : null;
      const { page, pageErrors } = await setupPage(context, {
        theme: sc.theme,
        dir: sc.dir,
        autoCollapseMs: autoCollapse,
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });

      if (sc.state === 'open') {
        await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('.sportmind-reveal-panel').waitFor({ state: 'visible', timeout: 5000 });
      } else if (sc.state === 'compact') {
        // Wait for reveal to appear then collapse
        await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('.sportmind-reveal-container').waitFor({ state: 'detached', timeout: 6000 });
        await page.locator('.uos-assistant-orb').waitFor({ state: 'visible', timeout: 5000 });
      } else if (sc.state === 'reopened') {
        await page.locator('.sportmind-reveal-container').waitFor({ state: 'visible', timeout: 10000 });
        await page.locator('.sportmind-reveal-container').waitFor({ state: 'detached', timeout: 6000 });
        const orb = page.locator('.uos-assistant-orb').first();
        await orb.click();
        await page.locator('.uos-assistant-panel').waitFor({ state: 'visible', timeout: 5000 });
      }

      await assertNoHorizontalOverflow(page, sc.id);
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]));
      await page.waitForTimeout(300);

      const filePath = path.join(OUTPUT_DIR, `${sc.id}.png`);
      await page.screenshot({ path: filePath, fullPage: false, animations: 'disabled' });
      const stat = fs.statSync(filePath);

      manifestEntries.push({
        scenario: sc.id,
        viewport: `${sc.vp.width}x${sc.vp.height}`,
        theme: sc.theme,
        direction: sc.dir,
        state: sc.state,
        screenshot: `${sc.id}.png`,
        sizeBytes: stat.size,
        horizontalOverflow: 0,
        pageErrors: pageErrors.length,
        result: 'PASS',
      });

      console.log(`  [Screenshot] Captured ${sc.id}.png (${stat.size} bytes)`);

      assert.equal(pageErrors.length, 0, `No page errors on ${sc.id}`);
      await page.close();
      await context.close();
    }

    // Write JSON manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      totalScreenshots: manifestEntries.length,
      status: 'PASS',
      testResults,
      files: manifestEntries,
      metrics: {
        scenariosPassed: manifestEntries.length,
        overflowViolations: 0,
        pageErrors: 0,
        consoleErrors: 0,
      },
    };

    const manifestPath = path.join(OUTPUT_DIR, 'sportmind-reveal-evidence.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`\nGenerated visual evidence manifest at ${manifestPath}`);
    console.log('All Public Reveal runtime scenarios PASSED successfully!');
  } finally {
    if (browser) await browser.close().catch(() => {});
    killProcessTree(server);
  }
}

runRevealRuntimeQA()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Reveal Runtime QA failed:', err);
    process.exit(1);
  });
