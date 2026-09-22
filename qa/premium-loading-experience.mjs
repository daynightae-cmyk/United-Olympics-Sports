import { chromium, firefox } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:3000';
const outputDir = process.env.UOS_LOADING_SCREENSHOTS ?? 'test-results/premium-loading';
const browserType = process.env.UOS_BROWSER === 'firefox' ? firefox : chromium;
const fixtureDir = process.env.UOS_SSR_FIXTURES;
const scenarios = [
  { name: 'coach-1440-dark-ltr', portal: 'coach', width: 1440, height: 1000, appearance: 'dark', order: 'en-first' },
  { name: 'player-1440-light-rtl', portal: 'player', width: 1440, height: 1000, appearance: 'light', order: 'ar-first' },
  { name: 'parent-768-dark-rtl', portal: 'parent', width: 768, height: 1024, appearance: 'dark', order: 'ar-first' },
  { name: 'admin-768-light-ltr', portal: 'admin', width: 768, height: 1024, appearance: 'light', order: 'en-first' },
  { name: 'portal-390-dark-rtl', portal: 'generic', width: 390, height: 844, appearance: 'dark', order: 'ar-first' },
];

const expectedTitle = {
  coach: 'Preparing your training workspace',
  player: 'Preparing your athlete workspace',
  parent: 'Preparing your family sports workspace',
  admin: 'Preparing the operations command center',
  generic: 'Preparing your sports workspace',
};

const settings = (appearance, bilingualOrder) => ({
  appearance,
  bilingualOrder,
  density: 'comfortable',
  motion: 'system',
  fontScale: 'default',
  sidebarDefault: 'expanded',
});

await fs.mkdir(outputDir, { recursive: true });
const browser = await browserType.launch();
const failures = [];

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      colorScheme: scenario.appearance,
      reducedMotion: 'no-preference',
    });
    await context.addInitScript(({ payload }) => {
      localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload));
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
      sessionStorage.setItem('uos:splash-seen', 'true');
      window.__uosConsoleErrors = [];
      window.addEventListener('error', (event) => window.__uosConsoleErrors.push(event.message));
      window.addEventListener('unhandledrejection', (event) => window.__uosConsoleErrors.push(String(event.reason)));
    }, { payload: settings(scenario.appearance, scenario.order) });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('fonts.gstatic.com')) consoleErrors.push(message.text());
    });
    if (fixtureDir) {
      await page.setContent(await fs.readFile(path.join(fixtureDir, `${scenario.name}.html`), 'utf8'), { waitUntil: 'domcontentloaded' });
    } else {
      await page.goto(`${baseUrl}/benchmark/loading?portal=${scenario.portal}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    }
    const loader = page.locator('[data-loading-system="uos-field-pulse"]');
    await loader.waitFor({ state: 'visible', timeout: 8_000 });
    await page.waitForTimeout(500);

    const result = await loader.evaluate((node) => {
      const core = node.querySelector('.uos-field-pulse')?.getBoundingClientRect();
      const skeleton = node.querySelector('.uos-loading-stage__skeleton')?.getBoundingClientRect();
      const titleLines = [...node.querySelectorAll('.uos-loading-stage__copy h1 .bi-en, .uos-loading-stage__copy h1 .bi-ar')]
        .map((line) => line.getBoundingClientRect())
        .map((rect) => ({ left: rect.left, right: rect.right }));
      const style = getComputedStyle(node);
      return {
        text: node.textContent ?? '',
        role: node.getAttribute('role'),
        busy: node.getAttribute('aria-busy'),
        portal: node.getAttribute('data-loading-portal'),
        coreWidth: core?.width ?? 0,
        skeletonHeight: skeleton?.height ?? 0,
        titleLines,
        background: style.backgroundColor,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        dir: document.documentElement.dir,
        theme: document.documentElement.dataset.theme,
        errors: window.__uosConsoleErrors ?? [],
        errorOverlay: Boolean(document.querySelector('.vite-error-overlay, #webpack-dev-server-client-overlay')),
      };
    });

    const expectedDir = scenario.order === 'ar-first' ? 'rtl' : 'ltr';
    if (!result.text.includes(expectedTitle[scenario.portal])) failures.push(`${scenario.name}: contextual English title missing`);
    if (!result.text.includes('جارِ تجهيز')) failures.push(`${scenario.name}: contextual Arabic title missing`);
    if (result.role !== 'status' || result.busy !== 'true') failures.push(`${scenario.name}: progress semantics missing`);
    if (result.portal !== scenario.portal) failures.push(`${scenario.name}: portal context mismatch`);
    if (result.dir !== expectedDir) failures.push(`${scenario.name}: dir=${result.dir}, expected ${expectedDir}`);
    if (result.theme !== scenario.appearance) failures.push(`${scenario.name}: theme=${result.theme}, expected ${scenario.appearance}`);
    if (result.coreWidth < 120 || result.coreWidth > 230) failures.push(`${scenario.name}: athletic core width ${result.coreWidth}px is out of bounds`);
    if (result.skeletonHeight < 10) failures.push(`${scenario.name}: structured loading surfaces are missing`);
    if (result.titleLines.some(({ left, right }) => left < -0.5 || right > scenario.width + 0.5)) failures.push(`${scenario.name}: title copy is clipped`);
    if (result.overflow) failures.push(`${scenario.name}: horizontal overflow detected`);
    if (result.errorOverlay) failures.push(`${scenario.name}: framework error overlay detected`);
    if (consoleErrors.length || result.errors.length) failures.push(`${scenario.name}: console errors ${[...consoleErrors, ...result.errors].join(' | ')}`);

    await page.screenshot({ path: path.join(outputDir, `${scenario.name}.png`), fullPage: true });
    await context.close();
    console.log(`[loading-visual] ${scenario.name} inspected and captured`);
  }

  const reducedContext = await browser.newContext({ viewport: { width: 768, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await reducedContext.addInitScript(({ payload }) => {
    localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload));
    sessionStorage.setItem('uos:luxury-splash-seen', 'true');
  }, { payload: settings('dark', 'en-first') });
  const reducedPage = await reducedContext.newPage();
  if (fixtureDir) {
    await reducedPage.setContent(await fs.readFile(path.join(fixtureDir, 'coach-1440-dark-ltr.html'), 'utf8'), { waitUntil: 'domcontentloaded' });
  } else {
    await reducedPage.goto(`${baseUrl}/benchmark/loading?portal=coach`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  }
  await reducedPage.locator('[data-loading-system="uos-field-pulse"]').waitFor({ state: 'visible' });
  const reducedAnimations = await reducedPage.evaluate(() => [
    '.uos-field-pulse__orbit',
    '.uos-field-pulse__signal',
    '.uos-loading-stage__telemetry-rail::after',
  ].map((selector) => {
    if (selector.endsWith('::after')) {
      const element = document.querySelector(selector.replace('::after', ''));
      return element ? getComputedStyle(element, '::after').animationName : 'missing';
    }
    const element = document.querySelector(selector);
    return element ? getComputedStyle(element).animationName : 'missing';
  }));
  if (reducedAnimations.some((name) => name !== 'none')) failures.push(`reduced-motion: active animations ${reducedAnimations.join(', ')}`);
  await reducedContext.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Premium loading visual QA PASS; screenshots: ${outputDir}`);
