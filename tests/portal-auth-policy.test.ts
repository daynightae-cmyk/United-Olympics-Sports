import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { portalAuthProviders, PRODUCTION_PORTAL_AUTH_PROVIDERS } from '../src/components/auth/portalAuthPolicy.ts';

const portals = ['admin', 'player', 'parent', 'coach', 'store'] as const;
for (const portal of portals) {
  assert.deepEqual(portalAuthProviders(portal), ['google'], `${portal} must use the shared Google-only production policy`);
}
assert.deepEqual(PRODUCTION_PORTAL_AUTH_PROVIDERS, ['google']);

const [genericRoute, playerRoute, parentRoute, coachRoute, authPage, appRouter] = await Promise.all([
  readFile(new URL('../src/components/auth/PortalLoginRoute.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/portals/player/auth/PlayerLoginPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/portals/parent/ParentLoginPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/portals/coach/CoachLoginPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/auth/PortalAuthPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/app/AppRouter.tsx', import.meta.url), 'utf8'),
]);

for (const [name, source] of [
  ['generic', genericRoute],
  ['player', playerRoute],
  ['parent', parentRoute],
  ['coach', coachRoute],
] as const) {
  assert.match(source, /portalAuthProviders\(/, `${name} login must consume the canonical provider policy`);
  assert.equal(/providers=\{?\[['"]/.test(source), false, `${name} login must not define an inline provider list`);
}

assert.equal(authPage.match(/\/brand\/united-olympics-sports-logo\.png/g)?.length, 1, 'shared login shell must render one canonical logo');
for (const portal of portals) {
  assert.match(authPage, new RegExp(`/media/portal-auth/${portal}\\.webp`), `${portal} must use its approved sports atmosphere`);
  await access(new URL(`../public/media/portal-auth/${portal}.webp`, import.meta.url));
}

assert.match(appRouter, /\^\\\/\(admin\|player\|parent\|coach\|store\)\\\/login/, 'all portal login routes must suppress internal overlays');
assert.match(authPage, /data-auth-provider=\{provider\}/, 'provider controls must expose a stable runtime QA selector');

console.log('Portal auth policy contract: PASS');
