# Release Checklist & Acceptance Matrix — United Olympics Sports
Release requires every gate below to PASS (or be explicitly marked external/deferred with a ledger entry). Status key: PASS · PARTIAL · BLOCKED · N/A.

## 1. Gates
| Gate | Command / evidence | Status |
|---|---|---|
| Typecheck | `npm run typecheck` | PASS |
| ESLint | `npm run lint` (0 errors) | PASS |
| Build | `npm run build` (client + server bundle) | PASS |
| Production suite | `npm run test:production` (26 suites incl. bootstrap, live-provider, bundle, RLS, leak gates) | PASS |
| CI Verify | staged pipeline green on the release SHA | PASS (at merge) |
| Migrations | fresh bootstrap 0001-0008 + dry-run parity | PASS |
| Secret leak | service-role leak gate + manual scan | PASS |
| Direct routes | matrix below | PASS (static verified; API post-fix pending deploy proof) |
| Console | browser QA smoke, no uncaught errors | PASS |
| Docs | this pack complete, no secret values | PASS |

## 2. Route acceptance matrix (auth · data · mobile · RTL · dark/light · console)
| Route | Auth | Data | Status |
|---|---|---|---|
| `/`, `/about`, `/sports`, `/sports/*` (6), `/programs`, `/coaches`, `/contact` | public | live enquiry API / static verified | PASS |
| `/privacy`, `/terms`, `/shipping`, `/returns` | public | static + owner-review marks | PASS |
| `/store`, `/store/shop`, `/store/product/*`, `/store/cart`, `/store/checkout` | public (checkout submit: auth) | production gateway / honest payment gap | PASS |
| `/store/account`, `/store/orders`, `/store/wishlist`, addresses, payments, notifications, settings | store auth (graceful) | local + honest unavailable | PASS |
| `/admin/login`, `/admin` + 20 workspaces | admin | live gateway + Preview mode | PASS |
| `/player/*`, `/parent/*`, `/coach/*` | portal binding | live scoped + isolation tests | PASS |
| `/auth/callback` | OAuth | Supabase → role lookup → Access Pending | PASS |
| `/benchmark` | DEV-only (not in prod bundle) | N/A | PASS |

## 3. External / deferred ledger (not release blockers)
- Payment merchant activation, SMS/Email providers, native signing: see EXTERNAL-PROVIDERS.
- Live-Supabase staging E2E in CI: needs owner staging project.
- Post-merge: prove `/api/v1/health` 200 on the new deployment (fixes the prior FUNCTION_INVOCATION_FAILED), then tag `v1.0.0`.

## 4. Closure mission ledger — 2026-09-15 (branch `fix/portal-auth-stabilization-20260914`, head `b3d139d`)
- Starting main: `ee61843`. Closure head: `b3d139d` (contains PR #25 deploy fix via merge `28afdde`, Parent/Player/Coach mount-time revalidation `3b5597c`, server-authoritative payments + reserved inventory + order cancel `d20dd8c`, catalog richness migration 0008 `b3d139d`).
- PR #25 (deploy foundation): OPEN, all checks PASS, awaiting owner review (branch protection requires 1 approving review).
- PR #26 (auth stabilization + closure): OPEN at `b3d139d`, all required checks PASS (static-gates, build, Production test suite, browser-qa, verify-production-boundary, 3x Store Golden Master).
- Merge gate: OWNER_REVIEW_REQUIRED (cannot self-approve; auto-merge disabled). No bypass attempted.
- Production `https://unitedolympicsports.store/` on main `ee61843`: site shell loads with correct product identity; `/api/v1/health` returns HTTP 500 (pre-existing FUNCTION_INVOCATION_FAILED gap, pending redeploy from fixed SHA).
- Local gates on `b3d139d`: `npm ci` clean, typecheck PASS, lint 0 errors, build PASS, `test:production` PASS, media-provenance PASS, `git diff --check` PASS, service-role leak gate PASS.
- Honestly PARTIAL (not CLOSED): Store Admin orders/inventory dashboard remains honest-empty (no fabricated rows; server order/inventory writes exist, admin read gateway pending), Reports/Content remain intentionally limited, provider transports remain ACTIVATION_REQUIRED per EXTERNAL-PROVIDERS.
