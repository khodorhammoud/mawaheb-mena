#!/usr/bin/env node

import { exec } from 'child_process';
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

async function setupTestCmsDb() {
  console.log('Setting up test CMS database...');

  // Get CMS database connection info from env
  const cmsDbHost = process.env.CMS_DB_HOST || 'localhost';
  const cmsDbPort = process.env.CMS_DB_PORT || '5434';
  const cmsDbName = process.env.CMS_DB_NAME || 'mawaheb_test_cms';
  const cmsDbUser = process.env.CMS_DB_USER || 'testuser';
  const cmsDbPassword = process.env.CMS_DB_PASSWORD || 'testpassword';

  // Path to the dump file (optional for this script)
  const dumpFilePath = path.resolve(projectRoot, 'scripts/seed/cms/mawaheb-cms.dump');

  console.log(`CMS DB connection: ${cmsDbUser}@${cmsDbHost}:${cmsDbPort}/${cmsDbName}`);

  // Fix for Windows: use environment object instead of PGPASSWORD prefix
  const env = {
    ...process.env,
    PGPASSWORD: cmsDbPassword,
  };

  try {
    // First, check if database exists and create it if needed
    await new Promise((resolve, reject) => {
      // Connect to postgres database to check if our database exists
      const checkCommand = `psql -h ${cmsDbHost} -p ${cmsDbPort} -U ${cmsDbUser} -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '${cmsDbName}';"`;
      console.log('Checking if CMS database exists...');

      exec(checkCommand, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error checking database existence:', stderr);
          reject(error);
          return;
        }

        // If database doesn't exist (no rows returned), create it
        if (!stdout.includes('(1 row)')) {
          console.log(`Database '${cmsDbName}' does not exist, creating it...`);
          const createDbCommand = `psql -h ${cmsDbHost} -p ${cmsDbPort} -U ${cmsDbUser} -d postgres -c "CREATE DATABASE ${cmsDbName} WITH OWNER = ${cmsDbUser};"`;

          exec(createDbCommand, { env }, (dbError, dbStdout, dbStderr) => {
            if (dbError) {
              console.error('Error creating database:', dbStderr);
              reject(dbError);
              return;
            }
            console.log(`Database '${cmsDbName}' created successfully.`);
            resolve();
          });
        } else {
          console.log(`Database '${cmsDbName}' already exists.`);
          resolve();
        }
      });
    });

    // Drop and recreate schema
    await new Promise((resolve, reject) => {
      const dropCommand = `psql -h ${cmsDbHost} -p ${cmsDbPort} -U ${cmsDbUser} -d ${cmsDbName} -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"`;
      console.log('Resetting schema...');

      exec(dropCommand, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error resetting schema:', stderr);
          reject(error);
          return;
        }
        console.log('Schema reset successfully.');
        resolve();
      });
    });

    console.log('CMS database setup complete! (schema only, no data)');
  } catch (error) {
    console.error('Error setting up CMS database:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupTestCmsDb()
    .then(() => {
      console.log('Test CMS database setup completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test CMS database setup failed:', error);
      process.exit(1);
    });
}

export default setupTestCmsDb;
