# Database & Migrations — United Olympics Sports
**Project:** Supabase `olmbezzzqavgjwydlfey.supabase.co` · **Migrations:** `src/db/migrations/0001–0010` · Runner: `npm run db:migrate` (checksum-tracked `schema_migrations`, idempotent, additive-only).

## 1. Migration map
| # | Content |
|---|---|
| 0001 | Production foundation (33 tables) |
| 0002 | Constraints & hardening |
| 0003 | Portal & operations (+ composite branch indexes) |
| 0004 | Portal assignment parity |
| 0005 | Schema parity & RLS hardening |
| 0006 | Live RLS policy closure (scoped policies, server-only webhooks, public content scoping) |
| 0007 | Covering FK indexes (`events.sport_id`, `payment_intents.subscription_id/player_id`) |
| 0008 | Store catalog richness (`catalog_products`: description/ar, category, sport, product_type/ar, media_url, slug + domain checks/indexes; additive, honest NULL fallback) |
| 0009 | Inventory anonymous-read scoping to active catalog products only |
| 0010 | Verified six-sport reference catalog (`football`, `swimming`, `basketball`, `tennis`, `gymnastics`, `martial-arts`) |

Fresh DB from migrations alone reaches the full schema (proven by `fresh-database-bootstrap.test.ts` on ephemeral PGlite).

## 2. RLS decisions (advisor closure)
- **Scoped authenticated read:** notifications (recipient), messages (participant), orders (customer), payment_intents (player owner), players (self/guardian/coach-assigned), guardians, coaches, groups.
- **Public read:** events (scheduled/published), announcements (active + role `all`), achievements (`is_public`).
- **Server-only (zero client policies, fail closed):** `payment_webhooks`, plus anon revokes on payment/order/message/notification tables. All server access uses the privileged connection; service-role keys never touch browsers (leak-gated in CI).

## 3. Reference vs business data
Migrations seed structure + verified reference catalogs only. Players, guardians, branches, prices, schedules are owner-entered via Admin/First Setup — never seeded as fake rows.

## 4. Safety rules
New DDL = new versioned migration, `IF NOT EXISTS` style, no drops of live data, rollback note in header. Never edit schema from the dashboard without committing the migration. Unused-index warnings are intentionally not acted on (traffic too immature for usage stats).

### Live tracking reconciliation note — 2026-09-18
The connected production Supabase project contains the application schema but does **not** currently expose the repository runner's expected `public.schema_migrations` table. Supabase-managed migration tables exist in internal schemas, but they are not a substitute for this repository runner's checksum ledger. Until that lifecycle is reconciled, do **not** blindly run the full migration chain against production. The verified sports catalog rows are already present in production, and migration `0010` codifies the same idempotent reference data for controlled future bootstrap/reconciliation.
