# United Olympics Sports — Identity Provider & Authentication Strategy
**Document ID:** `UOS-IDENTITY-PROVIDER-STRATEGY`  
**Version:** 1.0  
**Effective Date:** 2026-09-09  
**Product:** United Olympics Sports / يونايتد أوليمبيكس سبورت  

---

## 1. Architectural Mandate

United Olympics Sports operates a unified multi-tenant identity and access architecture supporting multiple frontend personas (Player Portal, Parent/Guardian Portal, Coach Portal, and Admin Workspaces).

To remove authentication ambiguity between legacy Firebase components and modern Supabase infrastructure, this document establishes the authoritative identity ownership hierarchy and session lifecycle.

---

## 2. Identity Provider Hierarchy

```
+-------------------------------------------------------------+
|                  PRIMARY IDENTITY PROVIDER                  |
|                           Supabase                          |
|  - Authoritative User Registry                              |
|  - Bearer JWT Issuance & Verification                       |
|  - PostgreSQL Row Level Security (RLS) Integration          |
|  - Google OAuth Federation                                  |
|  - Production Phone OTP Delivery (Twilio / SMS Gateway)     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               SECONDARY / MIGRATION PROVIDER                |
|                        Firebase Auth                        |
|  - Backward compatibility for legacy Firebase client SDKs   |
|  - Admin SDK session revocation support                     |
|  - Co-existing identity federation via subject mapping      |
+-------------------------------------------------------------+
```

### Subject Mapping Standards
- **Supabase Subjects:** Prefixed as `supabase:<uuid>` (e.g. `supabase:6b2a47e1-8842-4dc9-9830-101112131415`).
- **Firebase Subjects:** Raw Firebase UID string (e.g. `firebase:u7X89qZ...` or direct UID).
- **Database Linking:** `users.uid` in PostgreSQL uniquely binds to the provider subject.

---

## 3. Google OAuth Strategy

1. **State & Nonce Validation:**
   - Client initiates OAuth flow with Supabase Auth (`signInWithOAuth({ provider: 'google' })`).
   - CSRF protection ensured via cryptographic state parameter.
2. **Safe `returnTo` Handling:**
   - Only relative paths or allowed subdomains matching `*.unitedolympicssports.com` are honored.
   - External open-redirect attempts are rejected and defaulted to `/portal/overview`.
3. **Account Linking:**
   - If a verified email matches an existing account, the provider identity is linked to the existing user row in `users` and tenant bindings are preserved.

---

## 4. Phone Sign-In & OTP Challenge Lifecycle

1. **E.164 Normalization:**
   - All incoming phone numbers are normalized to E.164 format: `+<country_code><national_number>`.
   - Local UAE numbers (e.g. `050 123 4567`) are normalized to `+971501234567`.
2. **Attempt Throttling & Anti-Abuse:**
   - Sliding window rate limit: Maximum 3 OTP requests per 10 minutes per phone number.
   - Challenge verification attempts: Maximum 5 incorrect tries before invalidating OTP challenge.
3. **Strict Production Isolation:**
   - Production environments **NEVER** accept hardcoded test OTPs (such as `123456`).
   - Mock/Test bypass is strictly isolated to offline test fixtures (`NODE_ENV === 'test'`) and never exposed on live production routes.
4. **Credential Block Status:**
   - When production SMS gateway credentials (Twilio / TeleSign / Supabase SMS) are unconfigured in staging/local environments, the system truthfully returns `503 SERVICE_UNAVAILABLE` with code `AUTH_PROVIDER_UNCONFIGURED`. It never fabricates false success.

---

## 5. Session Refresh, Expiry & Revocation

| Parameter | Standard Value | Description |
|---|---|---|
| **Access Token TTL** | 1 Hour (3600s) | Short-lived signed JWT for stateless API dispatch. |
| **Refresh Token TTL** | 30 Days | Sliding window refresh with automatic rotation. |
| **Revocation** | Immediate | Server-side revocation via `auth-revoke` endpoint. Invalidates refresh token tokens family. |
| **Inactivity Timeout** | 14 Days | Sessions idle for > 14 days require re-authentication. |

---

## 6. Verification & Parity Test Coverage

All identity provider mappings and security constraints are verified by:
- `tests/identity-provider-strategy.test.ts`
- `tests/auth-routing-integration.ts`
- `tests/readiness-truth.ts`
