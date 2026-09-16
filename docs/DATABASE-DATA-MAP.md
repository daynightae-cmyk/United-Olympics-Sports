# United Olympics Sports — Database / Data Map (v1.0.0 closure)

Browser Auth/public Supabase project verified on 2026-09-16: `olmbezzzqavgjwydlfey` (`Unitedolympicsports`, `ACTIVE_HEALTHY`).

System-of-record data access is server-side PostgreSQL selected through `DATABASE_URL` or the `SQL_*` environment fields. The browser Supabase project ref must not be treated as proof of which server database connection is active in a deployment.

Migrations: `src/db/migrations/0001→0009`.
Runner: `npm run db:migrate` (`src/db/migrate.ts`: sha256 checksums, drift detection, transactional apply, concurrent-index split with invalid-index recovery).

## Tables (33, all RLS-enabled)

- **Org:** organizations, countries, branches
- **Catalog:** sports, programs, groups, coach_groups
- **People:** players, guardians, player_guardians, coaches
- **Operations:** sessions, attendance, performance_evaluations, registrations
- **Finance:** subscriptions, payments, payment_intents, payment_webhooks, orders
- **Commerce:** catalog_products, inventory
- **Engagement:** achievements, events, announcements, messages, notifications, documents
- **System:** app_user_roles, app_user_scopes, app_user_profiles, audit_logs, public_enquiries, service_requests

## Key relationships

- `players.branch_id → branches`, `players.group_id → groups`; `player_guardians(player_id, guardian_id, active)`; `coach_groups(coach_id, group_id)`.
- `attendance/sessions/performance_evaluations/subscriptions/payments` key off `player_id`; `payments.subscription_id → subscriptions`.
- `inventory.product_id → catalog_products(id)` unique; `orders`/`payment_intents` carry `customer_uid` / provider references with idempotency keys.
- Identity linkage is stored through the people `user_uid` fields and resolved by the canonical server identity/authorization layer; live acceptance must use a real IdP session rather than synthetic direct Auth rows.

## RLS posture (0005/0006/0009)

- Anon: `catalog_products` SELECT where `status='active'`; `inventory` SELECT only for active products (0009); `public_enquiries` INSERT-only; scoped public reads for achievements/events/announcements.
- Anon revoked on: payment_webhooks, payment_intents, orders, messages, notifications (+ payments/subscriptions effectively server-only).
- App tables: recipient/participant/owner-scoped SELECT (`auth.uid()::text`); `payment_webhooks` has zero client policies (server-only). All writes go through service-role server handlers, **except** `public_enquiries`, which has two intentional write paths: the primary public contact form submits to the `/public/enquiries` application route (validated, rate-limited server handler), and the `public_enquiries_anon_insert` policy additionally permits anonymous direct `INSERT` for direct clients. No other table permits anonymous writes.

## Integrity

- `chk_inventory_quantity (available_quantity >= 0)`, FKs with covering indexes (0007), status defaults (`draft` products), `archived_at` soft-archive on people records.
- Multi-table writes (checkout reserve, cancel release, webhook reconcile) run in transactions with `SELECT … FOR UPDATE` in deterministic product order; audit writes are transactional where required.
- Fresh bootstrap 0001→0009 and migration lifecycle are covered by `tests/fresh-database-bootstrap.test.ts` and `tests/database-migration-lifecycle.ts` (PGlite).
- On 2026-09-16, a live rollback-only acceptance transaction proved a representative organization/branch/program/group/player/guardian/coach/session/attendance/performance/audit chain and Player/Guardian/Coach RLS visibility, then verified that zero acceptance rows remained after rollback. See `docs/LIVE-ACCEPTANCE-EVIDENCE-20260916.md`.
- Destructive owner-record writes were not performed by that acceptance proof.
