import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.UOS_PORTAL_SCREENSHOTS ?? 'test-results/portal-emblems';
const expectedPath = {
  player: { light: '/brand/portals/player/player-portal-light.png', dark: '/brand/portals/player/player-portal-dark.png' },
  parent: { light: '/brand/portals/parent/parent-portal-light.png', dark: '/brand/portals/parent/parent-portal-dark.png' },
  coach: { light: '/brand/portals/coach/coach-portal-light.png', dark: '/brand/portals/coach/coach-portal-dark.png' },
  admin: { light: '/brand/portals/admin/admin-portal-light.png', dark: '/brand/portals/admin/admin-portal-dark.png' },
  store: { light: '/brand/portals/store/store-light.png', dark: '/brand/portals/store/store-dark.png' },
};
const cases = [
  { portal: 'player', route: '/player/login' },
  { portal: 'parent', route: '/parent/login' },
  { portal: 'coach', route: '/coach/login' },
  { portal: 'admin', route: '/admin/login' },
  { portal: 'store', route: '/store/login' },
  { portal: 'parent', route: '/parent' },
  { portal: 'coach', route: '/coach' },
  { portal: 'admin', route: '/admin' },
  { portal: 'store', route: '/store' },
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
        page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'networkidle' });
        const primary = page.locator('[data-portal-emblem-role="primary"]');
        if (await primary.count() < 1) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: missing primary emblem`);
        const primaryPortals = await primary.evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('data-portal-emblem')))]);
        if (primaryPortals.some((portal) => portal !== entry.portal)) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: wrong primary emblem(s) ${primaryPortals.join(',')}`);
        const expected = expectedPath[entry.portal][theme.effective];
        const sources = await primary.locator('img').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')));
        if (!sources.some((src) => src?.endsWith(expected))) errors.push(`${entry.route} ${theme.name} ${bilingualOrder}: expected ${expected}, got ${sources.join(',')}`);
        const resolvedThemes = await primary.evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('data-portal-theme')))]);
        if (resolvedThemes.some((resolved) => resolved !== theme.effective)) errors.push(`${entry.route} ${theme.name}: resolved theme ${resolvedThemes.join(',')} expected ${theme.effective}`);
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
console.log(`Portal emblem QA PASS; screenshots: ${outputDir}`);
