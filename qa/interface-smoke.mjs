import { chromium, firefox, webkit } from 'playwright';

const baseURL = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const uiSettingsKey = 'uos:ui-settings:v1';
const previewPlayerId = 'player-demo-001';
const previewParentId = 'parent-preview-01';
const previewCoachId = 'coach-preview-01';

const publicRoutes = ['/', '/about', '/sports', '/sports/football', '/sports/swimming', '/sports/basketball', '/sports/tennis', '/sports/gymnastics', '/sports/martial-arts', '/programs', '/programs/football-foundations', '/coaches', '/coaches', '/contact', '/auth/callback', '/admin/login', '/store/login', '/route-that-must-404'];
const playerRoutes = ['/player', '/player/login', '/player/auth/phone', '/player/auth/verify', '/player/phone', '/player/otp', '/player/home', '/player/schedule', '/player/schedule/session-demo-001', '/player/session/session-demo-001', '/player/attendance', '/player/performance', '/player/achievements', '/player/feedback', '/player/subscription', '/player/payments', '/player/documents', '/player/messages', '/player/notifications', '/player/profile', '/player/settings', '/player/route-that-must-404'];
const parentRoutes = ['/parent', '/parent/login', '/parent/children', '/parent/children/player-demo-001', '/parent/schedule', '/parent/attendance', '/parent/performance', '/parent/feedback', '/parent/subscriptions', '/parent/payments', '/parent/documents', '/parent/messages', '/parent/notifications', '/parent/profile', '/parent/settings', '/parent/route-that-must-404'];
const coachRoutes = ['/coach', '/coach/login', '/coach/schedule', '/coach/groups', '/coach/groups/football-demo-u12', '/coach/evaluations', '/coach/players', '/coach/players/player-demo-001', '/coach/attendance', '/coach/programs', '/coach/messages', '/coach/profile', '/coach/route-that-must-404'];
const adminRoutes = [
  '/admin',
  '/admin/countries', '/admin/countries/country-workspace-01',
  '/admin/branches', '/admin/branches/branch-workspace-01', '/admin/branches/branch-workspace-01/overview',
  '/admin/sports', '/admin/sports/football', '/admin/sports/football/groups', '/admin/sports/football/groups/football-demo-u12',
  '/admin/programs', '/admin/programs/program-demo-football-foundation',
  '/admin/players', '/admin/players/player-demo-001',
  '/admin/parents', '/admin/parents/parent-preview-01',
  '/admin/coaches', '/admin/coaches/coach-preview-01',
  '/admin/groups',
  '/admin/schedules', '/admin/schedules/session-demo-001',
  '/admin/attendance',
  '/admin/registrations', '/admin/registrations/registration-preview-001',
  '/admin/performance',
  '/admin/achievements', '/admin/achievements/achievement-preview-001',
  '/admin/events', '/admin/events/event-preview-001',
  '/admin/subscriptions', '/admin/subscriptions/subscription-preview-001',
  '/admin/payments', '/admin/payments/payment-preview-001',
  '/admin/reports',
  '/admin/announcements', '/admin/announcements/announcement-preview-001',
  '/admin/messages', '/admin/messages/message-preview-001',
  '/admin/content', '/admin/content/content-preview-001',
  '/admin/users',
  '/admin/settings',
  '/admin/audit-activity',
];
const allRoutes = [...publicRoutes, ...playerRoutes, ...parentRoutes, ...coachRoutes, ...adminRoutes];
const intentionalPlayerLoginRedirects = new Set([
  '/player/auth/phone',
  '/player/auth/verify',
  '/player/phone',
  '/player/otp',
  '/player/verify',
]);

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
const responsiveRoutes = ['/', '/sports', '/programs', '/programs/football-foundations', '/auth/callback', '/admin/login', '/player/login', '/player/home', '/parent/login', '/parent', '/parent/children', '/parent/payments', '/coach', '/coach/players', '/admin', '/admin/branches', '/admin/players', '/admin/coaches', '/admin/sports'];

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

