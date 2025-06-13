# Test info

- Name: Employer signup flow >> shows validation errors for empty signup form
- Location: C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:51:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/signup-employer
Call log:
  - navigating to "http://localhost:5173/signup-employer", waiting until "load"

    at C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:52:16
```

# Test source

```ts
   1 | //
   2 | // In the test here, i went to the code apps\frontend\app\servers\emails\emailSender.server.ts, and i added a code to not run Brevo
   3 | //
   4 | // Brevo is an ecxternal email service.
   5 | // Normally, it sends real emails and we need that for production level, but for testing, no need to:
   6 | // - Make real network calls to Brevo (slow, flaky, might hit limits, or fail if offline)
   7 | // - Send real emails to fake/test accounts
   8 | //
   9 | // and Brevo was causing erros in the test, so i used the below code to skip Brevo (you can see it in the file path in the first line in the comment):
  10 | //   if (process.env.IS_E2E === "true") {
  11 | //     console.log("Skipping real email send in E2E!");
  12 | //     return;
  13 | //   }
  14 | //
  15 | // Now, when I run tests with the IS_E2E=true environment variable set, and how i make IS_E2E=true, is by instead of running the normal test command, we run another one:
  16 | // ❌ pnpm e2e e2e/auth/employer-signup.spec.ts
  17 | // ✅ $env:IS_E2E="true"; pnpm e2e e2e/auth/employer-signup.spec.ts
  18 | //
  19 | // Below is why Brevo got us errors in the testing:
  20 | // When your e2e test runs, it goes through your real signup flow, which includes the backend trying to send a verification email.
  21 | // Since Brevo has not activated your account for sending, any call to send an email will get a 403 Forbidden error (which you saw).
  22 | //.
  23 |
  24 | import { test, expect } from '@playwright/test';
  25 | import { generateEmployer } from '../utils/test-data';
  26 |
  27 | test.describe('Employer signup flow', () => {
  28 |   test('signs-up a brand-new employer', async ({ page }) => {
  29 |     const { email, password } = generateEmployer();
  30 |
  31 |     // 1. open the page and wait for Remix hydration
  32 |     await page.goto('/signup-employer');
  33 |     await page.waitForLoadState('networkidle');
  34 |
  35 |     // 2. fill the form
  36 |     await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
  37 |     await page.getByRole('textbox', { name: 'First Name' }).fill('John');
  38 |     await page.getByRole('textbox', { name: 'Last Name' }).fill('Doe');
  39 |     await page.getByLabel('Password').fill(password);
  40 |     await page.getByRole('checkbox', { name: /I accept the terms/i }).check();
  41 |
  42 |     // 3. submit – unique locator thanks to `exact: true`
  43 |     await page.locator('form').getByRole('button', { name: 'Continue', exact: true }).click();
  44 |
  45 |     // 4. success banner must appear
  46 |     await expect(page.getByText(/A verification email has been sent to you/i)).toBeVisible({
  47 |       timeout: 30_000,
  48 |     });
  49 |   });
  50 |
  51 |   test('shows validation errors for empty signup form', async ({ page }) => {
> 52 |     await page.goto('/signup-employer');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/signup-employer
  53 |     await page.waitForLoadState('networkidle');
  54 |
  55 |     await page.getByRole('checkbox', { name: /I accept the terms/i }).check();
  56 |
  57 |     await page.locator('form').getByRole('button', { name: 'Continue', exact: true }).click();
  58 |
  59 |     const form = page.locator('form');
  60 |
  61 |     await expect(form.locator('#email').locator('p:has-text(/required/i)')).toBeVisible();
  62 |     await expect(form.locator('#firstName').locator('p:has-text(/required/i)')).toBeVisible();
  63 |     await expect(form.locator('#lastName').locator('p:has-text(/required/i)')).toBeVisible();
  64 |     await expect(form.locator('#password').locator('p:has-text(/required/i)')).toBeVisible();
  65 |   });
  66 |
  67 |   // test('should show error for duplicate email', async ({ page }) => {
  68 |   //   const employer = generateEmployer();
  69 |
  70 |   //   /* 1️⃣  first, create the user */
  71 |   //   await page.goto('/signup-employer');
  72 |   //   await page.getByLabel(/Email Address/i).fill(employer.email);
  73 |   //   await page.getByLabel(/First Name/i).fill('Test');
  74 |   //   await page.getByLabel(/Last Name/i).fill('User');
  75 |   //   await page.getByLabel(/Password/i).fill(employer.password);
  76 |   //   await page.getByLabel(/I accept the terms/i).check({ force: true });
  77 |   //   await page.locator('form').locator('button[type="submit"]').first().click();
  78 |
  79 |   //   await expect(page.getByText(/A verification email has been sent/i)).toBeVisible({
  80 |   //     timeout: 260_000,
  81 |   //   });
  82 |
  83 |   //   /* 2️⃣  try to sign up again with the SAME e‑mail */
  84 |   //   await page.goto('/signup-employer');
  85 |   //   await page.getByLabel(/Email Address/i).fill(employer.email);
  86 |   //   await page.getByLabel(/First Name/i).fill('Test');
  87 |   //   await page.getByLabel(/Last Name/i).fill('User');
  88 |   //   await page.getByLabel(/Password/i).fill(employer.password);
  89 |   //   await page.getByLabel(/I accept the terms/i).check({ force: true });
  90 |   //   await page.locator('form').locator('button[type="submit"]').first().click();
  91 |
  92 |   //   await expect(page.locator('div.bg-red-100')).toHaveText(/already registered/i, {
  93 |   //     timeout: 260_000,
  94 |   //   });
  95 |   // });
  96 | });
  97 |
```