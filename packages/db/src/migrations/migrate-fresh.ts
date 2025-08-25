import { sql } from 'drizzle-orm';
import pkg from 'pg';
const { Client } = pkg;
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Check if --seed argument is provided
const shouldAutoSeed = process.argv.includes('--seed');

const execPromise = promisify(exec);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user for confirmation
const confirm = async (message: string): Promise<boolean> => {
  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

async function dropAllTables() {
  console.log('Connecting to database...');

  console.log('DATABASE_URL', DATABASE_URL);

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Finding all tables...');

    // Get all tables in the public schema
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const tables = tablesResult.rows.map(row => row.tablename);

    if (tables.length === 0) {
      console.log('No tables found to drop.');
      return;
    }

    console.log(`Found ${tables.length} tables to drop: ${tables.join(', ')}`);

    // Drop all tables
    console.log('Dropping all tables...');

    // First drop all foreign key constraints
    await client.query(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT conname, conrelid::regclass AS table_name FROM pg_constraint WHERE contype = 'f') 
        LOOP
          EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.conname;
        END LOOP;
      END $$;
    `);

    // Drop all enum types
    const enumsResult = await client.query(`
      SELECT typname
      FROM pg_type 
      JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE typtype = 'e' AND nspname = 'public'
    `);

    const enums = enumsResult.rows.map(row => row.typname);

    if (enums.length > 0) {
      console.log(`Found ${enums.length} enums to drop: ${enums.join(', ')}`);

      // Drop each enum
      for (const enumName of enums) {
        await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
      }
    }

    // Drop all tables
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      console.log(`Dropped table: ${table}`);
    }

    console.log('All tables and related objects have been dropped.');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  } finally {
    // Close the client connection
    await client.end();
  }
}

async function runGenerate() {
  console.log('\nRunning drizzle-kit generate...');
  try {
    const { stdout, stderr } = await execPromise('npm run db:generate');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Error running generate command:', error);
    process.exit(1);
  }
}

async function runMigration() {
  console.log('\nRunning migrations...');
  try {
    const { stdout, stderr } = await execPromise('npm run db:migrate');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Error running migration command:', error);
    process.exit(1);
  }
}

async function runSeeder() {
  console.log('\nRunning seeders...');
  try {
    const { stdout, stderr } = await execPromise('npm run db:seed');
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Error running seeder command:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('\x1b[31m%s\x1b[0m', '⚠️  WARNING: This will DELETE ALL DATA in your database! ⚠️');
  console.log('This operation will:');
  console.log('1. Drop all tables in your database');
  console.log('2. Run the generate command to refresh migration files');
  console.log('3. Run migrations to recreate tables');
  if (shouldAutoSeed) {
    console.log('4. Seed the database with fresh data (--seed flag detected)');
  } else {
    console.log('4. Optionally seed the database with fresh data');
  }

  const shouldProceed = await confirm('Are you absolutely sure you want to continue?');

  if (!shouldProceed) {
    console.log('Operation cancelled.');
    rl.close();
    return;
  }

  await dropAllTables();
  await runGenerate();
  await runMigration();

  let runSeed = shouldAutoSeed;

  if (!shouldAutoSeed) {
    runSeed = await confirm('Do you want to seed the database with fresh data?');
  }

  if (runSeed) {
    await runSeeder();
  }

  console.log('\x1b[32m%s\x1b[0m', '✅ Database reset completed successfully!');
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
