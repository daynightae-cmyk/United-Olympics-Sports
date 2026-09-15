# United Olympics Sports — Environment Inventory (v1.0.0 closure)

Values are never recorded here. Presence below reflects repository contract (`.env.example`, code references), not live dashboard state.

| Variable | Purpose | Scope | Required in | Status |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (public) | Client | All | Pre-filled (public value, not a secret) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (public) | Client | All | Pre-filled (public value, not a secret) |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Server-side aliases of the above | Server | Prod/preview | Optional alias |
| `DATABASE_URL` or `SQL_HOST/PORT/DB_NAME/USER/PASSWORD` | PostgreSQL system-of-record connection (pool) | Server only | Prod (migrations + API) | Owner-configured, unknown to repo |
| `SQL_POOL_MAX`, `SQL_SSL`, `SQL_SSL_REJECT_UNAUTHORIZED` | Pool/TLS tuning | Server only | Prod | Optional (sane defaults) |
| `SQL_ADMIN_USER` / `SQL_ADMIN_PASSWORD` | Migration-run credentials | Server/CI only | Migration runs | Optional |
| `REDIS_URL` / `UPSTASH_REDIS_REST_URL` | Shared rate-limit store | Server only | Prod (multi-instance) | Unset → per-instance memory limiter (documented limitation) |
| `FIREBASE_PROJECT_ID` | Firebase fallback project | Server | Prod | Pre-filled (non-secret) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` / `GOOGLE_APPLICATION_CREDENTIALS` | Firebase Admin verification | Server only | Prod (if Firebase used) | Owner-configured, unknown to repo |
| `PAYMENTS_PROVIDER` | Payment backend selector (`stripe` to activate) | Server only | Prod (to charge) | Unset → charging disabled, honest UI |
| `PAYMENTS_SECRET_KEY` | Provider secret | Server only | Prod (to charge) | Unknown to repo |
| `PAYMENTS_WEBHOOK_SECRET` | Webhook HMAC secret | Server only | Prod (to reconcile) | Unknown; webhooks 503 without it (fail-closed) |
| `SMS_PROVIDER` | Supabase SMS/OTP enablement marker | Server | Prod (for OTP) | Requires Supabase-project SMS enablement by owner |
| `GEMINI_API_KEY` | Deferred assistant provider | — | — | Deferred (assistant is local/static) |
| `SUPPORT_EMAIL` | Public support contact | Client | All | Pre-filled |
| `VITE_UOS_ADMIN_PREVIEW` / `VITE_UOS_STORE_PREVIEW` / `VITE_UOS_PORTAL_DEMO` | QA-only preview/demo switches | Build-time | CI QA only | **Must be unset/false in Vercel production**; blocked on canonical production hosts regardless (`src/lib/preview-guard.ts`) |

Secret hygiene: service-role keys, DB passwords, Stripe secrets, and Firebase private keys never enter `VITE_*`, the client bundle, logs, screenshots, or reports (`tests/service-role-leak-gate.test.ts` scans 308 files on every run).
