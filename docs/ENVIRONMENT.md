# Environment Contract — United Olympics Sports

## PUBLIC (safe for `VITE_*`, shipped to browsers)
| Name | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (default baked in) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (default baked in) |
| `VITE_UOS_ADMIN_PREVIEW` | `true` forces Admin Preview mode (demos) |
| `VITE_UOS_STORE_PREVIEW` | `true` forces Store Preview catalog (demos) |

## SERVER SECRETS (never `VITE_*`, Vercel production only)
| Name | Purpose | Owner |
|---|---|---|
| `DATABASE_URL` **or** `SQL_HOST/SQL_PORT/SQL_DB_NAME/SQL_USER/SQL_PASSWORD` | Server Postgres authority (roles/scopes/app data) | Owner/DBA |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Server-side token verification aliases | Owner |
| `FIREBASE_PROJECT_ID` | Firebase fallback verification | Owner |
| `FIREBASE_SERVICE_ACCOUNT_JSON` **or** `GOOGLE_APPLICATION_CREDENTIALS` | Admin revocation only; never commit the value | Owner |
| `PAYMENTS_PROVIDER` / `PAYMENTS_WEBHOOK_SECRET` | Payment activation (deferred until merchant account) | Owner/Finance |
| `SMS_PROVIDER` | SMS/OTP delivery (deferred) | Owner |
| `REDIS_URL` / `UPSTASH_REDIS_REST_URL` | Shared rate-limit store (optional; memory fallback otherwise) | Owner |
| `SQL_ADMIN_USER` / `SQL_ADMIN_PASSWORD` | Migration runs only | DBA |

## CI / LOCAL
- CI needs no secrets: contract tests run on mocks + ephemeral PGlite.
- Local dev: copy `.env.example`; `DATABASE_URL` empty = truthful dry-run mode.
- Rotation: rotate in the secret store (Vercel dashboard), redeploy, revoke the old value; audit event `auth.revoke` covers session invalidation.

## Credential transfer
Values live in owner-controlled stores only. This repo documents **names, purpose, location, owner, rotation** — never values.
