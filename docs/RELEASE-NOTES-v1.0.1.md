# United Olympics Sports — v1.0.1

Release date: 2026-09-17

This patch is the client-delivery follow-up to v1.0.0. It records only changes supported by repository and runtime evidence.

## Included

- Canonical Supabase authentication authority is pinned for server-side bearer-token verification so unrelated generic Supabase integration variables cannot retarget identity verification.
- Google/Supabase authentication remains role-gated by the application authorization layer.
- Passkey / device-biometric sign-in surfaces and authenticated passkey management introduced before this patch remain part of the current portal family.
- Installable PWA lifecycle is completed with a production-only service worker.
- PWA caching is deliberately conservative: authenticated routes, API traffic, public enquiry submission, version checks, writes, and cross-origin requests bypass the service-worker cache.
- Navigation uses a network-first strategy with an offline application-shell fallback.
- Production tests lock both the authentication-authority behavior and the PWA cache-safety contract.

## Verified data state

The canonical Supabase Auth project has an authenticated user associated with an active `super_admin` application role. This verifies identity and role data exist; it does not by itself replace interactive browser acceptance for every portal.

## Still requires interactive owner/provider evidence

- Full authenticated browser acceptance for Admin / Player / Parent / Coach using intended production accounts.
- Stripe test-provider end-to-end acceptance from application checkout through test PaymentIntent and signed webhook reconciliation. The repository proof intentionally requires a real authenticated test-user token and explicit test consent; it does not fabricate a provider PASS.
- Final owner/client acceptance sign-off.

## Version contract

- Application version: `1.0.1`
- Build label: `client-delivery-20260917`
- Minimum supported version: `1.0.0`

Native iOS/Android binary changes, when introduced, remain subject to their platform build/signing/store delivery requirements. Web/PWA delivery does not claim to bypass those requirements.
