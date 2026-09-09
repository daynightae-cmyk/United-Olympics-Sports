# United Olympics Sports — Production Endpoint Matrix
**Document ID:** `UOS-PRODUCTION-ENDPOINT-MATRIX`  
**Generated:** 2026-09-09  
**Canonical Repository:** `https://github.com/daynightae-cmyk/United-Olympics-Sports.git`  
**Target Branch:** `main` (via `recovery/uos-production-closure-20260909`)  
**Parity Verification:** Express (`server.ts`) ⟷ Vercel Serverless (`api/index.ts`) 100% Unified

---

## 1. Executive Summary

All canonical API routes have been unified under the single authoritative dispatcher `dispatchApi` in `src/server/routes.ts`. Both REST path requests and query route parameters (`?route=...`) are supported with identical authorization, validation, rate limiting, and database handling.

---

## 2. Endpoint Matrix Table

| Endpoint Path | Query Route Key | Methods | Auth Level | Required Roles / Scopes | Domain / Tenant Entity | Abuse Prevention / Rate Limit | Production Status |
|---|---|---|---|---|---|---|---|
| `/api/v1/health`<br>`/health` | `health` | `GET` | Public | None | System Infrastructure | Bounded probe (5000ms max) | **OPERATIONAL / VERIFIED** |
| `/auth/session`<br>`/api/v1/auth/session` | `auth-session` | `POST` | Authenticated | Valid Bearer (Supabase or Firebase) | User Session | Bearer token verification | **OPERATIONAL / VERIFIED** |
| `/auth/revoke`<br>`/api/v1/auth/revoke` | `auth-revoke` | `POST` | Privileged | Firebase Token + Admin SDK | Session Revocation | Guarded by `authAdministrativeActionsConfigured()` | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/whoami`<br>`/admin/whoami` | `admin-whoami` | `GET` | Privileged Admin | `admin`, `super_admin` | Multi-Tenant Administration | Strict role assertion (403 if unauthorized) | **OPERATIONAL / VERIFIED** |
| `/api/v1/portal/whoami`<br>`/portal/whoami` | `portal-whoami` | `GET` | Authenticated Portal User | `player`, `guardian`, `coach`, or implicit link | Portal Domain Context | Tenant bindings (org, country, branch, player, coach) | **OPERATIONAL / VERIFIED** |
| `/public/enquiries`<br>`/api/v1/public/enquiries` | `public-enquiries` | `POST` | Public | None | Public Admissions Enquiry | Honeypot trap + Sliding Window (5 req/10m/IP) + Regex phone/email | **OPERATIONAL / VERIFIED** |
| `/api/v1/requests/sports` | `sport-request` | `POST` | Authenticated | Player or Guardian of Player | Service Requests | `assertPlayerRelationship` enforcement | **OPERATIONAL / VERIFIED** |
| `/api/v1/catalog`<br>`/catalog` | `catalog` | `GET` | Public | None | Store Inventory | SQL projection with non-negative constraints | **OPERATIONAL / VERIFIED** |
| `/api/v1/attendance`<br>`/attendance` | `attendance-record` | `POST` | Authenticated Coach / Admin | `coach`, `branch_admin`, `super_admin` with group assignment | Attendance Vertical Slice | Multi-tenant branch assertion + Group assignment check + Idempotent upsert + Audit log + Notification event | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/organization` | `admin-organization` | `GET` | Privileged Admin | `admin`, `super_admin` | Organization Management | Multi-tenant organization scope isolation | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/countries` | `admin-countries` | `GET`, `POST` | Privileged Admin | `admin`, `super_admin` | Country Management | Paged query + unique country code constraints | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/branches` | `admin-branches` | `GET`, `POST` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Branch Management | Country-scoped branch isolation | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/sports` | `admin-sports` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Sports Catalog | Active sports listing | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/programs` | `admin-programs` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Training Programs | Sport & branch scoped program catalog | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/groups` | `admin-groups` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Training Groups | Coach assignment & capacity verification | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/players` | `admin-players` | `GET`, `POST` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Player Management | Multi-tenant branch scope assertion | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/coaches` | `admin-coaches` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Coach Roster | Branch-bound coach roster | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/parents` | `admin-parents` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Guardian Roster | Guardian-player binding isolation | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/sessions` | `admin-sessions` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin`, `coach` | Session Scheduling | Temporal date-range query | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/registrations` | `admin-registrations` | `GET` | Privileged Admin | `admin`, `super_admin`, `branch_admin` | Registration Intake | Status filtered intake queue | **OPERATIONAL / VERIFIED** |
| `/api/v1/admin/performance` | `admin-performance` | `POST` | Privileged Staff | `admin`, `coach` | Player Performance Records | 0-100 bounded score validation + audit trail | **OPERATIONAL / VERIFIED** |
| `/api/v1/portal/player/data` | `portal-player-data` | `GET` | Authenticated Player | `player` (or bound guardian) | Player Portal | Strict self-only record isolation | **OPERATIONAL / VERIFIED** |
| `/api/v1/portal/parent/children` | `portal-parent-children` | `GET` | Authenticated Guardian | `guardian` | Parent Portal | Strict guardian-child link isolation | **OPERATIONAL / VERIFIED** |
| `/api/v1/portal/coach/scope` | `portal-coach-scope` | `GET` | Authenticated Coach | `coach` | Coach Portal | Group assignment scope enforcement | **OPERATIONAL / VERIFIED** |
| `/api/v1/store/products` | `store-products` | `GET` | Public | None | Store Catalog | Server-authoritative catalog | **OPERATIONAL / VERIFIED** |
| `/api/v1/store/checkout` | `store-checkout` | `POST` | Authenticated User | Valid Bearer | Store Orders | Concurrency-safe inventory deduction guard | **OPERATIONAL / VERIFIED** |
| `/api/v1/payments/intent` | `payment-intent` | `POST` | Authenticated User | Valid Bearer | Payments | Provider-neutral intent creation + idempotency deduplication | **OPERATIONAL / VERIFIED** |
| `/api/v1/payments/webhook` | `payment-webhook` | `POST` | Public Webhook | Provider Signature Validated | Payments Webhook | Duplicate webhook event protection | **OPERATIONAL / VERIFIED** |
| `/api/v1/documents/register` | `document-register` | `POST` | Authenticated User | Valid Bearer | Documents Registry | Path traversal sanitization & metadata storage | **OPERATIONAL / VERIFIED** |
| `/api/v1/documents/signed-url` | `document-signed-url` | `POST` | Authenticated User | Valid Bearer (Owner or Admin) | Secure Document Retrieval | HMAC-SHA256 time-bounded signed URL | **OPERATIONAL / VERIFIED** |

---

## 3. Security & Anti-Abuse Specifications

1. **Sliding Window Rate Limiter**:
   - Implemented in `src/server/rate-limiter.ts`.
   - In-memory store with periodic automatic cleanup of expired timestamps.
   - Emits standard `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and `Retry-After` headers.
   - Defaults: 5 requests per 10 minutes per IP for public form submissions.

2. **Honeypot Filtering**:
   - Rejects submissions populating hidden bot-trap fields (`website`, `hp`, `address_line2_confirm`).
   - Returns 400 `SPAM_DETECTED`.

3. **Multi-Tenant Authorization Context**:
   - Implemented in `src/server/authorization-context.ts`.
   - Strict hierarchical boundary enforcement: `assertCanAccessOrganization`, `assertCanAccessCountry`, `assertCanAccessBranch`, `assertCanManagePlayer`, `assertCanRecordAttendance`.
   - Cross-tenant access attempts are rejected with 403 `CROSS_ORGANIZATION_DENIED`, `CROSS_COUNTRY_DENIED`, or `CROSS_BRANCH_DENIED`.

4. **Structured Audit Trail**:
   - Implemented in `src/server/audit.ts`.
   - Sensitive credentials and tokens (`token`, `password`, `secret`, `authorization`, `otp`) are automatically redacted before persistence.
   - Audit records track `actorUid`, `actorRoles`, `organizationId`, `countryId`, `branchId`, `entityType`, `entityId`, `correlationId`, and `metadata`.
