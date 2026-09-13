# Backup & Recovery — United Olympics Sports

## 1. Database (Supabase)
- **Backup:** Supabase dashboard → Database → Backups (daily automatic on paid plans; manual snapshot before any migration run on production). Confirm retention window with the owner.
- **Migration recovery:** migrations are additive/idempotent — re-running `npm run db:migrate` skips applied checksums and reports drift (`DRIFT_DETECTED`) instead of silently rewriting. To undo a bad migration, add a forward corrective migration (never edit applied history).
- **Restore drill:** restore to the Supabase staging branch first, run `npm run test:production`, then promote. Do not claim "restore tested" until this drill has actually run (record date + operator in the release notes).

## 2. Code & releases
- Every production state is a Git SHA on `main`; every deploy is immutable in Vercel. Recovery = promote previous deployment in Vercel, then `git revert` on `main`.
- Release tags (`v1.0.0`…) mark verified client releases only.

## 3. Config & assets
- Env vars: exported from Vercel project settings by the owner before rotation; `.env.example` is the contract, never the values.
- Media: repository assets under `public/media` + `src/assets` are versioned in Git; provenance log `media-provenance.json` (CI-gated).
