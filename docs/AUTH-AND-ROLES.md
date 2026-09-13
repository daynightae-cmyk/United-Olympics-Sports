# Auth & Roles — United Olympics Sports

## 1. Canonical flow
Google (Supabase Auth) → OAuth callback → server verifies JWT → role/scope lookup (`app_user_roles`, `app_user_scopes`) → binding lookup (player/guardian/coach) → authorized portal destination. Google sign-in alone grants nothing; unknown accounts see Access Pending.

## 2. Providers
- **Primary:** Supabase Auth (Google OAuth, session restore, refresh rotation, server revocation via `/auth/revoke`).
- **Secondary (migration-compatible):** Firebase Auth. Server selects deterministically by token issuer (Supabase `iss` → Supabase verify; `securetoken.google.com` → Firebase verify; unknown → Supabase then Firebase). Firebase Admin is used only for verification/revocation — never shipped to browsers.
- **Phone/OTP:** implemented end-to-end through Supabase Auth SMS (`POST /api/v1/auth/phone/request|verify` → `PlayerAuthGateway` → portal binding check). Policy enforced server-side: E.164 normalization, honeypot, 3 requests/10 min/number, 5 verify attempts/10 min, audit, masked logging. Without provider SMS on the Supabase project, both ends fail closed with Google-sign-in guidance. No test OTP is ever accepted in production.

## 3. Role model
`super_admin` (all scopes) · `admin` (tenant scope) · `coach` (assigned groups/players) · `guardian` (linked children) · `player` (own record) · `store_customer` (own orders). Tenant law: identity → roles → scopes → bindings → entity. Client-supplied IDs are never trusted; every request re-resolves scope server-side. Negative isolation is tested (guardian, coach, cross-tenant).

## 4. Session safety
Short-lived access JWTs, `safeReturnTo` (relative paths only), expired-session recovery to login, no OAuth tokens or payment secrets in logs (redacted audit metadata).
