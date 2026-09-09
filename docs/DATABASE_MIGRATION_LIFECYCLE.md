# United Olympics Sports - Database Migration & Governance Lifecycle

**Date**: 2026-09-09  
**Status**: ACTIVE PRODUCTION SPECIFICATION  
**Database**: PostgreSQL 15+ / Supabase  

---

## 1. Architecture Overview

Database schema changes in United Olympics Sports follow a strict versioned, transactional, forward-only migration strategy. Raw ad-hoc DDL queries in components or server code are strictly forbidden.

Migrations reside in:
`src/db/migrations/`
and are executed via the canonical migration runner:
`src/db/migrate.ts`

### Migration Tracking Table
Every applied migration is permanently recorded in the `schema_migrations` table:

```sql
create table if not exists schema_migrations (
  id serial primary key,
  version text not null unique,
  checksum text not null,
  applied_at timestamptz not null default now()
);
```

---

## 2. Migration Execution Commands

### Running Migrations
To execute pending migrations against the configured PostgreSQL environment:

```bash
npx tsx src/db/migrate.ts
```

Or via package script:
```bash
npm run db:migrate
```

### Dry-Run Validation
If `DATABASE_URL` or SQL credentials are not present, the runner automatically performs a dry-run integrity validation of all SQL migration files, verifying syntax and calculating SHA-256 checksums without throwing runtime connection crashes.

---

## 3. Drift Detection Strategy

To prevent schema divergence between environments:
1. Every migration script on disk is hashed with SHA-256.
2. The runner compares the disk hash against the stored hash in `schema_migrations`.
3. If an existing migration has been mutated after application, the runner detects and flags `DRIFT_DETECTED` status.

---

## 4. Mandatory Backup-Before-Migration Policy

Before applying any migration in staging or production:
1. Create a full physical or logical dump using `pg_dump`:
   ```bash
   pg_dump --clean --if-exists --no-owner --format=c \
     --dbname="$DATABASE_URL" \
     --file="backup_$(date +%Y%m%d_%H%M%S).dump"
   ```
2. Verify dump file size is greater than zero and verify its archive integrity:
   ```bash
   pg_restore --list "backup_$(date +%Y%m%d_%H%M%S).dump"
   ```

---

## 5. Disaster Recovery & Rollback Procedure

Because PostgreSQL migrations are executed inside transactional boundaries (`BEGIN ... COMMIT`), any migration failure automatically rolls back the in-flight transaction.

In the catastrophic event of unrecoverable data corruption:
1. Terminate all active application instances.
2. Restore from the pre-migration snapshot:
   ```bash
   pg_restore --clean --if-exists --no-owner \
     --dbname="$DATABASE_URL" \
     "backup_YYYYMMDD_HHMMSS.dump"
   ```
3. Verify table counts and row integrity.
4. Restart application services.

---

## 6. Migration Catalog

| Version | Description | Key Constraints |
|---|---|---|
| `0001_production_foundation.sql` | Base schema: organizations, countries, branches, sports, programs, groups, players, guardians, coaches, sessions, attendance, performance, subscriptions, payments, audit_logs. | Foreign keys, primary keys, UUID defaults. |
| `0002_constraints_and_hardening.sql` | Hardened domain integrity constraints. | Non-negative amounts/inventory, ends_at >= starts_at, score 0-100, enumerated statuses, currency validation, unique active subscriptions, unique payment references. |
