// packages/db/src/migrations/migrator.ts

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { PoolConfig } from '../types/PoolConfig';

/* NEW: load .env from common places (monorepo-safe) */
(function loadEnv() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../.env.local'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      return;
    }
  }
  dotenv.config();
})();

/* ─────────────────────────────────────────────────────────────── */

let connectionConfig: any;

const isProduction = process.env.NODE_ENV === 'production';
let databaseURL = process.env.DATABASE_URL as string;

/* NEW: helpful error if missing */
if (!databaseURL) {
  console.error('❌ DATABASE_URL is not set. Put it in .env (root or packages/db).');
  process.exit(1);
}

/* Parse DATABASE_URL → object config */
try {
  const url = new URL(databaseURL);
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  const database = url.pathname.substring(1);

  /* NEW: auto-SSL detection (Neon / ?sslmode=require / DATABASE_SSL=true) */
  const needSsl =
    /\bneon\.tech\b/i.test(host) ||
    url.searchParams.get('sslmode') === 'require' ||
    process.env.DATABASE_SSL === 'true';

  connectionConfig = {
    host,
    database,
    username,
    password,
    port,
    /* NEW: postgres-js expects 'require' to enforce TLS without CA fuss */
    ssl: needSsl ? 'require' : undefined,
  };
} catch (error) {
  console.error('Error parsing DATABASE_URL:', error);
  throw new Error('Invalid DATABASE_URL format');
}

/* Fallback path (kept from your original) */
if (!connectionConfig) {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
    process.env as unknown as PoolConfig;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
    throw new Error('Missing db connection environment variables');
  }

  console.log('PGHOST', PGHOST);
  console.log('PGDATABASE', PGDATABASE);
  console.log('PGUSER', PGUSER);
  console.log('PGPASSWORD', PGPASSWORD);
  console.log('ENDPOINT_ID', ENDPOINT_ID);

  connectionConfig = {
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
      options: `project=${ENDPOINT_ID}`,
    },
  };
}

const psqlConnector = postgres(connectionConfig);

async function drizzleMigrator() {
  console.log('Running Drizzle migrations...');
  await migrate(drizzle(psqlConnector), {
    /* NEW: robust path (works from tsx & built code) */
    migrationsFolder: path.resolve(process.cwd(), 'src/migrations'),
  });
  await psqlConnector.end();
  console.log('✅ Migrations applied successfully');
}

drizzleMigrator().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
