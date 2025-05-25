#!/usr/bin/env node

import postgres from 'postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

async function verifyTestDb() {
  console.log('Verifying test database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in test environment');
  }

  // Create a database connection
  const sql = postgres(connectionString, {
    onnotice: () => {}, // Suppress notices
  });

  try {
    // Verify tables were created
    console.log('Checking database tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (tables.length > 0) {
      console.log(`Found ${tables.length} tables in the database:`);
      tables.forEach(table => {
        console.log(` - ${table.table_name}`);
      });
    } else {
      console.warn('No tables found in the database.');
    }

    // Check for test user
    const users = await sql`SELECT * FROM users`;
    console.log(`\nFound ${users.length} users in the database`);
    if (users.length > 0) {
      console.log('First user:', users[0]);
    }
  } catch (error) {
    console.error('Error verifying test database:', error);
  } finally {
    // Close connection
    await sql.end();
  }
}

// Run the verification
verifyTestDb()
  .catch(console.error)
  .finally(() => console.log('Verification complete'));
