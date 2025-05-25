#!/usr/bin/env node

import postgres from 'postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the test env file
config({ path: path.resolve(currentDir, '../apps/frontend/.env.test') });

async function teardownTestDb() {
  console.log('Tearing down test database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in the test environment');
  }

  // Connect to the database
  const sql = postgres(connectionString);

  try {
    // Drop all tables in the test database
    console.log('Dropping all tables...');

    // Get all table names
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    // Drop each table
    for (const { tablename } of tables) {
      console.log(`Dropping table: ${tablename}`);
      await sql`DROP TABLE IF EXISTS ${sql(tablename)} CASCADE`;
    }

    console.log('Test database teardown complete.');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
}

// Run the teardown if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  teardownTestDb()
    .then(() => {
      console.log('Test database teardown completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test database teardown failed:', error);
      process.exit(1);
    });
}

export default teardownTestDb;
