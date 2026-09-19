# External Providers — United Olympics Sports
Code boundaries are complete and tested; the items below need real owner-side activation. Nothing here is marked live.

| Capability | Status | What the owner must do |
|---|---|---|
| Card/merchant payments (Stripe) | **CODE COMPLETE · ACTIVATION REQUIRED** | Open merchant account, set `PAYMENTS_PROVIDER=stripe` + browser-safe `PAYMENTS_PUBLISHABLE_KEY` + server-only `PAYMENTS_SECRET_KEY` + `PAYMENTS_WEBHOOK_SECRET`, register webhook URL `/api/v1/payments/webhook`, then run sandbox checkout + signed replay proof. The Checkout Payment Element, runtime readiness endpoint, intent creation (`charge:true`, idempotent), HMAC verification with replay tolerance, and `pending→paid` reconciliation are implemented and tested |
| SMS / phone OTP | **CODE COMPLETE · ACTIVATION REQUIRED** | Enable an SMS provider on the Supabase project (no new app secret needed). Request/verify proxy (`/api/v1/auth/phone/*`) with E.164, honeypot, 3-requests/10-min + 5-attempts limits and audit is implemented, tested, and wired into Player login. Without provider SMS, both ends fail closed with setup guidance |
| Email delivery | **EXTERNAL ACTIVATION REQUIRED** | Choose sender provider; messaging domain currently supports stored in-app records only |
| Push notifications | Deferred | Attach transport to the notification-record core later |
| AI assistant backend | Deferred | Assistant answers verified static info locally; `GEMINI_API_KEY` reserved, no browser secret |
| Native apps / store signing | **OWNER AUTHORIZATION REQUIRED** | Apple/Play developer accounts + signing — out of web-delivery scope |
| Shared rate-limit store | Optional | Set `REDIS_URL`/`UPSTASH_REDIS_REST_URL`, else per-instance memory limiting |

Until activation, every surface shows accurate setup-required states and all tests assert fail-closed behavior (`*_UNCONFIGURED`, `EXTERNAL_PROVIDER_REQUIRED`).
