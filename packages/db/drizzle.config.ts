import { Config, defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { PoolConfig } from './src/types/PoolConfig';
dotenv.config();

// Configuration options for database connection
let dbCredentials;

let connectionConfig;

const isProduction = process.env.NODE_ENV === 'production';
let databaseURL = '';

// if (isProduction) {
//   databaseURL = process.env.PRODUCTION_DATABASE_URL as string;
// } else {
databaseURL = process.env.DATABASE_URL as string;
// }

// Check if DATABASE_URL is available
if (databaseURL) {
  try {
    // Parse the URL manually to ensure correct extraction of credentials
    const url = new URL(databaseURL);
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'

    dbCredentials = {
      host,
      database,
      user,
      password,
      port,
      ssl: url.searchParams.get('sslmode') === 'require',
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Fallback to individual environment variables
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } =
    process.env as unknown as PoolConfig;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
    throw new Error('Missing db connection environment variables');
  }

  dbCredentials = {
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: true,
  };
}

export default defineConfig({
  schema: './src/schema/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials,
  verbose: true,
  strict: true,
} satisfies Config);
