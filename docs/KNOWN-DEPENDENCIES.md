# Known Dependencies & Deferred Scope — United Olympics Sports

## Explicitly deferred (accepted, documented, tested as unavailable)
- Generated-report records engine (live aggregates + CSV work today).
- Headless CMS content pipeline (public pages are repository-managed; legal pages carry owner-review marks where wording is pending).
- Store merchandising extensions (variants/media/collections/discounts schema + admin writes).
- Authenticated store account data (orders/addresses/payment-methods history views) and server cart sync.
- External messaging transports (SMS/email/push); in-app records only.
- Live Supabase staging E2E in CI (runs on mocks + ephemeral PGlite; needs a staging project + secrets to go further).

## Standing decisions
- Firebase retained as migration-compatible secondary identity (deterministic issuer selection); removal only after proving zero dependency.
- RLS with zero client policies on `payment_webhooks` is intentional (server-only).
- No hard deletes on relational/business history (archive/deactivate; audit immutable).
- Unused-index advisor warnings intentionally not acted on.

## Owner actions
Main-branch protection (require PR + Verify checks, block force-push/deletion) — configure in GitHub settings if not already applied; branch-protection state is verified at release time, never assumed.
