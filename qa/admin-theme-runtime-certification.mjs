import { chromium, firefox, webkit } from 'playwright';

const base = process.env.UOS_BASE_URL || 'http://127.0.0.1:4173';
const settingsKey = 'uos:ui-settings:v1';

const routes = [
  '/admin','/admin/countries','/admin/branches','/admin/sports','/admin/programs','/admin/groups','/admin/players','/admin/parents','/admin/coaches','/admin/schedules','/admin/attendance','/admin/performance','/admin/registrations','/admin/achievements','/admin/events','/admin/subscriptions','/admin/payments','/admin/reports','/admin/announcements','/admin/messages','/admin/content','/admin/users','/admin/settings','/admin/integrations','/admin/audit-activity','/admin/store','/admin/store/orders','/admin/store/products','/admin/store/categories','/admin/store/inventory','/admin/store/collections','/admin/store/discounts','/admin/store/settings'
];

const gotoAdmin = async (page, path) => {
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  if (page.url().includes('/admin/login')) throw new Error(`Admin preview gate redirected ${path} to login`);
  if (!(await page.locator('body').innerText()).trim()) throw new Error(`Blank admin route ${path}`);
};

async function verifySettingsPersistence() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await gotoAdmin(page, '/admin/settings');
  const night = page.getByRole('button', { name: /Night Mode/i }).first();
  if (await night.count() !== 1) throw new Error('Settings Night Mode control is missing');
  await night.click();
  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).appearance === 'dark' : false;
  }, settingsKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  const state = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    appearance: document.documentElement.dataset.appearance,
    darkClass: document.documentElement.classList.contains('dark'),
  }));
  if (state.theme !== 'dark' || state.appearance !== 'dark' || !state.darkClass) {
    throw new Error(`Settings persistence mismatch: ${JSON.stringify(state)}`);
  }
  await browser.close();
  console.log('Admin Settings persistence certification passed.');
}

async function runMatrix(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  let cases = 0;
  for (const width of [390, 1440]) {
    for (const theme of ['light', 'dark']) {
      for (const dir of ['ltr', 'rtl']) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(({ theme, dir, settingsKey }) => {
          localStorage.setItem(settingsKey, JSON.stringify({
            appearance: theme,
            bilingualOrder: dir === 'rtl' ? 'ar-first' : 'en-first',
            density: 'comfortable',
            motion: 'system',
            fontScale: 'default',
            sidebarDefault: 'expanded',
          }));
        }, { theme, dir, settingsKey });
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        for (const route of routes) {
          pageErrors.length = 0;
          await gotoAdmin(page, route);
          await page.waitForTimeout(50);
          if (pageErrors.length) throw new Error(`Page error ${name} ${width} ${theme} ${dir} ${route}: ${pageErrors.join('; ')}`);

          const state = await page.evaluate(() => ({
            dir: document.documentElement.dir,
            theme: document.documentElement.dataset.theme,
            appearance: document.documentElement.dataset.appearance,
            order: document.documentElement.dataset.bilingualOrder,
            darkClass: document.documentElement.classList.contains('dark'),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
          }));
          const expectedOrder = dir === 'rtl' ? 'ar-first' : 'en-first';
          if (state.dir !== dir) throw new Error(`Direction mismatch ${name} ${width} ${theme} ${dir} ${route}: ${state.dir}`);
          if (state.theme !== theme || state.appearance !== theme) throw new Error(`Theme mismatch ${name} ${width} ${theme} ${dir} ${route}: ${JSON.stringify(state)}`);
          if (state.order !== expectedOrder) throw new Error(`Bilingual order mismatch ${name} ${width} ${theme} ${dir} ${route}: ${state.order}`);
          if (state.darkClass !== (theme === 'dark')) throw new Error(`Dark-class mismatch ${name} ${width} ${theme} ${dir} ${route}`);
          if (state.overflow) throw new Error(`Horizontal overflow ${name} ${width} ${theme} ${dir} ${route}`);
          cases += 1;
        }
        await context.close();
      }
    }
  }
  await browser.close();
  console.log(`${name}: ${cases} strict responsive/theme/direction/runtime cases passed.`);
  return cases;
}

await verifySettingsPersistence();
let total = 0;
total += await runMatrix(chromium, 'Chromium');
total += await runMatrix(firefox, 'Firefox');
total += await runMatrix(webkit, 'WebKit');
console.log(`Admin strict theme/direction/runtime certification passed: ${total} route cases.`);
