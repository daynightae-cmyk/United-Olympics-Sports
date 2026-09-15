# United Olympics Sports — Release Notes v1.0.0

## What shipped

- **Security:** production builds ignore all preview/demo flags across 10 client gates (admin bypass, data providers, demo routes/links, portal guards) — a misconfigured deploy env can no longer enable preview behavior in production.
- **Store:** authenticated account routes (`order/:id`, `payment-methods`, `settings`) render verified session data with working logout; new account-scoped order detail; mode-truthful checkout header; dead static account shell removed.
- **Database:** migration 0009 scopes anonymous inventory reads to active catalog products; bootstrap coverage 0001→0009.
- **Auth hygiene:** removed dead Firebase-only Express middleware; canonical path is the dual-provider verifier.
- **Docs:** 15-file client handoff pack (architecture, route map, role matrix, data map, operations guides, runbooks, environment inventory, security closure, QA evidence, acceptance checklist).

## Verification (on release SHA)

- `typecheck`, `lint` (0 errors), `qa:media-provenance`, full `test:production` (31 suites incl. new isolation test), `vite+server build` — all green.
- CI extended gate: required checks + production readiness + Chromium/Firefox/WebKit golden masters + emblem QA + review threads resolved.
- Vercel deployment SHA-parity + Supabase integration confirmed post-merge (see QA-EVIDENCE.md).

## Known limitations (truthful)

- Charging, SMS/OTP delivery, and email/notifications require owner provider activations (see ENVIRONMENT-INVENTORY.md); until then the UI states what is missing instead of faking success.
- Rate limiting is per-instance until Redis is configured; no idle session timeout (IdP token lifetime governs).
- PWA is manifest-only (no service worker): nothing private is cached, installability criteria for maskable icons are unmet.

## Upgrade / rollback

- Deploy: merge to `main`, verify Vercel SHA parity. Roll back by reverting the merge commit (migrations are additive; claims self-expire in 30 min).
