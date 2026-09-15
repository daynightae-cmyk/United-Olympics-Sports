# United Olympics Sports — Security Closure (v1.0.0)

## Authorization / IDOR

- All production queries are scoped server-side by `resolveAuthorizationContext` (roles + scopes + people bindings); no broad-list-then-filter in the browser on production paths (contract: `portal-runtime-closure`, `multi-tenant-authorization`, `provider-boundary` tests).
- Negative tests prove: player A ↛ player B, guardian ↛ unlinked child, coach ↛ unassigned athlete/group, customer A ↛ customer B orders, non-admin ↛ admin APIs, branch role ↛ other branch, unauthenticated ↛ protected APIs, preview token ↛ production bypass (new `production-preview-isolation` test).

## RLS

- 33/33 tables RLS-enabled; anon inventory reads scoped to active products (0009); payments/webhooks/orders/messages/notifications revoked from anon; service-role-only webhook table. Verified by `rls-security-contract` (5 suites) + fresh bootstrap.

## Secrets

- Zero client leaks: `service-role-leak-gate` scans 308 files every run (supabase service keys, `service_role`, Stripe secrets, Firebase private keys, `DATABASE_URL`). Server-only credentials never enter `VITE_*`, bundle, logs, or reports.

## Payments

- Server-created intents, HMAC webhook verification (300s replay tolerance, timing-safe compare), idempotent reconcile, claim TTL + expiry release, no fake paid states.

## Transport / platform

- Security headers + CORS tests (`security-headers.test.ts`), distributed rate-limit contract with per-route limits (`distributed-rate-limit-contract`), `Retry-After` correctness; dual OAuth `validateSafeReturnTo` allowlist (relative + club domains + localhost dev).

## Residual risks (accepted, documented)

1. **Single-instance rate limiting** when Redis is unconfigured (per-instance memory limiter; comment-admitted). Mitigation: configure `REDIS_URL`/`UPSTASH_REDIS_REST_URL` before multi-instance scale-out.
2. **No idle/max-age session timeout** — lifetime follows IdP tokens; request-level aborts (5/10/15s) and 30-min payment-claim TTL bound operations. Re-auth policy can be tightened without code changes via IdP settings.
3. **Supabase publishable defaults baked into server bundle** as fallback — public values by design (not secrets); set explicit env to pin the project.
4. **Main JS chunk ~893 kB** (route-level lazy loading in place; login pages fetch no workspace data). Budget: keep public-route initial JS under 1 MB gzip-measured 250 kB; revisit manual chunks when adding the next large dependency.
