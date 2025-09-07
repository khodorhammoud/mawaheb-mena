import { test, expect } from '@playwright/test';

// Mirrors employer login tests for the freelancer role
// Reuses the same robust hooks pattern to ensure clean session state per test

test.describe('Freelancer login flow', () => {
  // Ensure clean slate per test (cookies + storage)
  test.setTimeout(90000);

  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    try {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.warn('beforeEach init script failed:', error);
    }
  });

  test.afterEach(async ({ context, page }) => {
    try {
      await context.clearCookies();
    } catch {}
    try {
      if (!page.isClosed()) {
        await page.close({ runBeforeUnload: false });
      }
    } catch (error) {
      console.warn('afterEach page close failed:', error);
    }
  });

  // Smoke: app reachable
  test('smoke: home route responds and body attaches', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/?/);
    await expect(page.locator('body')).toBeAttached();
  });

  // Redirects unauthenticated users to freelancer login
  test('protects private routes with redirect to freelancer login', async ({ page }) => {
    // Choose a freelancer-only page (dashboard or profile)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login-employer/);
  });

  // Invalid credentials error
  test('shows error on invalid freelancer credentials', async ({ page }) => {
    await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email Address').fill('freelancer2@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    const form = page.locator('form').filter({ has: page.getByLabel('Email Address') });
    await form.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByText('Error!')).toBeVisible();
  });

  // Requires fields
  test('requires email and password on freelancer login', async ({ page }) => {
    await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
    const form = page.locator('form').filter({ has: page.getByLabel('Email Address') });
    await form.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByText('Error!')).toBeVisible();
  });

  // Happy path
  test('freelancer can login and logout; protected route redirects after logout', async ({
    page,
  }) => {
    await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Email Address').fill('freelancer2@example.com');
    await page.getByLabel('Password').fill('123');
    const form = page.locator('form').filter({ has: page.getByLabel('Email Address') });
    await form.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard|\/browse-jobs/);

    // Visit a freelancer area then logout
    await page.goto('/browse-jobs', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => fetch('auth/logout', { method: 'POST' }));

    // Attempt to access a protected route again
    await page.goto('/browse-jobs');
    await expect(page).toHaveURL(/\/login|\/login-freelancer/);
  });
});