function sessionBootstrap() {
  return ({ playerId, parentId, coachId, settingsKey, theme, forceRtl }) => {
    const playerSession = {
      userId: `preview-user-${playerId}`,
      playerId,
      provider: 'preview',
      createdAt: new Date().toISOString(),
    };
    const parentSession = {
      parentId,
      provider: 'preview',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('uos:player-portal:session', JSON.stringify(playerSession));
    localStorage.setItem('uos:player-portal:active-id', playerId);
    localStorage.setItem('uos:player-portal:auth', 'true');
    localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify(parentSession));
    localStorage.removeItem('uos:coach-portal:auth');
    localStorage.removeItem('uos:coach-portal:active-id');
    localStorage.setItem(settingsKey, JSON.stringify({ appearance: theme, bilingualOrder: forceRtl ? 'ar-first' : 'en-first', density: 'comfortable', motion: 'reduced', fontScale: 'default', sidebarDefault: 'expanded' }));
    sessionStorage.setItem('uos:coach-portal:preview-session:v1', coachId);
    sessionStorage.setItem('uos:luxury-splash-seen', 'true');
    sessionStorage.setItem('uos:splash-seen', 'true');
    if (forceRtl) {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement?.setAttribute('dir', 'rtl');
      }, { once: true });
    }
  };
}

async function createCheckedContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport ?? { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(sessionBootstrap(), {
    playerId: options.playerId ?? previewPlayerId,
    parentId: options.parentId ?? previewParentId,
    coachId: options.coachId ?? previewCoachId,
    settingsKey: uiSettingsKey,
    theme: options.appearance ?? 'dark',
    forceRtl: Boolean(options.rtl),
  });
  return context;
}

async function createCheckedPageInContext(context) {
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    const text = message.text();
    const sourceUrl = message.location().url ?? '';
    const googleFontNetworkError =
      sourceUrl.includes('fonts.googleapis.com')
      || sourceUrl.includes('fonts.gstatic.com')
      || text.includes('https://fonts.googleapis.com/')
      || text.includes('https://fonts.gstatic.com/');
    const ignorableExternalFontFailure =
      message.type() === 'error'
      && googleFontNetworkError
      && (
        text.includes('downloadable font: download failed')
        || text.includes('Failed to preconnect')
        || text.includes('Failed to load resource: WebKit encountered an internal error')
      );

    if (message.type() === 'error' && !ignorableExternalFontFailure) {
      runtimeErrors.push(`console: ${text}`);
    }
  });
  return { page, runtimeErrors };
}

async function waitForRouteSettled(page, route) {
  await page.waitForTimeout(100);
  try {
    await page.locator('[data-route-loading="true"]').waitFor({ state: 'hidden', timeout: 10_000 });
  } catch {
    const stillLoading = await page.locator('[data-route-loading="true"]').count();
    if (stillLoading) throw new Error(`${route}: lazy route loader did not settle`);
  }

  try {
    await page.waitForFunction(
      () => (document.querySelector('#root')?.textContent?.trim().length ?? 0) >= 8,
      undefined,
      { timeout: 10_000 },
    );
  } catch {
    const rootText = await page.locator('#root').textContent().catch(() => '');
    throw new Error(`${route}: app root did not render meaningful content within 10s (length=${rootText?.trim().length ?? 0})`);
  }
}

