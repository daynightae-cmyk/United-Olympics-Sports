/* United Olympics Sports PWA service worker.
 *
 * Safety contract:
 * - Never cache authenticated, API, payment, or version-check traffic.
 * - Cache only the stable application shell and manifest.
 * - Vite build chunks and portal/brand artwork stay network-only because rapid
 *   route changes can cancel in-flight image/module requests in Firefox/WebKit.
 * - Navigation is network-first and falls back to the cached shell when offline.
 * - Runtime cache reads/writes are best-effort and can never break a network response.
 */

const CACHE_NAME = 'uos-static-shell-v3-final-portal-runtime';
const SHELL_URL = '/';
const PRECACHE_URLS = [
  SHELL_URL,
  '/manifest.webmanifest',
];

const NEVER_CACHE_PREFIXES = [
  '/api',
  '/auth',
  '/public/enquiries',
];

const NETWORK_ONLY_STATIC_PREFIXES = [
  '/assets',
  '/brand/portals',
];

const NETWORK_ONLY_STATIC_EXACT = new Set([
  '/brand/united-olympics-sports-logo.png',
]);

const NEVER_CACHE_EXACT = new Set([
  '/version.json',
]);

function hasPathPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isSensitivePath(pathname) {
  return NEVER_CACHE_EXACT.has(pathname)
    || NEVER_CACHE_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
}

function isNetworkOnlyStaticPath(pathname) {
  return NETWORK_ONLY_STATIC_EXACT.has(pathname)
    || NETWORK_ONLY_STATIC_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/brand/')
    || pathname === '/manifest.webmanifest';
}

async function matchBestEffort(key) {
  try {
    return await caches.match(key);
  } catch {
    // CacheStorage reads are optional. Storage eviction/corruption must behave
    // like a cache miss so a healthy network request can still proceed.
    return undefined;
  }
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

async function serveStaticAsset(request) {
  const cached = await matchBestEffort(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) await putBestEffort(request, response.clone());
    return response;
  } catch {
    // Only cache-safe static resources reach this handler. Build chunks and
    // frequently reused brand/portal artwork bypass the service worker so
    // browser-driven cancellation cannot surface as a console/runtime failure.
    return (await matchBestEffort(request)) || Response.error();
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
  if (isNetworkOnlyStaticPath(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) await putBestEffort(SHELL_URL, response.clone());
        return response;
      } catch {
        const cached = await matchBestEffort(SHELL_URL);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(serveStaticAsset(request));
  }
});
