//
// In the test here, i went to the code apps\frontend\app\servers\emails\emailSender.server.ts, and i added a code to not run Brevo
//
// Brevo is an ecxternal email service.
// Normally, it sends real emails and we need that for production level, but for testing, no need to:
// - Make real network calls to Brevo (slow, flaky, might hit limits, or fail if offline)
// - Send real emails to fake/test accounts
//
// and Brevo was causing erros in the test, so i used the below code to skip Brevo (you can see it in the file path in the first line in the comment):
//   if (process.env.IS_E2E === "true") {
//     console.log("Skipping real email send in E2E!");
//     return;
//   }
//
// Now, when I run tests with the IS_E2E=true environment variable set, and how i make IS_E2E=true, is by instead of running the normal test command, we run another one:
// ❌ pnpm e2e e2e/auth/employer-signup.spec.ts
// ✅ $env:IS_E2E="true"; pnpm e2e e2e/auth/employer-signup.spec.ts
//
// Below is why Brevo got us errors in the testing:
// When your e2e test runs, it goes through your real signup flow, which includes the backend trying to send a verification email.
// Since Brevo has not activated your account for sending, any call to send an email will get a 403 Forbidden error (which you saw).
//.

import { test, expect } from '@playwright/test';
import { generateEmployer } from '../utils/test-data';

test.describe('Employer signup flow', () => {
  test('signs-up a brand-new employer', async ({ page }) => {
    const { email, password } = generateEmployer();

    // 1. open the page and wait for Remix hydration
    await page.goto('/signup-employer');
    await page.waitForLoadState('networkidle');

    // 2. fill the form
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'First Name' }).fill('John');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Doe');
    await page.getByLabel('Password').fill(password);
    await page.getByRole('checkbox', { name: /I accept the terms/i }).check();

    // 3. submit – unique locator thanks to `exact: true`
    await page.locator('form').getByRole('button', { name: 'Continue', exact: true }).click();

    // 4. success banner must appear
    await expect(page.getByText(/A verification email has been sent to you/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test('shows validation errors for empty signup form', async ({ page }) => {
    await page.goto('/signup-employer');

    await page.getByRole('checkbox', { name: /I accept the terms/i }).check();

    await page.locator('form').getByRole('button', { name: 'Continue', exact: true }).click();

    const form = page.locator('form');

    await expect(form.locator('#email').locator('p:has-text(/required/i)')).toBeVisible();
    await expect(form.locator('#firstName').locator('p:has-text(/required/i)')).toBeVisible();
    await expect(form.locator('#lastName').locator('p:has-text(/required/i)')).toBeVisible();
    await expect(form.locator('#password').locator('p:has-text(/required/i)')).toBeVisible();
  });

  // test('should show error for duplicate email', async ({ page }) => {
  //   const employer = generateEmployer();

  //   /* 1️⃣  first, create the user */
  //   await page.goto('/signup-employer');
  //   await page.getByLabel(/Email Address/i).fill(employer.email);
  //   await page.getByLabel(/First Name/i).fill('Test');
  //   await page.getByLabel(/Last Name/i).fill('User');
  //   await page.getByLabel(/Password/i).fill(employer.password);
  //   await page.getByLabel(/I accept the terms/i).check({ force: true });
  //   await page.locator('form').locator('button[type="submit"]').first().click();

  //   await expect(page.getByText(/A verification email has been sent/i)).toBeVisible({
  //     timeout: 260_000,
  //   });

  //   /* 2️⃣  try to sign up again with the SAME e‑mail */
  //   await page.goto('/signup-employer');
  //   await page.getByLabel(/Email Address/i).fill(employer.email);
  //   await page.getByLabel(/First Name/i).fill('Test');
  //   await page.getByLabel(/Last Name/i).fill('User');
  //   await page.getByLabel(/Password/i).fill(employer.password);
  //   await page.getByLabel(/I accept the terms/i).check({ force: true });
  //   await page.locator('form').locator('button[type="submit"]').first().click();

  //   await expect(page.locator('div.bg-red-100')).toHaveText(/already registered/i, {
  //     timeout: 260_000,
  //   });
  // });
});
