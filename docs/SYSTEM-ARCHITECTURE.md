# United Olympics Sports — System Architecture (v1.0.0 closure)

Canonical repo `daynightae-cmyk/United-Olympics-Sports` · branch `main` · production `https://unitedolympicsports.store`.

## Runtime shape

- Single Vite + React 19 + React Router 7 SPA (`src/app/AppRouter.tsx`), served by Express (`server.ts`) locally and as Vercel serverless functions in production (`api/index.ts` → `src/server/routes.ts`, 38 route keys).
- SPA fallback: `vercel.json` rewrites all non-API routes to `/index.html`.
- Build: `vite build` + `esbuild server.ts --bundle` → `dist/server.cjs` (`npm run build`).

## Data layers

| Layer | Role |
|---|---|
| Supabase Auth | Primary identity (Google OAuth, phone OTP via SMS proxy). Issues JWTs the server verifies (`src/server/auth.ts`, 5s abort). |
| Firebase Auth/Admin | Secondary verifier for migrated identities; `signOutEverywhere` clears both. Legacy Firebase-only Express middleware removed (dead code). |
| PostgreSQL (`src/db`, `pg` pool) | System of record. `statement_timeout` enforced, pool limits, migration runner with checksums + concurrent-index recovery (`src/db/migrate.ts`, 0001→0009). |
| Drizzle ORM | Schema/migration tooling alongside raw SQL repositories. |
| RLS policies (0005/0006/0009) | Defense in depth: anon catalog reads scoped to active products; payments/webhooks/orders/messages revoked from anon; recipient/owner-scoped SELECT for app tables. All writes go through service-role server handlers. |

## Provider boundary (preview vs production)

- Every surface has an explicit mode: `AdminDataProvider` (`preview`|`live`), `StoreDataProvider` (`preview`|`production`|`unavailable`), portal session contexts (`production`|`preview`).
- **Canonical production hosts block preview/demo flags** (`src/lib/preview-guard.ts`: `previewModeAllowed` on all 10 client gates, `tests/production-preview-isolation.test.ts`). Preview modes work in dev and explicit preview-QA builds on non-canonical hosts but are blocked on canonical production hosts even if a `VITE_UOS_*` variable is misconfigured — while the separate preview-QA layer keeps full coverage.
- Preview gateways are in-memory/tab-local and never write to the server.

## Request path (authenticated)

`getAccessToken` (Supabase → Firebase fallback) → `fetchJsonWithRuntimeTimeout` (10s) → `/api?route=<key>` → `verifyBearerIdentity` (issuer-routed, dual-verify fallback) → `resolveAuthorizationContext` (roles + scopes + player/guardian/coach bindings) → scoped repository query with `statement_timeout` → typed `{ ok }` or `{ error: { code } }`.

## Store / payments

Catalog is live-read; checkout creates a server-priced pending order (`SELECT … FOR UPDATE`, `INSUFFICIENT_INVENTORY 409`). Charging is a separate `payment-intent` call (idempotency key required, 30-min claim TTL, HMAC webhook verification with 300s replay tolerance, `canceled`/`cancelled` normalization, abandoned-claim expiry releasing inventory). No real charge is performed by automated QA; test-mode proof only.

## Portals

Player / Parent / Coach shells render only after server-validated identity binding (`portal-whoami` single-binding checks, binding-mismatch logout + stale-session purge). Coach/Player providers fail fast with `AUTH_REQUIRED` when no token exists, so every async route settles to success / empty / error / retry / login redirect — never an infinite loader.
