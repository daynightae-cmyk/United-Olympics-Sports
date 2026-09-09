# United Olympics Sports — Production Endpoint & Capabilities Matrix
**Document ID:** `UOS-PRODUCTION-ENDPOINT-MATRIX`
**Generated:** 2026-09-10
**Product:** United Olympics Sports / يونايتد أوليمبيكس سبورت
**Canonical Repository:** `https://github.com/daynightae-cmyk/United-Olympics-Sports.git`
**Authoritative Branch:** `main`

---

## 1. Executive Summary

This matrix establishes the authoritative operational specification for all United Olympics Sports backend API endpoints, admin data capabilities, gateway bindings, and fail-closed error contracts.

All fake success returns, mock arrays, and silent empty fallbacks have been completely eliminated.

---

## 2. Admin Capabilities & Endpoint Registry

Governed by `src/admin/data/productionCapabilities.ts` and enforced via `tests/production-gateway-completeness.test.ts`.

| Entity | Route Pattern | Methods | Read Status | Write Status | Delete Status | Backend Handler | Error Handling Contract |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Organization** | `/api/v1/admin/organization` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminOrganizationHandler` | 404 returns null; 401/403/500 bubbles `AdminGatewayError` |
| **Countries** | `/api/v1/admin/countries[/:id]` | GET, POST, PUT | `LIVE_READ_WRITE` | `LIVE_READ_WRITE` | `DISABLED` | `adminCountriesHandler` | CRUD live; delete throws 405 `CAPABILITY_DISABLED` |
| **Branches** | `/api/v1/admin/branches[/:id]` | GET, POST, PUT | `LIVE_READ_WRITE` | `LIVE_READ_WRITE` | `DISABLED` | `adminBranchesHandler` | CRUD live; delete throws 405 `CAPABILITY_DISABLED` |
| **Sports** | `/api/v1/admin/sports[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminSportsHandler` | Codified Olympic catalog; writes throw 405 `CAPABILITY_DISABLED` |
| **Programs** | `/api/v1/admin/programs[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminProgramsHandler` | Developmental paths; writes throw 405 `CAPABILITY_DISABLED` |
| **Groups** | `/api/v1/admin/groups[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminGroupsHandler` | Training groups; writes throw 405 `CAPABILITY_DISABLED` |
| **Players** | `/api/v1/admin/players[/:id]` | GET, POST, PUT | `LIVE_READ_WRITE` | `LIVE_READ_WRITE` | `DISABLED` | `adminPlayersHandler` | Full CRUD; hard-delete throws 405 (archival required) |
| **Coaches** | `/api/v1/admin/coaches[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminCoachesHandler` | Staff roster; writes throw 405 `CAPABILITY_DISABLED` |
| **Parents** | `/api/v1/admin/parents[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminParentsHandler` | Guardian accounts; writes throw 405 `CAPABILITY_DISABLED` |
| **Sessions** | `/api/v1/admin/sessions[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminSessionsHandler` | Schedules; writes throw 405 `CAPABILITY_DISABLED` |
| **Performance** | `/api/v1/admin/performance` | POST | `LIVE_READ_WRITE` | `LIVE_READ_WRITE` | `DISABLED` | `adminPerformanceHandler` | Real-time score recording with bounds check [0-100] |
| **Registrations** | `/api/v1/admin/registrations[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminRegistrationsHandler` | Inquiries & service requests; writes throw 405 |
| **Subscriptions**| `/api/v1/admin/subscriptions` | — | `EXTERNAL_PROVIDER_REQUIRED` | `EXTERNAL_PROVIDER_REQUIRED` | `DISABLED` | External Gateway | Throws 501 `EXTERNAL_PROVIDER_REQUIRED` |
| **Payments** | `/api/v1/payments/intent` | POST | `EXTERNAL_PROVIDER_REQUIRED` | `EXTERNAL_PROVIDER_REQUIRED` | `DISABLED` | `paymentIntentHandler` | Provider boundary (Stripe/Paymob) |
| **Reports** | `/api/v1/admin/reports` | — | `DISABLED` | `DISABLED` | `DISABLED` | — | Throws 405 `CAPABILITY_DISABLED` |
| **Content** | `/api/v1/admin/content` | — | `DISABLED` | `DISABLED` | `DISABLED` | — | Throws 405 `CAPABILITY_DISABLED` |
| **Users & Roles** | `/api/v1/admin/users` | — | `EXTERNAL_PROVIDER_REQUIRED` | `EXTERNAL_PROVIDER_REQUIRED` | `DISABLED` | Identity Boundary | Throws 501 `EXTERNAL_PROVIDER_REQUIRED` |
| **Achievements** | `/api/v1/admin/achievements[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminAchievementsHandler` | Live query from `achievements` table |
| **Events** | `/api/v1/admin/events[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminEventsHandler` | Live query from `events` table |
| **Announcements** | `/api/v1/admin/announcements[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminAnnouncementsHandler` | Live query from `announcements` table |
| **Messages** | `/api/v1/admin/messages` | — | `EXTERNAL_PROVIDER_REQUIRED` | `EXTERNAL_PROVIDER_REQUIRED` | `DISABLED` | External Gateway | Throws 501 `EXTERNAL_PROVIDER_REQUIRED` |
| **Audit Activity**| `/api/v1/admin/audit[/:id]` | GET | `LIVE_READ_ONLY` | `DISABLED` | `DISABLED` | `adminAuditHandler` | Immutable audit trail from `audit_logs` table |

---

## 3. Portals & Operational Endpoints

| Domain | Route | Methods | Auth Scope | Implementation Status |
| :--- | :--- | :---: | :--- | :---: |
| **Player Portal** | `/api/v1/portal/player/data` | GET | `player` (scoped by `playerId`) | **PRODUCTION READY** |
| **Parent Portal** | `/api/v1/portal/parent/children`| GET | `guardian` (linked children) | **PRODUCTION READY** |
| **Coach Portal** | `/api/v1/portal/coach/scope` | GET | `coach` (assigned groups) | **PRODUCTION READY** |
| **Store Catalog** | `/api/v1/store/products` | GET | Public / Anon | **PRODUCTION READY** |
| **Store Checkout**| `/api/v1/store/checkout` | POST | Authenticated / Customer | **PRODUCTION READY** |
| **Payments** | `/api/v1/payments/intent` | POST | Customer / Parent | **PRODUCTION READY** |
| **Payments Webhook**| `/api/v1/payments/webhook`| POST | Webhook signature verified | **PRODUCTION READY** |
| **Documents Reg** | `/api/v1/documents/register` | POST | Authenticated Staff / Admin | **PRODUCTION READY** |
| **Documents URL** | `/api/v1/documents/signed-url`| GET | Authorized User (HMAC-SHA256) | **PRODUCTION READY** |
| **Public Enquiries**| `/api/v1/public/enquiries` | POST | Public (Honeypot protected) | **PRODUCTION READY** |
| **Sport Requests** | `/api/v1/requests/sports` | POST | Public / Parent | **PRODUCTION READY** |
| **Attendance** | `/api/v1/attendance` | POST | Assigned Coach / Admin | **PRODUCTION READY** |
| **Health** | `/api/v1/health` | GET | Public | **PRODUCTION READY** |
| **Auth Session** | `/api/v1/auth/session` | GET | Public / Bearer token | **PRODUCTION READY** |
| **Auth Revoke** | `/api/v1/auth/revoke` | POST | Bearer token | **PRODUCTION READY** |
| **Admin WhoAmI** | `/api/v1/admin/whoami` | GET | Admin / Staff | **PRODUCTION READY** |
| **Portal WhoAmI** | `/api/v1/portal/whoami` | GET | Portal User | **PRODUCTION READY** |

---

## 4. Truth Model: Mock Elimination Guarantee

1. **Calculated Aggregates:** Player attendance rate and average performance scores are dynamically computed from `attendance` and `performance_evaluations` tables using SQL aggregation (`count`, `avg`, `round`). Hardcoded mocks (`92`, `88`) are eliminated.
2. **Error Bubbling:** All gateway requests bubble network failures and 401/403/500 errors as typed `AdminGatewayError`. Only 404 on single-item retrieval resolves to `null`.
3. **Data Integrity:** Destructive deletes are disabled across all core relational tables to ensure audit and regulatory compliance.
