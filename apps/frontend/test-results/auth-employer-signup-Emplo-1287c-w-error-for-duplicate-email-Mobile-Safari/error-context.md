# Test info

- Name: Employer Signup Flow >> should show error for duplicate email
- Location: C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:47:5

# Error details

```
Error: page.goto: Could not connect to server
Call log:
  - navigating to "http://localhost:5173/signup-employer", waiting until "load"

    at C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:51:20
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { generateEmployer } from '../utils/test-data';
   3 |
   4 | test.describe('Employer Signup Flow', () => {
   5 |     test('should sign up a new employer successfully', async ({ page }) => {
   6 |         const employer = generateEmployer();
   7 |     
   8 |         // Go to the signup page
   9 |         await page.goto('/signup-employer');
  10 |
  11 |         await page.getByLabel(/Email Address/i).fill(employer.email);
  12 |
  13 |         await page.getByLabel(/First Name/i).fill('John');
  14 |         await page.getByLabel(/Last Name/i).fill('Doe');
  15 |
  16 |         await page.getByLabel(/Password/i).fill(employer.password);
  17 |         
  18 |         await page.getByLabel(/I accept the terms/i).check();
  19 |         
  20 |         // this didn't work since in the code (SignupFormComponent.tsx), there is <SocialLinks /> component which has continue buttons
  21 |         // await page.getByRole('button', { name: /continue/i }).click();
  22 |         
  23 |         await page.locator('form').first().locator('button[type="submit"]').click();
  24 |         
  25 |         await expect(
  26 |             page.getByText(/A verification email has been sent to you/i)
  27 |         ).toBeVisible({ timeout: 60_000});
  28 |         
  29 |         // console.log('Cleaning up test user:', employer.email);
  30 |         // await cleanupTestData([employer.email]);
  31 |     });
  32 |     
  33 |     test('should show validation errors for missing fields', async ({ page }) => {
  34 |         await page.goto('/signup-employer');
  35 |
  36 |         await page.getByLabel(/I accept the terms/i).click({ force: true });
  37 |
  38 |         await page.locator('form').first().locator('button[type="submit"]').click();
  39 |         
  40 |         await expect(page.getByText(/Email Address is required/i).first()).toBeVisible({ timeout: 260_000});
  41 |         await expect(page.getByText(/First Name is required/i).first()).toBeVisible({ timeout: 260_000});
  42 |         await expect(page.getByText(/Last Name is required/i).first()).toBeVisible({ timeout: 260_000});
  43 |         await expect(page.getByText(/Password is required/i).first()).toBeVisible({ timeout: 260_000});
  44 |     });
  45 |
  46 |
  47 |     test('should show error for duplicate email', async ({ page }) => {
  48 |         const employer = generateEmployer();
  49 |       
  50 |         /* 1️⃣  first, create the user */
> 51 |         await page.goto('/signup-employer');
     |                    ^ Error: page.goto: Could not connect to server
  52 |         await page.getByLabel(/Email Address/i).fill(employer.email);
  53 |         await page.getByLabel(/First Name/i).fill('Test');
  54 |         await page.getByLabel(/Last Name/i).fill('User');
  55 |         await page.getByLabel(/Password/i).fill(employer.password);
  56 |         await page.getByLabel(/I accept the terms/i).check({ force: true });
  57 |         await page.locator('form').locator('button[type="submit"]').first().click();
  58 |
  59 |         await expect(page.getByText(/A verification email has been sent/i))
  60 |               .toBeVisible({ timeout: 230_000 });
  61 |       
  62 |         /* 2️⃣  try to sign up again with the SAME e‑mail */
  63 |         await page.goto('/signup-employer');
  64 |         await page.getByLabel(/Email Address/i).fill(employer.email);
  65 |         await page.getByLabel(/First Name/i).fill('Test');
  66 |         await page.getByLabel(/Last Name/i).fill('User');
  67 |         await page.getByLabel(/Password/i).fill(employer.password);
  68 |         await page.getByLabel(/I accept the terms/i).check({ force: true });
  69 |         await page.locator('form').locator('button[type="submit"]').first().click();
  70 |       
  71 |         await expect(page.locator('div.bg-red-100'))
  72 |               .toHaveText(/already registered/i, { timeout: 230_000 });
  73 |       });
  74 |       
  75 | });
```