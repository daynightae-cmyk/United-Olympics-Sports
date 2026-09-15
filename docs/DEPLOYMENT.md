# Deployment — United Olympics Sports
**Target:** Vercel · **Production branch:** `main` · **URL:** https://unitedolympicsports.store

## 1. How deploys happen
- Canonical package manager is **npm** (`package-lock.json`, `packageManager`, CI `npm ci`). Do NOT commit a second lockfile (`bun.lock` was removed — dual lockfiles fail Vercel's package-manager detection and chronically failed production deployments).
- Node `>=20.11` is pinned via `engines` (required by `import.meta.dirname` and modern APIs).
- Push/merge to `main` triggers the Vercel production deployment (Git integration, `main` only per `vercel.json`).
- CI (`Verify`: static gates → build → production tests → browser QA → Store Golden Master) must be green before merge.
- SPA fallback: `vercel.json` rewrites all non-API routes to `/index.html`; API routes rewrite to `/api/index`.
- Serverless API: `api/index.ts` bundles `src/server/*`. The server closure MUST use extensionless relative imports (guarded by `tests/vercel-function-bundle.test.ts`) — explicit `.ts` specifiers crash Vercel resolution (`FUNCTION_INVOCATION_FAILED`).

## 2. Post-deploy verification
1. `GET /api/v1/health` → 200 `{ ok: true, service: "united-olympics-sports" }` (status `degraded` until DATABASE_URL is set — truthful, not a failure).
2. Direct loads: `/`, `/about`, `/sports/football`, `/programs`, `/coaches`, `/contact`, `/store`, `/store/shop`, `/admin/login`, `/player/login`, `/auth/callback`.
3. OAuth callback round-trip with a test Google account → Access Pending (no role) is the correct first result.
4. Admin login → Settings → organization state reads live.

## 3. Rollback
- Vercel dashboard → Deployments → promote the previous known-good deployment (immutable).
- Git recovery: `git revert` the offending merge on `main`; never force-push `main`.
- Database: migrations are additive and idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`); rollback notes live in each migration header.

## 4. Environments
Production env vars are set in the Vercel project dashboard (see `docs/ENVIRONMENT.md`). Preview deployments inherit non-secret values only; service-role and payment secrets are production-only.
