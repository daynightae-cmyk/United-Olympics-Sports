import { chromium, firefox, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const preview = process.env.UOS_STORE_PREVIEW === 'true';
const evidence = process.env.UOS_QA_OUTPUT;
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const routes = ['/store', '/store/shop', '/store/categories', '/store/category/swimming', '/store/product/elite-swim-goggles', '/store/product/performance-training-top', '/store/search?q=swim', '/store/cart', '/store/checkout', '/store/wishlist', '/store/account', '/store/orders'];
const forbidden = /Academy|الأكاديمية|FIFA Quality Pro|Official Federation Approved|100% Olympic Grade|Guaranteed Next-Day|30-Day Guaranteed Returns|100% Refund|Olympic Grade SSL|UNITED10|OLYMPIC2026/iu;
if (evidence) await mkdir(evidence, { recursive: true });

async function checkedContext(browser, width, theme = 'light', rtl = false) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, reducedMotion: 'reduce', hasTouch: width < 768 });
  await context.addInitScript(({ theme, rtl }) => {
    sessionStorage.setItem('uos:splash-seen', 'true');
    sessionStorage.setItem('uos:assistant-dismissed', '1');
    localStorage.setItem('uos:ui-settings:v1', JSON.stringify({ appearance: theme, bilingualOrder: rtl ? 'ar-first' : 'en-first', density: 'comfortable', motion: 'reduced', fontScale: 'default', sidebarDefault: 'expanded' }));
  }, { theme, rtl });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    const externalFontFailure = message.type() === 'error' && text.includes('downloadable font: download failed') && text.includes('https://fonts.gstatic.com/');
    if (message.type() === 'error' && !externalFontFailure) errors.push(text);
  });
  return { context, page, errors };
}

async function visit(page, errors, route) {
  const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), `${route}: HTTP failure`);
  await page.locator('.store-shell').waitFor();
  if (preview && ['/store', '/store/shop', '/store/category/swimming'].includes(route)) await page.locator('.store-product-card').first().waitFor();
  await page.waitForTimeout(100);
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    text: document.querySelector('.store-shell')?.textContent ?? '',
    errors: Boolean(document.querySelector('vite-error-overlay')),
    broken: [...document.images].filter((i) => i.complete && !i.naturalWidth && i.currentSrc).map((i) => i.currentSrc),
    cardCount: document.querySelectorAll('.store-product-card').length,
    search: document.querySelector('.store-search-wrap')?.getBoundingClientRect().toJSON(),
    cart: document.querySelector('.store-utilities>button[aria-label="Cart | السلة"]')?.getBoundingClientRect().toJSON(),
    dir: document.querySelector('.store-shell')?.getAttribute('dir'),
  }));
  assert(state.text.length > 100 && !state.errors, `${route}: empty or error overlay`);
  assert(state.overflow <= 2, `${route}: overflow ${state.overflow}`);
  assert(!forbidden.test(state.text), `${route}: unsupported commercial or brand text`);
  assert.deepEqual(state.broken, [], `${route}: broken images`);
  assert.deepEqual(errors, [], `${route}: runtime errors`);
  const width = page.viewportSize().width;
  assert(state.cart.width >= 32 && state.cart.x >= 0 && state.cart.right <= width + 1, `${route}: inaccessible cart`);
  if (width <= 820) assert(state.search.width >= width - 32, `${route}: search is not full width (${state.search.width})`);
  if (!preview) assert.equal(state.cardCount, 0, `${route}: production fixture leak`);
  return state;
}

