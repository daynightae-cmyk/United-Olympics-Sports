import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.UOS_SOUL_SCREENSHOTS ?? 'test-results/portal-soul-closure';
const mode = process.env.UOS_SOUL_MODE ?? 'all';
const settingsKey = 'uos:ui-settings:v1';
const loginCases = [
  { portal: 'admin', route: '/admin/login', widths: [390, 768, 1440] },
  { portal: 'player', route: '/player/login', widths: [390, 1440] },
  { portal: 'parent', route: '/parent/login', widths: [390, 1440] },
  { portal: 'coach', route: '/coach/login', widths: [390, 1440] },
  { portal: 'store', route: '/store/login', widths: [390, 1440] },
];
const internalCases = [
  { portal: 'admin', route: '/admin' },
  { portal: 'player', route: '/player/home' },
  { portal: 'parent', route: '/parent' },
  { portal: 'coach', route: '/coach' },
  { portal: 'store', route: '/store' },
];

const settings = (appearance, bilingualOrder = 'en-first') => ({
  appearance,
  bilingualOrder,
  density: 'comfortable',
  motion: 'reduced',
  fontScale: 'default',
  sidebarDefault: 'expanded',
});

async function waitForApp(page) {
  await page.locator('#root').waitFor({ state: 'attached', timeout: 15_000 });
  await page.waitForFunction(() => (document.querySelector('#root')?.textContent?.trim().length ?? 0) > 12);
  await page.locator('[data-route-loading="true"]').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(120);
}

function collectRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    const text = message.text();
    const externalFontFailure = message.type() === 'error'
      && /fonts\.(googleapis|gstatic)\.com/.test(`${message.location().url} ${text}`);
    if (message.type() === 'error' && !externalFontFailure) errors.push(`console: ${text}`);
  });
  return errors;
}

async function openContext(browser, { width, theme, rtl = false, preview = false }) {
  const height = width <= 430 ? 844 : width === 768 ? 1024 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(({ key, value, previewMode }) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (previewMode) {
      localStorage.setItem('uos:player-portal:session', JSON.stringify({ userId: 'preview-user-player-demo-001', playerId: 'player-demo-001', provider: 'preview', createdAt: new Date().toISOString() }));
      localStorage.setItem('uos:player-portal:active-id', 'player-demo-001');
      localStorage.setItem('uos:player-portal:auth', 'true');
      localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify({ parentId: 'parent-preview-01', provider: 'preview', createdAt: new Date().toISOString() }));
      sessionStorage.setItem('uos:coach-portal:preview-session:v1', 'coach-preview-01');
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
      sessionStorage.setItem('uos:splash-seen', 'true');
    }
  }, { key: settingsKey, value: settings(theme, rtl ? 'ar-first' : 'en-first'), previewMode: preview });
  return context;
}

