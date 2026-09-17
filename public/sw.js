/* United Olympics Sports PWA service worker.
 *
 * Safety contract:
 * - Never cache authenticated, API, payment, or version-check traffic.
 * - Cache only the application shell and immutable/static same-origin assets.
 * - Navigation is network-first and falls back to the cached shell when offline.
 * - Runtime cache writes are best-effort and can never break a network response.
 */

const CACHE_NAME = 'uos-static-shell-v1';
const SHELL_URL = '/';
const PRECACHE_URLS = [
  SHELL_URL,
  '/manifest.webmanifest',
  '/brand/united-olympics-sports-logo.png',
];

const NEVER_CACHE_PREFIXES = [
  '/api',
  '/auth',
  '/public/enquiries',
];

const NEVER_CACHE_EXACT = new Set([
  '/version.json',
]);

function isSensitivePath(pathname) {
  return NEVER_CACHE_EXACT.has(pathname)
    || NEVER_CACHE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/')
    || pathname.startsWith('/brand/')
    || pathname === '/manifest.webmanifest';
}

async function putBestEffort(key, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(key, response);
  } catch {
    // Cache persistence is an enhancement only. A cache failure must never
    // turn a successful network response into a failed application request.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isSensitivePath(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) await putBestEffort(SHELL_URL, response.clone());
        return response;
      } catch {
        const cached = await caches.match(SHELL_URL);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) await putBestEffort(request, response.clone());
      return response;
    })());
  }
});
