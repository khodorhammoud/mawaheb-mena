# Test info

- Name: Employer Signup Flow >> should sign up a new employer successfully
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:5:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:5173/signup-employer", waiting until "load"

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:9:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { generateEmployer } from '../utils/test-data';
   3 |
   4 | test.describe('Employer Signup Flow', () => {
   5 |   test('should sign up a new employer successfully', async ({ page }) => {
   6 |     const employer = generateEmployer();
   7 |
   8 |     // Go to the signup page
>  9 |     await page.goto('/signup-employer');
     |                ^ Error: page.goto: Target page, context or browser has been closed
  10 |
  11 |     await page.getByLabel(/Email Address/i).fill(employer.email);
  12 |
  13 |     await page.getByLabel(/First Name/i).fill('John');
  14 |     await page.getByLabel(/Last Name/i).fill('Doe');
  15 |
  16 |     await page.getByLabel(/Password/i).fill(employer.password);
  17 |
  18 |     await page.getByLabel(/I accept the terms/i).check();
  19 |
  20 |     // this didn't work since in the code (SignupFormComponent.tsx), there is <SocialLinks /> component which has continue buttons
  21 |     // await page.getByRole('button', { name: /continue/i }).click();
  22 |
  23 |     await page.locator('form').first().locator('button[type="submit"]').click();
  24 |
  25 |     await expect(page.getByText(/A verification email has been sent to you/i)).toBeVisible({
  26 |       timeout: 60_000,
  27 |     });
  28 |
  29 |     // console.log('Cleaning up test user:', employer.email);
  30 |     // await cleanupTestData([employer.email]);
  31 |   });
  32 |
  33 |   test('should show validation errors for missing fields', async ({ page }) => {
  34 |     await page.goto('/signup-employer');
  35 |
  36 |     await page.getByLabel(/I accept the terms/i).click({ force: true });
  37 |
  38 |     await page.locator('form').first().locator('button[type="submit"]').click();
  39 |
  40 |     await expect(page.getByText(/Email Address is required/i).first()).toBeVisible({
  41 |       timeout: 260_000,
  42 |     });
  43 |     await expect(page.getByText(/First Name is required/i).first()).toBeVisible({
  44 |       timeout: 260_000,
  45 |     });
  46 |     await expect(page.getByText(/Last Name is required/i).first()).toBeVisible({
  47 |       timeout: 260_000,
  48 |     });
  49 |     await expect(page.getByText(/Password is required/i).first()).toBeVisible({ timeout: 260_000 });
  50 |   });
  51 |
  52 |   test('should show error for duplicate email', async ({ page }) => {
  53 |     const employer = generateEmployer();
  54 |
  55 |     /* 1️⃣  first, create the user */
  56 |     await page.goto('/signup-employer');
  57 |     await page.getByLabel(/Email Address/i).fill(employer.email);
  58 |     await page.getByLabel(/First Name/i).fill('Test');
  59 |     await page.getByLabel(/Last Name/i).fill('User');
  60 |     await page.getByLabel(/Password/i).fill(employer.password);
  61 |     await page.getByLabel(/I accept the terms/i).check({ force: true });
  62 |     await page.locator('form').locator('button[type="submit"]').first().click();
  63 |
  64 |     await expect(page.getByText(/A verification email has been sent/i)).toBeVisible({
  65 |       timeout: 230_000,
  66 |     });
  67 |
  68 |     /* 2️⃣  try to sign up again with the SAME e‑mail */
  69 |     await page.goto('/signup-employer');
  70 |     await page.getByLabel(/Email Address/i).fill(employer.email);
  71 |     await page.getByLabel(/First Name/i).fill('Test');
  72 |     await page.getByLabel(/Last Name/i).fill('User');
  73 |     await page.getByLabel(/Password/i).fill(employer.password);
  74 |     await page.getByLabel(/I accept the terms/i).check({ force: true });
  75 |     await page.locator('form').locator('button[type="submit"]').first().click();
  76 |
  77 |     await expect(page.locator('div.bg-red-100')).toHaveText(/already registered/i, {
  78 |       timeout: 230_000,
  79 |     });
  80 |   });
  81 | });
  82 |
```