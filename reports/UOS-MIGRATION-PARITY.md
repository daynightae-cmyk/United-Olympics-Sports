# United Olympics Sports — Migration Parity & Reconciliation Report
**Document ID:** `UOS-MIGRATION-PARITY`
**Generated:** 2026-09-10
**Product:** United Olympics Sports / يونايتد أوليمبيكس سبورت
**Canonical Repository:** `https://github.com/daynightae-cmyk/United-Olympics-Sports.git`
**Supabase Endpoint:** `https://olmbezzzqavgjwydlfey.supabase.co`
**Supabase Project ID:** `olmbezzzqavgjwydlfey`

---

## 1. Executive Summary

This report establishes the definitive reconciliation between repository-tracked SQL migrations (`src/db/migrations/`) and the live Supabase PostgreSQL migration ledger (`supabase_migrations.schema_migrations`).

### Key Parity Findings
1. **Live Supabase Ledger:** Contains 8 recorded timestamped migrations (`20260908034016` to `20260909181555`).
2. **Repository Version Control:** Contains 6 sequenced migration scripts (`0001` through `0006`).
3. **Migration 0005 Reconciliation:** Repository migration `0005_production_schema_parity_and_rls_hardening.sql` was **NOT applied to live Supabase**. Its true status is `REPOSITORY_ONLY`.
4. **Migration 0006 Policy Closure:** Created forward-only migration `0006_live_rls_policy_closure.sql` to remediate the permissive `achievements_public_read` policy (`using (true)`) in 0005, enforcing strict `is_public = true` scoping, isolating sensitive tables (`payment_webhooks`, `payment_intents`, `orders`, `messages`, `notifications`) from anonymous read, and bootstrapping table 33 (`app_user_profiles`).
5. **Fresh Bootstrap Verification:** Executing migrations `0001` through `0006` on an empty PostgreSQL database (PGlite) succeeds with 0 errors and generates all 33 production tables with RLS enabled.

---

## 2. Migration Mapping & Lifecycle Matrix

| Sequence | Repo Migration File | SHA-256 Checksum | Live Supabase Equivalent | Live Status | Parity State |
| :---: | :--- | :--- | :--- | :---: | :---: |
| 1 | `0001_production_foundation.sql` | `a8116e5aebf32b34eca91ba0578c67a8f63f8812921bbc2c7cd29d93366281f0` | `20260908034016`, `20260908044238`, `20260908050937`, `20260908051755` | `APPLIED` | **RECONCILED** |
| 2 | `0002_constraints_and_hardening.sql` | `1e551aa4ac59a26022431b7652b65ae303119691f640c7941302a8aff8ab8e51` | `20260908182236` | `APPLIED` | **RECONCILED** |
| 3 | `0003_portal_and_operations.sql` | `4791d88ed6a56ffbda76db902b348b13f93533b73f00660416d7d803ab1c8a10` | `20260909015039` | `APPLIED` | **RECONCILED** |
| 4 | `0004_portal_assignment_parity.sql` | `78f1666936acd5945f5bf04608ff022729b7de50271a79eb5607693934ba6393` | `20260909063715` | `APPLIED` | **RECONCILED** |
| 5 | `0005_production_schema_parity_and_rls_hardening.sql` | `5a3e4b81c5e7577fabb0f3685a038fdeb5d04d46196d2fc58e127b51e06c3f89` | *None* | `UNAPPLIED` | **REPOSITORY_ONLY** |
| 6 | `0006_live_rls_policy_closure.sql` | `dc22a20627c509283d92f6b47d9c2c89c6e974c8b227b7f6bacb87358741e273` | *Forward closure migration* | `PENDING_DEPLOY` | **PROPOSED_CLOSURE** |

---

## 3. Detailed Migration Descriptions & Audit

### Migration 0001: `0001_production_foundation.sql`
- **Scope:** Foundation domain tables (organizations, countries, branches, sports, programs, groups, players, coaches, sessions, attendance, subscriptions, payments).
- **Live Reconciliation:** Semantic base matching migrations `20260908034016` through `20260908051755`.

### Migration 0002: `0002_constraints_and_hardening.sql`
- **Scope:** Strict check constraints (non-negative financial amounts, positive inventory, temporal bounds, score limits `0..100`, status enum validation).
- **Live Reconciliation:** Matches live constraint ledger from `20260908182236`.

### Migration 0003: `0003_portal_and_operations.sql`
- **Scope:** Operational tables (`notifications`, `payment_intents`, `orders`) with check constraints and index optimizations.
- **Live Reconciliation:** Corresponds to `20260909015039`.

### Migration 0004: `0004_portal_assignment_parity.sql`
- **Scope:** Player group assignments (`players.group_id` foreign key) and coach group assignments (`coach_groups` table).
- **Live Reconciliation:** Corresponds to `20260909063715`. Confirmed present on live Supabase endpoint.

### Migration 0005: `0005_production_schema_parity_and_rls_hardening.sql`
- **Scope:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` across domain tables, public read policies, and composite indexes.
- **Status:** **`REPOSITORY_ONLY`**. Not executed on the live remote database.
- **Audit Finding:** Included an overly permissive `achievements_public_read` policy with `using (true)` which exposed private player achievements.

### Migration 0006: `0006_live_rls_policy_closure.sql`
- **Scope:** Complete RLS policy closure:
  - Establishes `auth.uid()` stub function for non-Supabase environments.
  - Creates table 33 (`app_user_profiles`) with row-level security.
  - Adds `achievements.is_public boolean not null default false` column.
  - Revokes anonymous read on sensitive tables (`payment_webhooks`, `payment_intents`, `orders`, `messages`, `notifications`).
  - Sets recipient/owner scoping on sensitive tables.
  - Replaces `achievements_public_read` with strict `is_public = true` predicate.
  - Configures `payment_webhooks` as `SERVER_ONLY` (0 client policies).

---

## 4. Fresh Database Bootstrap Proof

Testing an empty PostgreSQL instance (`@electric-sql/pglite` with `pgcrypto` extension) executing `0001` through `0006` sequentially:
- **Total Migrations Executed:** 6
- **Execution Errors:** 0
- **Total Tables Created:** 33
- **RLS Enabled Tables:** 33 / 33 (100%)
- **Bootstrap Verification Test:** `tests/fresh-database-bootstrap.test.ts` (PASS)
- **RLS Security Contract Test:** `tests/rls-security-contract.test.ts` (PASS)
