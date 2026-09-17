# United Olympics Sports — Client Acceptance Checklist (v1.0.1)

**Delivery date:** 2026-09-17
**Production domain:** https://unitedolympicsports.store

Use a normal production browser/device. Do not use browser-storage tricks or preview/demo flags to manufacture acceptance.

## Owner / Admin (`/admin/login`)

- [ ] Google sign-in completes OAuth callback and establishes the application session.
- [ ] Authorized owner identity enters Admin; unknown/unassigned identities see a safe access-pending/denied state and never admin data.
- [ ] Passkey/device-biometric option is visible only where the platform supports it and does not bypass role authorization.
- [ ] A registered passkey can be managed from the authenticated security surface without exposing credentials/secrets.
- [ ] One-time **Settings → First Setup** creates the organization when legitimately required, then closes according to the product contract.
- [ ] Create or verify country → branch → player; assign guardian, group, program and coach using real acceptance data.
- [ ] Create/verify a training schedule; record attendance and performance through the Coach flow.
- [ ] Finance shows consistent payment/subscription data across authorized Admin/Parent/Player views.
- [ ] Store orders appear under `/admin/store/orders` once a real test order exists.
- [ ] Audit Activity records expected mutations with actor and timestamp.

## Coach (`/coach/login`)

- [ ] Intended Coach account signs in and reaches the Coach portal.
- [ ] Coach sees only assigned groups/players; unassigned IDs do not expose data.
- [ ] Coach can record attendance/performance and the authorized Player/Parent views reflect the result after refresh.

## Player (`/player/login`)

- [ ] Intended Player account signs in and reaches the Player portal.
- [ ] Player sees only own schedule, attendance, performance and authorized subscription/payment information.
- [ ] No screen stays indefinitely on a loading state; failures expose a recoverable product error rather than raw engineering output.

## Parent (`/parent/login`)

- [ ] Intended Parent account signs in and reaches the Parent portal.
- [ ] Parent sees only linked children; child switching keeps records isolated.
- [ ] Editing a URL/object identifier to another child fails safely and exposes no unauthorized data.

## Store and Stripe test acceptance (`/store`)

- [ ] Shopper can browse public catalog/search/cart without login where the product permits it.
- [ ] `/store/login` account state is isolated; wishlist/order history does not leak between accounts.
- [ ] Checkout uses server-computed totals and does not trust client-supplied payable amounts.
- [ ] With Stripe **test mode** configured, an authenticated test-user checkout creates a Stripe PaymentIntent.
- [ ] Repeating the same idempotency key returns the same intent instead of creating a duplicate.
- [ ] A Stripe test payment/provider event reaches the signed webhook endpoint.
- [ ] Webhook replay is deduplicated and application payment/order state reconciles correctly.
- [ ] No Stripe secret key appears in browser/API responses.

## PWA / installable web app

- [ ] Browser recognizes the production site as installable where platform criteria are met.
- [ ] Installed/standalone launch opens the United Olympics Sports application shell correctly.
- [ ] Reloading an already visited application route while temporarily offline shows the cached shell rather than a blank page.
- [ ] Auth/API/payment/version-check responses are never accepted from a stale service-worker cache.
- [ ] Returning online restores current network-backed operational data.

## Public site

- [ ] Home/About/Sports/Programs/Philosophy/Contact render correctly in EN + AR/RTL, light/dark and representative mobile/desktop widths.
- [ ] Official United Olympics Sports logo/branding is used; no `Academy` brand substitution appears.
- [ ] Contact enquiry submission returns a truthful success/error state.
- [ ] No invented addresses, awards, partners, statistics or people are presented as production truth.

## Release identity

- [ ] About/update metadata reports application version `1.0.1` / build `client-delivery-20260917` where surfaced.
- [ ] No user-facing screen still labels the delivered build as `0.0.0` / `preview`.

## Sign-off

Owner / Client name: ______________________________
Date: __________________
Result: **ACCEPTED / ACCEPTED WITH NOTES / REJECTED**

Notes / evidence links:

__________________________________________________________________

__________________________________________________________________
