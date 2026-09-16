# United Olympics Sports — Canonical Route Map (v1.0.0 closure)

Source of truth: `src/app/AppRouter.tsx`, `src/pages/public/PublicExperience.tsx`,
`src/store/StoreApp.tsx`, `src/portals/{Player,Parent,Coach}PortalRouter.tsx`,
`src/layouts/AdminLayout.tsx`, `src/server/routes.ts`. Verified 2026-09-16.

## System

| Route | Access |
|---|---|
| `/auth/callback` | Public (OAuth code exchange, then role destination) |
| `/benchmark` | DEV-only (unmounted in all deployed builds) |
| `/demo/:portal` | DEV-only (unmounted in production builds; page self-guards) |
| `/api?route=<key>` (38 keys) | Per-handler auth (see ROLE-PERMISSION-MATRIX) |

## Public (`*` → PublicExperience, all public)

`/`, `/about`, `/sports`, `/sports/:slug` (football, swimming, basketball, tennis, gymnastics, martial-arts), `/programs`, `/philosophy`, `/coaches`, `/contact` (live `/public/enquiries` flow), `/privacy`, `/terms`, `/shipping`, `/returns`, `*` → 404.

## Store (`/store/*`)

Public: `/store`, `/shop`, `/categories`, `/category/:slug`, `/product`, `/product/:slug`, `/search`, `/cart`, `/checkout`, `/order-success`, `/store/login`.
Authenticated (`StoreAccountBoundary` → redirect `/store/login` when unauthenticated, terminal error + retry on failure): `/account` (+ `/profile` redirect), `/orders`, `/order/:id` (account-scoped detail), `/wishlist`, `/addresses`, `/payment-methods`, `/notifications`, `/settings`.

## Player (`/player/*`)

Public: `/player/login` (+ legacy `auth/phone`, `auth/verify`, `otp`, `phone`, `verify` → redirect to login). Role-protected (`PlayerProtectedRoute` + server single-binding validation): `home`, `schedule`, `schedule/:sessionId`, `performance`, `feedback`, `achievements`, `attendance`, `documents`, `messages`, `notifications`, `subscription`, `payments`, `profile`, `settings`, `*` → portal 404.

## Parent (`/parent/*`)

Public: `/parent/login`. Role-protected (guardian single-binding + `guardianPlayerIds` validation): `index` overview, `children`, `children/:childId`, `schedule`, `attendance`, `performance`, `feedback`, `subscriptions`, `payments`, `documents`, `messages`, `notifications`, `profile`, `settings`, `*` → portal 404.

## Coach (`/coach/*`)

Public: `/coach/login`. Role-protected (server scope snapshot + binding-mismatch logout; unauthorized player/group IDs redirect to list): `home`, `schedule`, `groups`, `groups/:groupId`, `evaluations`, `players`, `players/:playerId`, `attendance`, `programs`, `messages`, `profile`, `*` → portal 404.

## Admin (`/admin/*`, all behind `AdminAccessGate` → `/admin/login` when denied)

`index` dashboard, `sports`, `sports/:sportId[/groups[/:groupId]]`, `groups`, `players`, `players/:playerId`, `settings`, `integrations`, `countries[/:countryId]`, `branches[/:branchId[/overview]]`, `programs[/:programId]`, `parents[/:parentId]`, `coaches[/:coachId]`, `schedules[/:sessionId]`, `attendance`, `performance`, `subscriptions[/:subscriptionId]`, `payments[/:paymentId]`, `store/*` (products, categories, orders, inventory, collections, discounts, settings), `reports`, `content[/:contentId]`, `users[/:userId]`, `registrations[/:registrationId]`, `achievements[/:achievementId]`, `events[/:eventId]`, `announcements[/:announcementId]`, `messages[/:messageId]`, `audit-activity[/:activityId]`, `*` → redirect `/admin`.

## Login-page guarantee

All login routes are lightweight and independent of workspace data fetching (contract test `portal-runtime-closure.test.ts` forbids session providers, admin hooks, and bulk list hooks on login pages).
