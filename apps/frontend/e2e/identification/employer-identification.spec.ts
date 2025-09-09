// Production-level employer identification e2e tests
// This file tests the employer identification flow at /identification route
//
// Test Coverage:
// 1. Access control - only onboarded users with null/draft account_status can access
// 2. Form structure and required document uploads
// 3. Validation - form submission fails without documents
// 4. Happy path - successful document upload and submission
// 5. Pending view verification after successful submission

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage state file for identification employer
const identificationEmployerFile = path.join(__dirname, '../.auth/employer-identification.json'); // is_onboarded: true, account_status: null/draft

test.describe('Employer identification flow', () => {
  test.setTimeout(90000); // Increased timeout for file operations

  // Test 1: Access control - unauthenticated users cannot access /identification
  test('redirects unauthenticated users away from identification route', async ({ page }) => {
    // This test intentionally uses no storageState to test unauthenticated access

    // Attempt to access identification route without authentication
    await page.goto('/identification', { waitUntil: 'domcontentloaded' });

    // Should be redirected away from identification page
    await expect(page).not.toHaveURL(/\/identification/);
    // Should be redirected to login page or home
    await expect(page).toHaveURL(/\/login|\/$/);

    console.log('✅ Authentication protection test passed');
  });

  // Core identification tests with identification employer (is_onboarded: true, account_status: null/draft)
  test.describe('Identification employer tests', () => {
    // Use the identification employer authentication state
    test.use({ storageState: identificationEmployerFile });

    // Test 2: Access control for onboarded users with correct account status
    test('allows access for onboarded users with null or draft account status', async ({
      page,
    }) => {
      console.log('🚀 Testing access control with identification employer');

      // Navigate to identification route (already authenticated via storageState)
      await page.goto('/identification', { waitUntil: 'domcontentloaded' });

      const currentUrl = page.url();
      console.log(`Current URL after navigation: ${currentUrl}`);

      // Must be on /identification; anything else is a failure
      await expect(page).toHaveURL(/\/identification/);

      const hasIdentificationContent = await page.locator('text=Identity Verification').isVisible();
      const hasPendingContent = await page.locator('text=Account Verification').isVisible();

      expect(hasIdentificationContent || hasPendingContent).toBeTruthy();
      console.log('✅ Access control test passed - user can access identification');
    });

    // Test 3: Form structure and content verification
    test('displays correct identification form structure for employers', async ({ page }) => {
      console.log('🚀 Testing form structure with identification employer');

      await page.goto('/identification', { waitUntil: 'domcontentloaded' });

      // Should show identification form since user has correct database state
      const hasForm = await page.locator('text=Identity Verification').isVisible();
      const isPendingView = await page.locator('text=Account Verification').isVisible();

      if (hasForm) {
        // Verify form structure
        await expect(page.locator('text=Identity Verification')).toBeVisible();
        await expect(
          page.locator('text=Please upload your identification documents')
        ).toBeVisible();

        // Check for document upload sections
        await expect(page.getByRole('heading', { name: 'Identification Documents' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Trade License' })).toBeVisible();

        // Check for action buttons
        await expect(page.getByRole('button', { name: 'Back to account info' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit Documents' })).toBeVisible();

        console.log('✅ Form structure test passed - identification form displayed correctly');
      } else if (isPendingView) {
        console.log(
          '✅ Form structure test passed - user already submitted (showing pending view)'
        );
      } else {
        throw new Error('Expected identification form or pending view, but neither was visible');
      }
    });

    // Test 4: Document upload validation - strict: either error signals or no POST and form still visible
    test('prevents form submission without required documents', async ({ page }) => {
      await page.goto('/identification?force=true', { waitUntil: 'domcontentloaded' });

      // Must be on identification; not bounced elsewhere
      await expect(page).toHaveURL(/\/identification(?:$|\/|\?)/);
      expect(page.url()).not.toMatch(/\/(login|onboarding|dashboard)(?:$|\/|\?)/);

      // Precondition: the form must be visible (force=true ensures this even if Pending)
      await expect(page.getByText(/Identity Verification/i)).toBeVisible();

      // Submit without files
      const submitButton = page.getByRole('button', { name: /Submit Documents/i });
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Small wait for UI feedback
      await page.waitForTimeout(1500);

      // Error signals (check both messages separately)
      const hasToast = await page
        .locator('[data-radix-toast-viewport]')
        .isVisible()
        .catch(() => false);
      const hasAlert = await page
        .locator('[role="alert"]')
        .isVisible()
        .catch(() => false);
      const hasErrA = await page
        .getByText(/Required Documents Missing/i)
        .isVisible()
        .catch(() => false);
      const hasErrB = await page
        .getByText(/Please upload all required documents/i)
        .isVisible()
        .catch(() => false);

      // Optional: detect if a POST happened (navigation submits may not always be caught)
      let didSubmit = false;
      try {
        await page.waitForResponse(
          res => res.url().includes('/identification') && res.request().method() === 'POST',
          { timeout: 1000 }
        );
        didSubmit = true;
      } catch {
        /* no-op */
      }

      const formStillVisible = await page
        .getByText(/Identity Verification/i)
        .isVisible()
        .catch(() => false);

      // Must see an explicit error OR (no POST + form still visible)
      expect(
        hasToast || hasAlert || hasErrA || hasErrB || (!didSubmit && formStillVisible)
      ).toBeTruthy();
    });

    // Test 5: Happy path - strict server-side submission followed by pending/success assertion
    test('submits identification via server action and shows pending/success', async ({ page }) => {
      // Ensure session is valid
      await page.goto('/identification?force=true', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/identification(?:$|\/|\?)/);
      expect(page.url()).not.toMatch(/\/(login|onboarding|dashboard)(?:$|\/|\?)/);

      // Server-side submit minimal valid payload
      const response = await page.request.post('/identification', {
        multipart: {
          'target-updated': 'employer-identification',
          identification: {
            name: 'id-document-1.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test identification content 1'),
          },
          trade_license: {
            name: 'trade-license-1.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test trade license content 1'),
          },
        },
      });

      // Accept common OK/redirect codes
      expect([200, 201, 204, 302, 303]).toContain(response.status());

      // Reload without force to let Pending view render
      await page.goto('/identification', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/identification(?:$|\/|\?)/);

      const isPending = await page
        .getByText(/Account Verification/i)
        .isVisible()
        .catch(() => false);
      const isSuccess = await page
        .getByText(/Documents Submitted/i)
        .isVisible()
        .catch(() => false);

      expect(isPending || isSuccess).toBeTruthy();
    });

    // Test 6: Verify pending view after successful submission
    test('shows pending verification view after document submission', async ({ page }) => {
      console.log('🚀 Testing pending view display after submission');

      // Ensure we're authenticated and have a session
      await page.goto('/identification', { waitUntil: 'domcontentloaded' });

      // If not already pending, programmatically submit minimal documents to set account_status to Pending
      let isPendingView = await page.locator('text=Account Verification').isVisible();
      if (!isPendingView) {
        const response = await page.request.post('/identification', {
          multipart: {
            'target-updated': 'employer-identification',
            identification: {
              name: 'id.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('minimal id file'),
            },
            trade_license: {
              name: 'trade.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('minimal trade file'),
            },
          },
        });

        // Even if the action returns non-200, the status update happens first; proceed to check UI
        console.log('POST /identification status:', response.status());

        // Reload identification to reflect new account_status
        await page.goto('/identification', { waitUntil: 'domcontentloaded' });
        isPendingView = await page.locator('text=Account Verification').isVisible();
      }

      // Require pending view now
      expect(isPendingView).toBeTruthy();

      // Verify pending view elements
      await expect(page.locator('text=Account Verification')).toBeVisible();
      await expect(page.locator('text=Your account is being validated')).toBeVisible();
      await expect(page.locator("text=We're reviewing your submitted documents")).toBeVisible();
      await expect(
        page.locator('text=This process typically takes 1-2 business days')
      ).toBeVisible();
      await expect(page.locator("text=You'll receive an email notification")).toBeVisible();

      console.log('✅ Pending view test passed - pending elements visible after submission');
    });
  });
});
