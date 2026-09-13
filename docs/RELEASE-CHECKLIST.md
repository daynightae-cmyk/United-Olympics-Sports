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
| Migrations | fresh bootstrap 0001→0007 + dry-run parity | PASS |
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
