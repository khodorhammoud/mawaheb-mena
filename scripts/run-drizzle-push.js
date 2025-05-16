#!/usr/bin/env node

import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../');

// Load environment variables from the test env file
const envPath = path.resolve(currentDir, '../apps/frontend/.env.test');
config({ path: envPath });

try {
  console.log('Running drizzle-kit push from frontend directory...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in test environment');
  }

  console.log('Using connection string:', connectionString);

  // Change to the frontend directory
  const frontendDir = path.resolve(projectRoot, 'apps/frontend');
  process.chdir(frontendDir);

  // Run drizzle-kit push with the test config
  const cmd = `npx drizzle-kit push --config=drizzle.test.config.ts --verbose`;
  console.log(`Executing: ${cmd}`);

  execSync(cmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
    },
  });

  console.log('Schema pushed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error running drizzle-kit push:', error);
  process.exit(1);
}
