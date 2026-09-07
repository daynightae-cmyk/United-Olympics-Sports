import { chromium, firefox, webkit } from 'playwright';

const base = process.env.UOS_BASE_URL || 'http://127.0.0.1:4173';
const storeKey = 'uos-admin-preview-data-v1';
const settingsKey = 'uos-ui-settings-v1';
const stamp = Date.now().toString(36);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const readStore = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), storeKey);
const waitStore = async (page, predicate, label, timeout = 8000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await readStore(page);
    const result = predicate(value);
    if (result) return result;
    await sleep(80);
  }
  throw new Error(`Timed out waiting for Preview store: ${label}`);
};
const selectFirstReal = async (locator) => {
  const values = await locator.locator('option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
  if (!values.length) throw new Error('Select has no usable option');
  await locator.selectOption(values[0]);
  return values[0];
};
const gotoAdmin = async (page, path) => {
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  if (page.url().includes('/admin/login')) throw new Error(`Admin preview gate redirected ${path} to login`);
  const body = await page.locator('body').innerText();
  if (!body.trim()) throw new Error(`Blank admin route ${path}`);
};

async function runCrudPersistence() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  // Group: create -> reload -> update -> reload -> delete.
  const groupName = `QA Group ${stamp}`;
  await gotoAdmin(page, '/admin/groups');
  await page.getByRole('button', { name: /Add Group/i }).click();
  let section = page.locator('section[aria-label="Create training group"]');
  await section.locator('input').nth(0).fill(groupName);
  await section.locator('input').nth(1).fill(`مجموعة اختبار ${stamp}`);
  await selectFirstReal(section.locator('select').nth(0));
  await section.locator('input').nth(2).fill('U14');
  await section.locator('input').nth(3).fill('تحت 14');
  await section.locator('input').nth(4).fill('QA Level');
  await section.locator('input').nth(5).fill('مستوى اختبار');
  await section.getByRole('button', { name: /Save Group/i }).click();
  const group = await waitStore(page, (s) => s.groups?.find((x) => x.name?.en === groupName), 'group create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/sports/${group.sportId}/groups/${group.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/sports/${group.sportId}/groups/${group.id}`);
  await page.getByRole('button', { name: /Deactivate/i }).click();
  await waitStore(page, (s) => s.groups?.find((x) => x.id === group.id)?.status === 'inactive', 'group update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Archive Group/i }).click();
  await waitStore(page, (s) => !s.groups?.some((x) => x.id === group.id), 'group delete');

  // Player.
  const playerName = `QA Player ${stamp}`;
  await gotoAdmin(page, '/admin/players');
  await page.getByRole('button', { name: /Add Player/i }).click();
  let dialog = page.getByRole('dialog').last();
  await dialog.locator('input').nth(0).fill(playerName);
  await dialog.locator('input').nth(1).fill(`لاعب اختبار ${stamp}`);
  await dialog.getByRole('button', { name: /Continue/i }).click();
  await selectFirstReal(dialog.locator('select').nth(0));
  await dialog.getByRole('button', { name: /Continue/i }).click();
  await dialog.getByRole('button', { name: /Save Player/i }).click();
  const player = await waitStore(page, (s) => s.players?.find((x) => x.nameEn === playerName), 'player create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/players/${player.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/players/${player.id}`);
  await page.getByRole('button', { name: /Deactivate/i }).click();
  await waitStore(page, (s) => s.players?.find((x) => x.id === player.id)?.status?.en === 'Inactive', 'player update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.players?.some((x) => x.id === player.id), 'player delete');

  // Coach.
  const coachName = `QA Coach ${stamp}`;
  await gotoAdmin(page, '/admin/coaches');
  await page.getByRole('button', { name: /Add Coach/i }).click();
  section = page.locator('section[aria-label="Create coach"]');
  await section.locator('input').nth(0).fill(coachName);
  await section.locator('input').nth(1).fill(`مدرب اختبار ${stamp}`);
  await selectFirstReal(section.locator('select').nth(0));
  await section.getByRole('button', { name: /Save Coach/i }).click();
  const coach = await waitStore(page, (s) => s.coaches?.find((x) => x.nameEn === coachName), 'coach create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/coaches/${coach.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/coaches/${coach.id}`);
  await page.getByRole('button', { name: /Deactivate/i }).click();
  await waitStore(page, (s) => s.coaches?.find((x) => x.id === coach.id)?.status === 'inactive', 'coach update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.coaches?.some((x) => x.id === coach.id), 'coach delete');

  // Parent.
  const parentName = `QA Parent ${stamp}`;
  await gotoAdmin(page, '/admin/parents');
  await page.getByRole('button', { name: /Add Parent/i }).click();
  section = page.locator('section[aria-label="Create parent"]');
  await section.locator('input').nth(0).fill(parentName);
  await section.locator('input').nth(1).fill(`ولي اختبار ${stamp}`);
  await section.getByRole('button', { name: /Save Parent/i }).click();
  const parent = await waitStore(page, (s) => s.parents?.find((x) => x.nameEn === parentName), 'parent create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/parents/${parent.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/parents/${parent.id}`);
  await page.getByRole('button', { name: /Deactivate/i }).click();
  await waitStore(page, (s) => s.parents?.find((x) => x.id === parent.id)?.status === 'inactive', 'parent update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.parents?.some((x) => x.id === parent.id), 'parent delete');

  // Session.
  await gotoAdmin(page, '/admin/schedules');
  await page.getByRole('button', { name: /Add Session/i }).click();
  section = page.locator('section[aria-label="Create session"]');
  await selectFirstReal(section.locator('select').nth(0));
  await page.waitForTimeout(100);
  await selectFirstReal(section.locator('select').nth(1));
  await section.locator('input[type="datetime-local"]').fill('2030-01-14T10:30');
  await section.getByRole('button', { name: /Save Session/i }).click();
  const session = await waitStore(page, (s) => [...(s.sessions || [])].reverse().find((x) => x.startsAt?.startsWith('2030-01-14')), 'session create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/schedules/${session.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/schedules/${session.id}`);
  await page.getByRole('button', { name: /Cancel Session/i }).click();
  await waitStore(page, (s) => s.sessions?.find((x) => x.id === session.id)?.status?.en === 'Cancelled', 'session update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.sessions?.some((x) => x.id === session.id), 'session delete');

  // Subscription.
  const planName = `QA Plan ${stamp}`;
  await gotoAdmin(page, '/admin/subscriptions');
  await page.getByRole('button', { name: /Add Subscription/i }).click();
  section = page.locator('section[aria-label="Create subscription"]');
  await selectFirstReal(section.locator('select').nth(0));
  await selectFirstReal(section.locator('select').nth(1));
  await selectFirstReal(section.locator('select').nth(2));
  const subInputs = section.locator('input');
  await subInputs.nth(0).fill(planName);
  await subInputs.nth(1).fill(`خطة اختبار ${stamp}`);
  await subInputs.nth(2).fill('2030-01-01');
  await subInputs.nth(4).fill('321.45');
  await section.getByRole('button', { name: /Save Subscription/i }).click();
  const subscription = await waitStore(page, (s) => s.subscriptions?.find((x) => x.plan?.en === planName), 'subscription create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/subscriptions/${subscription.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/subscriptions/${subscription.id}`);
  await page.getByRole('button', { name: /^active/i }).click();
  await waitStore(page, (s) => s.subscriptions?.find((x) => x.id === subscription.id)?.status === 'active', 'subscription update');

  // Payment linked to created subscription.
  const reference = `QA-REF-${stamp}`;
  await gotoAdmin(page, '/admin/payments');
  await page.getByRole('button', { name: /Add Payment Record/i }).click();
  section = page.locator('section[aria-label="Create payment record"]');
  await section.locator('select').nth(0).selectOption(subscription.id);
  const payInputs = section.locator('input');
  await payInputs.nth(0).fill('123.45');
  await payInputs.nth(2).fill('2030-01-15');
  await payInputs.nth(3).fill(reference);
  await section.getByRole('button', { name: /Save Payment Record/i }).click();
  const payment = await waitStore(page, (s) => s.payments?.find((x) => x.reference === reference), 'payment create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/payments/${payment.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/payments/${payment.id}`);
  await page.getByRole('button', { name: /^completed/i }).click();
  await waitStore(page, (s) => s.payments?.find((x) => x.id === payment.id)?.status === 'completed', 'payment update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.payments?.some((x) => x.id === payment.id), 'payment delete');
  await gotoAdmin(page, `/admin/subscriptions/${subscription.id}`);
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.subscriptions?.some((x) => x.id === subscription.id), 'subscription delete');

  // Content.
  const contentTitle = `QA Content ${stamp}`;
  await gotoAdmin(page, '/admin/content');
  await page.getByRole('button', { name: /Add Content/i }).click();
  section = page.locator('section[aria-label="Create content"]');
  const contentInputs = section.locator('input');
  await contentInputs.nth(0).fill(contentTitle);
  await contentInputs.nth(1).fill(`محتوى اختبار ${stamp}`);
  await contentInputs.nth(2).fill('Article');
  await contentInputs.nth(3).fill('مقال');
  await section.getByRole('button', { name: /Save Content/i }).click();
  const content = await waitStore(page, (s) => s.content?.find((x) => x.title?.en === contentTitle), 'content create');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(`a[href="/admin/content/${content.id}"]`).first().waitFor();
  await gotoAdmin(page, `/admin/content/${content.id}`);
  await page.getByRole('button', { name: /^published/i }).click();
  await waitStore(page, (s) => s.content?.find((x) => x.id === content.id)?.status === 'published', 'content update');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Delete/i }).click();
  await waitStore(page, (s) => !s.content?.some((x) => x.id === content.id), 'content delete');

  // Reports generate + reload persistence.
  await gotoAdmin(page, '/admin/reports');
  const reportsBefore = (await readStore(page)).reports?.length || 0;
  await page.getByRole('button', { name: /Generate Preview Report/i }).click();
  const generated = await waitStore(page, (s) => (s.reports?.length || 0) > reportsBefore ? s.reports.at(-1) : null, 'report generate');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText(generated.id, { exact: true }).waitFor();

  // Settings persistence.
  await gotoAdmin(page, '/admin/settings');
  const darkButton = page.getByRole('button', { name: /Dark/i }).first();
  if (await darkButton.count()) {
    await darkButton.click();
    await waitStoreSetting(page, (s) => s.appearance === 'dark', 'settings appearance');
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  // Integrations truthfulness.
  await gotoAdmin(page, '/admin/integrations');
  const integrationsBody = await page.locator('body').innerText();
  if (!integrationsBody.includes('Service API not verified')) throw new Error('Integrations page does not disclose unverified service APIs');

  await browser.close();
  console.log('Admin critical CRUD/update/delete/reload QA passed.');
}

async function waitStoreSetting(page, predicate, label, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const settings = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), settingsKey);
    if (predicate(settings)) return settings;
    await sleep(80);
  }
  throw new Error(`Timed out waiting for settings persistence: ${label}`);
}

const routes = [
  '/admin','/admin/countries','/admin/branches','/admin/sports','/admin/programs','/admin/groups','/admin/players','/admin/parents','/admin/coaches','/admin/schedules','/admin/attendance','/admin/performance','/admin/registrations','/admin/achievements','/admin/events','/admin/subscriptions','/admin/payments','/admin/reports','/admin/announcements','/admin/messages','/admin/content','/admin/users','/admin/settings','/admin/integrations','/admin/audit-activity','/admin/store','/admin/store/orders','/admin/store/products','/admin/store/categories','/admin/store/inventory','/admin/store/collections','/admin/store/discounts','/admin/store/settings'
];

async function runMatrix(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  let cases = 0;
  for (const width of [390, 1440]) {
    for (const theme of ['light', 'dark']) {
      for (const dir of ['ltr', 'rtl']) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(({ theme, dir, settingsKey }) => {
          localStorage.setItem(settingsKey, JSON.stringify({ appearance: theme, bilingualOrder: dir === 'rtl' ? 'ar-first' : 'en-first', density: 'comfortable', fontScale: 'md', motion: 'full', sidebarDefault: 'expanded' }));
          document.documentElement.dir = dir;
        }, { theme, dir, settingsKey });
        const page = await context.newPage();
        for (const route of routes) {
          await gotoAdmin(page, route);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
          if (overflow) throw new Error(`Horizontal overflow ${name} ${width} ${theme} ${dir} ${route}`);
          const consoleErrors = [];
          page.on('pageerror', (error) => consoleErrors.push(error.message));
          if (consoleErrors.length) throw new Error(`Page error ${name} ${route}: ${consoleErrors.join('; ')}`);
          cases += 1;
        }
        await context.close();
      }
    }
  }
  await browser.close();
  console.log(`${name}: ${cases} responsive/theme/direction route cases passed.`);
  return cases;
}

await runCrudPersistence();
let total = 0;
total += await runMatrix(chromium, 'Chromium');
total += await runMatrix(firefox, 'Firefox');
total += await runMatrix(webkit, 'WebKit');
console.log(`Admin final browser matrix passed: ${total} route cases.`);
