import { chromium } from 'playwright';
import fs from 'node:fs';

const base = 'http://127.0.0.1:3000';
const report = { routes: {}, filters: {}, responsive: {}, bilingual: {}, images: {}, reducedMotion: {}, placeholders: {}, admin: {}, consoleErrors: [], status: 'RUNNING' };
const browser = await chromium.launch({ headless: true });
const assert = (value, message) => { if (!value) throw new Error(message); };
const bodyText = async page => (await page.locator('body').innerText()).trim();
const checkOverflow = async (page, key) => {
  const dims = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  report.responsive[key] = dims;
  assert(dims.scrollWidth <= dims.clientWidth + 1, `Overflow ${key}: ${dims.scrollWidth}/${dims.clientWidth}`);
};
const checkBilingual = async (page, key) => {
  const broken = await page.locator('.bi').evaluateAll(nodes => nodes.filter(node => !node.querySelector('.bi-en') || !node.querySelector('.bi-ar')).length);
  report.bilingual[key] = { broken };
  assert(broken === 0, `Broken bilingual components ${key}: ${broken}`);
};
const checkImages = async (page, key) => {
  const images = page.locator('img');
  const count = await images.count();
  for (let index = 0; index < count; index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(180);
  const broken = await images.evaluateAll(items => items.filter(image => image.complete && image.naturalWidth === 0).map(image => image.getAttribute('src')));
  report.images[key] = broken;
  assert(broken.length === 0, `Broken images ${key}: ${broken.join(',')}`);
};

try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await context.addInitScript(() => sessionStorage.setItem('uos:splash-seen', '1'));
  const page = await context.newPage();
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });

  const publicRoutes = ['/', '/about', '/sports', '/sports/football', '/sports/swimming', '/sports/basketball', '/sports/tennis', '/sports/gymnastics', '/sports/martial-arts', '/programs', '/programs/football-foundations', '/programs/swimming-progressive', '/programs/basketball-team-performance', '/programs/tennis-individual-skills', '/coaches', '/contact', '/player', '/parent', '/coach'];
  const adminRoutes = ['/admin', '/admin/sports', '/admin/players', '/admin/groups', '/admin/parents', '/admin/coaches', '/admin/programs', '/admin/schedules', '/admin/attendance', '/admin/performance', '/admin/countries', '/admin/branches', '/admin/subscriptions', '/admin/payments', '/admin/reports', '/admin/content', '/admin/users', '/admin/settings'];

  for (const route of [...publicRoutes, ...adminRoutes]) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    const text = await bodyText(page);
    assert(text.length > 90, `Route too sparse ${route}`);
    assert(!/Foundation shell ready|ready for the next mission|Future Module|Coach profiles are being prepared|Details available after verification/.test(text), `Owner placeholder visible ${route}`);
    report.routes[route] = { textLength: text.length, url: page.url() };
    await checkOverflow(page, `${route}@1600`);
    await checkBilingual(page, route);
    await checkImages(page, route);
  }
  report.placeholders = { visibleTechnicalPlaceholders: 0, pass: true };

  for (const route of adminRoutes.filter(route => !['/admin', '/admin/sports', '/admin/players'].includes(route))) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    assert(await page.locator('.amp-preview-banner').count() === 1, `Admin contextual preview missing ${route}`);
    assert(await page.locator('.future-panel').count() === 0, `Generic future panel visible ${route}`);
  }
  report.admin = { contextualPreviewRoutes: 15, pass: true };

  await page.goto(base + '/programs', { waitUntil: 'networkidle' });
  assert(await page.locator('.od-program-card').count() === 4, 'All programme cards not rendered');
  await page.screenshot({ path: 'qa05v/screenshots/programs-all-1600.png', fullPage: true });
  for (const [name, key] of [['Football', 'football'], ['Swimming', 'swimming'], ['Basketball', 'basketball'], ['Tennis', 'tennis']]) {
    await page.getByRole('button', { name: new RegExp(name, 'i') }).click();
    await page.waitForTimeout(100);
    const count = await page.locator('.od-program-card').count();
    const featured = await page.locator('.od-program-grid.is-featured').count();
    const box = await page.locator('.od-program-card').boundingBox();
    assert(count === 1 && featured === 1, `Featured filter failed ${name}`);
    assert((box?.width ?? 0) > 1000, `Featured programme too narrow ${name}: ${box?.width}`);
    report.filters[key] = { count, featured, width: box?.width };
    if (key === 'football') await page.screenshot({ path: 'qa05v/screenshots/programs-football-1600.png', fullPage: true });
  }

  await page.goto(base + '/parent', { waitUntil: 'networkidle' });
  assert(await page.locator('.od-parent-grid article').count() >= 6, 'Parent modules missing');
  assert(await page.locator('.od-child-switcher button').count() >= 2, 'Parent child switcher missing');
  await page.screenshot({ path: 'qa05v/screenshots/parent-1600.png', fullPage: true });

  await page.goto(base + '/player', { waitUntil: 'networkidle' });
  assert(await page.locator('.od-phone-frame').count() === 1, 'Player device mockup missing');
  await page.screenshot({ path: 'qa05v/screenshots/player-1600.png', fullPage: true });

  await page.goto(base + '/coach', { waitUntil: 'networkidle' });
  assert(await page.locator('.od-session-timeline').count() === 1 && await page.locator('.od-roster').count() === 1, 'Coach workflow missing');
  await page.screenshot({ path: 'qa05v/screenshots/coach-1600.png', fullPage: true });

  await page.goto(base + '/coaches', { waitUntil: 'networkidle' });
  assert(await page.locator('.od-coach-role-grid article').count() === 3, 'Public coaching role cards missing');
  await page.screenshot({ path: 'qa05v/screenshots/public-coaches-1600.png', fullPage: true });

  await page.goto(base + '/sports', { waitUntil: 'networkidle' });
  assert(await page.locator('.sport-card').count() === 6, 'Sports cards missing');
  assert(await page.locator('.od-sport-concept').count() === 3, 'Concept sport visuals missing');
  await page.screenshot({ path: 'qa05v/screenshots/sports-1600.png', fullPage: true });

  await page.goto(base + '/admin/groups', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa05v/screenshots/admin-groups-1600.png', fullPage: true });
  await page.goto(base + '/admin/payments', { waitUntil: 'networkidle' });
  assert(!/AED\s*\d|\d\s*AED/.test(await bodyText(page)), 'Payment amount invented');
  await page.screenshot({ path: 'qa05v/screenshots/admin-payments-1600.png', fullPage: true });

  const representativeRoutes = ['/programs', '/parent', '/player', '/coach', '/sports', '/admin/groups'];
  for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [430, 932], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const route of representativeRoutes) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await checkOverflow(page, `${route}@${width}`);
    }
    if (width === 390) {
      for (const route of ['/programs', '/parent', '/player', '/coach']) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `qa05v/screenshots/${route.slice(1)}-390.png`, fullPage: true });
      }
    }
    if (width === 768) {
      for (const route of ['/programs', '/parent']) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `qa05v/screenshots/${route.slice(1)}-768.png`, fullPage: true });
      }
    }
  }
  assert(report.consoleErrors.length === 0, `Console errors: ${report.consoleErrors.join(' | ')}`);
  await context.close();

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(base + '/', { waitUntil: 'domcontentloaded' });
  assert(await reducedPage.locator('.splash').count() === 1, 'Reduced Splash missing');
  assert(await reducedPage.locator('.splash').getAttribute('data-reduced-motion') === 'true', 'Reduced mode not synchronous');
  assert(await reducedPage.locator('.splash .official-logo').count() === 1, 'Reduced logo count incorrect');
  const decorations = await reducedPage.locator('.splash-particles,.splash-shield-outline,.splash-energy-ring,.gold-orbit').count();
  assert(decorations === 0, 'Reduced decorations rendered');
  const opacity = Number(await reducedPage.locator('.splash-copy').evaluate(element => getComputedStyle(element).opacity));
  assert(opacity > .9, `Reduced bilingual copy opacity ${opacity}`);
  const started = Date.now();
  await reducedPage.locator('.splash').waitFor({ state: 'detached', timeout: 1000 });
  const visibleRemainder = Date.now() - started;
  const seen = await reducedPage.evaluate(() => sessionStorage.getItem('uos:splash-seen'));
  assert(seen === '1', 'Splash session key missing');
  await reducedPage.goto(base + '/sports', { waitUntil: 'networkidle' });
  await reducedPage.goto(base + '/', { waitUntil: 'networkidle' });
  const replay = await reducedPage.locator('.splash').count();
  assert(replay === 0, 'Splash replayed in same session');
  report.reducedMotion = { visibleRemainderMs: visibleRemainder, decorations, copyOpacity: opacity, sessionKey: seen, replay, pass: true };
  await reducedContext.close();
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error instanceof Error ? (error.stack || error.message) : String(error);
  throw error;
} finally {
  await browser.close();
  fs.mkdirSync('qa05v', { recursive: true });
  fs.writeFileSync('qa05v/report.json', JSON.stringify(report, null, 2));
  console.log('MISSION_05V_REPORT=' + JSON.stringify(report));
}
