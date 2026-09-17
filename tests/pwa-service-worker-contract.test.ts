import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sw = readFileSync('public/sw.js', 'utf8');
const registration = readFileSync('src/platform/serviceWorker.ts', 'utf8');
const entry = readFileSync('src/main.tsx', 'utf8');

assert.match(sw, /const NEVER_CACHE_PREFIXES = \[/, 'service worker must define explicit no-cache prefixes');
for (const sensitive of ['/api', '/auth', '/public/enquiries']) {
  assert.ok(sw.includes(`'${sensitive}'`), `service worker must exclude ${sensitive} from caching`);
}
assert.ok(sw.includes("'/version.json'"), 'version manifest must never be served from the service-worker cache');
assert.match(sw, /if \(request\.method !== 'GET'\) return;/, 'service worker must not intercept writes');
assert.match(sw, /if \(url\.origin !== self\.location\.origin\) return;/, 'service worker must not cache cross-origin requests');
assert.match(sw, /if \(isSensitivePath\(url\.pathname\)\) return;/, 'sensitive routes must bypass cache handling');
assert.ok(!sw.includes("pathname.startsWith('/media/')"), 'large/dynamic media must not be broadly runtime-cached');
assert.match(sw, /request\.mode === 'navigate'/, 'navigation should have an offline shell fallback');
assert.match(sw, /caches\.match\(SHELL_URL\)/, 'offline navigation fallback must use the cached shell');
assert.match(sw, /async function putBestEffort/, 'runtime cache writes must be isolated from response delivery');
assert.match(sw, /catch \{[\s\S]*Cache persistence is an enhancement only/, 'cache write failures must be non-fatal');
assert.equal(
  (sw.match(/event\.waitUntil\(/g) ?? []).length,
  2,
  'event.waitUntil must be limited to install/activate and never called late from fetch handlers',
);

assert.match(registration, /if \(!import\.meta\.env\.PROD\) return;/, 'service worker must not register in development');
assert.match(registration, /navigator\.serviceWorker\.register\('\/sw\.js'/, 'production registration must target /sw.js');
assert.match(entry, /registerServiceWorker\(\);/, 'application entry must activate service-worker registration');

console.log('PWA SERVICE WORKER CONTRACT: PASS');
