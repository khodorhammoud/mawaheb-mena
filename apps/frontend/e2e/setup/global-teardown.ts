import { execSync } from 'child_process';
import * as path from 'path';
import { FullConfig } from '@playwright/test';
import { fileURLToPath } from 'url';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../../../');

/**
 * This global teardown file runs after all tests and is responsible for:
 * 1. Tearing down the main test database
 * 2. Tearing down the CMS test database
 * 3. Stopping the Docker containers
 */
async function globalTeardown(config: FullConfig) {
  console.log('Starting global teardown for tests...');

  try {
    // Run the main database teardown script
    console.log('Tearing down test database...');
    execSync('pnpm db:test:teardown', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Run the CMS database teardown script
    console.log('Tearing down CMS test database...');
    execSync('pnpm db:test:cms:teardown', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Stop and remove the test database containers
    console.log('Stopping test database containers...');
    execSync('pnpm db:test:down', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Error during global teardown:', error);
    throw error;
  }
}

export default globalTeardown;
