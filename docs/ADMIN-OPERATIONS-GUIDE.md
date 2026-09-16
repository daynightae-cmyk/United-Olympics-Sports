# United Olympics Sports — Admin Operations Guide (v1.0.0 closure)

Owner entry: `/admin/login` (Google) → `/admin`. Unknown accounts see **Access Pending**; sign-in alone grants nothing.

## First setup (one-time)

1. Open **Settings → First Setup**, create the real organization (closes permanently after use).
2. Add countries, then branches (organization is derived from your grant — never typed).
3. Add sports/programs/groups via the migration-managed catalog, then players, coaches, guardians, and role bindings in **Users & Roles**.

## Live capability truth (enforced by `productionCapabilities.ts` + server)

| Module | Read | Create | Update | Notes |
|---|---|---|---|---|
| Countries, branches, players | ✅ live | ✅ | ✅ | Full CRUD with validation, search/filter/sort/pagination |
| Organization | ✅ | — | — | One-time bootstrap only |
| Sports, programs, groups, coaches, parents, sessions, registrations, achievements, events, announcements, audit | ✅ live | — | — | Migration-managed or provider-owned; UI explains why creation is disabled |
| Subscriptions, payments, users, messages | scoped | — | — | `EXTERNAL_PROVIDER_REQUIRED` until provider configured |
| Reports, content | — | — | — | Disabled by design; no fake totals rendered |

Every list has empty / error / retry states; mutations validate server-side, enforce branch boundaries, and return typed errors. No delete verbs exist in production (archival only where domain-safe).

## Daily routines

- **Attendance/performance:** review coach-submitted records; corrections go through the same authorized endpoints.
- **Finance:** subscriptions/payments reflect provider truth; duplicate webhooks are idempotent; refunds/cancellation flow through the claim lifecycle (see STORE-OPERATIONS-GUIDE).
- **Audit:** every mutation is visible under **Audit Activity** with actor, entity, and timestamp.
- **Access changes:** disable a user in Users & Roles; their sessions converge to logout/forbidden on next validation (no infinite retry).
