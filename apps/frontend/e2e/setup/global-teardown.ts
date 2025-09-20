import * as path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';
import postgres from 'postgres';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../../../');

/**
 * Global teardown for local E2E:
 * - Load .env.test
 * - Drop the local test database (terminate connections, drop DB)
 */
async function globalTeardown() {
  console.log('Starting global teardown for tests...');

  try {
    // Load test env
    loadEnv({ path: path.resolve(projectRoot, 'apps/frontend/.env.test') });
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL must be set in apps/frontend/.env.test');

    const dbUrl = new URL(databaseUrl);
    const targetDbName = dbUrl.pathname.replace('/', '');
    const adminUrl = new URL(databaseUrl);
    adminUrl.pathname = '/postgres';

    console.log(`Dropping test database: ${targetDbName}`);
    const adminSql = postgres(adminUrl.toString());
    try {
      // Terminate active connections
      await adminSql`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = ${targetDbName}
          AND pid <> pg_backend_pid();
      `;
      await adminSql.unsafe(`DROP DATABASE IF EXISTS ${targetDbName}`);
      console.log(`Dropped database ${targetDbName}`);
    } finally {
      await adminSql.end();
    }

    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Error during global teardown:', error);
    throw error;
  }
}

export default globalTeardown;
