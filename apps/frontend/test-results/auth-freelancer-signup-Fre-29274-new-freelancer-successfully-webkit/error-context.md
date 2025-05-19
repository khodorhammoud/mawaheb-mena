# Test info

- Name: Freelancer Signup Flow >> signs up a new freelancer successfully
- Location: C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\freelancer-signup.spec.ts:5:3

# Error details

```
Error: locator.fill: Test ended.
Call log:
  - waiting for getByLabel(/Email Address/i)

    at C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\freelancer-signup.spec.ts:10:45
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { generateFreelancer } from '../utils/test-data'; // Use your real function!
   3 |
   4 | test.describe('Freelancer Signup Flow', () => {
   5 |   test('signs up a new freelancer successfully', async ({ page }) => {
   6 |     const freelancer = generateFreelancer();
   7 |
   8 |     await page.goto('/signup-freelancer');
   9 |
> 10 |     await page.getByLabel(/Email Address/i).fill(freelancer.email);
     |                                             ^ Error: locator.fill: Test ended.
  11 |     await page.getByLabel(/First Name/i).fill('Freela');
  12 |     await page.getByLabel(/Last Name/i).fill('Tester');
  13 |     await page.getByLabel(/Password/i).fill(freelancer.password);
  14 |
  15 |     // Accept terms checkbox
  16 |     await page.getByLabel(/I accept the terms/i).check();
  17 |
  18 |     // Click the *first* "Continue" button (not the Google button)
  19 |     await page.getByRole('button', { name: /^Continue$/ }).click();
  20 |
  21 |     // Wait for the success message
  22 |     await expect(page.getByText(/A verification email has been sent to you/i)).toBeVisible({
  23 |       timeout: 60_000,
  24 |     });
  25 |   });
  26 |
  27 |   // test('should show validation errors for missing fields', async ({ page }) => {
  28 |   //   await page.goto('/signup-freelancer');
  29 |
  30 |   //   await page.getByLabel(/I accept the terms/i).click({ force: true });
  31 |
  32 |   //   await page.getByRole('button', { name: /^Continue$/ }).click();
  33 |
  34 |   //   await expect(page.getByText(/Email Address is required/i)).toBeVisible();
  35 |   //   await expect(page.getByText(/First Name is required/i)).toBeVisible();
  36 |   //   await expect(page.getByText(/Last Name is required/i)).toBeVisible();
  37 |   //   await expect(page.getByText(/Password is required/i)).toBeVisible();
  38 |   // });
  39 |
  40 |   // test('should show error for duplicate email', async ({ page }) => {
  41 |   //   const freelancer = generateFreelancer();
  42 |
  43 |   //   // First, sign up
  44 |   //   await page.goto('/signup-freelancer');
  45 |   //   await page.getByLabel(/Email Address/i).fill(freelancer.email);
  46 |   //   await page.getByLabel(/First Name/i).fill('Dup');
  47 |   //   await page.getByLabel(/Last Name/i).fill('User');
  48 |   //   await page.getByLabel(/Password/i).fill(freelancer.password);
  49 |   //   await page.getByLabel(/I accept the terms/i).check();
  50 |   //   await page.getByRole('button', { name: /^Continue$/ }).click();
  51 |   //   await expect(page.getByText(/A verification email has been sent/i)).toBeVisible();
  52 |
  53 |   //   // Try to sign up again with the same email
  54 |   //   await page.goto('/signup-freelancer');
  55 |   //   await page.getByLabel(/Email Address/i).fill(freelancer.email);
  56 |   //   await page.getByLabel(/First Name/i).fill('Dup');
  57 |   //   await page.getByLabel(/Last Name/i).fill('User');
  58 |   //   await page.getByLabel(/Password/i).fill(freelancer.password);
  59 |   //   await page.getByLabel(/I accept the terms/i).check();
  60 |   //   await page.getByRole('button', { name: /^Continue$/ }).click();
  61 |   //   await expect(page.locator('div.bg-red-100')).toHaveText(/already registered/i);
  62 |   // });
  63 | });
  64 |
```