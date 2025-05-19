#!/usr/bin/env node

/**
 * Custom Test Database Seeding Script
 *
 * This script demonstrates how to create a dedicated seeding script for a specific test.
 * It's executed by the test's beforeEach hook to set up the exact database state needed.
 *
 * Benefits of this approach:
 * - Keep complex database seeding logic separate from test files
 * - Reuse the same seeding logic across multiple tests
 * - Make tests more readable by focusing on assertions, not setup
 */

try {
  console.log('Loading dependencies...');
  const { exec } = require('child_process');
  const dotenv = require('dotenv');
  const path = require('path');
  const { Pool } = require('pg');
  const fs = require('fs');
  console.log('Dependencies loaded successfully');

  // Get current directory
  const currentDir = __dirname;
  const projectRoot = path.resolve(currentDir, '../../');
  console.log('Project root:', projectRoot);

  // Load environment variables from the test env file
  const envPath = path.resolve(projectRoot, 'apps/frontend/.env.test');
  console.log('Loading env from:', envPath);
  dotenv.config({ path: envPath });

  async function seedCustomTestData() {
    console.log('Running custom test data seeding...');

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

    // Use a numeric ID as default and parse the testUserId if provided
    const userId = testUserId ? parseInt(testUserId, 10) : 99999;
    console.log(`Using test user ID: ${userId} (type: ${typeof userId})`);

    // Ensure userId is a valid number
    if (isNaN(userId)) {
      throw new Error(`Invalid user ID: ${testUserId}. Must be convertible to a number.`);
    }

    // Create database connection
    const pool = new Pool({
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      user: dbUser,
      password: dbPassword,
    });

    try {
      // Start a transaction to ensure all changes are applied atomically
      await pool.query('BEGIN');

      // 1. Insert or update a test user
      console.log(`Setting up test user with ID: ${userId}`);
      await pool.query(
        `
        INSERT INTO users (
          id, first_name, last_name, email, pass_hash, is_verified, provider, role
        ) VALUES (
          $1, 'Custom', 'TestUser', 'custom-test@example.com', 'testhash', true, 'credentials', 'user'
        )
      `,
        [userId]
      );

      // 2. Create an account for this user
      console.log('Setting up test account');
      await pool.query(
        `
        INSERT INTO accounts (
          id, user_id, account_type, account_status
        ) VALUES (
          $1, $2, 'freelancer', 'published'
        )
    `,
        [userId + 1000, userId]
      );

      // 3. Create a freelancer profile
      console.log('Setting up freelancer profile');
      await pool.query(
        `
        INSERT INTO freelancers (
          id, account_id, about, years_of_experience
        ) VALUES (
          $1, $2, 'Custom test user description for testing', 3
        )
      `,
        [userId + 2000, userId + 1000]
      );

      // 4. Add some skills to the freelancer
      console.log('Adding skills to freelancer');

      // First, ensure we have test skills
      const skillResult = await pool.query(`
        INSERT INTO skills (id, label)
        VALUES 
          (1001, 'JavaScript'),
          (1002, 'React'),
          (1003, 'Node.js')
        RETURNING id
      `);

      const skillIds = skillResult.rows.map(row => row.id);

      // Then associate skills with the freelancer
      for (const skillId of skillIds) {
        await pool.query(
          `
          INSERT INTO freelancer_skills (
            freelancer_id, skill_id, years_of_experience
          ) VALUES (
            $1, $2, 3
          )
        `,
          [userId + 2000, skillId]
        );
      }

      // 5. Add a job posting and application for testing
      console.log('Setting up test job and application');

      // Create a test employer account
      await pool.query(`
        INSERT INTO accounts (
          id, user_id, account_type, account_status
        ) VALUES (
          500000, 500001, 'employer', 'published'
        )
      `);

      // Create an employer profile
      await pool.query(`
        INSERT INTO employers (
          id, account_id, company_name
        ) VALUES (
          500002, 500000, 'Test Company'
        )
      `);

      // Create a job category if needed
      await pool.query(`
        INSERT INTO job_categories (
          id, name
        ) VALUES (
          1004, 'Software Development'
        )
      `);

      // Create a job posting
      await pool.query(`
        INSERT INTO jobs (
          id, employer_id, job_category_id, title, description
        ) VALUES (
          1005, 500002, 1004, 'Test Developer Position', 
          'This is a test job description'
        )
      `);

      // Create a job application
      await pool.query(
        `
        INSERT INTO job_applications (
          id, job_id, freelancer_id, application_status
        ) VALUES (
          $1, 1005, $2, 'approved'
        )
          `,
        [userId + 3000, userId + 2000]
      );

      // Commit all changes
      await pool.query('COMMIT');
      console.log('Custom test data setup completed successfully');
    } catch (error) {
      // Rollback on any error
      await pool.query('ROLLBACK');
      console.error('Error setting up custom test data:', error);
      throw error;
    } finally {
      // Close the database connection
      await pool.end();
    }
  }

  // Run the seeding if this file is executed directly
  if (require.main === module) {
    seedCustomTestData()
      .then(() => {
        console.log('Custom test data seeding completed successfully.');
        process.exit(0);
      })
      .catch(error => {
        console.error('Custom test data seeding failed:', error);
        process.exit(1);
      });
  }

  module.exports = seedCustomTestData;
} catch (error) {
  console.error('Error loading dependencies:', error);
  process.exit(1);
}
