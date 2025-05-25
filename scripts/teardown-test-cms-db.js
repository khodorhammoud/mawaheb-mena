#!/usr/bin/env node

import { exec } from 'child_process';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

async function teardownTestCmsDb() {
  console.log('Tearing down test CMS database...');

  // Get CMS database connection info from env
  const cmsDbHost = process.env.CMS_DB_HOST || 'localhost';
  const cmsDbPort = process.env.CMS_DB_PORT || '5434';
  const cmsDbName = process.env.CMS_DB_NAME || 'mawaheb_test_cms';
  const cmsDbUser = process.env.CMS_DB_USER || 'testuser';
  const cmsDbPassword = process.env.CMS_DB_PASSWORD || 'testpassword';

  // Fix for Windows: use environment object instead of PGPASSWORD prefix
  const env = {
    ...process.env,
    PGPASSWORD: cmsDbPassword,
  };

  try {
    // Drop all tables in the CMS database
    await new Promise((resolve, reject) => {
      const dropCommand = `psql -h ${cmsDbHost} -p ${cmsDbPort} -U ${cmsDbUser} -d ${cmsDbName} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"`;
      console.log('Dropping CMS database schema...');

      exec(dropCommand, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error dropping CMS schema:', stderr);
          reject(error);
          return;
        }
        console.log('CMS schema dropped successfully.');
        resolve();
      });
    });

    console.log('CMS database teardown complete!');
  } catch (error) {
    console.error('Error tearing down CMS database:', error);
    throw error;
  }
}

// Run the teardown if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  teardownTestCmsDb()
    .then(() => {
      console.log('Test CMS database teardown completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test CMS database teardown failed:', error);
      process.exit(1);
    });
}

export default teardownTestCmsDb;
