# United Olympics Sports — Client Acceptance Checklist (v1.0.0)

No code editing or browser-storage tricks required. Check each box in a normal browser.

## Owner / admin (`/admin/login`)

- [ ] Log in with Google; unknown accounts see **Access Pending**, never admin data.
- [ ] One-time **Settings → First Setup** creates the organization, then closes permanently.
- [ ] Create a country → branch → player; assign guardian, group, program, coach.
- [ ] Create a training schedule; record attendance + performance via coach flow.
- [ ] Finance shows the same payment/subscription totals as parent/player views (no contradictions).
- [ ] Store orders appear under `/admin/store/orders` once a real order exists.
- [ ] Audit Activity lists each mutation with actor and timestamp.

## Coach (`/coach/login`)

- [ ] Sees only assigned groups/players; unassigned IDs redirect to the list.
- [ ] Records attendance and performance; player/parent views update after reload.

## Player (`/player/login`)

- [ ] Sees own schedule, attendance, performance, subscriptions/payments where applicable.
- [ ] No screen stays on “Loading workspace” forever; failures show error + retry.

## Parent (`/parent/login`)

- [ ] Sees only linked children; switching child isolates data.
- [ ] Editing the URL to another child ID fails safely (redirect, no data).

## Shopper (`/store`)

- [ ] Browses shop/categories/search/cart without login; prices honest, no fake products.
- [ ] `/store/login` → wishlist is per-account; logout clears it from view.
- [ ] Checkout states exactly what is unconfigured; on success path, order appears under My Orders with server-computed totals.

## Public site

- [ ] Home/About/Sports/Programs/Philosophy/Contact render EN + AR (RTL), light/dark, mobile/desktop; official logo; contact enquiry submits.
- [ ] No “Academy” branding, no invented addresses/awards/partner claims.

## Sign-off

Owner name: ______________  Date: __________  Result: ACCEPTED / ACCEPTED WITH NOTES / REJECTED (notes attached).
