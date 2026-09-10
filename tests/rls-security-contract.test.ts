import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

console.log('--- RUNNING RLS SECURITY CONTRACT TEST (IN-MEMORY POSTGRES) ---');

const db = new PGlite({
  extensions: { pgcrypto }
});

// Section 21: Test setup emulates Supabase platform primitives (auth schema, uuid auth.uid(), roles)
await db.exec(`
  create schema if not exists auth;
  create or replace function auth.uid() returns uuid as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$ language sql stable;

  do $$
  begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then
      create role anon nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then
      create role authenticated nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then
      create role service_role nologin;
    end if;
  end $$;
`);

const migrationsDir = path.resolve(import.meta.dirname, '../src/db/migrations');
const migrationFiles = [
  '0001_production_foundation.sql',
  '0002_constraints_and_hardening.sql',
  '0003_portal_and_operations.sql',
  '0004_portal_assignment_parity.sql',
  '0005_production_schema_parity_and_rls_hardening.sql',
  '0006_live_rls_policy_closure.sql'
];

for (const file of migrationFiles) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  await db.exec(sql);
}

// Grant base permissions to anon and authenticated roles so RLS policies are evaluated
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select on all tables in schema public to anon, authenticated;
  revoke all on public.payment_webhooks from anon;
  revoke all on public.payment_intents from anon;
  revoke all on public.orders from anon;
  revoke all on public.messages from anon;
  revoke all on public.notifications from anon;
