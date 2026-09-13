# Admin Guide — United Olympics Sports
Admin entry: `/admin/login` (Google via Supabase). Preview mode (if enabled) is badged everywhere.

## 1. First Setup (once)
Settings → First Setup → create the organization. This binds your identity as `super_admin` and closes permanently (`BOOTSTRAP_CLOSED` afterwards). Then: Countries → Branches → Players → Groups/Programs → Sessions.

## 2. What you can do live
- **Write:** Countries, Branches, Players, Performance evaluations.
- **Read:** Organization, Sports, Programs, Groups, Coaches, Parents, Sessions, Registrations, Achievements, Events, Announcements, Audit Activity.
- **Disabled by design:** hard deletes (use archive/deactivate), audit log edits (immutable), sport catalog edits (migration-managed), payments/subscriptions/users/messages writes (external provider required — see EXTERNAL-PROVIDERS).

## 3. People & access
Users & Roles: view users, assign/remove roles, set organization/country/branch scopes, link player/guardian/coach identity, activate/deactivate. Sensitive changes are audit-logged. Never put service-role keys in browser settings.

## 4. Operations
- Schedules/Attendance: scoped to your branches; coach-recorded evaluations flow to player read views.
- Registrations: public enquiries land here read-only; resolve via the enquiry workflow.
- Reports: live scope aggregates + CSV export. Generated-report records are a deferred engine (Preview only).
- Store admin: live catalog read; orders/inventory/discounts/settings show honest unavailable states until activation.

## 5. Empty states
A fresh install shows guided empty states (configure organization → countries → branches …), never zeros without explanation and never fake data.