async function assertRoute(page, runtimeErrors, route, checkOverflow = true) {
  runtimeErrors.length = 0;
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('#root', { state: 'attached', timeout: 10_000 });
  await waitForRouteSettled(page, route);
  if (response && response.status() >= 400) throw new Error(`${route}: HTTP ${response.status()}`);
  const state = await page.evaluate(() => ({
    rootText: document.querySelector('#root')?.textContent?.trim().length ?? 0,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    pathname: window.location.pathname,
    failedImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0 && Boolean(image.currentSrc || image.src))
      .map((image) => image.currentSrc || image.src),
  }));
  if (state.rootText < 8) throw new Error(`${route}: root rendered effectively empty`);
  if (checkOverflow && state.overflow > 2) throw new Error(`${route}: body horizontal overflow ${state.overflow}px`);
  if (state.failedImages.length) throw new Error(`${route}: broken image ${state.failedImages.join(' | ')}`);
  if (route.startsWith('/coach') && route !== '/coach/login' && state.pathname === '/coach/login') throw new Error(`${route}: unexpectedly redirected to coach login`);
  if (route.startsWith('/parent') && route !== '/parent/login' && state.pathname === '/parent/login') throw new Error(`${route}: unexpectedly redirected to parent login`);
  if (route.startsWith('/player') && !route.includes('/login') && !intentionalPlayerLoginRedirects.has(route) && state.pathname === '/player/login') throw new Error(`${route}: unexpectedly redirected to player login`);
  if (runtimeErrors.length) throw new Error(`${route}: ${runtimeErrors.join(' | ')}`);
  if (route === '/admin') await assertAdminVisualAuthority(page);
  if (['/admin/players','/admin/parents','/admin/coaches','/admin/sports','/admin/programs'].includes(route)) await assertAdminWorkspaceAuthority(page, route);
  if (/^\/(admin|player|parent|coach|store)(\/|$)/.test(route)) await assertInternalPortalVisualAuthority(page, route, state.pathname);
  return state;
}

