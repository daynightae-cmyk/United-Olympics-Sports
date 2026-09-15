import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { databaseConfigured, getPool } from './index';

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

type ConcurrentIndexState = {
  exists: boolean;
  valid: boolean;
};

export function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

export function splitConcurrentIndexStatements(content: string): {
  transactionalSql: string;
  concurrentStatements: string[];
} {
  const concurrentStatements: string[] = [];
  const concurrentIndexPattern = /^\s*create\s+(?:unique\s+)?index\s+concurrently\s+if\s+not\s+exists[\s\S]*?;/gim;
  const transactionalSql = content.replace(concurrentIndexPattern, (statement) => {
    concurrentStatements.push(statement.trim());
    return '';
  });

  if (/^\s*create\s+(?:unique\s+)?index\s+concurrently\b/im.test(transactionalSql)) {
    throw new Error('Concurrent index migration contains an unsupported CREATE INDEX CONCURRENTLY statement.');
  }

  return { transactionalSql, concurrentStatements };
}

export function getConcurrentIndexName(statement: string): string {
  const match = statement.match(
    /^\s*create\s+(?:unique\s+)?index\s+concurrently\s+if\s+not\s+exists\s+([a-zA-Z_][\w$]*(?:\.[a-zA-Z_][\w$]*)?)/i,
  );
  if (!match?.[1]) {
    throw new Error('Concurrent index statement must use a supported unquoted index identifier.');
  }
  return match[1];
}

function quoteQualifiedIdentifier(identifier: string): string {
  return identifier
    .split('.')
    .map((part) => `"${part.replace(/"/g, '""')}"`)
    .join('.');
}

async function readConcurrentIndexState(client: PoolClient, indexName: string): Promise<ConcurrentIndexState> {
  const state = await client.query<{ indisvalid: boolean; indisready: boolean }>(
    `select i.indisvalid, i.indisready
       from pg_class c
       join pg_index i on i.indexrelid = c.oid
      where c.oid = to_regclass($1)`,
    [indexName],
  );
  if (state.rows.length === 0) return { exists: false, valid: false };
  return {
    exists: true,
    valid: state.rows[0].indisvalid === true && state.rows[0].indisready === true,
  };
}

async function dropConcurrentIndex(client: PoolClient, indexName: string): Promise<void> {
  await client.query(`drop index concurrently if exists ${quoteQualifiedIdentifier(indexName)}`);
}

async function executeConcurrentIndexStatement(client: PoolClient, statement: string): Promise<string> {
  const indexName = getConcurrentIndexName(statement);
  const before = await readConcurrentIndexState(client, indexName);
  if (before.exists && !before.valid) {
    console.warn(`[DB-MIGRATE] Removing invalid concurrent index '${indexName}' before retry.`);
    await dropConcurrentIndex(client, indexName);
  }

  try {
    await client.query(statement);
  } catch (error) {
    const failedState = await readConcurrentIndexState(client, indexName);
    if (!failedState.exists || failedState.valid) throw error;

    console.warn(`[DB-MIGRATE] Concurrent index '${indexName}' was left invalid; rebuilding once.`);
    await dropConcurrentIndex(client, indexName);
    await client.query(statement);
  }

  let after = await readConcurrentIndexState(client, indexName);
  if (after.exists && !after.valid) {
    console.warn(`[DB-MIGRATE] Concurrent index '${indexName}' is invalid after creation; rebuilding once.`);
    await dropConcurrentIndex(client, indexName);
    await client.query(statement);
    after = await readConcurrentIndexState(client, indexName);
  }

  if (!after.exists || !after.valid) {
    throw new Error(`Concurrent index '${indexName}' is not valid after migration execution.`);
  }

  return indexName;
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
    await client.query(`
      create table if not exists schema_migrations (
        id serial primary key,
        version text not null unique,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
    `);

    const appliedRes = await client.query<{ version: string; checksum: string; applied_at: Date }>(
      'select version, checksum, applied_at from schema_migrations order by id asc;',
    );
    const appliedMap = new Map<string, { checksum: string; applied_at: Date }>();
    for (const row of appliedRes.rows) {
      appliedMap.set(row.version, { checksum: row.checksum, applied_at: row.applied_at });
    }

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

      const { transactionalSql, concurrentStatements } = splitConcurrentIndexStatements(sqlContent);
      const usesConcurrently = concurrentStatements.length > 0;
      console.log(`[DB-MIGRATE] Applying migration '${file}'${usesConcurrently ? ' (split concurrent indexes)' : ''}...`);
      let transactionOpen = false;
      try {
        if (usesConcurrently) {
          if (transactionalSql.trim()) {
            await client.query('BEGIN');
            transactionOpen = true;
            await client.query(transactionalSql);
            await client.query('COMMIT');
            transactionOpen = false;
          }

          const concurrentIndexNames: string[] = [];
          for (const statement of concurrentStatements) {
            concurrentIndexNames.push(await executeConcurrentIndexStatement(client, statement));
          }

          // CREATE INDEX CONCURRENTLY can fail while leaving an invalid relation.
          // Re-check every index immediately before recording the migration as
          // applied so IF NOT EXISTS can never hide an invalid leftover index.
          for (const indexName of concurrentIndexNames) {
            const state = await readConcurrentIndexState(client, indexName);
            if (!state.exists || !state.valid) {
              throw new Error(`Concurrent index '${indexName}' failed final validity verification.`);
            }
          }

          await client.query(
            'insert into schema_migrations (version, checksum, applied_at) values ($1, $2, now());',
            [file, currentChecksum],
          );
        } else {
          await client.query('BEGIN');
          transactionOpen = true;
          await client.query(transactionalSql);
          await client.query(
            'insert into schema_migrations (version, checksum, applied_at) values ($1, $2, now());',
            [file, currentChecksum],
          );
          await client.query('COMMIT');
          transactionOpen = false;
        }

        summary.appliedCount++;
        summary.results.push({
          version: file,
          status: 'APPLIED',
          checksum: currentChecksum,
          appliedAt: new Date().toISOString(),
        });
        console.log(`[DB-MIGRATE] Successfully applied '${file}'.`);
      } catch (err: unknown) {
        if (transactionOpen) {
          try { await client.query('ROLLBACK'); } catch { /* best-effort */ }
        }
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
