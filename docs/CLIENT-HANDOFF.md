# United Olympics Sports — Client Handoff Pack
**Product:** United Olympics Sports / يونايتد أوليمبيكس سبورت
**Repository:** `daynightae-cmyk/United-Olympics-Sports` · canonical branch `main`
**Production URL:** https://unitedolympicsports.store
**Database:** Supabase project `olmbezzzqavgjwydlfey.supabase.co`
**Auth provider:** Supabase Auth (Google OAuth), Firebase Auth retained as migration-compatible secondary

## 1. What is delivered
- Public website (home, about, 6 sports, programs, coaches philosophy, live contact enquiries, privacy/terms/shipping/returns, store entry) with bilingual EN/AR, RTL, dark/light, responsive, SEO (sitemap, robots, canonical, OpenGraph).
- Admin workspace with First Setup bootstrap, live CRUD for countries/branches/players/performance, live read scope for catalog/operations/engagement/audit, and explicit Preview mode for demos.
- Player / Parent / Coach portals with authenticated server bindings, guardian isolation, coach assignment isolation, plus explicit preview sessions.
- Store with live catalog gateway, durable cart/wishlist, server-authoritative checkout (pending orders), honest admin states.
- Security: scoped RLS (migration 0006), server-only payment webhooks, tenant authorization on every request, rate limiting, security headers, secret-leak gates.
- CI: staged Verify pipeline (static gates → build → production tests → browser QA → Store Golden Master).

## 2. First-run procedure (owner)
1. Sign in with Google at `/admin/login`.
2. Open **Settings → First Setup** and create the real organization (one-time; bootstrap closes permanently afterwards).
3. Add countries, then branches (organization is derived from your grant — never typed).
4. Add players, groups/programs via migration-managed catalog, sessions, staff bindings in Users & Roles.
5. Add store catalog rows (`catalog_products` + `inventory`) for the live shop.

## 3. Entry points
| Who | Where |
|---|---|
| Owner/Admin | `/admin/login` → `/admin` |
| Player | `/player/login` → `/player/home` |
| Parent | `/parent/login` → `/parent` |
| Coach | `/coach/login` → `/coach` |
| Shopper | `/store` · account `/store/login` |
| OAuth return | `/auth/callback` |

Unknown authenticated accounts see a clean **Access Pending** state — Google sign-in never grants admin by itself.

## 4. Truth rules the owner must know
- Empty database shows intentional empty states, never fake people, prices, schedules or revenue.
- Preview mode is explicit (badges, notices). Production never shows preview data silently.
- Disabled controls always carry an explanation (migration-managed catalog, external provider required, deferred engine).

## 5. Acceptance matrix
See `docs/RELEASE-CHECKLIST.md` for the route-by-route matrix and release gates.

## 6. External activations (not code work)
See `docs/EXTERNAL-PROVIDERS.md` and `docs/KNOWN-DEPENDENCIES.md`. No money moves until a payment merchant account is connected; no SMS/email leaves until a delivery provider is configured.
