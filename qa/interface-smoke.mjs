import { chromium, firefox, webkit } from 'playwright';

const baseURL = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const uiSettingsKey = 'uos:ui-settings:v1';
const previewPlayerId = 'player-demo-001';

const publicRoutes = ['/', '/about', '/sports', '/sports/football', '/sports/swimming', '/sports/basketball', '/sports/tennis', '/sports/gymnastics', '/sports/martial-arts', '/programs', '/coaches', '/contact', '/route-that-must-404'];
const playerRoutes = ['/player/login', '/player/auth/phone', '/player/auth/verify', '/player/home', '/player/schedule', '/player/session/session-demo-001', '/player/attendance', '/player/performance', '/player/achievements', '/player/feedback', '/player/subscription', '/player/payments', '/player/documents', '/player/messages', '/player/notifications', '/player/profile', '/player/settings', '/player/route-that-must-404'];
const parentRoutes = ['/parent', '/parent/children', '/parent/subscriptions', '/parent/documents', '/parent/messages', '/parent/schedule', '/parent/performance', '/parent/feedback', '/parent/payments', '/parent/profile', '/parent/route-that-must-404'];
const coachRoutes = ['/coach', '/coach/schedule', '/coach/groups', '/coach/evaluations', '/coach/players', '/coach/attendance', '/coach/programs', '/coach/messages', '/coach/profile', '/coach/route-that-must-404'];
const adminRoutes = ['/admin', '/admin/countries', '/admin/branches', '/admin/sports', '/admin/programs', '/admin/players', '/admin/parents', '/admin/coaches', '/admin/groups', '/admin/schedules', '/admin/attendance', '/admin/registrations', '/admin/performance', '/admin/achievements', '/admin/events', '/admin/subscriptions', '/admin/payments', '/admin/reports', '/admin/announcements', '/admin/messages', '/admin/content', '/admin/users', '/admin/settings', '/admin/audit-activity'];
const allRoutes = [...publicRoutes, ...playerRoutes, ...parentRoutes, ...coachRoutes, ...adminRoutes];

const viewportMatrix = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const responsiveRoutes = ['/', '/sports', '/player/login', '/player/home', '/parent', '/coach', '/admin', '/admin/players'];

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
  throw lastError ?? new Error(`Preview server did not become ready: ${baseURL}`);
}

function sessionBootstrap({ appearance = 'dark', rtl = false } = {}) {
  return ({ playerId, settingsKey, theme, forceRtl }) => {
    const authSession = {
      userId: `preview-user-${playerId}`,
      playerId,
      provider: 'preview',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('uos:player-portal:session', JSON.stringify(authSession));
    localStorage.setItem('uos:player-portal:active-id', playerId);
    localStorage.setItem('uos:player-portal:auth', 'true');
    localStorage.setItem(settingsKey, JSON.stringify({ appearance: theme, bilingualOrder: forceRtl ? 'ar-first' : 'en-first', density: 'comfortable', motion: 'reduced', fontScale: 'default', sidebarDefault: 'expanded' }));
    sessionStorage.setItem('uos:splash-seen', 'true');
    if (forceRtl) {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement?.setAttribute('dir', 'rtl');
      }, { once: true });
    }
  };
}

async function createCheckedPage(browser, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport ?? { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(sessionBootstrap(options), { playerId: previewPlayerId, settingsKey: uiSettingsKey, theme: options.appearance ?? 'dark', forceRtl: Boolean(options.rtl) });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  return { context, page, runtimeErrors };
}

async function assertRoute(page, runtimeErrors, route, checkOverflow = true) {
  runtimeErrors.length = 0;
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('#root', { state: 'attached', timeout: 10_000 });
  await page.waitForTimeout(120);
  if (response && response.status() >= 400) throw new Error(`${route}: HTTP ${response.status()}`);
  const state = await page.evaluate(() => ({
    rootText: document.querySelector('#root')?.textContent?.trim().length ?? 0,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  if (state.rootText < 8) throw new Error(`${route}: root rendered effectively empty`);
  if (checkOverflow && state.overflow > 2) throw new Error(`${route}: body horizontal overflow ${state.overflow}px`);
  if (runtimeErrors.length) throw new Error(`${route}: ${runtimeErrors.join(' | ')}`);
}

async function routeSweep(browserType, browserName) {
  const browser = await browserType.launch({ headless: true });
  try {
    const { context, page, runtimeErrors } = await createCheckedPage(browser);
    for (const route of allRoutes) await assertRoute(page, runtimeErrors, route, true);
    await context.close();
    console.log(`[browser] ${browserName}: ${allRoutes.length} routes passed`);
  } finally {
    await browser.close();
  }
}

async function responsiveSweep() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewportMatrix) {
      const { context, page, runtimeErrors } = await createCheckedPage(browser, { viewport });
      for (const route of responsiveRoutes) await assertRoute(page, runtimeErrors, route, true);
      await context.close();
      console.log(`[viewport] ${viewport.width}x${viewport.height}: ${responsiveRoutes.length} representative routes passed`);
    }
  } finally {
    await browser.close();
  }
}

async function themeAndRtlSweep() {
  const browser = await chromium.launch({ headless: true });
  const variants = [
    { appearance: 'light', rtl: false, label: 'light/LTR' },
    { appearance: 'dark', rtl: false, label: 'dark/LTR' },
    { appearance: 'light', rtl: true, label: 'light/RTL' },
    { appearance: 'dark', rtl: true, label: 'dark/RTL' },
  ];
  try {
    for (const variant of variants) {
      const { context, page, runtimeErrors } = await createCheckedPage(browser, { ...variant, viewport: { width: 390, height: 844 } });
      for (const route of ['/', '/player/home', '/parent', '/coach', '/admin']) await assertRoute(page, runtimeErrors, route, true);
      await context.close();
      console.log(`[theme] ${variant.label}: representative role routes passed`);
    }
  } finally {
    await browser.close();
  }
}

await waitForServer();
await routeSweep(chromium, 'Chromium');
await routeSweep(firefox, 'Firefox');
await routeSweep(webkit, 'WebKit');
await responsiveSweep();
await themeAndRtlSweep();
console.log('UOS interface smoke matrix passed.');
