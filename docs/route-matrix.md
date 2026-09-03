UNITED OLYMPICS SPORTS — EXHAUSTIVE ROUTE MATRIX
=================================================
Source: AppRouter + all nested routers (PlayerPortalRouter, ParentPortalRouter, CoachPortalRouter, AuthRouter, AdminLayout)
Status: Implementation in progress / Not yet fully QA-tested at every route

=== PUBLIC (PublicSite) ===
Route: / (PublicSite) — component exists (PublicSite.tsx) — mobile: partial — RTL: partial — empty/error/load: partial
Route: /about — page file? Not explicitly listed in router; falls through PublicSite — needs inspection
Route: /sports — same
Route: /sports/football — FootballPage exists
Route: /sports/swimming — SwimmingPage exists
Route: /sports/basketball — BasketballPage exists
Route: /sports/tennis — not found as separate file — needs check
Route: /sports/gymnastics — not found
Route: /sports/martial-arts — not found
Route: /programs — ProgramsPage exists
Route: /coaches — CoachesPage exists
Route: /contact — within PublicSite

=== AUTH (Real Main — Player Auth Gateway) ===
Route: /auth via Player auth architecture (PlayerAuthGateway, PlayerLoginPage, PlayerPhoneAuthPage, PlayerVerifyOtpPage) — NO generic duplicate /auth/* added.
Note: Generic AuthRouter NOT transplanted — conflicts with existing Player auth.

=== PLAYER PORTAL ===
Layout: PlayerPortalShell (Black Gold) / PortalLayout
Route: /player — PlayerPortalOverviewPage
Route: /player/schedule — PlayerPortalSchedulePage (exists on main)
Route: /player/session/:sessionId? — PlayerPortalSessionDetailPage (exists on main)
Route: /player/performance — PlayerPortalPerformancePage
Route: /player/feedback — PlayerPortalFeedbackPage
Route: /player/achievements — PlayerPortalAchievementsPage
Route: /player/attendance — PlayerPortalAttendancePage
Route: /player/documents — PlayerPortalDocumentsPage
Route: /player/messages — PlayerPortalMessagesPage (exists on main)
Route: /player/notifications — PlayerPortalNotificationsPage (exists on main)
Route: /player/subscription — PlayerPortalSubscriptionPage (exists on main)
Route: /player/payments — PlayerPortalPaymentsPage (exists on main)
Route: /player/profile — PlayerPortalProfilePage
Route: /player/settings — PlayerPortalSettingsPage (exists on main)
Route: /player/404 — PlayerPortalNotFoundPage (exists on main)

=== PARENT PORTAL ===
Layout: PortalLayout (portal="parent")
Route: /parent — ParentPortalOverviewPage
Route: /parent/children — ParentPortalChildrenPage
Route: /parent/subscriptions — ParentPortalSubscriptionsPage
Route: /parent/documents — ParentPortalDocumentsPage
Route: /parent/messages — ParentPortalMessagesPage
Route: /parent/profile — ParentPortalProfilePage
Route: /parent/schedule — ParentPortalSchedulePage
Route: /parent/performance — ParentPortalPerformancePage
Route: /parent/feedback — ParentPortalFeedbackPage
Route: /parent/payments — ParentPortalPaymentsPage

=== COACH PORTAL ===
Layout: PortalLayout (portal="coach")
Route: /coach — CoachPortalOverviewPage
Route: /coach/schedule — CoachPortalSchedulePage
Route: /coach/groups — CoachPortalGroupsPage
Route: /coach/evaluations — CoachPortalEvaluationsPage
Route: /coach/players — CoachPortalPlayersPage
Route: /coach/players/:playerId — CoachPortalPlayerDetailPage
Route: /coach/groups/:groupId — CoachPortalGroupDetailPage
Route: /coach/attendance — CoachPortalAttendancePage
Route: /coach/programs — CoachPortalProgramsPage
Route: /coach/messages — CoachPortalMessagesPage
Route: /coach/profile — CoachPortalProfilePage

=== ADMIN ===
Layout: AdminLayout (routes under /admin/*)
Index: AdminDashboardPage
Routes: sports, groups (via sport detail routes), players, settings, countries, branches, programs, parents, coaches, schedules (session detail), attendance, performance, subscriptions (subscription detail), payments (payment detail), reports, content (content detail), users, registrations (registration detail), achievements (achievement detail), events (event detail), announcements (announcement detail), messages (message detail), audit-activity, future-module fallback, sports/:sportId/groups (group detail mapped incorrectly?), sports/:sportId/groups/:groupId, sports/:sportId/groups (group list?), etc.
Note: Some route mappings look overlapping (groups under sports vs standalone groups); needs review.

=== SHARED UI ===
Components: UiButton, UiDialog, UiStatusBadge, UiEmptyState, UiErrorState, UiPreviewState, UiSkeleton — located in src/components/ui/UiPrimitives.tsx
Adoption: Must verify import usage across pages. Currently created but adoption is unknown.

=== DESIGN / 3D ===
Files:
- src/design/sports3d/sports3d.registry.ts (exists)
- src/design/sports3d/Sports3DIcon.tsx (exists)
- src/design/sports3d/Sports3DStage.tsx (exists)
- src/styles/sports-3d-system.css (exists)
Status: Created. Must verify imports and usage on identity surfaces only.
