import { Config, defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

interface PoolConfig {
  PGHOST: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  ENDPOINT_ID: string;
}

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
  process.env as unknown as PoolConfig;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
  throw new Error('Missing db connection environment variables');
}

export default defineConfig({
  schema: './src/db/drizzle/schemas/*.ts',
  out: './src/db/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: true,
  },
  verbose: true,
  strict: true,
} satisfies Config);
