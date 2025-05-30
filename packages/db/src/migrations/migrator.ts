// migrator.ts

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { PoolConfig } from '../types/PoolConfig';

dotenv.config();

// Configuration options for postgres connection
let connectionConfig;

const isProduction = process.env.NODE_ENV === 'production';
let databaseURL = '';

// if (isProduction) {
//   databaseURL = process.env.PRODUCTION_DATABASE_URL as string;
// } else {
databaseURL = process.env.DATABASE_URL as string;
// }

// Check if DATABASE_URL is available (for local development)
if (databaseURL) {
  try {
    // Parse the URL manually to ensure correct extraction of credentials
    const url = new URL(databaseURL);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'

    connectionConfig = {
      host,
      database,
      username,
      password,
      port,
      ssl: url.searchParams.get('sslmode') === 'require' ? 'require' : false,
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Fallback to individual environment variables
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
    process.env as unknown as PoolConfig;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
    throw new Error('Missing db connection environment variables');
  }

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
    migrationsFolder: 'src/migrations',
  });
  await psqlConnector.end();
}

drizzleMigrator().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
