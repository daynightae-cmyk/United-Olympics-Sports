import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseURL = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';

async function waitForServer() {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError ?? new Error(`Production preview did not become ready: ${baseURL}`);
}

await waitForServer();
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    sessionStorage.setItem('uos:luxury-splash-seen', 'true');
    sessionStorage.setItem('uos:splash-seen', 'true');
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    const ignorableFontFailure = message.type() === 'error' && text.includes('downloadable font: download failed') && text.includes('fonts.gstatic.com');
    if (message.type() === 'error' && !ignorableFontFailure) runtimeErrors.push(text);
  });

  for (const route of ['/store', '/store/shop', '/store/category/swimming']) {
    runtimeErrors.length = 0;
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    assert(response?.ok(), `${route}: HTTP failure`);
    await page.locator('.store-shell').waitFor({ timeout: 10_000 });
    const cardCount = await page.locator('.store-product-card').count();
    assert.equal(cardCount, 0, `${route}: preview fixture products leaked into ordinary production build`);
    assert.deepEqual(runtimeErrors, [], `${route}: runtime errors in ordinary production build`);
  }

  await page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForURL('**/admin/login', { timeout: 10_000 });
  assert.equal(new URL(page.url()).pathname, '/admin/login', 'ordinary production build exposed Admin without authentication');

  await context.close();
  console.log('Production provider boundary passed: Store fixtures absent and Admin closed.');
} finally {
  await browser.close();
}
