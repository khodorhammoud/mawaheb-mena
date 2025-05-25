#!/usr/bin/env node

import postgres from 'postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

async function setupTestDb() {
  console.log('Setting up test database directly using SQL...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in test environment');
  }

  console.log('Using connection string:', connectionString);

  // Connect to the database
  const sql = postgres(connectionString, {
    onnotice: () => {}, // Suppress notices
  });

  try {
    console.log('Connected to database');

    // Read the schema file
    const schemaPath = path.resolve(projectRoot, 'packages/db/src/schema/schema.ts');
    console.log('Reading schema at:', schemaPath);

    // Parse PostgreSQL tables from the schema file
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const pgTableMatches = schemaContent.matchAll(/pgTable\(['"](.*?)['"],\s*{/g);

    const tables = Array.from(pgTableMatches).map(match => match[1]);
    console.log('Found tables in schema:', tables);

    // Create minimal essential tables for testing
    console.log('\nCreating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(80),
        last_name VARCHAR(80),
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR,
        is_verified BOOLEAN DEFAULT FALSE,
        is_onboarded BOOLEAN DEFAULT FALSE,
        provider VARCHAR,
        role VARCHAR DEFAULT 'user'
      );
    `;

    // Add more tables as needed...

    // Check that tables were created
    const existingTables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    console.log(
      '\nCreated tables:',
      existingTables.map(t => t.tablename)
    );

    // Check if test user already exists
    const testUserEmail = 'test@example.com';
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${testUserEmail}
    `;

    // Add some test data if user doesn't exist
    if (existingUser.length === 0) {
      console.log('\nAdding test data...');
      await sql`
        INSERT INTO users (first_name, last_name, email, password_hash, is_verified, is_onboarded)
        VALUES ('Test', 'User', ${testUserEmail}, 'test_hash', true, true)
      `;
    } else {
      console.log('\nTest user already exists. Skipping insertion.');
    }

    console.log('Test database setup complete!');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    // Close connection
    await sql.end();
  }
}

// Run the setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupTestDb()
    .then(() => {
      console.log('Test database setup completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test database setup failed:', error);
      process.exit(1);
    });
}

export default setupTestDb;
