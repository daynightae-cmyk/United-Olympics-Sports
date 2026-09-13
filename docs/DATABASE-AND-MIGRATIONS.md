# Database & Migrations — United Olympics Sports
**Project:** Supabase `olmbezzzqavgjwydlfey.supabase.co` · **Migrations:** `src/db/migrations/0001–0007` · Runner: `npm run db:migrate` (checksum-tracked `schema_migrations`, idempotent, additive-only).

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

Fresh DB from migrations alone reaches the full schema (proven by `fresh-database-bootstrap.test.ts` on ephemeral PGlite).

## 2. RLS decisions (advisor closure)
- **Scoped authenticated read:** notifications (recipient), messages (participant), orders (customer), payment_intents (player owner), players (self/guardian/coach-assigned), guardians, coaches, groups.
- **Public read:** events (scheduled/published), announcements (active + role `all`), achievements (`is_public`).
- **Server-only (zero client policies, fail closed):** `payment_webhooks`, plus anon revokes on payment/order/message/notification tables. All server access uses the privileged connection; service-role keys never touch browsers (leak-gated in CI).

## 3. Reference vs business data
Migrations seed structure + verified reference catalogs only. Players, guardians, branches, prices, schedules are owner-entered via Admin/First Setup — never seeded as fake rows.

## 4. Safety rules
New DDL = new versioned migration, `IF NOT EXISTS` style, no drops of live data, rollback note in header. Never edit schema from the dashboard without committing the migration. Unused-index warnings are intentionally not acted on (traffic too immature for usage stats).
