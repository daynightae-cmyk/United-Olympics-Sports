# United Olympics Sports — Role / Permission Matrix (v1.0.0 closure)

Enforcement point: `resolveAuthorizationContext` (`src/server/authorization-context.ts`) merges
`app_user_roles` + `app_user_scopes` + `players`/`guardians`/`player_guardians`/`coaches`/`coach_groups`
bindings. Every protected handler asserts on the server; the client never grants access by itself.
Negative authorization coverage: `tests/multi-tenant-authorization.ts`, `tests/guardian-isolation.test.ts`,
`tests/coach-assignment-isolation.test.ts`, `tests/document-authorization.test.ts`.

| Capability | Super admin / admin | Coach | Guardian (parent) | Player | Store customer | Anonymous |
|---|---|---|---|---|---|---|
| Admin workspace (`/admin/*`, `admin-whoami`) | ✅ role-gated | ❌ | ❌ | ❌ | ❌ | ❌ → `/admin/login` |
| Countries / branches (create + update) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Players (create + update + read) | ✅ | scoped read via assignments | linked child only | self only | ❌ | ❌ |
| Sports / programs / groups catalog | read (+ bootstrap only) | assigned scope | linked scope | own relations | ❌ | ❌ |
| Sessions / schedules | manage | assigned groups | linked child | own | ❌ | ❌ |
| Attendance / performance write | ✅ | assigned athletes only | ❌ (read linked) | ❌ (read own) | ❌ | ❌ |
| Subscriptions / payments / users / messages admin | external-provider-required (501/503 until provider configured) | ❌ | own family (portal) | own (portal) | own orders only | ❌ |
| Store catalog read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ active products only (RLS) |
| Store checkout (pending order) | ❌ | ❌ | ❌ | ❌ | ✅ authenticated | ❌ (auth-required) |
| Store account/orders/wishlist | ❌ | ❌ | ❌ | ❌ | ✅ own (`customer_uid = ctx.uid`) | ❌ |
| Portal identity (`portal-whoami`, snapshots) | ❌ | own scope | own + linked children | self | ❌ | ❌ 401 |
| Public enquiries (insert) | n/a | n/a | n/a | n/a | n/a | ✅ insert-only |
| Unknown authenticated account | — | — | — | — | — | clean **Access Pending** state; sign-in alone grants nothing |

Cross-tenant rules: branch-scoped roles cannot read other branches; guardian cannot read unlinked children (manual ID/URL tampering fails closed); coach removed from a group converges to forbidden/logout, never an infinite retry; store user A cannot read user B orders; preview sessions/tokens are rejected by production builds.
