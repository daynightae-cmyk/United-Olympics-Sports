import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { computeChecksum, runMigrations } from '../src/db/migrate.ts';

// Test 1: Checksum computation determinism
const testContent = 'create table test_table (id serial primary key);';
const hash1 = computeChecksum(testContent);
const hash2 = computeChecksum(testContent);
assert.equal(hash1, hash2);
assert.equal(typeof hash1, 'string');
assert.equal(hash1.length, 64);

// Test 2: Migration file ordering and existence
const migrationsDir = path.resolve(import.meta.dirname, '../src/db/migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
assert.equal(migrationFiles.length >= 2, true, 'Must have at least 2 migrations');
assert.equal(migrationFiles[0], '0001_production_foundation.sql');
assert.equal(migrationFiles[1], '0002_constraints_and_hardening.sql');

// Test 3: SQL Constraint verification in 0002_constraints_and_hardening.sql
const hardeningSql = fs.readFileSync(path.join(migrationsDir, '0002_constraints_and_hardening.sql'), 'utf8');

// A. Non-negative checks
assert.match(hardeningSql, /chk_subscriptions_amount check \([\s\S]*amount_minor >= 0\)/i);
assert.match(hardeningSql, /chk_payments_amount check \([\s\S]*amount_minor >= 0\)/i);
assert.match(hardeningSql, /chk_inventory_quantity check \(available_quantity >= 0\)/i);

// B. Temporal checks
assert.match(hardeningSql, /chk_sessions_temporal check \([\s\S]*ends_at >= starts_at\)/i);

// C. Score bounds
assert.match(hardeningSql, /chk_evaluations_score check \([\s\S]*score >= 0 and score <= 100\)/i);

// D. Status enumerations
assert.match(hardeningSql, /chk_organizations_status check \(status in \('active', 'suspended', 'archived'\)\)/i);
assert.match(hardeningSql, /chk_attendance_status check \(status in \('present', 'absent', 'late', 'excused'\)\)/i);
assert.match(hardeningSql, /chk_subscriptions_status check \(status in \('pending', 'active', 'paused', 'cancelled', 'expired'\)\)/i);
assert.match(hardeningSql, /chk_payments_status check \(status in \('pending', 'succeeded', 'failed', 'refunded'\)\)/i);

// E. Uniqueness indexes
assert.match(hardeningSql, /unique_active_player_program_subscription[\s\S]*where status = 'active'/i);
assert.match(hardeningSql, /unique_provider_transaction_ref[\s\S]*where provider_reference is not null/i);

// Test 3.1: Migration 0003 Operational and Portal constraints
const operationalSql = fs.readFileSync(path.join(migrationsDir, '0003_portal_and_operations.sql'), 'utf8');
assert.match(operationalSql, /chk_notifications_status check \(status in \('queued', 'sending', 'sent', 'delivered', 'failed'\)\)/i);
assert.match(operationalSql, /chk_payment_intents_amount check \(amount_minor >= 0\)/i);
assert.match(operationalSql, /chk_orders_total check \(total_minor >= 0\)/i);

// Test 3.2: Migration 0004 Portal assignment parity
const assignmentSql = fs.readFileSync(path.join(migrationsDir, '0004_portal_assignment_parity.sql'), 'utf8');
assert.match(assignmentSql, /alter table players[\s\S]*add column if not exists group_id uuid/i);
assert.match(assignmentSql, /create table if not exists coach_groups/i);

// Test 3.3: Migration 0005 Production schema parity and RLS hardening
const rlsHardeningSql = fs.readFileSync(path.join(migrationsDir, '0005_production_schema_parity_and_rls_hardening.sql'), 'utf8');
assert.match(rlsHardeningSql, /alter table if exists organizations enable row level security;/i);
assert.match(rlsHardeningSql, /alter table if exists public_enquiries enable row level security;/i);
assert.match(rlsHardeningSql, /create policy "public_enquiries_anon_insert"/i);

// Test 4: Migration Runner Dry-run Execution
const summary = await runMigrations();
assert.equal(summary.totalFound >= 5, true);
assert.equal(summary.results.length >= 5, true);
assert.equal(summary.results.every((r) => r.status === 'DRY_RUN' || r.status === 'APPLIED' || r.status === 'SKIPPED'), true);

console.log('Database migration lifecycle tests: PASS');
console.log('P0 DATABASE FOUNDATION & CONSTRAINTS: PASS');
