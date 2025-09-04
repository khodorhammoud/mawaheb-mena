import { test, expect } from '@playwright/test';

test.describe('Employer login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => fetch('auth/logout', { method: 'POST' }).catch(() => {}));
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => fetch('auth/logout', { method: 'POST' }).catch(() => {}));
  });

  test('logs in employer, sees jobs, logs out and is redirected', async ({ page }) => {
    // Go to login page
    await page.goto('/login-employer');

    // Fill and submit form
    await page.getByLabel('Email Address').fill('employer2@example.com');
    await page.getByLabel('Password').fill('123');
    const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
    await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();

    // Expect to land on dashboard
    await expect(page).toHaveURL(/\/dashboard|\/manage-jobs/);

    // Navigate to Manage Jobs via sidebar link text
    await page.getByRole('link', { name: /Manage Jobs/i }).click();
    await expect(page).toHaveURL(/\/manage-jobs/);

    // Verify a known seeded job is visible
    await expect(page.getByText(/Senior React Developer/i)).toBeVisible();

    // Logout via direct request to reduce UI flakiness
    await page.evaluate(() => fetch('auth/logout', { method: 'POST' }));

    // After logout, trying to access manage-jobs should redirect to login
    await page.goto('/manage-jobs');
    await expect(page).toHaveURL(/\/login|\/login-employer/);
  });
});
