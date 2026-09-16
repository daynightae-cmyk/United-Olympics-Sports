# United Olympics Sports — Portal Operations Guide (v1.0.0 closure)

## Player (`/player/login` → `/player`)

- Identity is server-bound: exactly one `playerIds` binding must match the active player, else logout.
- Sees own profile, branch/sport/program/group/coach relations, schedules, attendance, performance, subscriptions/payments (where policy permits), achievements, documents, notifications, messages, settings.
- Cannot switch IDs manually; no admin list downloads; documents/messages enforce ownership.

## Parent (`/parent/login` → `/parent`)

- Exactly one `guardianIds` binding; children list comes from `guardianPlayerIds` only.
- Child switcher is isolated per authorized child; manual ID/URL tampering fails closed.
- Sees child's schedule/attendance/performance/subscriptions/payments; payments reconcile with Admin finance truth.
- One guardian's local state never bleeds into another session; logout clears identity-scoped storage.

## Coach (`/coach/login` → `/coach`)

- Server scope snapshot (`assignedGroups`, `assignedPlayerIds`) drives everything; binding mismatch purges stale storage and logs out.
- Records attendance/performance only for assigned athletes; unauthorized player/group URLs redirect to the list.
- After admin revocation (removed group, role change, disabled coach), the portal converges to logout/forbidden — never an infinite retry loop.

## Error contract (all portals)

Every async screen settles to success / empty / error+retry / explicit login redirect. Request timeouts are bounded (portal fetch 10s, Stripe 15s, Supabase verify 5s); retries re-run the failed boundary; session mismatch never leaves a stale authenticated shell.
