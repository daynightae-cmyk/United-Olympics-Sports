import { chromium } from 'playwright';

const baseURL = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const routes = [
  { route: '/player/login', expectedPath: '/player/login', kind: 'login' },
  { route: '/player', expectedPath: '/player/login', kind: 'redirect' },
  { route: '/parent/login', expectedPath: '/parent/login', kind: 'login' },
  { route: '/parent', expectedPath: '/parent/login', kind: 'redirect' },
  { route: '/coach/login', expectedPath: '/coach/login', kind: 'login' },
  { route: '/coach', expectedPath: '/coach/login', kind: 'redirect' },
  { route: '/store/login', expectedPath: '/store/login', kind: 'login' },
  { route: '/store/account', expectedPath: '/store/login', kind: 'redirect' },
  { route: '/admin/login', expectedPath: '/admin/login', kind: 'login' },
];

async function waitForServer() {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseURL}/api/v1/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError ?? new Error(`Production server did not become ready: ${baseURL}`);
}

function isIgnorableExternalFailure(url) {
  return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
}

async function assertStableRoute(browser, spec) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    sessionStorage.setItem('uos:luxury-splash-seen', 'true');
    sessionStorage.setItem('uos:splash-seen', 'true');
    localStorage.removeItem('uos:player-portal:session');
    localStorage.removeItem('uos:player-portal:active-id');
    localStorage.removeItem('uos:player-portal:auth');
    localStorage.removeItem('uos:parent-portal:session:v1');
    localStorage.removeItem('uos:coach-portal:session:v1');
    sessionStorage.removeItem('uos:coach-portal:preview-session:v1');
    localStorage.removeItem('uos:auth:token');
    sessionStorage.removeItem('uos:auth:token');
    localStorage.removeItem('sb-access-token');
  });

  const page = await context.newPage();
  const runtimeErrors = [];
  const badResponses = [];
  const failedRequests = [];

  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const source = message.location().url ?? '';
    const text = message.text();
    if (isIgnorableExternalFailure(source) || isIgnorableExternalFailure(text)) return;
    runtimeErrors.push(`console: ${text}`);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!isIgnorableExternalFailure(url)) failedRequests.push(`${request.method()} ${url}: ${request.failure()?.errorText ?? 'failed'}`);
  });
  page.on('response', (response) => {
    const url = response.url();
    if (response.status() >= 400 && !isIgnorableExternalFailure(url)) badResponses.push(`${response.status()} ${url}`);
  });

  try {
    const response = await page.goto(`${baseURL}${spec.route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (response && response.status() >= 400) throw new Error(`${spec.route}: document returned HTTP ${response.status()}`);
    await page.waitForSelector('#root', { state: 'attached', timeout: 10_000 });

    await page.waitForFunction(
      ({ expectedPath }) => window.location.pathname === expectedPath,
      { expectedPath: spec.expectedPath },
      { timeout: 12_000 },
    );

    try {
      await page.locator('[data-route-loading="true"]').waitFor({ state: 'hidden', timeout: 12_000 });
    } catch {
      const loadingText = await page.locator('[data-route-loading="true"]').allTextContents();
      throw new Error(`${spec.route}: route remained in loading state: ${loadingText.join(' | ')}`);
    }

    // A protected route can update history before React commits the destination
    // login surface. Wait for the actual UI, not only the pathname, so this gate
    // detects a genuinely missing login screen without racing the router render.
    if (spec.kind === 'login' || spec.kind === 'redirect') {
      try {
        await page.locator('.portal-auth').first().waitFor({ state: 'visible', timeout: 12_000 });
      } catch {
        throw new Error(`${spec.route}: stable login surface was not rendered`);
      }
    }

    const state = await page.evaluate(() => ({
      path: window.location.pathname,
      rootText: document.querySelector('#root')?.textContent?.trim().length ?? 0,
      loginCount: document.querySelectorAll('.portal-auth').length,
      terminalCount: document.querySelectorAll('[data-route-terminal]').length,
      activeLoaders: [...document.querySelectorAll('[data-route-loading="true"]')].filter((node) => {
        const element = node;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length,
    }));

    if (state.path !== spec.expectedPath) throw new Error(`${spec.route}: expected ${spec.expectedPath}, got ${state.path}`);
    if (state.rootText < 8) throw new Error(`${spec.route}: root rendered effectively empty`);
    if (state.activeLoaders) throw new Error(`${spec.route}: ${state.activeLoaders} active loader(s) remained`);
    if (spec.kind === 'login' || spec.kind === 'redirect') {
      if (state.loginCount < 1) throw new Error(`${spec.route}: stable login surface was not rendered`);
    }
    if (runtimeErrors.length) throw new Error(`${spec.route}: ${runtimeErrors.join(' | ')}`);
    if (failedRequests.length) throw new Error(`${spec.route}: failed network request(s): ${failedRequests.join(' | ')}`);
    if (badResponses.length) throw new Error(`${spec.route}: HTTP error response(s): ${badResponses.join(' | ')}`);

    console.log(`PASS ${spec.route} -> ${state.path} (terminal=${state.terminalCount}, loaders=${state.activeLoaders})`);
  } finally {
    await context.close();
  }
}

await waitForServer();
const browser = await chromium.launch({ headless: true });
try {
  for (const spec of routes) await assertStableRoute(browser, spec);
} finally {
  await browser.close();
}

console.log(`Real production runtime smoke passed for ${routes.length} protected/login routes without preview flags or injected auth sessions.`);
