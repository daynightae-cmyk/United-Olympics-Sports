# UOS mobile packaging — shared-core principle

One shared React application serves every surface. No `PlayerWeb` /
`PlayerAndroid` / `PlayerIOS` forks: shared components with small platform
adaptations only.

- **Web:** standard browser experience (Vite + React Router). Direct routes
  must work after refresh (SPA fallback preserved).
- **PWA:** `public/manifest.webmanifest` (standalone, official logo icon),
  theme-color handling in `index.html`, safe-area utilities
  (`.uos-safe-*`) in `uos-design-system.css`. No aggressive caching of
  authenticated business data.
- **Android / iOS (future):** thin Capacitor shell around the same product
  core. Only camera/gallery/push/biometrics/share/deep-links live behind
  bridges in `src/platform/platform.ts`. Actual native init is deferred —
  adding it now would risk the web deployment.
- **Version / update model:** `src/platform/version.ts` compares the running
  build against `/version.json`. Web/PWA content updates surface as a quiet
  `UpdateToast`; native binary changes will always require store builds and
  must respect Apple/Google rules (no hidden bypass mechanisms).
- **Overlay priority:** critical auth/session > required update > dialog >
  assistant > install suggestion > toast. One main overlay at a time on
  mobile, with body scroll locking and safe dismissal.