async function assertInternalPortalVisualAuthority(page, route, pathname) {
  if (route === '/player/home') {
    await page.waitForSelector('#player-overview-page .cgpt-athlete-id', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('#player-overview-page .cgpt-player-stat', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/parent') {
    await page.waitForSelector('#parent-overview-page .parent-family-hero', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('#parent-overview-page .parent-athlete-card', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('#parent-overview-page .parent-athlete-signal', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/coach') {
    await page.waitForSelector('#coach-overview-page .coach-command-hero', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('#coach-overview-page .coach-athlete-card', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('#coach-overview-page .coach-athlete-signal', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/coach/schedule') {
    await page.waitForSelector('.portal-coach .schedule-toolbar', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('.portal-coach .schedule-week-view', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/coach/players') {
    await page.waitForSelector('.portal-coach .enterprise-toolbar', { state: 'visible', timeout: 10_000 });
    await page.waitForSelector('.portal-coach .enterprise-table-shell', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/coach/groups' || route === '/coach/evaluations' || route === '/coach/programs') {
    await page.waitForSelector('.portal-coach .portal-card', { state: 'visible', timeout: 10_000 });
  }
  if (route === '/parent/children' || route === '/parent/attendance' || route.startsWith('/parent/children/')) {
    await page.waitForSelector('.portal-parent .parent-field', { state: 'visible', timeout: 10_000 });
  }

  const proof = await page.evaluate(() => {
    const playerLogo = document.querySelector('#player-portal-shell .athlete-sidebar-logo');
    const sharedPortalLogo = document.querySelector('.portal-shell .portal-brand > img.official-logo.portal-brand-logo');
    const athleteId = document.querySelector('#player-overview-page .cgpt-athlete-id');
    const athleteStat = document.querySelector('#player-overview-page .cgpt-player-stat');
    const quickLinks = document.querySelectorAll('#player-overview-page .athlete-quick-link-card');
    const overviewTitle = document.querySelector('#player-overview-page .athlete-overview-title');
    const portalCard = document.querySelector('.portal-shell .bm-card');
    const parentHero = document.querySelector('#parent-overview-page .parent-family-hero');
    const parentAthleteCard = document.querySelector('#parent-overview-page .parent-athlete-card');
    const parentAthleteAction = document.querySelector('#parent-overview-page .parent-athlete-card__action');
    const parentField = document.querySelector('.portal-parent .parent-field');
    const parentPanel = document.querySelector('.portal-parent .parent-panel');
    const coachHero = document.querySelector('#coach-overview-page .coach-command-hero');
    const coachAthleteCard = document.querySelector('#coach-overview-page .coach-athlete-card');
    const coachAthleteAction = document.querySelector('#coach-overview-page .coach-athlete-card__action');
    const coachDesk = document.querySelector('#coach-overview-page .coach-today');
    const coachScheduleToolbar = document.querySelector('.portal-coach .schedule-toolbar');
    const coachScheduleWeek = document.querySelector('.portal-coach .schedule-week-view');
    const coachEnterpriseToolbar = document.querySelector('.portal-coach .enterprise-toolbar');
    const coachTableShell = document.querySelector('.portal-coach .enterprise-table-shell');
    const coachPortalCard = document.querySelector('.portal-coach .portal-card');
    return {
      splashCount: document.querySelectorAll('#olympic-luxury-splash-root').length,
      playerLogoCount: document.querySelectorAll('#player-portal-shell .athlete-sidebar-logo').length,
      playerExtraEmblemCount: document.querySelectorAll('#player-portal-shell .athlete-sidebar-portal-emblem').length,
      playerLogoObjectFit: playerLogo ? getComputedStyle(playerLogo).objectFit : null,
      sharedPortalLogoCount: document.querySelectorAll('.portal-shell .portal-brand > img').length,
      sharedPortalLogoObjectFit: sharedPortalLogo ? getComputedStyle(sharedPortalLogo).objectFit : null,
      authLogoCount: document.querySelectorAll('.portal-auth .portal-auth-home > img').length,
      athleteIdDisplay: athleteId ? getComputedStyle(athleteId).display : null,
      athleteIdRadius: athleteId ? parseFloat(getComputedStyle(athleteId).borderTopLeftRadius) : null,
      athleteStatBackground: athleteStat ? getComputedStyle(athleteStat).backgroundImage : null,
      quickLinkCount: quickLinks.length,
      overviewTitleFont: overviewTitle ? getComputedStyle(overviewTitle).fontFamily : null,
      portalCardRadius: portalCard ? parseFloat(getComputedStyle(portalCard).borderTopLeftRadius) : null,
      portalCardBackground: portalCard ? getComputedStyle(portalCard).backgroundImage : null,
      parentHeroRadius: parentHero ? parseFloat(getComputedStyle(parentHero).borderTopLeftRadius) : null,
      parentHeroBackground: parentHero ? getComputedStyle(parentHero).backgroundImage : null,
      parentAthleteCount: document.querySelectorAll('#parent-overview-page .parent-athlete-card').length,
      parentAthleteBackground: parentAthleteCard ? getComputedStyle(parentAthleteCard).backgroundImage : null,
      parentAthleteActionHeight: parentAthleteAction ? parseFloat(getComputedStyle(parentAthleteAction).minHeight) : null,
      parentSignalCount: document.querySelectorAll('#parent-overview-page .parent-athlete-signal').length,
      parentFieldMinHeight: parentField ? parseFloat(getComputedStyle(parentField).minHeight) : null,
      parentFieldBackground: parentField ? getComputedStyle(parentField).backgroundImage : null,
      parentPanelRadius: parentPanel ? parseFloat(getComputedStyle(parentPanel).borderTopLeftRadius) : null,
      coachHeroRadius: coachHero ? parseFloat(getComputedStyle(coachHero).borderTopLeftRadius) : null,
      coachHeroBackground: coachHero ? getComputedStyle(coachHero).backgroundImage : null,
      coachAthleteCount: document.querySelectorAll('#coach-overview-page .coach-athlete-card').length,
      coachAthleteBackground: coachAthleteCard ? getComputedStyle(coachAthleteCard).backgroundImage : null,
      coachAthleteActionHeight: coachAthleteAction ? parseFloat(getComputedStyle(coachAthleteAction).minHeight) : null,
      coachSignalCount: document.querySelectorAll('#coach-overview-page .coach-athlete-signal').length,
      coachDeskRadius: coachDesk ? parseFloat(getComputedStyle(coachDesk).borderTopLeftRadius) : null,
      coachDeskBackground: coachDesk ? getComputedStyle(coachDesk).backgroundImage : null,
      coachScheduleToolbarRadius: coachScheduleToolbar ? parseFloat(getComputedStyle(coachScheduleToolbar).borderTopLeftRadius) : null,
      coachScheduleWeekRadius: coachScheduleWeek ? parseFloat(getComputedStyle(coachScheduleWeek).borderTopLeftRadius) : null,
      coachScheduleWeekBackground: coachScheduleWeek ? getComputedStyle(coachScheduleWeek).backgroundImage : null,
      coachEnterpriseToolbarRadius: coachEnterpriseToolbar ? parseFloat(getComputedStyle(coachEnterpriseToolbar).borderTopLeftRadius) : null,
      coachTableRadius: coachTableShell ? parseFloat(getComputedStyle(coachTableShell).borderTopLeftRadius) : null,
      coachPortalCardRadius: coachPortalCard ? parseFloat(getComputedStyle(coachPortalCard).borderTopLeftRadius) : null,
      coachPortalCardBackground: coachPortalCard ? getComputedStyle(coachPortalCard).backgroundImage : null,
    };
  });

  if (proof.splashCount !== 0) {
    throw new Error(`${route}: internal product route must never be blocked by the public luxury splash`);
  }

  if (pathname.startsWith('/player') && !pathname.endsWith('/login')) {
    if (proof.playerLogoCount !== 1 || proof.playerExtraEmblemCount !== 0) {
      throw new Error(`${route}: player shell must render exactly one canonical logo; logo=${proof.playerLogoCount}, extraEmblem=${proof.playerExtraEmblemCount}`);
    }
    if (proof.playerLogoObjectFit !== 'cover') {
      throw new Error(`${route}: player sidebar logo must crop the composite brand lockup to one emblem; object-fit=${proof.playerLogoObjectFit}`);
    }
  }

  if (route === '/player/home') {
    if (proof.athleteIdDisplay !== 'grid' || !(proof.athleteIdRadius >= 20)) {
      throw new Error(`${route}: athlete identity must render as a sports card grid with >=20px radius; display=${proof.athleteIdDisplay}, radius=${proof.athleteIdRadius}`);
    }
    if (!proof.athleteStatBackground || proof.athleteStatBackground === 'none') {
      throw new Error(`${route}: athlete stat cards must have a real athletic surface`);
    }
    if (proof.quickLinkCount < 4) {
      throw new Error(`${route}: expected four semantic athletic quick-link cards; got ${proof.quickLinkCount}`);
    }
    if (!proof.overviewTitleFont || !/(Outfit|Segoe UI)/i.test(proof.overviewTitleFont)) {
      throw new Error(`${route}: athlete overview title must use the athletic display font stack; got ${proof.overviewTitleFont}`);
    }
  }

  if (route === '/parent') {
    if (!(proof.parentHeroRadius >= 20) || !proof.parentHeroBackground || proof.parentHeroBackground === 'none') {
      throw new Error(`${route}: family hero must use the Parent athletic authority; radius=${proof.parentHeroRadius}, background=${proof.parentHeroBackground}`);
    }
    if (proof.parentAthleteCount < 1 || !proof.parentAthleteBackground || proof.parentAthleteBackground === 'none') {
      throw new Error(`${route}: expected at least one rendered sports athlete card; count=${proof.parentAthleteCount}, background=${proof.parentAthleteBackground}`);
    }
    if (proof.parentSignalCount < 4 || !(proof.parentAthleteActionHeight >= 40)) {
      throw new Error(`${route}: athlete cards must expose four sports signals and a full action control; signals=${proof.parentSignalCount}, actionMinHeight=${proof.parentAthleteActionHeight}`);
    }
  }

  if ((route === '/parent/children' || route === '/parent/attendance' || route.startsWith('/parent/children/'))) {
    if (!(proof.parentFieldMinHeight >= 68) || !proof.parentFieldBackground || proof.parentFieldBackground === 'none') {
      throw new Error(`${route}: Parent record fields must use the athletic field surface; minHeight=${proof.parentFieldMinHeight}, background=${proof.parentFieldBackground}`);
    }
    if (proof.parentPanelRadius !== null && proof.parentPanelRadius < 18) {
      throw new Error(`${route}: Parent panels must keep the athletic rounded hierarchy; radius=${proof.parentPanelRadius}`);
    }
  }

  if (route === '/coach') {
    if (!(proof.coachHeroRadius >= 24) || !proof.coachHeroBackground || proof.coachHeroBackground === 'none') {
      throw new Error(`${route}: Training Command hero must use the Coach athletic authority; radius=${proof.coachHeroRadius}, background=${proof.coachHeroBackground}`);
    }
    if (proof.coachAthleteCount < 1 || !proof.coachAthleteBackground || proof.coachAthleteBackground === 'none') {
      throw new Error(`${route}: expected at least one Coach athlete roster card; count=${proof.coachAthleteCount}, background=${proof.coachAthleteBackground}`);
    }
    if (proof.coachSignalCount < 4 || !(proof.coachAthleteActionHeight >= 40)) {
      throw new Error(`${route}: Coach athlete cards must expose four signals and a full action control; signals=${proof.coachSignalCount}, actionMinHeight=${proof.coachAthleteActionHeight}`);
    }
    if (!(proof.coachDeskRadius >= 18) || !proof.coachDeskBackground || proof.coachDeskBackground === 'none') {
      throw new Error(`${route}: Coach Today Desk must use the athletic desk surface; radius=${proof.coachDeskRadius}, background=${proof.coachDeskBackground}`);
    }
  }

  if (route === '/coach/schedule') {
    if (!(proof.coachScheduleToolbarRadius >= 14) || !(proof.coachScheduleWeekRadius >= 18) || !proof.coachScheduleWeekBackground || proof.coachScheduleWeekBackground === 'none') {
      throw new Error(`${route}: Coach schedule must use the athletic toolbar/week surface; toolbarRadius=${proof.coachScheduleToolbarRadius}, weekRadius=${proof.coachScheduleWeekRadius}, background=${proof.coachScheduleWeekBackground}`);
    }
  }

  if (route === '/coach/players') {
    if (!(proof.coachEnterpriseToolbarRadius >= 16) || !(proof.coachTableRadius >= 16)) {
      throw new Error(`${route}: Coach roster filters/table must use the athletic hierarchy; toolbarRadius=${proof.coachEnterpriseToolbarRadius}, tableRadius=${proof.coachTableRadius}`);
    }
  }

  if (route === '/coach/groups' || route === '/coach/evaluations' || route === '/coach/programs') {
    if (!(proof.coachPortalCardRadius >= 16) || !proof.coachPortalCardBackground || proof.coachPortalCardBackground === 'none') {
      throw new Error(`${route}: Coach portal cards must use the dedicated athletic surface; radius=${proof.coachPortalCardRadius}, background=${proof.coachPortalCardBackground}`);
    }
  }

  if ((pathname.startsWith('/parent') || pathname.startsWith('/coach')) && !pathname.endsWith('/login')) {
    if (proof.sharedPortalLogoCount !== 1) {
      throw new Error(`${route}: shared portal shell must render exactly one canonical logo; got ${proof.sharedPortalLogoCount}`);
    }
    if (proof.sharedPortalLogoObjectFit !== 'cover') {
      throw new Error(`${route}: shared portal sidebar must crop the composite lockup to one visible emblem; object-fit=${proof.sharedPortalLogoObjectFit}`);
    }
  }

  if (pathname.endsWith('/login') && proof.authLogoCount > 1) {
    throw new Error(`${route}: authentication header must not duplicate the canonical logo; got ${proof.authLogoCount}`);
  }
}

async function assertAdminVisualAuthority(page) {
  await page.waitForSelector('#admin-command-page .admin-command-hero', { state: 'visible', timeout: 10_000 });
  await page.waitForSelector('#admin-command-page .admin-command-metric', { state: 'visible', timeout: 10_000 });
  await page.waitForSelector('#admin-command-page .admin-operation-card', { state: 'visible', timeout: 10_000 });

  const proof = await page.evaluate(() => {
    const brand = document.querySelector('.admin-brand');
    const brandImages = brand ? [...brand.querySelectorAll(':scope > img')] : [];
    const canonicalLogoCount = brandImages.filter((image) =>
      (image.getAttribute('src') ?? '').includes('/brand/united-olympics-sports-logo.png')
    ).length;
    const brandLogo = document.querySelector('.admin-brand > img.official-logo.admin-brand-logo');
    const hero = document.querySelector('#admin-command-page .admin-command-hero');
    const heroLogo = document.querySelector('#admin-command-page .admin-command-logo');
    const stat = document.querySelector('#admin-command-page .admin-stat-card');
    const operation = document.querySelector('#admin-command-page .admin-operation-card');
    const activity = document.querySelector('#admin-command-page .admin-activity-command');

    return {
      totalBrandImages: brandImages.length,
      canonicalLogoCount,
      brandLogoObjectFit: brandLogo ? getComputedStyle(brandLogo).objectFit : null,
      heroRadius: hero ? parseFloat(getComputedStyle(hero).borderTopLeftRadius) : null,
      heroBackground: hero ? getComputedStyle(hero).backgroundImage : null,
      heroLogoObjectFit: heroLogo ? getComputedStyle(heroLogo).objectFit : null,
      commandMetricCount: document.querySelectorAll('#admin-command-page .admin-command-metric').length,
      operationCount: document.querySelectorAll('#admin-command-page .admin-operation-card').length,
      statRadius: stat ? parseFloat(getComputedStyle(stat).borderTopLeftRadius) : null,
      statBackground: stat ? getComputedStyle(stat).backgroundImage : null,
      operationRadius: operation ? parseFloat(getComputedStyle(operation).borderTopLeftRadius) : null,
      operationBackground: operation ? getComputedStyle(operation).backgroundImage : null,
      activityRadius: activity ? parseFloat(getComputedStyle(activity).borderTopLeftRadius) : null,
      activityBackground: activity ? getComputedStyle(activity).backgroundImage : null,
    };
  });

  if (proof.totalBrandImages !== 1 || proof.canonicalLogoCount !== 1) {
    throw new Error(`/admin: expected exactly one canonical sidebar logo, got ${proof.totalBrandImages} brand images / ${proof.canonicalLogoCount} canonical`);
  }
  if (proof.brandLogoObjectFit !== 'cover') {
    throw new Error(`/admin: sidebar must crop the composite brand lockup to one visible emblem; object-fit=${proof.brandLogoObjectFit}`);
  }
  if (!(proof.heroRadius >= 24) || !proof.heroBackground || proof.heroBackground === 'none') {
    throw new Error(`/admin: Operations Command hero must use the athletic authority; radius=${proof.heroRadius}, background=${proof.heroBackground}`);
  }
  if (proof.heroLogoObjectFit !== 'cover') {
    throw new Error(`/admin: command hero brand mark must use the single-emblem crop; object-fit=${proof.heroLogoObjectFit}`);
  }
  if (proof.commandMetricCount !== 4) {
    throw new Error(`/admin: expected four command metrics; got ${proof.commandMetricCount}`);
  }
  if (proof.operationCount < 7) {
    throw new Error(`/admin: expected at least seven operational action cards; got ${proof.operationCount}`);
  }
  if (!(proof.statRadius >= 18) || !proof.statBackground || proof.statBackground === 'none') {
    throw new Error(`/admin: KPI cards must use the Admin athletic surface; radius=${proof.statRadius}, background=${proof.statBackground}`);
  }
  if (!(proof.operationRadius >= 14) || !proof.operationBackground || proof.operationBackground === 'none') {
    throw new Error(`/admin: operation cards must use the Admin athletic surface; radius=${proof.operationRadius}, background=${proof.operationBackground}`);
  }
  if (!(proof.activityRadius >= 20) || !proof.activityBackground || proof.activityBackground === 'none') {
    throw new Error(`/admin: recent activity must use the Admin command surface; radius=${proof.activityRadius}, background=${proof.activityBackground}`);
  }
}


async function assertAdminWorkspaceAuthority(page, route) {
  const directoryRoute = ['/admin/players', '/admin/parents', '/admin/coaches'].includes(route);
  const organizationRoute = ['/admin/sports', '/admin/programs'].includes(route);

  await page.waitForSelector('.admin-shell .enterprise-toolbar', { state: 'visible', timeout: 10_000 });
  if (directoryRoute) {
    await page.waitForSelector('.admin-shell .directory-card', { state: 'visible', timeout: 10_000 });
  }
  if (organizationRoute) {
    await page.waitForSelector('.admin-shell .organization-card', { state: 'visible', timeout: 10_000 });
  }

  const proof = await page.evaluate(({ directoryRoute, organizationRoute }) => {
    const toolbar = document.querySelector('.admin-shell .enterprise-toolbar');
    const directoryCard = directoryRoute ? document.querySelector('.admin-shell .directory-card') : null;
    const organizationCard = organizationRoute ? document.querySelector('.admin-shell .organization-card') : null;
    return {
      toolbarRadius: toolbar ? parseFloat(getComputedStyle(toolbar).borderTopLeftRadius) : null,
      toolbarBackground: toolbar ? getComputedStyle(toolbar).backgroundImage : null,
      directoryRadius: directoryCard ? parseFloat(getComputedStyle(directoryCard).borderTopLeftRadius) : null,
      directoryBackground: directoryCard ? getComputedStyle(directoryCard).backgroundImage : null,
      organizationRadius: organizationCard ? parseFloat(getComputedStyle(organizationCard).borderTopLeftRadius) : null,
      organizationBackground: organizationCard ? getComputedStyle(organizationCard).backgroundImage : null,
    };
  }, { directoryRoute, organizationRoute });

  if (!(proof.toolbarRadius >= 16) || !proof.toolbarBackground || proof.toolbarBackground === 'none') {
    throw new Error(`${route}: Admin toolbar must use the athletic command surface; radius=${proof.toolbarRadius}, background=${proof.toolbarBackground}`);
  }

  if (directoryRoute && (!(proof.directoryRadius >= 18) || !proof.directoryBackground || proof.directoryBackground === 'none')) {
    throw new Error(`${route}: Admin directory cards must use the athletic surface; radius=${proof.directoryRadius}, background=${proof.directoryBackground}`);
  }

  if (organizationRoute && (!(proof.organizationRadius >= 18) || !proof.organizationBackground || proof.organizationBackground === 'none')) {
    throw new Error(`${route}: Admin organization cards must use the athletic surface; radius=${proof.organizationRadius}, background=${proof.organizationBackground}`);
  }
}

function isTransientRouteSweepError(error, browserName) {
  const message = error instanceof Error ? error.message : String(error);
  const transientWebKitNavigationError =
    browserName === 'WebKit'
    && (
      message.includes('WebKit encountered an internal error')
      || message.includes('Target page, context or browser has been closed')
      || message.includes('Importing a module script failed')
    );
  const transientFirefoxImageDecodeError =
    browserName === 'Firefox'
    && message.includes('Image corrupt or truncated.')
    && message.includes('/brand/portals/');
  return transientWebKitNavigationError || transientFirefoxImageDecodeError;
}

async function runRouteSweep(browserType, browserName) {
  let browser = await browserType.launch({ headless: true });
  let context = await createCheckedContext(browser);

  try {
    for (const route of allRoutes) {
      let page;
      try {
        let runtimeErrors;
        ({ page, runtimeErrors } = await createCheckedPageInContext(context));
        await assertRoute(page, runtimeErrors, route);
      } catch (error) {
        if (!isTransientRouteSweepError(error, browserName)) throw error;

        console.warn(`${browserName}: retrying transient route failure once for ${route}: ${error instanceof Error ? error.message : String(error)}`);
        await page?.close().catch(() => undefined);
        await context.close().catch(() => undefined);
        await browser.close().catch(() => undefined);

        browser = await browserType.launch({ headless: true });
        context = await createCheckedContext(browser);
        const retry = await createCheckedPageInContext(context);
        page = retry.page;
        await assertRoute(page, retry.runtimeErrors, route);
      } finally {
        await page?.close().catch(() => undefined);
      }
    }
  } finally {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

async function runResponsiveSweep() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewportMatrix) {
      const context = await createCheckedContext(browser, { viewport });
      try {
        for (const route of responsiveRoutes) {
          const { page, runtimeErrors } = await createCheckedPageInContext(context);
          try {
            await assertRoute(page, runtimeErrors, route);
          } finally {
            await page.close().catch(() => undefined);
          }
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

await waitForServer();
await runRouteSweep(chromium, 'Chromium');
await runRouteSweep(firefox, 'Firefox');
await runRouteSweep(webkit, 'WebKit');
await runResponsiveSweep();

console.log(`Interface smoke passed for ${allRoutes.length} routes across Chromium, Firefox, WebKit and ${viewportMatrix.length} responsive viewports.`);
