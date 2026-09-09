import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

console.log('--- RUNNING FRESH DATABASE BOOTSTRAP TEST (0001 -> 0006) ---');

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
  const filePath = path.join(migrationsDir, file);
  assert.ok(fs.existsSync(filePath), `Migration file ${file} must exist`);
  const sql = fs.readFileSync(filePath, 'utf8');
  await db.exec(sql);
}

// 1. Assert exactly 33 public base tables
const tablesRes = await db.query<{ table_name: string }>(`
  select table_name
    from information_schema.tables
   where table_schema = 'public'
     and table_type = 'BASE TABLE'
   order by table_name;
`);

const expectedTables = [
  'achievements',
  'announcements',
  'app_user_profiles',
  'app_user_roles',
  'app_user_scopes',
  'attendance',
  'audit_logs',
  'branches',
  'catalog_products',
  'coach_groups',
  'coaches',
  'countries',
  'documents',
  'events',
  'groups',
  'guardians',
  'inventory',
  'messages',
  'notifications',
  'orders',
  'organizations',
  'payment_intents',
  'payment_webhooks',
  'payments',
  'performance_evaluations',
  'player_guardians',
  'players',
  'programs',
  'public_enquiries',
  'service_requests',
  'sessions',
  'sports',
  'subscriptions'
];

const createdTables = tablesRes.rows.map((r) => r.table_name);
assert.equal(createdTables.length, 33, `Expected exactly 33 tables, got ${createdTables.length}`);
assert.deepEqual(createdTables, expectedTables, 'Created tables must exactly match expected tables');

// 2. Assert critical column parity
const colChecks = [
  { table: 'players', col: 'group_id' },
  { table: 'coach_groups', col: 'coach_id' },
  { table: 'coach_groups', col: 'group_id' },
  { table: 'achievements', col: 'is_public' },
  { table: 'app_user_profiles', col: 'user_id' },
  { table: 'app_user_profiles', col: 'email' }
];

for (const { table, col } of colChecks) {
  const colRes = await db.query<{ column_name: string }>(`
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name = $1
       and column_name = $2;
  `, [table, col]);
  assert.equal(colRes.rows.length, 1, `Column ${table}.${col} must exist`);
}

// 3. Assert RLS is enabled on all 33 tables
const rlsRes = await db.query<{ tablename: string; rowsecurity: boolean }>(`
  select tablename, rowsecurity
    from pg_tables
   where schemaname = 'public'
   order by tablename;
`);

assert.equal(rlsRes.rows.length, 33);
for (const row of rlsRes.rows) {
  assert.equal(row.rowsecurity, true, `Table ${row.tablename} must have rowsecurity = true`);
}

console.log('PASS: Fresh empty database bootstrap across migrations 0001 -> 0006 verified with 33 RLS-hardened tables.');
