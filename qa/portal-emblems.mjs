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
  { portal: 'parent', route: '/parent', primarySelector: '.portal-sidebar .portal-brand > img.official-logo' },
  { portal: 'coach', route: '/coach', primarySelector: '.portal-sidebar .portal-brand > img.official-logo' },
  { portal: 'admin', route: '/admin', primarySelector: '.admin-sidebar .admin-brand > img.official-logo' },
  { portal: 'store', route: '/store', primarySelector: '.store-main-header .store-brand > img' },
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

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const entry of cases) {
    for (const theme of themeScenarios) {
      for (const bilingualOrder of ['en-first', 'ar-first']) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme.colorScheme });
        await context.addInitScript(({ payload }) => localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload)), { payload: settings(theme.appearance, bilingualOrder) });
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
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'networkidle' });
        const primary = page.locator(entry.primarySelector);
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
  }

  for (const entry of screenshotCases) {
    for (const appearance of ['light', 'dark']) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport, colorScheme: appearance });
        await context.addInitScript(({ payload }) => localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload)), { payload: settings(appearance, 'en-first') });
        const page = await context.newPage();
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'networkidle' });
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
