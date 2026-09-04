# UNITED OLYMPICS SPORTS — FINAL ROUTE MATRIX
Base: origin/main 55b83e5 (Bolt visual candidate) fused with Traycer Mission 10X checkpoint 08b7d7e.
Player Black Gold, PlayerAuthGateway, United Assistant, Sports3D registry, PWA/platform/update and all data-truth fixes preserved; Bolt table/card/filter/login/overview strengths adopted; Bolt defects (dead Add Branch, drawerless mobile filters, click-only sortable, weak modal focus, invented readiness/trend/zeros) repaired.
Legend — VISUAL: PASS (finished hierarchy) / PARTIAL (served by shared shell, not bespoke) / DATA-TRUTH: PASS (derived or honest empty) / FAIL (none open) / RESPONSIVE: CSS-verified (rules in place, DOM QA blocked: no headless browser in env) / NOTES.

## PUBLIC (PublicSite + sport pages)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| / (hero: crest-led, 72px breathing, no Trophy beside crest) | PASS | PASS | CSS-verified | Dead-space stacking fixed (.page.home + .hero) |
| /about (PublicSite section) | PASS | PASS | CSS-verified | Shared header/section/card radius |
| /sports (grid + 3D medallions) | PASS | PASS | CSS-verified | SportCard uses Sports3DIcon; no false mapping |
| /sports/football (photo hero + 96px badge) | PASS | PASS | CSS-verified | Verified media kept; badge supports |
| /sports/swimming (photo hero + 96px badge) | PASS | PASS | CSS-verified | Verified media kept |
| /sports/basketball (photo hero + 96px badge) | PASS | PASS | CSS-verified | Verified media kept |
| /sports/tennis (concept + tennis badge) | PASS | PASS | CSS-verified | Exact match only |
| /sports/gymnastics (concept, no 3D) | PASS | PASS | CSS-verified | No gym mapping (honest) |
| /sports/martial-arts (concept, no 3D) | PASS | PASS | CSS-verified | No boxing mapping (honest) |
| /programs, /programs/:programSlug | PASS | PASS | CSS-verified | Preview-labeled |
| /coaches | PASS | PASS | CSS-verified | No invented credentials |
| /contact (UosFormSection fields, honest no-backend note) | PASS | PASS | CSS-verified | Preview-only submit; field architecture adopted |
| /player,/parent,/coach preview pages | PASS | PASS | CSS-verified | ProductPreviewPages fixtures |

