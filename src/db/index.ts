import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { databaseConfigured as runtimeDatabaseConfigured } from '../server/runtime';

declare global {
  var _uosPostgresPool: Pool | undefined;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = value ? Number(value) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function databaseConfigured(): boolean {
  return runtimeDatabaseConfigured();
}

export function getPool(): Pool {
  if (!databaseConfigured()) {
    throw new Error('Production database is not configured.');
  }

  if (!global._uosPostgresPool) {
    const connectionString = process.env.DATABASE_URL?.trim();
    const user = process.env.SQL_USER?.trim() || process.env.SQL_ADMIN_USER?.trim();
    const password = process.env.SQL_PASSWORD?.trim() || process.env.SQL_ADMIN_PASSWORD?.trim();
    const sslEnabled = process.env.SQL_SSL != null
      ? process.env.SQL_SSL === 'true'
      : process.env.NODE_ENV === 'production';
    const ssl = sslEnabled
      ? { rejectUnauthorized: process.env.SQL_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : undefined;
    const statementTimeout = positiveInteger(process.env.SQL_STATEMENT_TIMEOUT_MS, 12_000);
    const poolMax = positiveInteger(process.env.SQL_POOL_MAX, 10);

    global._uosPostgresPool = new Pool(
      connectionString
        ? {
            connectionString,
            max: poolMax,
            connectionTimeoutMillis: 15000,
            statement_timeout: statementTimeout,
            ssl,
          }
        : {
            host: process.env.SQL_HOST,
            port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : undefined,
            user,
            password,
            database: process.env.SQL_DB_NAME,
            max: poolMax,
            connectionTimeoutMillis: 15000,
            statement_timeout: statementTimeout,
            ssl,
          },
    );

    global._uosPostgresPool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error:', error);
    });
  }

  return global._uosPostgresPool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}