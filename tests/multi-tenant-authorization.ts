import assert from 'node:assert/strict';
import {
  type AuthorizationContext,
  canAccessOrganization,
  canAccessCountry,
  canAccessBranch,
  canManagePlayer,
  canRecordAttendance,
  canRecordPerformance,
  canManageFinance,
  assertCanAccessOrganization,
  assertCanAccessCountry,
  assertCanAccessBranch,
  assertCanManagePlayer,
  assertCanRecordAttendance,
  assertCanRecordPerformance,
} from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';

// 1. Super Admin Fixture
const superAdmin: AuthorizationContext = {
  uid: 'user-super-admin',
  provider: 'supabase',
  email: 'superadmin@unitedolympicssports.com',
  roles: ['super_admin'],
  scopes: ['*'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// 2. Organization Admin Fixture (UAE Organization only)
const orgAdmin: AuthorizationContext = {
  uid: 'user-org-admin',
  provider: 'supabase',
  email: 'orgadmin@unitedolympicssports.com',
  roles: ['org_admin'],
  scopes: ['org:manage'],
  tenant: {
    organizationIds: ['org-uae'],
    countryIds: [],
    branchIds: [],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// 3. Country Admin Fixture (KSA Country only)
const countryAdmin: AuthorizationContext = {
  uid: 'user-country-admin',
  provider: 'supabase',
  email: 'countryadmin@unitedolympicssports.com',
  roles: ['country_admin'],
  scopes: ['country:manage'],
  tenant: {
    organizationIds: [],
    countryIds: ['country-ksa'],
    branchIds: [],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// 4. Branch Admin Fixture (Dubai Branch only)
const branchAdmin: AuthorizationContext = {
  uid: 'user-branch-admin',
  provider: 'supabase',
  email: 'branchadmin@unitedolympicssports.com',
  roles: ['branch_admin'],
  scopes: ['branch:manage'],
  tenant: {
    organizationIds: [],
    countryIds: [],
    branchIds: ['branch-dubai'],
  },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// 5. Coach Fixture (Assigned to group-u12 and player-leo)
const coach: AuthorizationContext = {
  uid: 'user-coach-mike',
  provider: 'supabase',
  email: 'coach.mike@unitedolympicssports.com',
  roles: ['coach'],
  scopes: ['attendance:write', 'evaluations:write'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: [],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: ['coach-mike'],
    coachGroupIds: ['group-u12'],
    coachPlayerIds: ['player-leo'],
  },
};

// 6. Guardian Fixture (Linked to child-sami)
const guardian: AuthorizationContext = {
  uid: 'user-guardian-ahmed',
  provider: 'supabase',
  email: 'ahmed.parent@example.com',
  roles: ['parent'],
  scopes: ['portal:parent'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: [],
    guardianIds: ['guardian-ahmed'],
    guardianPlayerIds: ['player-sami'],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// 7. Player Fixture (Self is player-zayd)
const player: AuthorizationContext = {
  uid: 'user-player-zayd',
  provider: 'supabase',
  email: 'zayd.player@example.com',
  roles: ['player'],
  scopes: ['portal:player'],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: {
    playerIds: ['player-zayd'],
    guardianIds: [],
    guardianPlayerIds: [],
    coachIds: [],
    coachGroupIds: [],
    coachPlayerIds: [],
  },
};

// ============================================================================
// TEST SUITE: Positive (Allow) and Negative (Deny) Tests
// ============================================================================

// TEST 1: Super Admin has universal access
assert.equal(canAccessOrganization(superAdmin, 'org-uae'), true);
assert.equal(canAccessOrganization(superAdmin, 'org-ksa'), true);
assert.equal(canAccessCountry(superAdmin, 'country-egypt'), true);
assert.equal(canAccessBranch(superAdmin, 'branch-tokyo'), true);
assert.equal(canManagePlayer(superAdmin, 'any-player-id'), true);
assert.equal(canRecordAttendance(superAdmin, 'any-group-id'), true);
assert.equal(canManageFinance(superAdmin), true);

// TEST 2: Organization Isolation & Cross-Organization Denial
assert.equal(canAccessOrganization(orgAdmin, 'org-uae'), true);
assert.equal(canAccessOrganization(orgAdmin, 'org-ksa'), false);
assert.throws(
  () => assertCanAccessOrganization(orgAdmin, 'org-ksa'),
  (err: unknown) => err instanceof ApiError && err.code === 'CROSS_ORGANIZATION_DENIED',
);

// TEST 3: Country Isolation & Cross-Country Denial
assert.equal(canAccessCountry(countryAdmin, 'country-ksa'), true);
assert.equal(canAccessCountry(countryAdmin, 'country-uae'), false);
assert.throws(
  () => assertCanAccessCountry(countryAdmin, 'country-uae'),
  (err: unknown) => err instanceof ApiError && err.code === 'CROSS_COUNTRY_DENIED',
);

// TEST 4: Branch Isolation & Cross-Branch Denial
assert.equal(canAccessBranch(branchAdmin, 'branch-dubai'), true);
assert.equal(canAccessBranch(branchAdmin, 'branch-abu-dhabi'), false);
assert.throws(
  () => assertCanAccessBranch(branchAdmin, 'branch-abu-dhabi'),
  (err: unknown) => err instanceof ApiError && err.code === 'CROSS_BRANCH_DENIED',
);

// TEST 5: Coach Group Assignment & Unassigned Coach Denial
assert.equal(canRecordAttendance(coach, 'group-u12'), true);
assert.equal(canRecordAttendance(coach, 'group-u18'), false);
assert.throws(
  () => assertCanRecordAttendance(coach, 'group-u18'),
  (err: unknown) => err instanceof ApiError && err.code === 'UNASSIGNED_COACH_DENIED',
);

assert.equal(canRecordPerformance(coach, 'player-leo'), true);
assert.equal(canRecordPerformance(coach, 'player-stranger'), false);
assert.throws(
  () => assertCanRecordPerformance(coach, 'player-stranger'),
  (err: unknown) => err instanceof ApiError && err.code === 'UNASSIGNED_COACH_DENIED',
);

// TEST 6: Guardian Child Link & Unrelated Guardian Denial
assert.equal(canManagePlayer(guardian, 'player-sami'), true);
assert.equal(canManagePlayer(guardian, 'player-other-child'), false);
assert.throws(
  () => assertCanManagePlayer(guardian, 'player-other-child'),
  (err: unknown) => err instanceof ApiError && err.code === 'UNRELATED_PLAYER_DENIED',
);

// TEST 7: Player Self-Access & Unrelated Player Denial
assert.equal(canManagePlayer(player, 'player-zayd'), true);
assert.equal(canManagePlayer(player, 'player-leo'), false);
assert.throws(
  () => assertCanManagePlayer(player, 'player-leo'),
  (err: unknown) => err instanceof ApiError && err.code === 'UNRELATED_PLAYER_DENIED',
);

console.log('Multi-tenant authorization isolation tests: PASS');
console.log('P0 MULTI-TENANT AUTHORIZATION CLOSURE: PASS');
