import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [
  identitySource,
  nextSessionSource,
  achievementsSource,
  performanceSource,
  attendanceSource,
  quickActionsSource,
  overviewSource,
] = await Promise.all([
  read('src/portals/player/components/PlayerAthleteIdentityCard.tsx'),
  read('src/portals/player/components/PlayerNextSessionCard.tsx'),
  read('src/portals/player/components/PlayerAchievementsCard.tsx'),
  read('src/portals/player/components/PlayerPerformanceSnapshotCard.tsx'),
  read('src/portals/player/components/PlayerAttendanceSummaryCard.tsx'),
  read('src/portals/player/components/PlayerQuickActionsCard.tsx'),
  read('src/pages/portal/player/PlayerPortalOverviewPage.tsx'),
]);

console.log('=== RUNNING PLAYER REFERENCE PRODUCT TRUTH TESTS ===');

// 1. ATHLETE IDENTITY: Real player.id, no fabricated UO-2024-0176
assert.equal(identitySource.includes('UO-2024-0176'), false, 'AthleteIdentityCard must not contain fabricated ID UO-2024-0176');
assert(identitySource.includes('displayId = player.id') || identitySource.includes('{player.id}'), 'AthleteIdentityCard must use player.id directly');

// 2. ATHLETE IDENTITY: No fabricated birth year calculation
assert.equal(identitySource.includes('2026 - player.age'), false, 'AthleteIdentityCard must not calculate synthetic birth year');
assert(identitySource.includes('group?.ageGroup'), 'AthleteIdentityCard must use group.ageGroup or player.age');

// 3. ATHLETE IDENTITY: No fabricated fallbacks (Football, Elite Development, Riyadh, Coach Ahmed)
assert.equal(identitySource.includes("'Football'"), false, 'AthleteIdentityCard must not fall back to Football');
assert.equal(identitySource.includes("'Elite Development'"), false, 'AthleteIdentityCard must not fall back to Elite Development');
assert.equal(identitySource.includes("'Riyadh'"), false, 'AthleteIdentityCard must not fall back to Riyadh');
assert.equal(identitySource.includes("'Coach Ahmed'"), false, 'AthleteIdentityCard must not fall back to Coach Ahmed');
assert(identitySource.includes("bi('Not recorded', 'غير مسجل')"), 'AthleteIdentityCard must use truthful bilingual Not recorded fallback');

// 4. ATTENDANCE RATE & OVERALL SCORE: Numeric zero support
assert(attendanceSource.includes("rate !== null ? `${rate}%` : '—'"), 'AttendanceSummaryCard must display real attendance rate and preserve 0%');
assert(performanceSource.includes("typeof overallScore === 'number' && Number.isFinite(overallScore)"), 'PerformanceSnapshotCard must display real overall score and preserve 0');

// 5. NEXT SESSION: No fabricated fallbacks
assert.equal(nextSessionSource.includes('Mon, 22 Apr 2026'), false, 'NextSessionCard must not contain fabricated date fallback');
assert.equal(nextSessionSource.includes('5:00 PM – 7:00 PM'), false, 'NextSessionCard must not contain fabricated time fallback');
assert.equal(nextSessionSource.includes('UO Training Center – Riyadh'), false, 'NextSessionCard must not contain fabricated venue fallback');
assert.equal(nextSessionSource.includes("'Coach Ahmed'"), false, 'NextSessionCard must not fall back to Coach Ahmed');

// 6. NEXT SESSION: No synthetic duration calculation
assert.equal(nextSessionSource.includes('90 * 60000'), false, 'NextSessionCard must not synthesize a 90-minute session duration');

// 7. NEXT SESSION: Truthful empty state when session is null
assert(nextSessionSource.includes('No upcoming training session is recorded.'), 'NextSessionCard must render truthful English empty state');
assert(nextSessionSource.includes('لا توجد حصة تدريبية قادمة مسجلة.'), 'NextSessionCard must render truthful Arabic empty state');
assert(nextSessionSource.includes('next-session-empty-state'), 'NextSessionCard must expose next-session-empty-state class');