async function screenshot(page, name) {
  if (!evidence) return;
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 35)); } scrollTo(0, 0); });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${evidence}/${name}.png`, fullPage: true });
}

async function clickExposedBackdrop(page, backdrop, panel) {
  const backdropBox = await backdrop.boundingBox();
  const panelBox = await panel.boundingBox();
  assert(backdropBox, 'drawer backdrop has no measurable box');
  assert(panelBox, 'drawer panel has no measurable box');
  const margin = 8;
  const candidates = [
    { x: backdropBox.x + margin, y: backdropBox.y + margin },
    { x: backdropBox.x + backdropBox.width - margin, y: backdropBox.y + margin },
    { x: backdropBox.x + margin, y: backdropBox.y + backdropBox.height - margin },
    { x: backdropBox.x + backdropBox.width - margin, y: backdropBox.y + backdropBox.height - margin },
  ];
  const outside = candidates.find(({ x, y }) => x < panelBox.x || x > panelBox.x + panelBox.width || y < panelBox.y || y > panelBox.y + panelBox.height);
  if (!outside) return false;
  await page.mouse.click(outside.x, outside.y);
  return true;
}

async function clickOutsideOverlay(page, overlay) {
  const overlayBox = await overlay.boundingBox();
  const viewport = page.viewportSize();
  assert(overlayBox, 'overlay has no measurable box');
  assert(viewport, 'viewport is unavailable');
  const margin = 8;
  const candidates = [
    { x: margin, y: viewport.height - margin },
    { x: viewport.width - margin, y: viewport.height - margin },
    { x: margin, y: Math.round(viewport.height / 2) },
    { x: viewport.width - margin, y: Math.round(viewport.height / 2) },
  ];
  for (const point of candidates) {
    const outside = point.x < overlayBox.x || point.x > overlayBox.x + overlayBox.width || point.y < overlayBox.y || point.y > overlayBox.y + overlayBox.height;
    if (!outside) continue;
    const interactive = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('a,button,input,select,textarea,[role="button"]')), point);
    if (interactive) continue;
    await page.mouse.click(point.x, point.y);
    return;
  }
  assert.fail('search results have no safe exposed outside-click area');
}

async function modalChecks(page, selector, trigger, close) {
  await trigger.click();
  const panel = page.locator(selector);
  await panel.waitFor();
  await page.waitForFunction((activeSelector) => {
    const activePanel = document.querySelector(activeSelector);
    return Boolean(activePanel?.contains(document.activeElement));
  }, selector);
  assert(await panel.evaluate((e) => e.contains(document.activeElement)), `${selector}: missing initial focus`);
  for (let i = 0; i < 16; i++) await page.keyboard.press('Tab');
  assert(await panel.evaluate((e) => e.contains(document.activeElement)), `${selector}: escaped focus trap`);
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  assert(await trigger.evaluate((e) => e === document.activeElement), `${selector}: failed focus restoration`);
  await trigger.click();
  const backdropClicked = await clickExposedBackdrop(page, close, panel);
  if (!backdropClicked) await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  if (!backdropClicked) assert(await trigger.evaluate((e) => e === document.activeElement), `${selector}: failed fallback focus restoration`);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '', `${selector}: body scroll remains locked`);
}

async function interactions(browser, name, rtl) {
  const { context, page, errors } = await checkedContext(browser, 390, 'light', rtl);
  try {
    await visit(page, errors, '/store/shop');
    await modalChecks(page, '.store-filter-layer .store-filters', page.locator('.store-mobile-filter'), page.locator('.store-filter-layer .store-drawer-backdrop'));
    await page.locator('.store-mobile-filter').click();
    await page.locator('.store-filter-layer label').filter({ hasText: 'Swimming' }).click();
    await page.locator('.store-filter-layer .store-button-primary').click();
    if (preview) assert.equal(await page.locator('.store-product-card').count(), 3);
    const search = page.locator('#store-search');
    await search.fill('swim');
    await page.locator('#store-search-results').waitFor();
    await page.keyboard.press('ArrowDown');
    assert(await page.locator('#store-search-results').evaluate((e) => e.contains(document.activeElement)), 'search keyboard navigation failed');
    await page.keyboard.press('Escape');
    assert(await search.evaluate((e) => e === document.activeElement), 'search focus restoration failed');
    await search.fill('unmatched-query-xyz');
    await page.locator('.store-search-results p').waitFor();
    const searchResults = page.locator('#store-search-results');
    await clickOutsideOverlay(page, searchResults);
    await searchResults.waitFor({ state: 'hidden' });
    await search.fill('swim');
    await search.press('Enter');
    await page.waitForURL('**/store/search?q=swim');
    await modalChecks(page, '.store-mini-cart', page.locator('.store-utilities>button[aria-label="Cart | السلة"]'), page.locator('.store-drawer-layer .store-drawer-backdrop'));
    if (preview) {
      await visit(page, errors, '/store/shop');
      const card = page.locator('.store-product-card').filter({ has: page.locator('h3', { hasText: 'Performance Training Top' }) });
      const quick = card.locator('.store-quick-cart');
      assert(await quick.isDisabled(), 'unselected variants can be added');
      await card.getByRole('button', { name: 'Black / Gold | أسود / ذهبي', exact: true }).click();
      assert(await quick.isDisabled(), 'missing size can be added');
      await card.getByRole('button', { name: 'M', exact: true }).click();
      await quick.click();
      await card.locator('.store-quick-cart.is-added').waitFor();
      await card.getByRole('button', { name: 'Ivory / Gold | عاجي / ذهبي', exact: true }).click();
      assert((await card.locator('.store-product-media img').getAttribute('src')).includes('training-ivory'), 'variant image did not switch');
      await quick.click();
      await card.locator('.store-card-heart').click();
      await page.locator('.store-utilities>button[aria-label="Cart | السلة"]').click();
      assert.equal(await page.locator('.store-mini-cart-lines article').count(), 2, 'variants merged');
      await page.locator('.store-mini-cart-lines article').first().getByRole('button', { name: 'Increase quantity | زيادة الكمية', exact: true }).click();
      assert.deepEqual(await page.locator('.store-mini-cart-lines output').allTextContents(), ['2', '1'], 'quantity affected sibling variant');
      await page.locator('.store-mini-cart-lines article').first().locator('.store-remove').click();
      assert.equal(await page.locator('.store-mini-cart-lines article').count(), 1, 'remove affected sibling variant');
      await page.keyboard.press('Escape');
      await page.locator('.store-nav a[href="/store/shop"]').click();
      await page.locator('.store-product-card h3 a').filter({ hasText: 'Elite Swim Goggles' }).click();
      await page.locator('.store-product-info').waitFor();
      assert.equal(await page.locator('.store-thumbnails button').count(), 2, 'gallery duplicates primary');
      const before = await page.locator('.store-gallery-stage img').getAttribute('src');
      await page.locator('.store-gallery-next').click();
      assert.notEqual(await page.locator('.store-gallery-stage img').getAttribute('src'), before, 'gallery did not advance');
      await modalChecks(page, '.store-lightbox', page.locator('.store-gallery-expand'), page.locator('.store-lightbox-layer .store-drawer-backdrop'));
      await page.locator('[role=tab]').filter({ hasText: rtl ? 'دليل المقاسات' : 'Size guide' }).click();
      assert((await page.locator('[role=tabpanel]').textContent()).includes('Sizing information not configured yet'));
      await page.locator('.store-product-info').getByRole('button', { name: 'Black / Gold | أسود / ذهبي', exact: true }).click();
      await page.locator('.store-mobile-buy button').click();
      await page.locator('.store-mini-cart footer a[href="/store/cart"]').click();
      assert.equal(await page.locator('.store-cart-list article').count(), 2);
      await screenshot(page, `${name}-${rtl ? 'rtl' : 'ltr'}-cart`);
      await page.locator('.store-cart-summary a').click();
      await page.locator('input[type=email]').fill('qa@example.test');
      await page.locator('input[type=tel]').fill('0500000000');
      await page.locator('.store-checkout-form button[type=submit]').click();
      await page.locator('input[autocomplete=name]').fill('QA');
      await page.locator('.store-checkout-form select').nth(1).selectOption({ index: 1 });
      for (const input of await page.locator('.store-checkout-form input[required]').all()) if (!(await input.inputValue())) await input.fill('QA');
      await page.locator('.store-checkout-form button[type=submit]').click();
      assert((await page.locator('.store-checkout-form').textContent()).includes('Shipping configuration pending'));
      assert.equal(await page.locator('.store-delivery-slot').count(), 0, 'fake delivery slots');
      await page.locator('.store-checkout-form button[type=submit]').click();
      await page.locator('.store-checkout-form button[type=submit]').click();
      await page.locator('.store-checkout-form button[type=submit]').click();
      await page.locator('.store-inline-error').waitFor();
      await page.locator('.store-nav a[href="/store"]').click();
      assert((await page.locator('.store-main').textContent()).includes('Recently viewed'), 'legitimate history missing');
    }
    assert.deepEqual(errors, [], `${name} interaction runtime errors`);
    console.log(`[${name}] ${preview ? 'preview' : 'production'} interactions ${rtl ? 'RTL' : 'LTR'} passed`);
  } finally { await context.close(); }
}

async function matrix(type, name) {
  const browser = await type.launch({ headless: true });
  try {
    await interactions(browser, name, false);
    await interactions(browser, name, true);
    let count = 0;
    for (const width of widths) for (const theme of ['light', 'dark']) for (const rtl of [false, true]) {
      const { context, page, errors } = await checkedContext(browser, width, theme, rtl);
      try {
        for (const route of routes) {
          const state = await visit(page, errors, route);
          assert.equal(state.dir, rtl ? 'rtl' : 'ltr', 'locale direction mismatch');
          if (evidence && name === 'Chromium' && [390, 1440].includes(width) && ['/store', '/store/shop', '/store/product/elite-swim-goggles'].includes(route)) await screenshot(page, `${preview ? 'preview' : 'production'}-${width}-${theme}-${rtl ? 'rtl' : 'ltr'}-${route.split('/').at(-1)}`);
          count++;
        }
      } finally { await context.close(); }
      console.log(`[${name}] ${width} ${theme} ${rtl ? 'RTL' : 'LTR'}: ${routes.length} routes passed`);
    }
    console.log(`[${name}] PASS: ${count} responsive route/theme/locale cases`);
  } finally { await browser.close(); }
}

const selected = process.env.UOS_QA_BROWSER;
for (const [name, type] of Object.entries({ Chromium: chromium, Firefox: firefox, WebKit: webkit })) if (!selected || selected === name) await matrix(type, name);
console.log(`Store Golden Master ${preview ? 'development' : 'production'} QA passed.`);