`);

// Canonical UUID identities
const PLAYER_ALPHA_UID = '11111111-1111-1111-1111-111111111111';
const PLAYER_BETA_UID = '22222222-2222-2222-2222-222222222222';
const GUARDIAN_ALPHA_UID = '33333333-3333-3333-3333-333333333333';
const COACH_ALPHA_UID = '44444444-4444-4444-4444-444444444444';
const STRANGER_UID = '55555555-5555-5555-5555-555555555555';

const ORG_ID = '11111111-0000-0000-0000-000000000001';
const COUNTRY_ID = '22222222-0000-0000-0000-000000000001';
const BRANCH_ID = '33333333-0000-0000-0000-000000000001';
const SPORT_ID = '44444444-0000-0000-0000-000000000001';
const PROGRAM_ID = '55555555-0000-0000-0000-000000000001';

const PLAYER_ALPHA_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PLAYER_BETA_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const GROUP_ALPHA_ID = '99999999-9999-9999-9999-999999999991';
const GROUP_BETA_ID = '99999999-9999-9999-9999-999999999992';
const GUARDIAN_RECORD_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const COACH_RECORD_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

// Seed foundation test records
await db.exec(`
  -- Organizations & hierarchy
  insert into public.organizations (id, name, status)
  values ('${ORG_ID}', 'United Olympics Sports HQ', 'active');

  insert into public.countries (id, organization_id, iso_code, name, status)
  values ('${COUNTRY_ID}', '${ORG_ID}', 'ARE', 'United Arab Emirates', 'active');

  insert into public.branches (id, country_id, name, status)
  values ('${BRANCH_ID}', '${COUNTRY_ID}', 'Dubai Main', 'active');

  insert into public.sports (id, code, name, status)
  values ('${SPORT_ID}', 'football', 'Football', 'active');

  insert into public.programs (id, branch_id, sport_id, name, status)
  values ('${PROGRAM_ID}', '${BRANCH_ID}', '${SPORT_ID}', 'Elite Youth', 'active');

  -- Groups
  insert into public.groups (id, branch_id, program_id, name, status)
  values
    ('${GROUP_ALPHA_ID}', '${BRANCH_ID}', '${PROGRAM_ID}', 'Alpha Group', 'active'),
    ('${GROUP_BETA_ID}', '${BRANCH_ID}', '${PROGRAM_ID}', 'Beta Group', 'active');

  -- Players (Alpha in Group Alpha, Beta in Group Beta)
  insert into public.players (id, user_uid, branch_id, group_id, full_name)
  values
    ('${PLAYER_ALPHA_ID}', '${PLAYER_ALPHA_UID}', '${BRANCH_ID}', '${GROUP_ALPHA_ID}', 'Alpha Athlete'),
    ('${PLAYER_BETA_ID}', '${PLAYER_BETA_UID}', '${BRANCH_ID}', '${GROUP_BETA_ID}', 'Beta Athlete');

  -- Guardians (Guardian Alpha is linked ONLY to Player Alpha)
  insert into public.guardians (id, user_uid, full_name)
  values ('${GUARDIAN_RECORD_ID}', '${GUARDIAN_ALPHA_UID}', 'Alpha Parent');

  insert into public.player_guardians (id, player_id, guardian_id, relationship, active)
  values (gen_random_uuid(), '${PLAYER_ALPHA_ID}', '${GUARDIAN_RECORD_ID}', 'Mother', true);

  -- Coaches (Coach Alpha is assigned ONLY to Group Alpha)
  insert into public.coaches (id, user_uid, branch_id, full_name)
  values ('${COACH_RECORD_ID}', '${COACH_ALPHA_UID}', '${BRANCH_ID}', 'Alpha Coach');

  insert into public.coach_groups (id, coach_id, group_id, active)
  values (gen_random_uuid(), '${COACH_RECORD_ID}', '${GROUP_ALPHA_ID}', true);

  -- App User Profiles
  insert into public.app_user_profiles (user_id, email, display_name)
  values
    ('${PLAYER_ALPHA_UID}', 'alpha@uos.ae', 'Alpha User'),
    ('${PLAYER_BETA_UID}', 'beta@uos.ae', 'Beta User');

  -- Sensitive Data: Notifications
  insert into public.notifications (id, recipient_uid, channel, status, locale, title, body)
  values
    (gen_random_uuid(), '${PLAYER_ALPHA_UID}', 'in_app', 'queued', 'ar', 'Alpha Notice', 'Confidential Alpha'),
    (gen_random_uuid(), '${PLAYER_BETA_UID}', 'in_app', 'queued', 'ar', 'Beta Notice', 'Confidential Beta');

  -- Sensitive Data: Messages
  insert into public.messages (id, sender_uid, recipient_uid, thread_id, content)
  values
    (gen_random_uuid(), '${PLAYER_ALPHA_UID}', '${PLAYER_BETA_UID}', 'thread-1', 'Private message to Beta');

  -- Sensitive Data: Orders
  insert into public.orders (id, order_number, customer_uid, status, total_minor, currency, items)
  values
    (gen_random_uuid(), 'ORD-1001', '${PLAYER_ALPHA_UID}', 'pending', 5000, 'AED', '[]'::jsonb),
    (gen_random_uuid(), 'ORD-1002', '${PLAYER_BETA_UID}', 'pending', 9000, 'AED', '[]'::jsonb);

  -- Sensitive Data: Payment Intents
  insert into public.payment_intents (id, idempotency_key, player_id, amount_minor, currency, status, provider)
  values
    (gen_random_uuid(), 'idem-alpha-01', '${PLAYER_ALPHA_ID}', 5000, 'AED', 'succeeded', 'stripe'),
    (gen_random_uuid(), 'idem-beta-01', '${PLAYER_BETA_ID}', 9000, 'AED', 'succeeded', 'stripe');

  -- Sensitive Data: Payment Webhooks
  insert into public.payment_webhooks (id, event_id, provider, event_type, status, payload)
  values
    (gen_random_uuid(), 'evt-stripe-001', 'stripe', 'charge.succeeded', 'received', '{"charge": 1}'::jsonb);

  -- Public / Scoped Data: Achievements
  insert into public.achievements (id, player_id, title, category, is_public)
  values
    (gen_random_uuid(), '${PLAYER_ALPHA_ID}', 'Alpha Public Gold', 'gold', true),
    (gen_random_uuid(), '${PLAYER_ALPHA_ID}', 'Alpha Private Trophy', 'special', false),
    (gen_random_uuid(), '${PLAYER_BETA_ID}', 'Beta Public Silver', 'silver', true),
    (gen_random_uuid(), '${PLAYER_BETA_ID}', 'Beta Private Trophy', 'special', false);

  -- Public / Scoped Data: Events
  insert into public.events (id, organization_id, title, starts_at, status)
  values
    (gen_random_uuid(), '${ORG_ID}', 'Open Championship', now(), 'scheduled'),
    (gen_random_uuid(), '${ORG_ID}', 'Internal Draft Meet', now(), 'draft');

  -- Public / Scoped Data: Announcements
  insert into public.announcements (id, organization_id, title, body, status, target_role)
  values
    (gen_random_uuid(), '${ORG_ID}', 'Public Welcome', 'Welcome all', 'active', 'all'),
    (gen_random_uuid(), '${ORG_ID}', 'Staff Memo', 'Coaches only', 'active', 'coach');
`);

async function assertDenied(query: string, label: string) {
  try {
    const res = await db.query<{ count: string | number }>(query);
    assert.equal(Number(res.rows[0].count), 0, `${label} must return 0 rows`);
  } catch (err: any) {
    assert.match(err.message, /permission denied/i, `${label} must fail closed`);
  }
}

// =========================================================================
// TEST 1: ANONYMOUS ACCESS REJECTIONS & PUBLIC SCOPING
// =========================================================================
await db.exec(`
  set role anon;
  select set_config('request.jwt.claim.sub', '', false);
