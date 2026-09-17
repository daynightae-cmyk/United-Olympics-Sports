/* United Olympics Sports PWA service worker.
 *
 * Safety contract:
 * - Never cache authenticated, API, payment, or version-check traffic.
 * - Cache only the stable application shell and small same-origin brand assets.
 * - Vite build chunks and large portal artwork stay network-only because rapid
 *   route changes can cancel in-flight module/image requests in Firefox/WebKit.
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

const NETWORK_ONLY_STATIC_PREFIXES = [
  '/assets',
  '/brand/portals',
];

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
  return NETWORK_ONLY_STATIC_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/brand/')
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

async function serveStaticAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) await putBestEffort(request, response.clone());
    return response;
  } catch {
    // Only stable brand/manifest resources reach this handler. Build chunks and
    // portal artwork bypass the service worker so browser-driven cancellation
    // cannot surface as a service-worker console failure.
    return (await caches.match(request)) || Response.error();
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
        const cached = await caches.match(SHELL_URL);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(serveStaticAsset(request));
  }
});
