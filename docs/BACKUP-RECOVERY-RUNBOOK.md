# United Olympics Sports — Backup & Recovery Runbook (v1.0.0 closure)

Database of record: Supabase Postgres project `dbsukhctdjgvjfehknlp`.

## Backups (owner actions in Supabase dashboard)

1. Confirm automated daily backups are enabled for the project and note retention window.
2. Before any structural change (new migration, bulk import), take a manual snapshot / point-in-time-restore checkpoint.
3. Export `schema_migrations` alongside data backups so applied-version truth restores with content.

## Recovery

1. **Bad data write:** restore to a point-in-time before the write, or replay inverse writes for the affected rows (audit_logs carries actor/entity/timestamp to scope the blast radius).
2. **Failed migration:** the runner records nothing for failed files — fix forward with a new migration; never hand-edit `schema_migrations` checksums (drift detection will flag it).
3. **Stuck payment claim:** pending claims self-expire after 30 min and release inventory; verify via order status + provider dashboard before manual cancellation.
4. **Session/auth outage:** provider timeouts degrade to terminal error states client-side; recovery is re-login after provider health returns — no data migration involved.
5. **Bad deploy:** first promote the previous known-good immutable deployment in Vercel and verify its SHA (traffic recovery), then revert the merge commit on `main` and verify the resulting deployment SHA. Reverting alone does not re-serve old code. Applied migrations stay applied — compensate forward if DB behavior must change.

## What is NOT backed up by the repo

- Supabase Auth users (managed by the Auth service; export via dashboard if needed).
- Storage bucket objects (avatars, documents, invoices, product media) — include buckets in the backup plan.
- Stripe provider-side state (reconciled locally via webhooks; source of monetary truth).
