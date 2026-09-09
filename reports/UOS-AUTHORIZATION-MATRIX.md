# United Olympics Sports - Multi-Tenant Authorization Matrix

**Date**: 2026-09-09  
**Status**: ENFORCED & VERIFIED  
**Module**: `src/server/authorization-context.ts`  
**Test Suite**: `tests/multi-tenant-authorization.ts`  

---

## 1. Architectural Model

Multi-tenant security in United Olympics Sports is enforced through a centralized `AuthorizationContext`. Rather than relying on naive role-name checks, queries and mutations are scoped to explicit hierarchical tenant and relationship boundaries:

- **Organization**: Top-level entity (`organizations`).
- **Country**: Country-level branch federation (`countries`).
- **Branch**: Operational athletic facility (`branches`).
- **Domain Relationships**:
  - **Player**: Self-binding via `players.user_uid`.
  - **Guardian**: Linked child binding via `player_guardians`.
  - **Coach**: Group and athlete assignments via `coaches`, `groups`, and `sessions`.

---

## 2. Role & Policy Resolution Matrix

| Role | Scope | Allowed Actions | Restricted / Denied Actions |
|---|---|---|---|
| `super_admin` | Universal (`*`) | Full access across all organizations, countries, branches, finance, store, and users. | None. |
| `org_admin` | `organization_id` bound | Can manage all countries, branches, programs, coaches, and athletes within their bound organization. | **Cross-Organization Denial**: Cannot read or mutate records belonging to any other organization. |
| `country_admin` | `country_id` bound | Can manage branches, sports, programs, and staff within their bound country. | **Cross-Country Denial**: Cannot access branches or data in other countries. |
| `branch_admin` | `branch_id` bound | Can schedule sessions, manage local coaches, enroll players, and view local branch performance. | **Cross-Branch Denial**: Cannot access or modify other branches. |
| `coach` | `coach_id`, `group_ids` | Can record attendance and evaluate performance for **assigned groups and athletes**. | **Unassigned Coach Denial**: Cannot record attendance or submit evaluations for unassigned groups or athletes. |
| `parent` / `guardian` | `guardian_id`, `player_ids` | Can view schedule, attendance, payments, documents, and messages for **linked children**. | **Unrelated Guardian Denial**: Cannot access records of unlinked athletes. |
| `player` | `player_id` self | Can view own profile, schedule, attendance history, achievements, and subscriptions. | **Unrelated Player Denial**: Cannot access records of other athletes. |

---

## 3. Negative Isolation Test Verification

All isolation boundaries are covered by unit and contract integration tests:
- `canAccessOrganization`: Verified cross-organization rejection (`CROSS_ORGANIZATION_DENIED`).
- `canAccessCountry`: Verified cross-country rejection (`CROSS_COUNTRY_DENIED`).
- `canAccessBranch`: Verified cross-branch rejection (`CROSS_BRANCH_DENIED`).
- `canManagePlayer`: Verified unrelated athlete rejection (`UNRELATED_PLAYER_DENIED`).
- `canRecordAttendance`: Verified unassigned coach rejection (`UNASSIGNED_COACH_DENIED`).
- `canRecordPerformance`: Verified unassigned evaluation rejection (`UNASSIGNED_COACH_DENIED`).
