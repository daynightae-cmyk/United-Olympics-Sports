# External Providers — United Olympics Sports
Code boundaries are complete and tested; the items below need real owner-side activation. Nothing here is marked live.

| Capability | Status | What the owner must do |
|---|---|---|
| Card/merchant payments (Stripe/Checkout) | **EXTERNAL ACTIVATION REQUIRED** | Open merchant account, set `PAYMENTS_PROVIDER` + `PAYMENTS_WEBHOOK_SECRET`, run sandbox intent + webhook replay proof, then enable the payment step |
| SMS / phone OTP | **EXTERNAL ACTIVATION REQUIRED** | Contract SMS gateway (Twilio/Telesign/Supabase SMS), set `SMS_PROVIDER`, wire `PlayerAuthGateway` phone methods |
| Email delivery | **EXTERNAL ACTIVATION REQUIRED** | Choose sender provider; messaging domain currently supports stored in-app records only |
| Push notifications | Deferred | Attach transport to the notification-record core later |
| AI assistant backend | Deferred | Assistant answers verified static info locally; `GEMINI_API_KEY` reserved, no browser secret |
| Native apps / store signing | **OWNER AUTHORIZATION REQUIRED** | Apple/Play developer accounts + signing — out of web-delivery scope |
| Shared rate-limit store | Optional | Set `REDIS_URL`/`UPSTASH_REDIS_REST_URL`, else per-instance memory limiting |

Until activation, every surface shows accurate setup-required states and all tests assert fail-closed behavior (`*_UNCONFIGURED`, `EXTERNAL_PROVIDER_REQUIRED`).
