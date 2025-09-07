import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/schema.js';
import postgres from 'postgres';
import { PoolConfig } from './types/PoolConfig.js';
import * as dotenv from 'dotenv';

// Load .env, but do NOT override values already provided (important for tests!)
dotenv.config({ override: false });

// Determine database URL
let databaseURL = process.env.DATABASE_URL;

// Configuration options for postgres connection
let connectionConfig: any;

if (databaseURL && databaseURL !== '') {
  console.log('Using DATABASE_URL for connection:', databaseURL);

  try {
    const url = new URL(databaseURL);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'

    console.log('Parsed connection details:', {
      username,
      passwordProvided: !!password,
      host,
      port,
      database,
    });

    connectionConfig = {
      host,
      database,
      username,
      password,
      port,
      ssl: url.searchParams.get('sslmode') === 'require' ? true : false,
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Fallback: use individual Neon/PG env vars
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
    process.env as unknown as PoolConfig;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error('Missing db connection environment variables');
  }

  console.log('Using individual environment variables for connection');

  connectionConfig = {
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require' as const,
    connection: ENDPOINT_ID
      ? {
          options: `project=${ENDPOINT_ID}`,
        }
      : undefined,
  };
}

console.log('Final connection config (without sensitive data):', {
  ...connectionConfig,
  password: connectionConfig.password ? '****' : undefined,
});

// Create the postgres connector
const psqlConnector = postgres(connectionConfig);
export const db = drizzle(psqlConnector, { schema, logger: false });
