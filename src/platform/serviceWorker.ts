/**
 * Register the production PWA service worker without affecting local/dev runs.
 * Registration failure is non-fatal: the web application remains fully usable.
 */
const SERVICE_WORKER_URL = '/sw.js?v=uos-20260918-final-portal-runtime';

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: '/', updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => {
        // PWA enhancement only. Never block application startup on registration.
      });
  }, { once: true });
}
