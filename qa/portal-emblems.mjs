import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.UOS_PORTAL_SCREENSHOTS ?? 'test-results/portal-emblems';
const canonicalLogoPath = '/brand/united-olympics-sports-logo.png';
const cases = [
  { portal: 'player', route: '/player/login', primarySelector: '.portal-auth-brand-lockup img' },
  { portal: 'parent', route: '/parent/login', primarySelector: '.portal-auth-brand-lockup img' },
  { portal: 'coach', route: '/coach/login', primarySelector: '.portal-auth-brand-lockup img' },
  { portal: 'admin', route: '/admin/login', primarySelector: '.portal-auth-brand-lockup img' },
  { portal: 'store', route: '/store/login', primarySelector: '.portal-auth-brand-lockup img' },
  { portal: 'parent', route: '/parent', expectedRoute: '/parent', preview: true, primarySelector: '.portal-sidebar .portal-brand > img.official-logo' },
  { portal: 'coach', route: '/coach', expectedRoute: '/coach/home', preview: true, primarySelector: '.portal-sidebar .portal-brand > img.official-logo' },
  { portal: 'admin', route: '/admin', expectedRoute: '/admin', preview: true, primarySelector: '.admin-sidebar .admin-brand > img.official-logo' },
  { portal: 'store', route: '/store', expectedRoute: '/store', preview: true, primarySelector: '.store-main-header .store-brand > img' },
];
const screenshotCases = [cases[0], cases[5], cases[6], cases[7], cases[8]];
const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 1000 },
];
const themeScenarios = [
  { name: 'light', appearance: 'light', colorScheme: 'light', effective: 'light' },
  { name: 'dark', appearance: 'dark', colorScheme: 'dark', effective: 'dark' },
  { name: 'system-light', appearance: 'system', colorScheme: 'light', effective: 'light' },
  { name: 'system-dark', appearance: 'system', colorScheme: 'dark', effective: 'dark' },
];
const settings = (appearance, bilingualOrder) => ({ appearance, bilingualOrder, density: 'comfortable', motion: 'system', fontScale: 'default', sidebarDefault: 'expanded' });

async function installUiState(context, payload, preview = false) {
  await context.addInitScript(({ settingsPayload, previewMode }) => {
    localStorage.setItem('uos:ui-settings:v1', JSON.stringify(settingsPayload));
    if (previewMode) {
      localStorage.setItem('uos:player-portal:session', JSON.stringify({
        userId: 'preview-user-player-demo-001',
        playerId: 'player-demo-001',
        provider: 'preview',
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem('uos:player-portal:active-id', 'player-demo-001');
      localStorage.setItem('uos:player-portal:auth', 'true');
      localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify({
        parentId: 'parent-preview-01',
        provider: 'preview',
        createdAt: new Date().toISOString(),
      }));
      sessionStorage.setItem('uos:coach-portal:preview-session:v1', 'coach-preview-01');
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
      sessionStorage.setItem('uos:splash-seen', 'true');
    }
  }, { settingsPayload: payload, previewMode: preview });
}

const normalizePath = (value) => value.replace(/\/$/, '') || '/';

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const entry of cases) {
    for (const theme of themeScenarios) {
      for (const bilingualOrder of ['en-first', 'ar-first']) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme.colorScheme, reducedMotion: 'reduce' });
        await installUiState(context, settings(theme.appearance, bilingualOrder), entry.preview === true);
        const page = await context.newPage();
        const consoleErrors = [];
        page.on('console', (message) => {
          const text = message.text();
          const externalFontFailure =
            message.type() === 'error' &&
            text.includes('downloadable font: download failed') &&
            text.includes('https://fonts.gstatic.com/');
          if (message.type() === 'error' && !externalFontFailure) consoleErrors.push(text);
        });
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.locator('#root').waitFor({ state: 'attached', timeout: 5_000 });
        await page.waitForFunction(() => (document.querySelector('#root')?.textContent?.trim().length ?? 0) > 12, undefined, { timeout: 5_000 }).catch(() => undefined);
        if (entry.expectedRoute) {
          await page.waitForURL((url) => normalizePath(url.pathname) === entry.expectedRoute, { timeout: 5_000 }).catch(() => undefined);
          const actualPath = normalizePath(new URL(page.url()).pathname);
          if (actualPath !== entry.expectedRoute) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: expected internal preview route ${entry.expectedRoute}, got ${actualPath}`);
        }
        const primary = page.locator(entry.primarySelector);
        await primary.first().waitFor({ state: 'attached', timeout: 5_000 }).catch(() => undefined);
        const primaryCount = await primary.count();
        if (primaryCount !== 1) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: expected one canonical primary logo, got ${primaryCount}`);
        const primarySrc = primaryCount ? await primary.first().getAttribute('src') : null;
        if (!primarySrc?.endsWith(canonicalLogoPath)) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: expected canonical logo ${canonicalLogoPath}, got ${primarySrc ?? ''}`);
        const primaryBroken = primaryCount ? await primary.first().evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth === 0) : true;
        if (primaryBroken) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: canonical primary logo failed to load`);
        const resolvedTheme = await page.locator('html').getAttribute('data-theme');
        if (resolvedTheme !== theme.effective) errors.push(`${entry.route} ${theme.name}: resolved theme ${resolvedTheme ?? ''} expected ${theme.effective}`);
        const portalIdentity = await page.locator('[data-portal]').first().getAttribute('data-portal').catch(() => null);
        if (entry.route.endsWith('/login') && portalIdentity !== entry.portal) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: portal identity ${portalIdentity ?? ''} expected ${entry.portal}`);
        const dir = await page.locator('html').getAttribute('dir');
        const expectedDir = bilingualOrder === 'ar-first' ? 'rtl' : 'ltr';
        if (dir !== expectedDir) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: dir=${dir}, expected ${expectedDir}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        if (overflow) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: horizontal overflow at 390px`);
        if (consoleErrors.length) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: console errors: ${consoleErrors.join(' | ')}`);
        await context.close();
      }
    }
    console.log(`[portal-logo] checked ${entry.route} across explicit/system light-dark and EN/AR order`);
  }

  for (const entry of screenshotCases) {
    for (const appearance of ['light', 'dark']) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport, colorScheme: appearance, reducedMotion: 'reduce' });
        await installUiState(context, settings(appearance, 'en-first'), entry.preview === true);
        const page = await context.newPage();
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.locator('#root').waitFor({ state: 'attached', timeout: 5_000 });
        if (entry.expectedRoute) {
          await page.waitForURL((url) => normalizePath(url.pathname) === entry.expectedRoute, { timeout: 5_000 });
        }
        const primary = page.locator(entry.primarySelector);
        await primary.first().waitFor({ state: 'attached', timeout: 5_000 });
        await page.waitForTimeout(120);
        await page.screenshot({ path: path.join(outputDir, `${entry.portal}-${viewport.name}-${appearance}.png`), fullPage: true });
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join(String.fromCharCode(10)));
  process.exit(1);
}
console.log(`Portal canonical-logo QA PASS; screenshots: ${outputDir}`);
