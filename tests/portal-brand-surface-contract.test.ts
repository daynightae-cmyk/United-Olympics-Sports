import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [adminSidebar, portalLayout, portalAuth, entry, visualClosure] = await Promise.all([
  read('src/components/admin/AdminSidebar.tsx'),
  read('src/layouts/PortalLayout.tsx'),
  read('src/components/auth/PortalAuthPage.tsx'),
  read('src/main.tsx'),
  read('src/styles/portal-visual-proof-closure.css'),
]);

for (const [name, source] of [
  ['AdminSidebar', adminSidebar],
  ['PortalLayout', portalLayout],
  ['PortalAuthPage', portalAuth],
] as const) {
  assert.equal(source.includes('PortalEmblem'), false, `${name} must not render a second portal emblem beside the canonical brand logo`);
  const logos = source.match(/\/brand\/united-olympics-sports-logo\.png/g) ?? [];
  assert.equal(logos.length, 1, `${name} must render exactly one canonical United Olympics Sports logo; found ${logos.length}`);
}

assert(entry.includes("import './styles/portal-visual-proof-closure.css';"), 'visual proof closure must load last in the app entry');
assert(visualClosure.includes('.dashboard-hero'), 'visual proof closure must normalize the dashboard hero');
assert(visualClosure.includes('.admin-stat-card'), 'visual proof closure must normalize admin stat cards');
assert(visualClosure.includes('.portal-card'), 'visual proof closure must normalize portal cards');
assert(visualClosure.includes('.athlete-glass-card'), 'visual proof closure must normalize player portal cards');

console.log('PORTAL BRAND + SURFACE CONTRACT: PASS');