`);

// 1.1 ANON -> notifications = DENY
await assertDenied(`select count(*) as count from public.notifications;`, 'ANON -> notifications');

// 1.2 ANON -> messages = DENY
await assertDenied(`select count(*) as count from public.messages;`, 'ANON -> messages');

// 1.3 ANON -> orders = DENY
await assertDenied(`select count(*) as count from public.orders;`, 'ANON -> orders');

// 1.4 ANON -> payment_intents = DENY
await assertDenied(`select count(*) as count from public.payment_intents;`, 'ANON -> payment_intents');

// 1.5 ANON -> payment_webhooks = DENY
await assertDenied(`select count(*) as count from public.payment_webhooks;`, 'ANON -> payment_webhooks');

// 1.6 ANON -> players = DENY
await assertDenied(`select count(*) as count from public.players;`, 'ANON -> players');

// 1.7 ANON -> achievements: ONLY is_public = true
const publicAch = await db.query<{ title: string; is_public: boolean }>(`select title, is_public from public.achievements;`);
assert.equal(publicAch.rows.length, 2, 'Anonymous should only see 2 public achievements');
assert.ok(publicAch.rows.every((r) => r.is_public === true), 'All visible achievements to anon must be public');

// 1.8 ANON -> events: ONLY scheduled / published
const publicEvt = await db.query<{ title: string; status: string }>(`select title, status from public.events;`);
assert.equal(publicEvt.rows.length, 1, 'Anonymous should only see 1 scheduled event');
assert.equal(publicEvt.rows[0].status, 'scheduled');

// 1.9 ANON -> announcements: ONLY status = 'active' and target_role = 'all'
const publicAnn = await db.query<{ title: string; target_role: string }>(`select title, target_role from public.announcements;`);
assert.equal(publicAnn.rows.length, 1, 'Anonymous should only see target_role=all announcement');
assert.equal(publicAnn.rows[0].target_role, 'all');

console.log('PASS: Test 1 - Anonymous access rejections and public scoping verified.');

// =========================================================================
// TEST 2: PLAYER ISOLATION & SELF ACCESS (Player Alpha)
// =========================================================================
await db.exec(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${PLAYER_ALPHA_UID}', false);
`);

// 2.1 PLAYER A -> PLAYER A = ALLOW, PLAYER A -> PLAYER B = DENY
const alphaPlayers = await db.query<{ id: string; user_uid: string }>(`select id, user_uid from public.players;`);
assert.equal(alphaPlayers.rows.length, 1, 'Player Alpha must only see 1 player row');
assert.equal(alphaPlayers.rows[0].id, PLAYER_ALPHA_ID, 'Player Alpha must only see self');
assert.ok(!alphaPlayers.rows.some((p) => p.id === PLAYER_BETA_ID), 'PLAYER A -> PLAYER B must be DENY');

// 2.2 RECIPIENT ONLY: Alpha notifications (NON-RECIPIENT -> NOTIFICATION = DENY)
const alphaNotifs = await db.query<{ recipient_uid: string }>(`select recipient_uid from public.notifications;`);
assert.equal(alphaNotifs.rows.length, 1);
assert.equal(alphaNotifs.rows[0].recipient_uid, PLAYER_ALPHA_UID);

// 2.3 CUSTOMER ONLY: Alpha orders (CUSTOMER A -> ORDER B = DENY)
const alphaOrders = await db.query<{ customer_uid: string }>(`select customer_uid from public.orders;`);
assert.equal(alphaOrders.rows.length, 1);
assert.equal(alphaOrders.rows[0].customer_uid, PLAYER_ALPHA_UID);

// 2.4 PARTICIPANT ONLY: Alpha messages (NON-PARTICIPANT -> MESSAGE = DENY)
const alphaMsgs = await db.query<{ sender_uid: string; recipient_uid: string }>(`select sender_uid, recipient_uid from public.messages;`);
assert.equal(alphaMsgs.rows.length, 1);
assert.equal(alphaMsgs.rows[0].sender_uid, PLAYER_ALPHA_UID);

// 2.5 OWNER ONLY: Alpha payment intents
const alphaIntents = await db.query<{ player_id: string }>(`select player_id from public.payment_intents;`);
assert.equal(alphaIntents.rows.length, 1);
assert.equal(alphaIntents.rows[0].player_id, PLAYER_ALPHA_ID);

