// Production-level employer onboarding e2e tests using pure storageState
// This file tests the employer onboarding flow at /onboarding route
//
// Test Coverage:
// 1. Authentication protection - unauthenticated users cannot access /onboarding
// 2. Employer-specific content visibility and form interaction
// 3. Partial form submission capability (not all fields required)
// 4. Complete happy path: data entry -> submission -> redirect to /identification
// 5. Logout functionality and proper redirection behavior
// 6. Form validation with minimal data

import { test, expect } from '@playwright/test';
import { createAuthenticatedEmployer, logoutUser } from '../utils/auth-helpers';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage state file
const employerAuthFile = path.join(__dirname, '../.auth/employer.json');
const employerOnboardingAuthFile = path.join(__dirname, '../.auth/employer-onboarding.json');

test.describe('Employer onboarding flow', () => {
  test.setTimeout(60000); // Reduced timeout since using storageState

  // Note: No beforeEach/afterEach cookie clearing for storageState tests
  // StorageState handles authentication persistence automatically

  // Test 1: Authentication protection - unauthenticated users cannot access /onboarding
  test('redirects unauthenticated users away from onboarding route', async ({ page }) => {
    // This test intentionally uses no storageState to test unauthenticated access

    // Attempt to access onboarding route without authentication
    await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });

    // Should be redirected to login page (not onboarding)
    await expect(page).not.toHaveURL(/\/onboarding/);
    // Should be redirected to some form of login or home page
    await expect(page).toHaveURL(/\/login|\/$/);

    console.log('✅ Authentication protection test passed');
  });

  // All other tests use storageState for consistent authentication
  test.describe('Authenticated employer tests', () => {
    // Storage state will be specified per nested describe to avoid cross-test leakage

    test.describe('Authenticated content visibility (storageState)', () => {
      test.use({ storageState: employerOnboardingAuthFile });

      test.beforeEach(async ({ page }) => {
        await page.request.post('/identification', {
          form: { 'target-updated': 'back-to-account-info' },
        });
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
      });

      // Test 2: Employer sees correct onboarding content when authenticated
      test('authenticated employer sees comprehensive onboarding form content', async ({
        page,
      }) => {
        // Must be on /onboarding; explicitly forbid other routes
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
        expect(page.url()).not.toMatch(/\/(login|identification|dashboard)(?:$|[\/?#])/);

        // Employer-specific content
        await expect(page.getByText(/Add Title/i)).toBeVisible();
        await expect(page.getByText(/Years in Business/i).first()).toBeVisible();
        await expect(page.getByText(/Average Project Budget/i).first()).toBeVisible();
        await expect(page.locator('.grid').getByText(/About/i).first()).toBeVisible();
        await expect(page.getByText(/Add Years in Business/i)).toBeVisible();
        await expect(page.getByText(/Add Average Budget/i)).toBeVisible();
        await expect(page.getByText(/Add Bio/i)).toBeVisible();

        // Form + proceed
        const mainForm = page.locator('form[method="post"]');
        await expect(mainForm).toBeVisible();
        await expect(page.getByRole('button', { name: /Proceed/i })).toBeVisible();

        // Hidden control stays hidden
        await expect(
          page.locator('input[name="target-updated"][value="employer-onboard"]')
        ).toBeHidden();

        console.log(
          '✅ Onboarding content test passed (strict): on /onboarding with all expected fields visible'
        );
      });
    });

    test.describe('NO data submission (storageState)', () => {
      test.use({ storageState: employerOnboardingAuthFile });

      test.beforeEach(async ({ page }) => {
        await page.request.post('/identification', {
          form: { 'target-updated': 'back-to-account-info' },
        });
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
      });

      // test 3: NO data submission in its own describe using onboarding storage state
      test('employer submits with NO data and redirects to /identification', async ({ page }) => {
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });

        // Must be on /onboarding; forbid other routes
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
        expect(page.url()).not.toMatch(/\/(login|identification|dashboard)(?:$|[\/?#])/);

        const proceedButton = page.getByRole('button', { name: /Proceed/i });
        await expect(proceedButton).toBeVisible();

        // Observe POST and redirect; do them in one Promise.all to avoid races
        const post = page.waitForResponse(
          r => r.url().includes('/onboarding') && r.request().method() === 'POST'
        );
        const nav = page.waitForURL(/\/identification(?:$|[\/?#])/, { timeout: 15000 });

        await Promise.all([post, nav, proceedButton.click()]);

        // Validate POST status and final URL
        const submitResponse = await post;
        expect([200, 201, 204, 302, 303]).toContain(submitResponse.status());
        await expect(page).toHaveURL(/\/identification(?:$|[\/?#])/);

        console.log('✅ Onboarding submission (NO data) → /identification');
      });
    });

    test.describe('PARTIAL data submission (storageState)', () => {
      test.use({ storageState: employerOnboardingAuthFile });

      test.beforeEach(async ({ page }) => {
        await page.request.post('/identification', {
          form: { 'target-updated': 'back-to-account-info' },
        });
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
      });

      // Test 4: PARTIAL data submission in its own describe using onboarding storage state
      test('employer submits with PARTIAL data and redirects to /identification', async ({
        page,
      }) => {
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });

        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
        expect(page.url()).not.toMatch(/\/(login|identification|dashboard)(?:$|[\/?#])/);

        // Fill minimal field (About/Bio or first textarea fallback)
        const about = (await page
          .getByLabel(/About|Bio/i)
          .first()
          .count())
          ? page.getByLabel(/About|Bio/i).first()
          : page.locator('textarea').first();
        if (await about.count()) await about.fill('We build amazing projects.');

        const proceed = page.getByRole('button', { name: /Proceed/i });
        await expect(proceed).toBeVisible();

        const post = page.waitForResponse(
          r => r.url().includes('/onboarding') && r.request().method() === 'POST'
        );
        const nav = page.waitForURL(/\/identification(?:$|[\/?#])/, { timeout: 15000 });
        await Promise.all([post, nav, proceed.click()]);

        const postResponse = await post;
        expect([200, 201, 204, 302, 303]).toContain(postResponse.status());
        await expect(page).toHaveURL(/\/identification(?:$|[\/?#])/);

        console.log('✅ Onboarding submission (PARTIAL) → /identification');
      });
    });

    test.describe('Happy path with draft employer', () => {
      // Reuse the same onboarding employer; reset server-side state first
      test.use({ storageState: employerOnboardingAuthFile });

      test.beforeEach(async ({ page }) => {
        await page.request.post('/identification', {
          form: { 'target-updated': 'back-to-account-info' },
        });
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
      });

      // Test 5: Complete happy path - submit form and redirect to /identification
      test('complete onboarding flow redirects to identification page', async ({ page }) => {
        console.log('🚀 Using storageState authentication - employer');

        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });

        // If on onboarding page, complete the flow
        const proceedButton = page.getByRole('button', { name: 'Proceed' });
        await expect(proceedButton).toBeVisible();

        console.log('Submitting onboarding form and expecting redirect to /identification...');

        // Capture submit request and then await redirect to /identification
        const submitResponsePromise = page.waitForResponse(
          res => res.url().includes('/onboarding') && res.request().method() === 'POST'
        );
        const navigationPromise = page.waitForURL(/\/identification/, { timeout: 15000 });

        await proceedButton.click();

        const submitResponse = await submitResponsePromise;
        const status = submitResponse.status();
        expect([200, 201, 204, 302, 303].includes(status)).toBeTruthy();

        await navigationPromise;

        // Verify successful redirect to identification page (happy ending)
        await expect(page).toHaveURL(/\/identification/);
        console.log('✅ Happy path test completed - successfully redirected to /identification');
      });
    });

    test.describe('Logout flow (seeded employer storage)', () => {
      test.use({ storageState: employerAuthFile });

      // Test 6: Logout functionality works and redirects properly
      test('logout functionality works and redirects to appropriate page', async ({ page }) => {
        console.log('🚀 Using storageState authentication - employer');

        // Start from any authenticated page
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

        // If redirected to login, user is not authenticated
        if (page.url().includes('/login')) {
          throw new Error('StorageState authentication failed - user not logged in');
        }

        console.log('Verified user is authenticated via storageState');

        // Test logout functionality
        console.log('Testing logout functionality...');
        await logoutUser(page);

        // Wait for logout to complete
        await page.waitForTimeout(2000);

        // Try to access onboarding again - should be redirected away
        console.log('Attempting to access /onboarding after logout...');
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });

        // Should NOT be on onboarding page anymore
        await expect(page).not.toHaveURL(/\/onboarding/);

        // Should be redirected to login page or home
        const finalUrl = page.url();
        const isOnLoginOrHome =
          finalUrl.includes('/login') || finalUrl === '/' || finalUrl.endsWith('/');
        expect(isOnLoginOrHome).toBeTruthy();

        console.log(`✅ Logout test passed - redirected to: ${finalUrl}`);
      });
    });

    test.describe('Form validation minimal data (storageState)', () => {
      test.use({ storageState: employerOnboardingAuthFile });

      test.beforeEach(async ({ page }) => {
        await page.request.post('/identification', {
          form: { 'target-updated': 'back-to-account-info' },
        });
        await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/onboarding(?:$|[\/?#])/);
      });

      // Test 7: Form validation test - ensure employer can submit with minimal data
      test('form accepts submission with minimal or no data filled', async ({ page }) => {
        console.log('🚀 Using storageState authentication - employer');

        // If on onboarding page, test form submission
        const proceedButton = page.getByRole('button', { name: 'Proceed' });
        await expect(proceedButton).toBeVisible();

        console.log('Testing form submission with no additional data...');
        await proceedButton.click();

        // Should proceed successfully even with no additional data
        await page.waitForTimeout(3000);

        // Verify no validation errors appear (key requirement)
        const validationErrors = page.locator('.error, [role=\"alert\"], .text-red-500');
        const errorCount = await validationErrors.count();
        expect(errorCount).toBe(0);

        console.log('✅ Form validation test passed - no errors with minimal data submission');
      });
    });
  });
});
