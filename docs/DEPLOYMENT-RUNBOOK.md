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

## Rollback decision (two steps — revert alone does not re-serve old code)

1. **Restore traffic first:** in Vercel, promote the previous known-good immutable deployment and verify it serves its known-good SHA. A revert commit alone only queues a *new* deployment; it never re-serves the old one.
2. **Fix history second:** revert the offending merge commit on `main` (never reset history); when the revert deploys, verify the new deployment SHA equals the revert commit SHA.
- Data: migrations are additive and forward-only — reverting code does **not** undo applied migrations (e.g. 0009 stays applied). If the previous DB behavior is required, ship a forward compensating migration and re-verify the affected policy (see BACKUP-RECOVERY-RUNBOOK.md).
- Payments: stuck `pending` claims expire after 30 min and release inventory; failed webhooks are retried idempotently by the provider.

## Hotfix process

Branch from current `main` HEAD → fix + narrow test → full gate → PR → merge → post-merge verification. Never bypass branch protection, never force-push `main`.
