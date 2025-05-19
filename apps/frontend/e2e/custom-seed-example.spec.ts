import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;

/**
 * CUSTOM DATABASE SEEDING FOR SPECIFIC TESTS
 *
 * This example demonstrates how to set up custom database seeding for a specific test.
 * This approach allows you to:
 * 1. Seed the database with specific data needed for your test
 * 2. Clean up after the test is complete
 * 3. Ensure test isolation by having a consistent starting state
 *
 * Each test can have its own database setup and teardown sequence, creating
 * a reliable and predictable testing environment.
 */

// Helper to get the project root directory
const getProjectRoot = () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  // Navigate from /apps/frontend/e2e/ to project root
  return path.resolve(currentDir, '../../../');
};

/**
 * Custom fixture that manages database state for this specific test
 * This pattern allows us to:
 * - Set up the database before the test
 * - Clean up after the test is done
 * - Pass any needed data or connections to the test
 */
test.describe('Test with custom database seeding', () => {
  // Custom test data we'll use for this test
  const customTestData = {
    testUserId: 1000,
    firstName: 'Custom',
    lastName: 'TestUser',
    email: 'custom-test@example.com',
    // Add any other test data needed for this specific test
  };

  // Run before each test in this describe block
  test.beforeEach(async ({ page }) => {
    console.log('Setting up custom database seed for test...');
    const projectRoot = getProjectRoot();

    try {
      // Get connection details from environment variables (same as our setup scripts)
      const dbHost = process.env.TEST_DB_HOST || 'localhost';
      const dbPort = process.env.TEST_DB_PORT || '5433';
      const dbName = process.env.TEST_DB_NAME || 'mawaheb_test_db';
      const dbUser = process.env.TEST_DB_USER || 'testuser';
      const dbPassword = process.env.TEST_DB_PASSWORD || 'testpassword';

      // Option 1: Direct database connection to insert test data programmatically
      const pool = new Pool({
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        user: dbUser,
        password: dbPassword,
      });

      // Insert your custom test data
      console.log('Inserting custom test data...');

      // Example: Insert a custom user
      // Make sure this user doesn't cause conflicts with existing test data
      try {
        await pool.query(
          `
          INSERT INTO users (id, first_name, last_name, email, pass_hash, is_verified, provider, role) 
          VALUES ($1, $2, $3, $4, 'testhash', true, 'credentials', 'user')
          ON CONFLICT (id) DO UPDATE SET
            first_name = $2,
            last_name = $3,
            email = $4
        `,
          [
            customTestData.testUserId,
            customTestData.firstName,
            customTestData.lastName,
            customTestData.email,
          ]
        );

        console.log('Custom user data inserted successfully');

        // Close pool connection after use
        await pool.end();
      } catch (error) {
        console.error('Error inserting custom user data:', error);
        await pool.end();
        throw error;
      }

      // Option 2: Run a dedicated script for more complex setup
      // Useful for complex seeding that's better handled in a separate file
      const customSeedScriptPath = path.join(projectRoot, 'scripts/seed/custom-test-seed.cjs');

      // Check if the custom script exists
      if (fs.existsSync(customSeedScriptPath)) {
        console.log('Running custom seed script...');
        console.log('customSeedScriptPath', customSeedScriptPath);
        console.log('projectRoot', projectRoot);
        execSync(`node "${customSeedScriptPath}"`, {
          cwd: projectRoot,
          stdio: 'inherit',
          env: {
            ...process.env,
            // You can pass test-specific environment variables here
            TEST_SPECIFIC_USER_ID: String(customTestData.testUserId),
          },
        });
      }
    } catch (error) {
      console.error('Failed to set up test database:', error);
      throw error;
    }
  });

  // Optional: Clean up after each test
  test.afterEach(async ({ page }) => {
    console.log('Cleaning up custom test data...');

    try {
      // Option 1: Connect to DB and clean up test data
      const dbHost = process.env.TEST_DB_HOST || 'localhost';
      const dbPort = process.env.TEST_DB_PORT || '5433';
      const dbName = process.env.TEST_DB_NAME || 'mawaheb_test_db';
      const dbUser = process.env.TEST_DB_USER || 'testuser';
      const dbPassword = process.env.TEST_DB_PASSWORD || 'testpassword';

      const pool = new Pool({
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        user: dbUser,
        password: dbPassword,
      });

      // Delete the custom user we created
      await pool.query(`DELETE FROM users WHERE id = $1`, [customTestData.testUserId]);
      await pool.end(); // Close connection

      // Option 2: Run a dedicated cleanup script
      const projectRoot = getProjectRoot();
      const customCleanupScriptPath = path.join(
        projectRoot,
        'scripts/seed/custom-test-cleanup.cjs'
      );

      if (fs.existsSync(customCleanupScriptPath)) {
        console.log('Running custom cleanup script...');
        execSync(`node "${customCleanupScriptPath}"`, {
          cwd: projectRoot,
          stdio: 'inherit',
          env: {
            ...process.env,
            TEST_SPECIFIC_USER_ID: String(customTestData.testUserId),
          },
        });
      }
    } catch (error) {
      console.error('Failed to clean up test database:', error);
      // We don't throw here to avoid failing the test if cleanup fails
      // But we log it clearly for debugging
    }
  });

  // The actual test that uses our custom seeded data
  test('should show custom user profile data', async ({ page }) => {
    // Navigate to a page that would show our custom user's data
    // This depends on your application's routing
    await page.goto(`/users/${customTestData.testUserId}/profile`);

    // Now we can check that the page shows the custom user data we seeded
    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      `${customTestData.firstName} ${customTestData.lastName}`
    );

    await expect(page.locator('[data-testid="user-email"]')).toContainText(customTestData.email);

    // Add more assertions based on your specific test needs
  });

  // You can add more tests in this describe block that use the same database setup
  test('should allow editing custom user profile', async ({ page }) => {
    // These tests will also benefit from the same beforeEach and afterEach hooks
    await page.goto(`/users/${customTestData.testUserId}/edit`);

    // Test user editing functionality
    // ...
  });
});

/**
 * ALTERNATIVE APPROACH: Using test.use() for fixture customization
 *
 * Another approach is to create a custom fixture that manages the database state
 * This can be cleaner when you need to reuse the same setup across multiple test files
 */

// Example of a custom fixture (could be moved to a shared fixtures file)
type CustomDatabaseFixture = {
  testData: any;
  cleanupData: () => Promise<void>;
};

// Define the fixture
const customDatabaseTest = test.extend<{ customDb: CustomDatabaseFixture }>({
  customDb: async ({}, use) => {
    // Set up the database
    console.log('Setting up database from fixture...');

    // Setup code similar to beforeEach above
    const testData = { userId: 'fixture-user-id', name: 'Test Fixture User' };

    // Create the fixture object to pass to tests
    const fixture: CustomDatabaseFixture = {
      testData,
      cleanupData: async () => {
        console.log('Cleaning up fixture data...');
        // Cleanup code here
      },
    };

    // Use the fixture in the test
    await use(fixture);

    // After the test is done, clean up
    await fixture.cleanupData();
  },
});

// Using the custom fixture
customDatabaseTest('test with custom database fixture', async ({ page, customDb }) => {
  // Now we have access to customDb.testData in our test
  await page.goto(`/users/${customDb.testData.userId}`);

  // Rest of the test
});
