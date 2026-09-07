import { chromium, firefox, webkit } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.UOS_LIVE_URL;
const browserName = process.env.UOS_QA_BROWSER;
assert(base, 'UOS_LIVE_URL is required');

const browsers = { Chromium: chromium, Firefox: firefox, WebKit: webkit };
const type = browsers[browserName];
assert(type, `Unknown browser ${browserName}`);

const routes = [
  '/',
  '/about',
  '/sports',
  '/programs',
  '/coaches',
  '/contact',
  '/store',
  '/store/shop',
  '/store/categories',
  '/store/cart',
  '/store/checkout',
  '/store/account',
  '/player/login',
  '/parent/login',
  '/coach/login',
  '/admin',
];
const widths = [390, 1440];
const variants = [
  { theme: 'light', rtl: false },
  { theme: 'dark', rtl: false },
  { theme: 'light', rtl: true },
  { theme: 'dark', rtl: true },
];

const browser = await type.launch({ headless: true });
let cases = 0;
try {
  for (const width of widths) {
    for (const variant of variants) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 1000 },
        reducedMotion: 'reduce',
      });
      await context.addInitScript(({ theme, rtl }) => {
        sessionStorage.setItem('uos:splash-seen', 'true');
        sessionStorage.setItem('uos:assistant-dismissed', '1');
        localStorage.setItem(
          'uos:ui-settings:v1',
          JSON.stringify({
            appearance: theme,
            bilingualOrder: rtl ? 'ar-first' : 'en-first',
            density: 'comfortable',
            motion: 'reduced',
            fontScale: 'default',
            sidebarDefault: 'expanded',
          }),
        );
      }, variant);
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        const text = message.text();
        const externalFontFailure =
          message.type() === 'error' &&
          text.includes('downloadable font: download failed') &&
          text.includes('fonts.gstatic.com');
        if (message.type() === 'error' && !externalFontFailure) {
          runtimeErrors.push(`console: ${text}`);
        }
      });

      try {
        for (const route of routes) {
          runtimeErrors.length = 0;
          const response = await page.goto(base + route, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
          });
          assert(response, `${route}: no navigation response`);
          assert(response.status() < 400, `${route}: HTTP ${response.status()}`);
          await page.locator('#root').waitFor({ state: 'attached', timeout: 10_000 });
          await page.waitForTimeout(250);
          const state = await page.evaluate(() => ({
            rootText: document.querySelector('#root')?.textContent?.trim().length ?? 0,
            overflow: document.documentElement.scrollWidth - innerWidth,
            overlay: Boolean(document.querySelector('vite-error-overlay')),
            broken: [...document.images]
              .filter((image) => image.complete && image.naturalWidth === 0 && Boolean(image.currentSrc || image.src))
              .map((image) => image.currentSrc || image.src),
          }));
          assert(state.rootText >= 8, `${route}: root rendered effectively empty`);
          assert(state.overflow <= 2, `${route}: horizontal overflow ${state.overflow}px`);
          assert.equal(state.overlay, false, `${route}: Vite error overlay present`);
          assert.deepEqual(state.broken, [], `${route}: broken images`);
          assert.deepEqual(runtimeErrors, [], `${route}: runtime errors`);
          cases += 1;
        }
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

console.log(`[live-production] ${browserName} PASS: ${cases} route/theme/locale/viewport cases on ${base}`);
