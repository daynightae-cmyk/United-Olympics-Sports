import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const appRouter = readFileSync('src/app/AppRouter.tsx', 'utf8');
const publicExperience = readFileSync('src/pages/public/PublicExperience.tsx', 'utf8');

assert(
  appRouter.includes("import('../pages/public/PublicExperience')"),
  'AppRouter must lazy-load the canonical PublicExperience surface',
);
assert(
  appRouter.includes('<Route path="*" element={<PublicExperience />} />'),
  'All unmatched public routes must resolve through PublicExperience',
);
assert.equal(
  appRouter.includes('PublicSite'),
  false,
  'AppRouter must not reference the retired PublicSite surface',
);
assert.equal(
  existsSync('src/pages/public/PublicSite.tsx'),
  false,
  'Legacy PublicSite.tsx must remain removed',
);

for (const route of ['/about', '/sports', '/programs', '/coaches', '/contact', '/privacy', '/terms', '/shipping', '/returns']) {
  assert(
    publicExperience.includes(`path="${route}"`),
    `Canonical PublicExperience must own ${route}`,
  );
}

assert(
  publicExperience.includes('function ContactPage()'),
  'Canonical public authority must retain the live ContactPage',
);
assert(
  publicExperience.includes("fetch('/public/enquiries'"),
  'Canonical ContactPage must keep the live public enquiry backend integration',
);

console.log('PUBLIC AUTHORITY CONTRACT: PASS');