async function assertLogin(page, entry, width, theme, rtl) {
  const response = await page.goto(`${baseURL}${entry.route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.ok(!response || response.status() < 400, `${entry.route}: HTTP ${response?.status()}`);
  await waitForApp(page);
  assert.equal(page.url().replace(/\/$/, ''), `${baseURL}${entry.route}`, `${entry.route}: direct route changed unexpectedly`);
  await page.locator(`.portal-auth[data-portal="${entry.portal}"]`).waitFor({ state: 'visible' });

  const proof = await page.evaluate(() => {
    const button = document.querySelector('[data-auth-provider]');
    const card = document.querySelector('.portal-auth-card');
    const rect = card?.getBoundingClientRect();
    const brand = document.querySelector('.portal-auth-brand-lockup');
    const visualCopy = document.querySelector('.portal-auth-visual-copy');
    const brandRect = brand?.getBoundingClientRect();
    const visualCopyRect = visualCopy?.getBoundingClientRect();
    const switcher = document.querySelector('.portal-auth-switcher');
    return {
      theme: document.documentElement.dataset.theme,
      dir: document.documentElement.dir,
      logoCount: document.querySelectorAll('.portal-auth img[src="/brand/united-olympics-sports-logo.png"]').length,
      providerNames: [...document.querySelectorAll('[data-auth-provider]')].map((node) => node.getAttribute('data-auth-provider')),
      switcherCount: document.querySelectorAll('.portal-auth-switcher a').length,
      switcherVisible: switcher ? getComputedStyle(switcher).display !== 'none' : false,
      assistantCount: document.querySelectorAll('.uos-assistant-orb,.uos-assistant-panel,.uos-assistant-invite').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      buttonHeight: button ? button.getBoundingClientRect().height : 0,
      buttonVisible: button ? getComputedStyle(button).display !== 'none' : false,
      cardLeft: rect?.left ?? -1,
      cardRight: rect?.right ?? -1,
      cardWidth: rect?.width ?? 0,
      viewportWidth: window.innerWidth,
      cardColor: card ? getComputedStyle(card).color : '',
      cardBackground: card ? getComputedStyle(card).backgroundImage : '',
      brandBottom: brandRect?.bottom ?? 0,
      visualCopyTop: visualCopyRect?.top ?? 0,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    };
  });

  assert.equal(proof.theme, theme, `${entry.route}: ${theme} did not resolve`);
  assert.equal(proof.dir, rtl ? 'rtl' : 'ltr', `${entry.route}: direction mismatch`);
  assert.equal(proof.logoCount, 1, `${entry.route}: expected one canonical logo`);
  assert.deepEqual(proof.providerNames, ['google'], `${entry.route}: provider policy drift`);
  assert.equal(proof.switcherCount, 5, `${entry.route}: shared portal switcher missing`);
  assert.equal(proof.switcherVisible, true, `${entry.route}: shared portal switcher is hidden`);
  assert.equal(proof.assistantCount, 0, `${entry.route}: product overlays must not cover authentication`);
  assert.ok(proof.overflow <= 2, `${entry.route}: ${proof.overflow}px horizontal overflow at ${width}px`);
  assert.ok(proof.buttonVisible && proof.buttonHeight >= 44, `${entry.route}: Google control is not touch-ready`);
  assert.ok(proof.cardWidth > 0 && proof.cardLeft >= -1 && proof.cardRight <= proof.viewportWidth + 1, `${entry.route}: auth card is clipped at ${width}px`);
  assert.ok(
    proof.brandBottom + 8 <= proof.visualCopyTop,
    `${entry.route}: brand lockup overlaps the hero copy at ${width}px (brand bottom ${proof.brandBottom}, copy top ${proof.visualCopyTop})`,
  );
  if (theme === 'light') {
    assert.match(proof.cardColor, /^rgb\((?:[0-9]|[1-8][0-9]),/, `${entry.route}: Light card text must remain navy`);
    assert.match(proof.cardBackground, /rgba?\((?:255, 255, 255|250, 244, 233)/, `${entry.route}: Light card must use a warm light surface`);
  }
  assert.deepEqual(proof.brokenImages, [], `${entry.route}: broken image`);
}

if (mode !== 'internal') await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
try {
  if (mode !== 'internal') for (const entry of loginCases) {
    for (const theme of ['light', 'dark']) {
      for (const width of entry.widths) {
        const context = await openContext(browser, { width, theme });
        const page = await context.newPage();
        const runtimeErrors = collectRuntimeErrors(page);
        await assertLogin(page, entry, width, theme, false);
        assert.deepEqual(runtimeErrors, [], `${entry.route}: runtime errors`);
        await page.screenshot({ path: path.join(outputDir, `${entry.portal}-login-${width}-${theme}.png`), fullPage: true });
        await context.close();
      }
    }

    const rtlContext = await openContext(browser, { width: 390, theme: 'light', rtl: true });
    const rtlPage = await rtlContext.newPage();
    const rtlErrors = collectRuntimeErrors(rtlPage);
    await assertLogin(rtlPage, entry, 390, 'light', true);
    assert.deepEqual(rtlErrors, [], `${entry.route}: RTL runtime errors`);
    await rtlPage.screenshot({ path: path.join(outputDir, `${entry.portal}-login-390-light-rtl.png`), fullPage: true });
    await rtlContext.close();
  }

  if (mode !== 'auth') for (const entry of internalCases) {
    for (const theme of ['light', 'dark']) {
      const context = await openContext(browser, { width: 1440, theme, preview: true });
      const page = await context.newPage();
      const runtimeErrors = collectRuntimeErrors(page);
      const response = await page.goto(`${baseURL}${entry.route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      assert.ok(!response || response.status() < 400, `${entry.route}: HTTP ${response?.status()}`);
      await waitForApp(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 2, `${entry.route}: ${overflow}px horizontal overflow`);
      assert.deepEqual(runtimeErrors, [], `${entry.route}: runtime errors`);
      await page.screenshot({ path: path.join(outputDir, `${entry.portal}-home-1440-${theme}.png`), fullPage: true });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

// Keep this direct-load check independent of preview sessions: Store account
// correctly resolves to the shared login when no customer session exists.
if (mode !== 'internal') {
  const directBrowser = await chromium.launch();
  try {
    const context = await openContext(directBrowser, { width: 390, theme: 'dark' });
    const page = await context.newPage();
    await page.goto(`${baseURL}/store/account`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await waitForApp(page);
    await page.waitForURL(/\/store\/login$/, { timeout: 15_000 });
    await context.close();
  } finally {
    await directBrowser.close();
  }
}

console.log(`Portal Soul closure QA PASS (${mode}); screenshots: ${outputDir}`);
