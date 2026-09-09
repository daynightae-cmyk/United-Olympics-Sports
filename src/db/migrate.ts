import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { databaseConfigured, getPool } from './index.ts';

export interface MigrationResult {
  version: string;
  status: 'APPLIED' | 'SKIPPED' | 'DRIFT_DETECTED' | 'FAILED' | 'DRY_RUN';
  checksum: string;
  appliedAt?: string;
  error?: string;
}

export interface MigrationSummary {
  configured: boolean;
  totalFound: number;
  appliedCount: number;
  skippedCount: number;
  results: MigrationResult[];
}

export function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

export async function runMigrations(): Promise<MigrationSummary> {
  const migrationsDir = path.resolve(import.meta.dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const isConfigured = databaseConfigured();
  const summary: MigrationSummary = {
    configured: isConfigured,
    totalFound: files.length,
    appliedCount: 0,
    skippedCount: 0,
    results: [],
  };

  if (!isConfigured) {
    console.warn('[DB-MIGRATE] Database credentials not configured. Executing dry-run migration validation.');
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      summary.results.push({
        version: file,
        status: 'DRY_RUN',
        checksum: computeChecksum(content),
      });
    }
    return summary;
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Ensure tracking table exists
    await client.query(`
      create table if not exists schema_migrations (
        id serial primary key,
        version text not null unique,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
    `);

    // 2. Fetch applied migrations
    const appliedRes = await client.query<{ version: string; checksum: string; applied_at: Date }>(
      'select version, checksum, applied_at from schema_migrations order by id asc;',
    );
    const appliedMap = new Map<string, { checksum: string; applied_at: Date }>();
    for (const row of appliedRes.rows) {
      appliedMap.set(row.version, { checksum: row.checksum, applied_at: row.applied_at });
    }

    // 3. Process each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const currentChecksum = computeChecksum(sqlContent);

      if (appliedMap.has(file)) {
        const existing = appliedMap.get(file)!;
        if (existing.checksum !== currentChecksum) {
          console.warn(`[DB-MIGRATE] DRIFT DETECTED in migration '${file}'. Checksum mismatch.`);
          summary.results.push({
            version: file,
            status: 'DRIFT_DETECTED',
            checksum: currentChecksum,
            appliedAt: existing.applied_at.toISOString(),
          });
        } else {
          summary.skippedCount++;
          summary.results.push({
            version: file,
            status: 'SKIPPED',
            checksum: currentChecksum,
            appliedAt: existing.applied_at.toISOString(),
          });
        }
        continue;
      }

      // Apply migration in an isolated transaction
      console.log(`[DB-MIGRATE] Applying migration '${file}'...`);
      try {
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query(
          'insert into schema_migrations (version, checksum, applied_at) values ($1, $2, now());',
          [file, currentChecksum],
        );
        await client.query('COMMIT');

        summary.appliedCount++;
        summary.results.push({
          version: file,
          status: 'APPLIED',
          checksum: currentChecksum,
          appliedAt: new Date().toISOString(),
        });
        console.log(`[DB-MIGRATE] Successfully applied '${file}'.`);
      } catch (err: unknown) {
        await client.query('ROLLBACK');
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[DB-MIGRATE] Migration '${file}' failed:`, errMsg);
        summary.results.push({
          version: file,
          status: 'FAILED',
          checksum: currentChecksum,
          error: errMsg,
        });
        throw err;
      }
    }

    return summary;
  } finally {
    client.release();
  }
}

// CLI runner execution
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then((res) => {
      console.log('[DB-MIGRATE] Execution finished with summary:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB-MIGRATE] Execution aborted with error:', err);
      process.exit(1);
    });
}