// 2.6 Alpha achievements: sees public achievements + own private achievement (3 total, 0 for Beta private)
const alphaAch = await db.query<{ title: string; is_public: boolean }>(`select title, is_public from public.achievements;`);
assert.equal(alphaAch.rows.length, 3);
assert.ok(!alphaAch.rows.some((r) => r.title === 'Beta Private Trophy'), 'Alpha must not see Beta private achievement');

// 2.7 App User Profiles: Alpha sees only Alpha profile (user_id = auth.uid())
const alphaProfiles = await db.query<{ user_id: string }>(`select user_id from public.app_user_profiles;`);
assert.equal(alphaProfiles.rows.length, 1);
assert.equal(alphaProfiles.rows[0].user_id, PLAYER_ALPHA_UID);

console.log('PASS: Test 2 - Player self access and cross-player isolation verified.');

// =========================================================================
// TEST 3: NON-PARTICIPANT / NON-RECIPIENT ISOLATION (Stranger)
// =========================================================================
await db.exec(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${STRANGER_UID}', false);
`);

// NON-RECIPIENT -> NOTIFICATION = DENY
const strangerNotifs = await db.query<{ count: string | number }>(`select count(*) as count from public.notifications;`);
assert.equal(Number(strangerNotifs.rows[0].count), 0, 'NON-RECIPIENT -> NOTIFICATION must be DENY (0 rows)');

// NON-PARTICIPANT -> MESSAGE = DENY
const strangerMsgs = await db.query<{ count: string | number }>(`select count(*) as count from public.messages;`);
assert.equal(Number(strangerMsgs.rows[0].count), 0, 'NON-PARTICIPANT -> MESSAGE must be DENY (0 rows)');

// STRANGER -> ORDERS = DENY
const strangerOrders = await db.query<{ count: string | number }>(`select count(*) as count from public.orders;`);
assert.equal(Number(strangerOrders.rows[0].count), 0, 'Stranger must see 0 orders');

// STRANGER -> PLAYERS = DENY
const strangerPlayers = await db.query<{ count: string | number }>(`select count(*) as count from public.players;`);
assert.equal(Number(strangerPlayers.rows[0].count), 0, 'Stranger must see 0 players');

console.log('PASS: Test 3 - Non-participant and non-recipient isolation verified.');

// =========================================================================
// TEST 4: GUARDIAN ISOLATION (Guardian Alpha)
// =========================================================================
await db.exec(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${GUARDIAN_ALPHA_UID}', false);
`);

// GUARDIAN A -> LINKED PLAYER = ALLOW
// GUARDIAN A -> UNLINKED PLAYER = DENY
const guardianPlayers = await db.query<{ id: string }>(`select id from public.players;`);
assert.equal(guardianPlayers.rows.length, 1, 'Guardian Alpha must see exactly 1 linked player');
assert.equal(guardianPlayers.rows[0].id, PLAYER_ALPHA_ID, 'GUARDIAN A -> LINKED PLAYER (Alpha) must be ALLOW');
assert.ok(!guardianPlayers.rows.some((p) => p.id === PLAYER_BETA_ID), 'GUARDIAN A -> UNLINKED PLAYER (Beta) must be DENY');

console.log('PASS: Test 4 - Guardian linked child allow and unlinked child deny verified.');

// =========================================================================
// TEST 5: COACH ISOLATION (Coach Alpha)
// =========================================================================
await db.exec(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', '${COACH_ALPHA_UID}', false);
`);

// COACH A -> ASSIGNED GROUP PLAYER = ALLOW
// COACH A -> UNASSIGNED PLAYER = DENY
const coachPlayers = await db.query<{ id: string }>(`select id from public.players;`);
assert.equal(coachPlayers.rows.length, 1, 'Coach Alpha must see exactly 1 assigned group player');
assert.equal(coachPlayers.rows[0].id, PLAYER_ALPHA_ID, 'COACH A -> ASSIGNED PLAYER (Alpha) must be ALLOW');
assert.ok(!coachPlayers.rows.some((p) => p.id === PLAYER_BETA_ID), 'COACH A -> UNASSIGNED PLAYER (Beta) must be DENY');

// COACH A -> COACH GROUPS: only assigned groups
const coachGroups = await db.query<{ group_id: string }>(`select group_id from public.coach_groups;`);
assert.equal(coachGroups.rows.length, 1);
assert.equal(coachGroups.rows[0].group_id, GROUP_ALPHA_ID);

console.log('PASS: Test 5 - Coach group assignment allow and unassigned deny verified.');

// Reset role for clean exit
await db.exec(`reset role;`);
console.log('RLS SECURITY CONTRACT VERIFICATION: ALL 5 SUITES PASSED');
