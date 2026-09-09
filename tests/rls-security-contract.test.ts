import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

console.log('--- RUNNING RLS SECURITY CONTRACT TEST (IN-MEMORY POSTGRES) ---');

const db = new PGlite({
  extensions: { pgcrypto }
});

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

// Grant base permissions to anon and authenticated roles so RLS policies can be tested
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select on all tables in schema public to anon, authenticated;
  revoke all on public.payment_webhooks from anon;
  revoke all on public.payment_intents from anon;
  revoke all on public.orders from anon;
  revoke all on public.messages from anon;
  revoke all on public.notifications from anon;
`);

// Seed foundation test records
await db.exec(`
  -- Organizations & hierarchy
  insert into public.organizations (id, name, status)
  values ('11111111-1111-1111-1111-111111111111', 'United Olympics Sports HQ', 'active');

  insert into public.branches (id, country_id, name, status)
  select '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Dubai Main', 'active'
  where false; -- skip hierarchy FKs by using standalone entries where FKs allow

  -- Players
  insert into public.players (id, user_uid, full_name)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'usr_player_alpha', 'Alpha Athlete'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'usr_player_beta', 'Beta Athlete');

  -- Sensitive Data: Notifications
  insert into public.notifications (id, recipient_uid, channel, status, locale, title, body)
  values
    (gen_random_uuid(), 'usr_player_alpha', 'in_app', 'queued', 'ar', 'Alpha Notice', 'Confidential'),
    (gen_random_uuid(), 'usr_player_beta', 'in_app', 'queued', 'ar', 'Beta Notice', 'Confidential');

  -- Sensitive Data: Messages
  insert into public.messages (id, sender_uid, recipient_uid, thread_id, content)
  values
    (gen_random_uuid(), 'usr_player_alpha', 'usr_player_beta', 'thread-1', 'Private message to Beta');

  -- Sensitive Data: Orders
  insert into public.orders (id, order_number, customer_uid, status, total_minor, currency, items)
  values
    (gen_random_uuid(), 'ORD-1001', 'usr_player_alpha', 'pending', 5000, 'AED', '[]'::jsonb),
    (gen_random_uuid(), 'ORD-1002', 'usr_player_beta', 'pending', 9000, 'AED', '[]'::jsonb);

  -- Sensitive Data: Payment Intents
  insert into public.payment_intents (id, idempotency_key, player_id, amount_minor, currency, status, provider)
  values
    (gen_random_uuid(), 'idem-alpha-01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'AED', 'succeeded', 'stripe'),
    (gen_random_uuid(), 'idem-beta-01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 9000, 'AED', 'succeeded', 'stripe');

  -- Sensitive Data: Payment Webhooks
  insert into public.payment_webhooks (id, event_id, provider, event_type, status, payload)
  values
    (gen_random_uuid(), 'evt-stripe-001', 'stripe', 'charge.succeeded', 'received', '{"charge": 1}'::jsonb);

  -- Public / Scoped Data: Achievements
  insert into public.achievements (id, player_id, title, category, is_public)
  values
    (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alpha Public Gold', 'gold', true),
    (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alpha Private Trophy', 'special', false),
    (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Beta Public Silver', 'silver', true),
    (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Beta Private Trophy', 'special', false);

  -- Public / Scoped Data: Events
  insert into public.events (id, organization_id, title, starts_at, status)
  values
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Open Championship', now(), 'scheduled'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Internal Draft Meet', now(), 'draft');

  -- Public / Scoped Data: Announcements
  insert into public.announcements (id, organization_id, title, body, status, target_role)
  values
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Public Welcome', 'Welcome all', 'active', 'all'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Staff Memo', 'Coaches only', 'active', 'coach');
`);

// =========================================================================
// TEST 1: ANONYMOUS ACCESS REJECTIONS & SCOPING
// =========================================================================
await db.exec(`
  set role anon;
  select set_config('request.jwt.claim.sub', '', false);
`);

// A. Sensitive tables must return 0 rows or throw permission denied
try {
  const notifRes = await db.query<{ count: string | number }>(`select count(*) as count from public.notifications;`);
  assert.equal(Number(notifRes.rows[0].count), 0, 'Anonymous must see 0 notifications');
} catch (err: any) {
  // Permission denied is also valid fail-closed
  assert.match(err.message, /permission denied/i);
}

try {
  const msgRes = await db.query<{ count: string | number }>(`select count(*) as count from public.messages;`);
  assert.equal(Number(msgRes.rows[0].count), 0, 'Anonymous must see 0 messages');
} catch (err: any) {
  assert.match(err.message, /permission denied/i);
}

try {
  const ordRes = await db.query<{ count: string | number }>(`select count(*) as count from public.orders;`);
  assert.equal(Number(ordRes.rows[0].count), 0, 'Anonymous must see 0 orders');
} catch (err: any) {
  assert.match(err.message, /permission denied/i);
}

try {
  const piRes = await db.query<{ count: string | number }>(`select count(*) as count from public.payment_intents;`);
  assert.equal(Number(piRes.rows[0].count), 0, 'Anonymous must see 0 payment intents');
} catch (err: any) {
  assert.match(err.message, /permission denied/i);
}

try {
  const pwRes = await db.query<{ count: string | number }>(`select count(*) as count from public.payment_webhooks;`);
  assert.equal(Number(pwRes.rows[0].count), 0, 'Anonymous must see 0 payment webhooks');
} catch (err: any) {
  assert.match(err.message, /permission denied/i);
}

// B. Public scoped tables
const publicAch = await db.query<{ title: string; is_public: boolean }>(`select title, is_public from public.achievements;`);
assert.equal(publicAch.rows.length, 2, 'Anonymous should only see 2 public achievements');
assert.ok(publicAch.rows.every((r) => r.is_public === true), 'All visible achievements to anon must be public');

const publicEvt = await db.query<{ title: string; status: string }>(`select title, status from public.events;`);
assert.equal(publicEvt.rows.length, 1, 'Anonymous should only see 1 scheduled event');
assert.equal(publicEvt.rows[0].status, 'scheduled');

const publicAnn = await db.query<{ title: string; target_role: string }>(`select title, target_role from public.announcements;`);
assert.equal(publicAnn.rows.length, 1, 'Anonymous should only see target_role=all announcement');
assert.equal(publicAnn.rows[0].target_role, 'all');

console.log('PASS: Anonymous RLS restrictions and public scoping verified.');

// =========================================================================
// TEST 2: AUTHENTICATED USER ISOLATION (Alpha Athlete)
// =========================================================================
await db.exec(`
  set role authenticated;
  select set_config('request.jwt.claim.sub', 'usr_player_alpha', false);
`);

// Alpha notifications
const alphaNotifs = await db.query<{ recipient_uid: string }>(`select recipient_uid from public.notifications;`);
assert.equal(alphaNotifs.rows.length, 1);
assert.equal(alphaNotifs.rows[0].recipient_uid, 'usr_player_alpha');

// Alpha orders
const alphaOrders = await db.query<{ customer_uid: string }>(`select customer_uid from public.orders;`);
assert.equal(alphaOrders.rows.length, 1);
assert.equal(alphaOrders.rows[0].customer_uid, 'usr_player_alpha');

// Alpha messages
const alphaMsgs = await db.query<{ sender_uid: string; recipient_uid: string }>(`select sender_uid, recipient_uid from public.messages;`);
assert.equal(alphaMsgs.rows.length, 1);
assert.equal(alphaMsgs.rows[0].sender_uid, 'usr_player_alpha');

// Alpha payment intents
const alphaIntents = await db.query<{ player_id: string }>(`select player_id from public.payment_intents;`);
assert.equal(alphaIntents.rows.length, 1);
assert.equal(alphaIntents.rows[0].player_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

// Alpha achievements: sees public achievements + own private achievement (3 total: 2 public + 1 private own)
const alphaAch = await db.query<{ title: string; is_public: boolean }>(`select title, is_public from public.achievements;`);
assert.equal(alphaAch.rows.length, 3);
assert.ok(!alphaAch.rows.some((r) => r.title === 'Beta Private Trophy'), 'Alpha must not see Beta private achievement');

console.log('PASS: Authenticated tenant isolation and owner-scoped RLS verified.');

// Reset role for clean exit
await db.exec(`reset role;`);
console.log('RLS SECURITY CONTRACT VERIFICATION: PASS');
