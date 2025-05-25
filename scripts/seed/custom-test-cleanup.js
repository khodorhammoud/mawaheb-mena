#!/usr/bin/env node

/**
 * Custom Test Database Cleanup Script
 *
 * This script is responsible for cleaning up the test data created by custom-test-seed.js.
 * It's executed by the test's afterEach hook to ensure the database is returned to a clean state.
 *
 * Benefits of separate cleanup:
 * - Ensures test isolation - one test doesn't affect others
 * - Prevents database bloat during testing
 * - Makes tests more reliable and repeatable
 */

const { config } = require('dotenv');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

// Get current directory
const currentDir = __dirname;
const projectRoot = path.resolve(currentDir, '../../');

// Load environment variables from the test env file
const envPath = path.resolve(projectRoot, 'apps/frontend/.env.test');
config({ path: envPath });

async function cleanupCustomTestData() {
  console.log('Running custom test data cleanup...');

  // Get database connection info from env
  const dbHost = process.env.TEST_DB_HOST || 'localhost';
  const dbPort = process.env.TEST_DB_PORT || '5433';
  const dbName = process.env.TEST_DB_NAME || 'mawaheb_test_db';
  const dbUser = process.env.TEST_DB_USER || 'testuser';
  const dbPassword = process.env.TEST_DB_PASSWORD || 'testpassword';

  // Get test-specific values passed from the test
  const testUserId = process.env.TEST_SPECIFIC_USER_ID;

  if (!testUserId) {
    console.warn('No TEST_SPECIFIC_USER_ID provided, using default value');
  }

  const userId = testUserId || 'default-test-user';
  console.log(`Using test user ID for cleanup: ${userId}`);

  // Create database connection
  const pool = new Pool({
    host: dbHost,
    port: parseInt(dbPort),
    database: dbName,
    user: dbUser,
    password: dbPassword,
  });

  try {
    // Start a transaction to ensure all cleanup happens atomically
    await pool.query('BEGIN');

    // Delete in reverse order of creation (respecting foreign key constraints)

    // 1. Delete job application
    console.log('Removing test job application...');
    await pool.query('DELETE FROM job_applications WHERE id = $1', [`application-${userId}`]);

    // 2. Delete freelancer skills
    console.log('Removing test freelancer skills...');
    await pool.query('DELETE FROM freelancer_skills WHERE freelancer_id = $1', [
      `freelancer-${userId}`,
    ]);

    // 3. Delete test freelancer profile
    console.log('Removing test freelancer profile...');
    await pool.query('DELETE FROM freelancers WHERE id = $1', [`freelancer-${userId}`]);

    // 4. Delete test account
    console.log('Removing test account...');
    await pool.query('DELETE FROM accounts WHERE id = $1', [`account-${userId}`]);

    // 5. Delete test user
    console.log('Removing test user...');
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Optional: If this is a dedicated test database that will be reset between test runs anyway,
    // you might decide to keep the shared test data (job, employer, skills) for other tests

    // Commit all changes
    await pool.query('COMMIT');
    console.log('Custom test data cleanup completed successfully');
  } catch (error) {
    // Rollback on any error
    await pool.query('ROLLBACK');
    console.error('Error cleaning up custom test data:', error);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupCustomTestData()
    .then(() => {
      console.log('Custom test data cleanup completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Custom test data cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanupCustomTestData;
