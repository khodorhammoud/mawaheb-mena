import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schemas/schema';
import postgres from 'postgres';
import { PoolConfig } from '~/types/PoolConfig';
import * as dotenv from 'dotenv';
dotenv.config();

// dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
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

export const db = drizzle(psqlConnector, { schema, logger: true });
