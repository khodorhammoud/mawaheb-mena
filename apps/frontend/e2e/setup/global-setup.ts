import { execSync } from 'child_process';
import * as path from 'path';
import { FullConfig } from '@playwright/test';
import { fileURLToPath } from 'url';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../../../');

/**
 * This global setup file runs before all tests and is responsible for:
 * 1. Starting the test database Docker container
 * 2. Setting up the database schema and seed data
 * 3. Setting up the CMS database with necessary structure
 * 4. Seeding the CMS database with data from the dump file
 */
async function globalSetup(config: FullConfig) {
  console.log('Starting global setup for tests...');

  try {
    // Start the test database with Docker
    console.log('Starting test database container...');
    execSync('pnpm db:test:up', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Give the database a moment to fully initialize
    console.log('Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run the database setup script
    console.log('Setting up test database...');
    execSync('pnpm db:test:setup', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Setup CMS database structure
    console.log('Setting up CMS test database...');
    execSync('pnpm db:test:cms:setup', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Seed CMS database with data from dump file
    console.log('Seeding CMS test database from dump file...');
    execSync('pnpm db:test:cms:seed', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  }
}

export default globalSetup;
