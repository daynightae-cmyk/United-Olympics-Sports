import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  selectPlayerSessions,
  selectUpcomingSession,
} from '../src/portals/player/foundation/playerSelectors.js';
import type { Player, Session } from '../src/domain/contracts.js';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [scheduleSource, sessionDetailSource, routerSource] = await Promise.all([
  read('src/pages/portal/player/PlayerPortalSchedulePage.tsx'),
  read('src/portals/player/components/PlayerSessionDetailContent.tsx'),
  read('src/portals/PlayerPortalRouter.tsx'),
]);

console.log('=== RUNNING PLAYER SCHEDULE + SESSION EXPERIENCE TESTS ===');

// 1. REAL SESSION ORDERING TEST
const testPlayer: Player = {
  id: 'player-test-01',
  nameEn: 'Sami Mansoor',
  nameAr: 'سامي منصور',
  sportId: 'football',
  groupId: 'group-u12-elite',
  level: { en: 'Advanced', ar: 'متقدم' },
  status: { en: 'Active', ar: 'نشط' },
  coachIds: ['coach-01'],
  achievements: [],
  attendanceRecords: [
    { id: 'att-01', date: '2026-09-20', status: 'present' },
    { id: 'att-02', date: '2026-09-22', status: 'late' },
  ],
  performanceHistory: [],
  coachFeedback: [],
};

const unorderedSessions: Session[] = [
  { id: 'session-c', sportId: 'football', groupId: 'group-u12-elite', startsAt: '2026-09-25T17:00:00Z', status: { en: 'Scheduled', ar: 'مجدولة' } },
  { id: 'session-a', sportId: 'football', groupId: 'group-u12-elite', startsAt: '2026-09-20T17:00:00Z', status: { en: 'Completed', ar: 'مكتملة' } },
  { id: 'session-b', sportId: 'football', groupId: 'group-u12-elite', startsAt: '2026-09-22T17:00:00Z', status: { en: 'Completed', ar: 'مكتملة' } },
  { id: 'session-other-group', sportId: 'football', groupId: 'group-different', startsAt: '2026-09-21T17:00:00Z', status: { en: 'Scheduled', ar: 'مجدولة' } },
];

const ordered = selectPlayerSessions(testPlayer, unorderedSessions);
assert.equal(ordered.length, 3, 'selectPlayerSessions must filter only player group sessions');
assert.equal(ordered[0].id, 'session-a', 'Earliest session must be first');
assert.equal(ordered[1].id, 'session-b', 'Middle session must be second');
assert.equal(ordered[2].id, 'session-c', 'Latest session must be third');

// 2. UPCOMING VS PAST SEMANTICS TEST
const simulatedNow = new Date('2026-09-21T12:00:00Z');
const upcoming = selectUpcomingSession(ordered, simulatedNow);
assert.equal(upcoming?.id, 'session-b', 'Upcoming session selector must pick the earliest future session');

const pastSessions = ordered.filter((s) => new Date(s.startsAt).getTime() < simulatedNow.getTime());
const futureSessions = ordered.filter((s) => new Date(s.startsAt).getTime() >= simulatedNow.getTime());
assert.equal(pastSessions.length, 1, 'Past sessions must accurately capture sessions before simulated now');
assert.equal(pastSessions[0].id, 'session-a');
assert.equal(futureSessions.length, 2, 'Future sessions must accurately capture sessions after simulated now');
assert.deepEqual(futureSessions.map((s) => s.id), ['session-b', 'session-c']);

// 3. EMPTY SCHEDULE STATE
const emptySessions = selectPlayerSessions(testPlayer, []);
assert.equal(emptySessions.length, 0, 'Empty input must return empty session array');
const noUpcoming = selectUpcomingSession([], simulatedNow);
assert.equal(noUpcoming, null, 'No upcoming session when session list is empty');

// 4. UNLINKED STATE SAFETY
const unlinkedPlayerSessions = selectPlayerSessions(null, unorderedSessions);
assert.equal(unlinkedPlayerSessions.length, 0, 'Unlinked player must return zero sessions');

// 5. DATA PRIVACY & SCOPING IN SESSION DETAIL CONTENT
assert.equal(sessionDetailSource.includes('peerAttendees'), false, 'Session detail must never expose peer attendee list');
assert.equal(sessionDetailSource.includes('guardianPhone'), false, 'Session detail must never expose guardian phone');
assert.equal(sessionDetailSource.includes('adminOnlyNotes'), false, 'Session detail must never expose admin-only notes');
assert.equal(sessionDetailSource.includes('coachPrivateEmail'), false, 'Session detail must never expose coach private email');
assert(sessionDetailSource.includes('athlete-truth-note'), 'Session detail must expose athletic truth note');
assert(sessionDetailSource.includes('generateIcsUrl'), 'Session detail must support standard calendar download');

// 6. ROUTING FOR SESSION DETAIL
assert(routerSource.includes('schedule/:sessionId'), 'PlayerPortalRouter must expose schedule/:sessionId');
assert(routerSource.includes("to={sessionId ? `/player/schedule/${sessionId}` : '/player/schedule'}"), 'Legacy /player/session/:sessionId must safely redirect to /player/schedule/:sessionId');

// 7. RESPONSIVE STRUCTURAL SELECTORS
assert(scheduleSource.includes('id="player-schedule-page"'), 'Schedule page must expose id="player-schedule-page"');
assert(scheduleSource.includes('schedule-week-view'), 'Schedule page must expose schedule-week-view');
assert(scheduleSource.includes('schedule-week-grid'), 'Schedule page must expose schedule-week-grid');
assert(scheduleSource.includes('schedule-day-column'), 'Schedule page must expose schedule-day-column');
assert(scheduleSource.includes('schedule-list-view'), 'Schedule page must expose schedule-list-view');
assert(scheduleSource.includes('schedule-session-card'), 'Schedule page must expose schedule-session-card');
assert(scheduleSource.includes('athlete-data-scope'), 'Schedule page must expose athlete-data-scope');

console.log('PLAYER SCHEDULE + SESSION EXPERIENCE TESTS: ALL PASSED');
