# United Olympics Sports — Deployment Runbook (v1.0.0 closure)

Project: `daynightae-cmyks-projects / united-olympics-sports` → `https://unitedolympicsports.store`.

## Standard release

1. Merge to `main` only when the extended gate is green (required checks + production readiness + all golden masters + emblem QA + zero review threads).
2. Confirm the Vercel deployment commit SHA equals the merge SHA and status is Ready.
3. Confirm the custom domain serves the new deployment (no stale deployment pinned).
4. Run the production-mode smoke (unauthenticated boundaries + terminal-state detection) against the live domain.

## Pre-merge verification (every PR)

```
npm ci
npm run typecheck
npm run lint
npm run qa:media-provenance
npm run test:production
npm run build
git diff --check
```

Browser/runtime QA runs in CI (`verify.yml`: browser-qa + store golden masters on Chromium/Firefox/WebKit; `portal-emblem-qa.yml`).

## Database migration (`npm run db:migrate`)

- Forward-only 0001→0009 with checksum drift detection; re-runnable and idempotent.
- `CREATE INDEX CONCURRENTLY` statements execute outside transactions with invalid-index recovery.
- Without credentials the runner performs a validating dry-run and reports `DRY_RUN` per file.

## Rollback decision

- Code: revert the merge commit on `main` (never reset history); Vercel redeploys the previous Ready deployment — verify SHA parity again.
- Data: migrations are additive; no destructive DDL to undo. If a migration fails, `schema_migrations` records nothing for it — fix forward with a new migration.
- Payments: stuck `pending` claims expire after 30 min and release inventory; failed webhooks are retried idempotently by the provider.

## Hotfix process

Branch from current `main` HEAD → fix + narrow test → full gate → PR → merge → post-merge verification. Never bypass branch protection, never force-push `main`.
