# Production readiness continuation

This document records the production-transition boundary for **United Olympics Sports | يونايتد أوليمبيكس سبورت**. It intentionally distinguishes implemented code from external infrastructure that has not been proven.

## Current production boundary

The application now has a server-side API boundary that is designed to fail closed. Browser-supplied user IDs are not accepted as authorization proof. Protected routes derive identity from a verified Firebase ID token and may augment roles/scopes from the database when the production database is configured.

### Implemented routes

| Route | Access | Behavior |
| --- | --- | --- |
| `GET /api/v1/health` | Public | JSON-only readiness metadata; never exposes secrets. |
| `POST /auth/session` | Bearer token | Verifies the server-side identity and returns safe role/scope metadata. |
| `POST /auth/revoke` | Bearer token | Revokes refresh tokens only when administrative Firebase credentials are configured. |
| `GET /api/v1/admin/whoami` | Admin/Super Admin | Demonstrates protected role authorization. |
| `POST /public/enquiries` | Public | Validates and persists an enquiry only when the production database is configured. |
| `POST /api/v1/requests/sports` | Authenticated + relationship check | Creates a sports service request; player/guardian relationship is verified server-side. Client-provided prices are not accepted. |
| `GET /api/v1/catalog` | Public | Reads active catalog/inventory data from the production data service. |

Unknown `/api`, `/auth`, and `/public` routes return structured JSON errors instead of falling through to the SPA HTML response in the local Node server. Vercel routes the supported production endpoints to the serverless handler before the SPA fallback.

## Data model foundation

`src/db/schema.ts` and `src/db/migrations/0001_production_foundation.sql` define the first institutional model for:

- organization → country → branch;
- sport → program → group → session;
- players, guardians and coaches;
- player/guardian relationships;
- attendance and performance evaluations;
- subscriptions and payments;
- documents and audit logs;
- public enquiries and service requests;
- catalog products and inventory;
- server-side roles and scopes.

The migration is **not evidence that a production database has been provisioned or migrated**. Migration execution requires an explicitly configured and reviewed production database.

## P0–P5 status

### P0 — Production boundary and fail-closed routing

Implemented in code. API errors are JSON; the SPA remains the fallback only for product routes. Runtime database access is lazy and refuses to initialize without configuration.

### P1 — Authentication and authorization

Implemented foundation. Firebase ID tokens are verified on the server. Roles/scopes are read from verified claims and, when configured, server-side role/scope tables. Player/guardian service-request access performs a database relationship check. Additional domain-specific authorization tests should be added as more write APIs are introduced.

### P2 — Enquiries and sports service requests

Implemented foundation. Public enquiries receive a server-generated reference only after persistence succeeds. Sports requests receive a server-generated reference and do not trust client pricing. Fees remain pending a server-side quote/catalog decision.

### P3 — Catalog, inventory and payments

Catalog/inventory read boundary is present. **Payments are deliberately not activated.** A real provider, sandbox verification and webhook signature verification are required before a payment-intent endpoint may be enabled.

### P4 — Assets and licensing

Not closed by this backend change. Existing verified Football/Swimming/Basketball media must remain protected. A separate asset inventory must record repository path/source URL, license/approval provenance and duplication status before unverified media can be treated as production-approved.

### P5 — Build, routes, mobile and language verification

The production-readiness workflow runs TypeScript lint, server contract tests and a production build. Full browser/device QA, Arabic/English visual QA and live Vercel endpoint proof remain separate deployment evidence requirements.

## Required environment variables

No secret values belong in source control.

- `DATABASE_URL` **or** `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`/`SQL_ADMIN_USER`, `SQL_PASSWORD`/`SQL_ADMIN_PASSWORD`
- optional SQL controls: `SQL_PORT`, `SQL_POOL_MAX`, `SQL_SSL`, `SQL_SSL_REJECT_UNAUTHORIZED`
- `FIREBASE_PROJECT_ID` (verification may use the checked-in public Firebase project metadata as a fallback)
- `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` for administrative Firebase actions such as revocation
- future payment boundary: `PAYMENTS_PROVIDER`, `PAYMENTS_WEBHOOK_SECRET`
- future SMS boundary: `SMS_PROVIDER`

## Explicit production blockers

Do not claim full production readiness until evidence exists for all applicable items:

1. production PostgreSQL/Cloud SQL connectivity and reviewed migration execution;
2. production authorization records and deny/allow relationship tests against that database;
3. Firebase administrative credential validation for revocation/privileged operations;
4. payment-provider sandbox flow and signed webhook verification;
5. SMS provider integration if SMS is required;
6. asset-license/approval inventory;
7. live Vercel direct-route proof for API and SPA routes;
8. responsive Arabic/English browser QA and console verification.

The health endpoint reports configuration presence only. It must not be treated as proof that an external dependency is healthy or approved for production.
