#!/usr/bin/env npx tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as schema from '../packages/db/src/schema/schema';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

// Type for table objects from Drizzle
type DrizzleTable = {
  name: string;
  toSQL: () => { sql: string };
};

// Type for enum objects from Drizzle
type DrizzleEnum = {
  enumName: string;
  toSQL: () => { sql: string };
};

async function setupTestDb() {
  console.log('Setting up test database from Drizzle schema...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in test environment');
  }

  console.log('Using connection string:', connectionString);

  try {
    // Create a database connection
    const sql = postgres(connectionString, {
      max: 1,
      onnotice: () => {}, // Suppress notices
    });

    // Create Drizzle instance with the imported schema
    const db = drizzle(sql);

    // Log all schema tables found
    const tableNames = Object.keys(schema)
      .filter(key => key.endsWith('Table'))
      .sort();

    console.log(`\nFound ${tableNames.length} tables in schema:`, tableNames.join(', '));

    // Create schema by executing create statements for each table
    console.log('\nCreating database schema...');

    // Extract all tables from the schema
    const tables = Object.entries(schema)
      .filter(([key]) => key.endsWith('Table'))
      .map(([_, value]) => value as unknown as DrizzleTable);

    console.log(`Creating ${tables.length} tables...`);

    // Generate and execute CREATE TABLE statements
    for (const table of tables) {
      try {
        const tableName = table.name;
        console.log(`Creating table: ${tableName}`);

        // Generate SQL for creating table
        const createTableSQL = table.toSQL();

        if (createTableSQL && createTableSQL.sql) {
          await sql.unsafe(createTableSQL.sql);
          console.log(`  ✅ Table ${tableName} created`);
        } else {
          console.warn(`  ⚠️ Could not generate SQL for table ${tableName}, skipping`);
        }
      } catch (error: any) {
        // If table already exists, log but continue
        if (error.message && error.message.includes('already exists')) {
          console.log(`  ⚠️ Table ${table.name} already exists, skipping`);
        } else {
          console.error(`  ❌ Error creating table ${table.name}:`, error.message);
        }
      }
    }

    // Create enums as well (if pgEnum is used)
    console.log('\nCreating enum types...');
    const enumTypes = Object.entries(schema)
      .filter(([key]) => key.endsWith('Enum'))
      .map(([_, value]) => value as unknown as DrizzleEnum);

    for (const enumType of enumTypes) {
      try {
        const createEnumSQL = enumType.toSQL?.();
        if (createEnumSQL && createEnumSQL.sql) {
          await sql.unsafe(createEnumSQL.sql);
          console.log(`  ✅ Enum ${enumType.enumName} created`);
        }
      } catch (error: any) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`  ⚠️ Enum ${enumType.enumName} already exists, skipping`);
        } else {
          console.error(
            `  ❌ Error creating enum ${enumType.enumName || 'unknown'}:`,
            error.message
          );
        }
      }
    }

    // Verify tables were created
    console.log('\nVerifying database tables...');
    const dbTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (dbTables.length > 0) {
      console.log(`Found ${dbTables.length} tables in the database:`);
      dbTables.forEach(table => {
        console.log(` - ${table.table_name}`);
      });
    } else {
      console.warn('No tables found in the database. Schema generation may have failed.');
    }

    // Add test data
    console.log('\nAdding test data...');

    try {
      // Check if test user already exists
      const testUserEmail = 'test@example.com';
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${testUserEmail}
      `;

      // Add test user if it doesn't exist
      if (existingUser.length === 0) {
        await db.insert(schema.UsersTable).values({
          firstName: 'Test',
          lastName: 'User',
          email: testUserEmail,
          passHash: 'test_hash',
          isVerified: true,
          isOnboarded: true,
        });
        console.log('Test user created successfully');
      } else {
        console.log('Test user already exists');
      }

      // Verify user was created
      const users = await sql`SELECT * FROM users`;
      console.log(`Number of users in database: ${users.length}`);
    } catch (error: any) {
      console.error('Error adding test data:', error.message);
    }

    console.log('\nDatabase setup complete!');

    // Close the client
    await sql.end();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
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