// 8. NEXT SESSION: Facility image is decorative
assert(nextSessionSource.includes('alt=""'), 'NextSessionCard facility thumbnail must have empty alt attribute');
assert(nextSessionSource.includes('aria-hidden="true"'), 'NextSessionCard facility thumbnail must be aria-hidden');

// 9. ACHIEVEMENTS: No fabricated sample achievements
assert.equal(achievementsSource.includes('Player of the Month'), false, 'AchievementsCard must not contain sample Player of the Month');
assert.equal(achievementsSource.includes('Top Attendance'), false, 'AchievementsCard must not contain sample Top Attendance');
assert.equal(achievementsSource.includes('Skill Development'), false, 'AchievementsCard must not contain sample Skill Development');

// 10. ACHIEVEMENTS: Truthful zero state
assert(achievementsSource.includes('No achievements recorded yet.'), 'AchievementsCard must render truthful English zero state');
assert(achievementsSource.includes('لم يتم تسجيل إنجازات بعد.'), 'AchievementsCard must render truthful Arabic zero state');
assert(achievementsSource.includes('achievements-reference-empty'), 'AchievementsCard must expose achievements-reference-empty class');

// 11. PERFORMANCE SNAPSHOT: No synthetic derivations or 4.5 fallback
assert.equal(performanceSource.includes('overallScore / 20'), false, 'PerformanceSnapshotCard must not divide overallScore by 20');
assert.equal(performanceSource.includes('overallScore * 0.95'), false, 'PerformanceSnapshotCard must not multiply overallScore by 0.95');
assert.equal(performanceSource.includes('overallScore * 1.05'), false, 'PerformanceSnapshotCard must not multiply overallScore by 1.05');
assert.equal(performanceSource.includes('4.5'), false, 'PerformanceSnapshotCard must not fall back to 4.5');
assert(performanceSource.includes("typeof overallScore === 'number' && Number.isFinite(overallScore)"), 'PerformanceSnapshotCard must strictly validate numeric overallScore including 0');
assert(performanceSource.includes("bi('Recorded Performance', 'الأداء المسجل')"), 'PerformanceSnapshotCard must label period link as Recorded Performance');

// 12. ATTENDANCE SUMMARY: Period link is Recorded Attendance
assert(attendanceSource.includes("bi('Recorded Attendance', 'الحضور المسجل')"), 'AttendanceSummaryCard must label period link as Recorded Attendance');
assert.equal(attendanceSource.includes("bi('This Month', 'هذا الشهر')"), false, 'AttendanceSummaryCard must not claim This Month since all records are aggregated');

// 13. QUICK ACTIONS: Default unreadCount is 0
assert(quickActionsSource.includes('unreadCount = 0'), 'QuickActionsCard must default unreadCount to 0, not 3');
assert.equal(quickActionsSource.includes('unreadCount = 3'), false, 'QuickActionsCard must not default unreadCount to 3');

// 14. PHANTOM TEST DOM REMOVED
assert.equal(overviewSource.includes('athlete-snapshot-card'), false, 'PlayerPortalOverviewPage must not contain phantom athlete-snapshot-card');
assert.equal(overviewSource.includes('athlete-quick-link-card'), false, 'PlayerPortalOverviewPage must not contain phantom athlete-quick-link-card');

// 15. OVERVIEW PAGE RENDERS REAL COMPONENTS
assert(overviewSource.includes('<PlayerAthleteIdentityCard'), 'Overview must render PlayerAthleteIdentityCard');
assert(overviewSource.includes('<PlayerAttendanceSummaryCard'), 'Overview must render PlayerAttendanceSummaryCard');
assert(overviewSource.includes('<PlayerAchievementsCard'), 'Overview must render PlayerAchievementsCard');
assert(overviewSource.includes('<PlayerNextSessionCard'), 'Overview must render PlayerNextSessionCard');
assert(overviewSource.includes('<PlayerPerformanceSnapshotCard'), 'Overview must render PlayerPerformanceSnapshotCard');
assert(overviewSource.includes('<PlayerQuickActionsCard'), 'Overview must render PlayerQuickActionsCard');

console.log('PLAYER REFERENCE PRODUCT TRUTH TESTS: ALL PASSED');