## AUTH (Player gateway — single system, no duplicate)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| /player/login | PASS | PASS | CSS-verified | Text-only providers + Not configured chips; zero broken images; Preview Mode explicit |
| /player/auth/phone | PASS | PASS | CSS-verified | Honest gateway error + preview fallback link; UosSteps 1/2 adopted |
| /player/auth/verify (OTP) | PASS | PASS | CSS-verified | No fake OTP; gateway truthful; UosSteps 2/2 adopted |
| generic /auth/* | REMOVED | — | — | Duplicate AuthRouter NOT transplanted (conflicts PlayerAuthGateway) |

## PLAYER (Black Gold preserved; session architecture intact)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| /player, /player/home (identity hero + pulse + log) | PASS | PASS | CSS-verified | Photo/initials fallback; 3D secondary mark 18% behind portrait (exact sports only) |
| /player/schedule (live-date tabs) | PASS | PASS | CSS-verified | No "Today" mislabel |
| /player/schedule/:sessionId | PASS | PASS | CSS-verified | Strict group-privacy scoping |
| /player/attendance (streak derived chronologically) | PASS | PASS | CSS-verified | No invented streak |
| /player/performance (null when unmeasured) | PASS | PASS | CSS-verified | Zero = real zero only |
| /player/achievements (recorded tier, factual category) | PASS | PASS | CSS-verified | No gold/dev fabrication; honest empty state |
| /player/feedback (strict player relation) | PASS | PASS | CSS-verified | — |
| /player/subscription,/payments (empty, no fixtures) | PASS | PASS | CSS-verified | Honest unavailable states |
| /player/documents | PASS | PASS | CSS-verified | Preview-labeled |
| /player/messages,/notifications (derived only) | PASS | PASS | CSS-verified | No fake delivery |
| /player/profile (guardian renders record or unavailable) | PASS | PASS | CSS-verified | No jersey/uniform invention |
| /player/settings (support honestly unconfigured) | PASS | PASS | CSS-verified | TrainingLog goal starts unset, per-player |
| wildcard 404 + error boundary + route loader | PASS | PASS | CSS-verified | No blank screens |

## PARENT (PortalLayout; preview-data architecture, labeled)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| /parent (family dashboard: context, child cards, sport/group, next training, attendance, performance, coach, feedback, subscription, docs/messages) | PASS | PASS | CSS-verified | 9 priorities covered; no Player copy |
| /parent/children,/children/:childId | PASS | PASS | CSS-verified | Preview badge + honest empty |
| /parent/schedule (live-date upcoming filter + empty) | PASS | PASS | CSS-verified | Fixed: was unfiltered |
| /parent/performance (measured-only average, no fake trend) | PASS | PASS | CSS-verified | Fixed: hardcoded [58..72] series removed |
| /parent/feedback | PASS | PASS | CSS-verified | Preview records, empty state |
| /parent/subscriptions,/payments (preview ledger, no processing claim) | PASS | PASS | CSS-verified | — |
| /parent/documents (local-only open) | PASS | PASS | CSS-verified | No delivery claim |
| /parent/messages (local-only thread) | PASS | PASS | CSS-verified | Fixed: invented "Today · 09:20" removed |
| /parent/profile (local-only prefs) | PASS | PASS | CSS-verified | — |

## COACH (PortalLayout; preview-assignment architecture, labeled)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| /coach (Training Command: assignment, today-by-date, upcoming, roster) | PASS | PASS | CSS-verified | One whistle mark; today filtered by local date |
| /coach/schedule (upcoming filter + empty) | PASS | PASS | CSS-verified | Fixed: was unfiltered |
| /coach/groups (real roster lines) | PASS | PASS | CSS-verified | Fixed: players×20 capacity formula removed |
| /coach/groups/:groupId (honest 404, roster count) | PASS | PASS | CSS-verified | Fixed: wrong-record fallback + fake % |
| /coach/players (search/filter, honest perf) | PASS | PASS | CSS-verified | Fixed: 0/100 fake zeros |
| /coach/players/:playerId (honest 404, measured-only) | PASS | PASS | CSS-verified | Fixed: wrong-athlete fallback + zeros |
| /coach/attendance (local marks) | PASS | PASS | CSS-verified | Operational, stays local |
| /coach/evaluations (measured-only, local notes) | PASS | PASS | CSS-verified | Fixed: 0 progress bars; not a certified assessment |
| /coach/programs (all 5, no silent slice) | PASS | PASS | CSS-verified | Fixed: slice(0,4) hid a program |
| /coach/messages (local-only) | PASS | PASS | CSS-verified | No delivery claim |
| /coach/profile (local prefs) | PASS | PASS | CSS-verified | — |

## ADMIN (AdminLayout command center; gateway + preview fixtures)
| ROUTE | VISUAL | DATA-TRUTH | RESPONSIVE | NOTES |
|---|---|---|---|---|
| /admin (dashboard) | PASS | PASS | CSS-verified | Black/Gold preserved |
| /admin/sports (+ exact 3D medallion, vector controls kept) | PASS | PASS | CSS-verified | 3D decorative only |
| /admin/sports/:sportId (+groups,:groupId) | PARTIAL | PASS | CSS-verified | Shared enterprise shell |
| /admin/groups,/players,/:playerId (UiDialog adopted) | PASS | PASS | CSS-verified | Tables with toolbar/empty states |
| /admin/countries,/:countryId,/branches,/:branchId | PASS | PASS | CSS-verified | Branch readiness fabrication removed; real coverage line |
| /admin/programs,/:programId,/parents,/:parentId,/coaches,/:coachId | PARTIAL | PASS | CSS-verified | Directory shells, preview-labeled |
| /admin/schedules,/:sessionId,/attendance,/performance | PARTIAL | PASS | CSS-verified | Operational shells |
| /admin/subscriptions,/:subscriptionId,/payments,/:paymentId | PARTIAL | PASS | CSS-verified | Preview amounts, no totals claimed |
| /admin/reports (derived table + export) | PASS | PASS | CSS-verified | No live-analytics claim |
| /admin/content (media workspace) + /:contentId (domain cockpit) | PASS | PASS | CSS-verified | Fixed: generic stub -> resolved record + linked media + 404 |
| /admin/users,/registrations,/:registrationId,/achievements,/:achievementId | PARTIAL | PASS | CSS-verified | CRUD shells, honest states |
| /admin/events,/:eventId,/announcements,/:announcementId,/messages,/:messageId | PARTIAL | PASS | CSS-verified | Detail shells |
| /admin/audit-activity,/admin/settings,/customization | PASS | PASS | CSS-verified | Truth charter page kept |
| /* fallback (-> /admin) | PASS | PASS | — | No blank screens |

## SHARED / SYSTEM
- UiButton/UiDialog/UiStatusBadge/UiEmptyState/UiErrorState/UiPreviewState/UiSkeleton: adopted (Admin×7, Coach/Parent workspaces, Players/Settings dialogs). Proven, not shelfware.
- Enterprise toolbar/table/empty/loading/error + Portal metric/card/section/status: adopted across portals.
- UosFields (Text/Password/Search/Select/TextArea + FormSection): adopted on Contact; Phone composite stays custom (gateway-honest).
- UnitedAssistant: local-guide provider, no fake AI/business data; invitation remembers dismissal; suppressed auto-open on auth routes; Escape + safe-area + reduced-motion.
- PWA: manifest + icons + theme-color + install-ready; platform.ts; version.ts vs /version.json (0.0.0 = no-update default); UpdateToast quiet-only.
- Brand: "United Olympics Sports" exact; Academy hits = 0 (src).
- No SKIPPED routes. Browser DOM QA: BLOCKED (no headless browser in env) — server smoke 200s + CSS verification instead.
