import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';
import postgres from 'postgres';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../../../');

/**
 * Global setup for local E2E:
 * - Load .env.test
 * - Ensure the test database exists (create if missing)
 * - Run migrations and seed on the local test DB
 */
async function globalSetup() {
  console.log('Starting global setup for tests...');

  try {
    // Load test env
    loadEnv({ path: path.resolve(projectRoot, 'apps/frontend/.env.test') });
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL must be set in apps/frontend/.env.test');

    // Ensure test DB exists by connecting to the server database and creating it if needed
    const dbUrl = new URL(databaseUrl);
    const targetDbName = dbUrl.pathname.replace('/', '');
    const adminUrl = new URL(databaseUrl);
    adminUrl.pathname = '/postgres';

    console.log(`Ensuring test database exists: ${targetDbName}`);
    const adminSql = postgres(adminUrl.toString());
    try {
      // terminate existing connections if create fails later
      const dbs = await adminSql`SELECT 1 FROM pg_database WHERE datname = ${targetDbName}`;
      if (dbs.length === 0) {
        await adminSql.unsafe(`CREATE DATABASE ${targetDbName}`);
        console.log(`Created database ${targetDbName}`);
      } else {
        console.log(`Database ${targetDbName} already exists`);
      }
    } finally {
      await adminSql.end();
    }

    // Run migrations and seed against the test DB
    console.log('Running migrations...');
    execSync('pnpm run db:migrate', {
      cwd: path.resolve(projectRoot, 'packages/db'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    console.log('Seeding database...');
    execSync('pnpm run db:seed', {
      cwd: path.resolve(projectRoot, 'packages/db'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  }
}

export default globalSetup;
