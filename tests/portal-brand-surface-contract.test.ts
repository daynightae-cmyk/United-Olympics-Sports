import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [adminSidebar, portalLayout, portalAuth, playerPortalShell, playerOverview, parentOverview, parentClosure, coachOverview, coachClosure, adminDashboard, adminClosure, splash, serviceWorker, entry, visualClosure, athleticClosure] = await Promise.all([
  read('src/components/admin/AdminSidebar.tsx'),
  read('src/layouts/PortalLayout.tsx'),
  read('src/components/auth/PortalAuthPage.tsx'),
  read('src/portals/player/PlayerPortalShell.tsx'),
  read('src/pages/portal/player/PlayerPortalOverviewPage.tsx'),
  read('src/pages/portal/parent/ParentPortalOverviewPage.tsx'),
  read('src/styles/parent-portal-final.css'),
  read('src/pages/portal/coach/CoachPortalOverviewPage.tsx'),
  read('src/styles/coach-portal-final.css'),
  read('src/pages/admin/AdminDashboardPage.tsx'),
  read('src/styles/admin-athletic-final.css'),
  read('src/components/splash/OlympicLuxurySplash.tsx'),
  read('src/platform/serviceWorker.ts'),
  read('src/main.tsx'),
  read('src/styles/portal-visual-proof-closure.css'),
  read('src/styles/portal-athletic-cards-final.css'),
]);
const interiorDelivery = await read('src/styles/portal-interior-delivery-final.css');
const [parentRouter, coachRouter, portalDrawerA11y, adminLayout, adminTopbar] = await Promise.all([
  read('src/portals/ParentPortalRouter.tsx'),
  read('src/portals/CoachPortalRouter.tsx'),
  read('src/components/portal/usePortalDrawerA11y.ts'),
  read('src/layouts/AdminLayout.tsx'),
  read('src/components/admin/AdminTopbar.tsx'),
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

assert.equal(playerPortalShell.includes('PortalEmblem'), false, 'PlayerPortalShell must not render a second portal emblem beside the canonical logo');
assert(playerPortalShell.includes('athlete-sidebar-logo'), 'PlayerPortalShell must render the canonical SafeBrandLogo');
assert(splash.includes('INTERNAL_PRODUCT_ROUTE'), 'luxury splash must explicitly exclude internal product routes');
assert(splash.includes('className="olympic-luxury-splash"'), 'luxury splash must use semantic production CSS');
assert(serviceWorker.includes("updateViaCache: 'none'"), 'service worker registration must bypass stale SW HTTP cache');
assert(entry.includes("import './styles/portal-visual-proof-closure.css';"), 'visual proof closure must remain in the app entry');
assert(entry.includes("import './styles/portal-premium-final.css';"), 'shared premium portal system must remain in the app entry');
assert(entry.includes("import './styles/player-portal-chatgpt-black-gold.css';"), 'Player cinematic athletic layer must be loaded');
assert(entry.includes("import './styles/player-portal-final.css';"), 'Player final closure layer must be loaded');
assert(entry.includes("import './styles/parent-portal-final.css';"), 'Parent final visual authority must be loaded');
assert(entry.includes("import './styles/coach-portal-final.css';"), 'Coach final visual authority must be loaded');
assert(entry.includes("import './styles/portal-athletic-cards-final.css';"), 'Shared athletic portal card authority must be loaded');
assert(entry.includes("import './styles/admin-athletic-final.css';"), 'Admin athletic command authority must be loaded');
assert(entry.includes("import './styles/portal-interior-delivery-final.css';"), 'Client-delivery portal interior authority must be loaded');
assert(
  entry.indexOf("portal-athletic-cards-final.css") > entry.indexOf("player-portal-final.css"),
  'Athletic portal card authority must load after Player final closure',
);
assert(
  entry.indexOf("portal-athletic-cards-final.css") > entry.indexOf("parent-portal-final.css"),
  'Athletic shared authority must load after Parent final closure',
);
assert(
  entry.indexOf("portal-athletic-cards-final.css") > entry.indexOf("coach-portal-final.css"),
  'Athletic shared authority must load after Coach final closure',
);
assert(
  entry.indexOf("admin-athletic-final.css") > entry.indexOf("portal-athletic-cards-final.css"),
  'Admin athletic command authority must load after the shared athletic closure',
);
assert(
  entry.indexOf("portal-interior-delivery-final.css") > entry.indexOf("admin-athletic-final.css"),
  'Client-delivery portal interior authority must load last',
);
assert(playerOverview.includes('athlete-snapshot-card'), 'Player overview snapshots must use semantic athletic cards');
assert(playerOverview.includes('athlete-quick-link-card'), 'Player overview quick links must use semantic athletic cards');
assert(playerOverview.includes('athlete-overview-title'), 'Player overview must expose semantic athletic heading hierarchy');
assert(athleticClosure.includes('object-fit: cover !important'), 'Portal emblem crop must prevent the composite lockup from displaying as two visible emblems');
assert(athleticClosure.includes('.bm-action-card'), 'Parent/Coach action cards must receive the athletic card authority');
assert(athleticClosure.includes('.bm-form-section'), 'Portal form sections must receive the athletic field authority');
assert(parentOverview.includes('parent-family-hero'), 'Parent overview must expose the family sports hero');
assert(parentOverview.includes('parent-athlete-card'), 'Parent overview must expose semantic athlete cards');
assert(parentOverview.includes('parent-athlete-signal'), 'Parent overview athlete cards must expose semantic performance signals');
assert(parentClosure.includes('PARENT PORTAL — ATHLETIC FAMILY DASHBOARD CLOSURE'), 'Parent athletic family closure must remain present');
assert(parentClosure.includes('.parent-field'), 'Parent athletic closure must cover parent fields');
assert(parentClosure.includes('.parent-table-wrap'), 'Parent athletic closure must cover parent tables');
assert(coachOverview.includes('coach-command-hero'), 'Coach overview must expose the training command hero');
assert(coachOverview.includes('coach-athlete-card'), 'Coach overview must expose semantic athlete roster cards');
assert(coachOverview.includes('coach-athlete-signal'), 'Coach roster cards must expose semantic athlete signals');
assert(coachClosure.includes('Coach Portal Athletic Authority'), 'Coach athletic authority must remain present');
assert(coachClosure.includes('.schedule-week-view'), 'Coach athletic authority must cover the weekly schedule');
assert(coachClosure.includes('.enterprise-table'), 'Coach athletic authority must cover roster and attendance tables');
assert(coachClosure.includes('.enterprise-toolbar'), 'Coach athletic authority must cover coach filters and search');
assert(adminSidebar.includes('official-logo admin-brand-logo'), 'Admin sidebar must expose the crop-safe canonical logo class');
assert(portalLayout.includes('official-logo portal-brand-logo'), 'Parent/Coach shared shell must expose the crop-safe canonical logo class');
assert(
  adminDashboard.includes('uos-cc__header') || adminDashboard.includes('data-surface="admin-command-hero"'),
  'Admin dashboard must expose the operations command hero',
);
assert(
  adminDashboard.includes('uos-cc__metric') || adminDashboard.includes('data-surface="admin-command-metric"'),
  'Admin dashboard must expose semantic command metrics',
);
assert(
  adminDashboard.includes('uos-cc__op-card') || adminDashboard.includes('data-surface="admin-operation-card"'),
  'Admin dashboard must expose sports operation cards',
);
assert(adminClosure.includes('Admin Athletic Command Authority'), 'Admin athletic authority must remain present');
assert(adminClosure.includes('.enterprise-table-shell'), 'Admin athletic authority must cover enterprise tables');
assert(adminClosure.includes('.uos-form-grid'), 'Admin athletic authority must cover bilingual forms');
assert(adminClosure.includes('.directory-card'), 'Admin athletic authority must cover People directory cards');
assert(adminClosure.includes('.bm-filter-bar'), 'Admin athletic authority must cover Benchmark player filters');
assert(adminClosure.includes('.bm-table-container'), 'Admin athletic authority must cover Benchmark player tables');
const adminLogoRule = adminClosure.match(/\.admin-shell \.admin-sidebar \.admin-brand > img\.official-logo\.admin-brand-logo\s*\{([\s\S]*?)\}/)?.[1] ?? '';
assert(adminLogoRule.includes('object-fit:cover !important'), 'Admin athletic authority must crop the composite logo to a single emblem');
assert(visualClosure.includes('.dashboard-hero'), 'visual proof closure must normalize the dashboard hero');
assert(visualClosure.includes('.admin-stat-card'), 'visual proof closure must normalize admin stat cards');
assert(visualClosure.includes('.portal-card'), 'visual proof closure must normalize portal cards');
assert(visualClosure.includes('.athlete-glass-card'), 'visual proof closure must normalize player portal cards');
assert(portalLayout.includes('usePortalDrawerA11y'), 'Parent/Coach shell must use the shared mobile drawer behavior');
assert(playerPortalShell.includes('usePortalDrawerA11y'), 'Player shell must use the shared mobile drawer behavior');
assert(adminLayout.includes('usePortalDrawerA11y'), 'Admin shell must use the shared mobile drawer behavior');
assert(adminSidebar.includes('id="admin-portal-navigation"'), 'Admin sidebar must expose a stable controlled drawer id');
assert(adminTopbar.includes('aria-controls="admin-portal-navigation"'), 'Admin menu trigger must control the shared drawer id');
for (const marker of ["document.body.style.overflow = 'hidden'", "event.key === 'Escape'", "event.key !== 'Tab'", 'triggerRef.current?.focus']) {
  assert(portalDrawerA11y.includes(marker), `Shared portal drawer behavior missing: ${marker}`);
}
assert(parentRouter.includes("session?.provider === 'production' ? 'production' : 'preview'"), 'Parent shell status must reflect the validated session provider');
assert(parentRouter.includes('statusMode={statusMode}'), 'Parent PortalLayout must receive the resolved portal status');
assert(coachRouter.includes('const { isPreviewSession } = useCoachSession();'), 'Coach shell status must use the validated session context');
assert(coachRouter.includes("statusMode={isPreviewSession ? 'preview' : 'production'}"), 'Coach PortalLayout must distinguish preview from live production');
assert(portalLayout.includes("className={({ isActive }) => isActive ? 'active' : undefined}"), 'Parent/Coach navigation must expose an explicit active visual state');
assert(interiorDelivery.includes('.portal-parent .portal-nav a.active'), 'Parent portal must have an athletic active navigation state');
assert(interiorDelivery.includes('.portal-coach .portal-nav a.active'), 'Coach portal must have an athletic active navigation state');
assert(interiorDelivery.includes('.parent-form-field input'), 'Parent fields must receive the delivery field authority');
assert(interiorDelivery.includes('.enterprise-table th'), 'Portal enterprise tables must receive the delivery table authority');
assert(interiorDelivery.includes('.player-shell-container .athlete-glass-card-interactive'), 'Player interactive cards must receive final delivery polish');

console.log('PORTAL BRAND + SURFACE CONTRACT: PASS');
