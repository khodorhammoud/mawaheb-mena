// connector.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import { PoolConfig } from '@mawaheb/db/src/types/PoolConfig';
// import * as schema from '@mawaheb/db/src/schema/schema';
import * as schema from './schema/schema';
// import postgres from 'postgres';
import * as postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

// Configuration options for postgres connection
let connectionConfig;

// Check if DATABASE_URL is available (for local development)
if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for connection:', process.env.DATABASE_URL);

  try {
    // Parse the URL manually to ensure correct extraction of credentials
    const url = new URL(process.env.DATABASE_URL);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'

    console.log('Parsed connection details:', {
      username,
      // Don't log actual password
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

  console.log('Using individual environment variables for connection');

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

console.log('Final connection config (without sensitive data):', {
  ...connectionConfig,
  // password: connectionConfig.password ? '****' : undefined,
  password: connectionConfig.password,
});

// Create the postgres connector with appropriate configuration
const psqlConnector = postgres(connectionConfig);

export const db = drizzle(psqlConnector, { schema, logger: false });
