import * as postgres from 'postgres';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { PoolConfig } from '~/types/PoolConfig';

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
  process.env as unknown as PoolConfig;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
  throw new Error('Missing db connection environment variables');
}

const psqlConnector = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function drizzleMigrator() {
  await migrate(drizzle(psqlConnector), {
    migrationsFolder: './src/db/drizzle/migrations',
  });
  await psqlConnector.end();
}

drizzleMigrator();
