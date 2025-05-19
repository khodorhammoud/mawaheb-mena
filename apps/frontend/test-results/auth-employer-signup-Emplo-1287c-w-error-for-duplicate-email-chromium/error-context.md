# Test info

- Name: Employer Signup Flow >> should show error for duplicate email
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible()

Locator: getByText(/A verification email has been sent/i)
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 230000ms
  - waiting for getByText(/A verification email has been sent/i)

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:64:73
```

# Page snapshot

```yaml
- banner:
  - text: MAWAHEB MENA
  - navigation:
    - link "For Employers":
      - /url: /for-employers
    - link "For Freelancers":
      - /url: /for-freelancers
    - link "About Us":
      - /url: /about-us
    - link "Contact Us":
      - /url: /contact-us
  - navigation:
    - link "Hire Now":
      - /url: /signup-employer
    - link "Join Our Team":
      - /url: /signup-freelancer
- heading "Sign Up" [level=1]
- strong: Error!
- text: An unexpected error occurred. Please try again later.
- paragraph: Select user type
- paragraph: You can change your account at any time
- button "👤 Personal Set Up Your Dream Team"
- button "🏢 Company Hire Top Talent"
- textbox "Email Address Enter your email": employer-1747657371996@example.com
- text: Email Address
- textbox "First Name": Test
- text: First Name
- textbox "Last Name": User
- text: Last Name
- textbox "Password": Password123!
- text: Password
- button "👁️"
- paragraph: Password must be 8 characters, upper capital, lower case, symbols
- checkbox "I accept the terms and conditions" [checked]:
  - img
- text: I accept the
- link "terms and conditions":
  - /url: /terms-and-conditions
- button "Continue"
- text: or
- button "Continue with Google Continue with Google":
  - text: Continue with Google
  - img
  - text: Continue with Google
- link "Continue with LinkedIn Continue with LinkedIn":
  - /url: /
  - text: Continue with LinkedIn
  - img
  - text: Continue with LinkedIn
- link "Continue with Microsoft Continue with Microsoft":
  - /url: /
  - text: Continue with Microsoft
  - img
  - text: Continue with Microsoft
- paragraph:
  - text: Already have an account?
  - link "Login":
    - /url: /login-employer
- paragraph: The platform not only provided me with access to a wide range of exciting jobs but also supported me every step of the way.
- paragraph: Layla Mourad
- paragraph: JavaScript Expert
- img
- img
- img
- img
- img
- button:
  - img
- button:
  - img
- contentinfo:
  - heading "Join our newsletter" [level=4]
  - textbox
  - text: Enter your email
  - button "Subscribe"
  - paragraph:
    - text: By subscribing you agree to our
    - link "Privacy Policy":
      - /url: "#"
  - heading "Solutions" [level=4]
  - list:
    - listitem:
      - link "1+ Freelancers":
        - /url: "#"
    - listitem:
      - link "Delivery Teams":
        - /url: "#"
    - listitem:
      - link "Permanent Employees":
        - /url: "#"
    - listitem:
      - link "AI Developers":
        - /url: "#"
    - listitem:
      - link "Technical Scoping":
        - /url: "#"
    - listitem:
      - link "Kodeless":
        - /url: "#"
  - heading "Ecosystem" [level=4]
  - list:
    - listitem:
      - link "Studios":
        - /url: "#"
    - listitem:
      - link "Agencies":
        - /url: "#"
    - listitem:
      - link "Fellows":
        - /url: "#"
  - heading "Product" [level=4]
  - list:
    - listitem:
      - link "How It Works":
        - /url: "#"
    - listitem:
      - link "Why MAWAHEB":
        - /url: "#"
    - listitem:
      - link "Our Vetting":
        - /url: "#"
    - listitem:
      - link "vs. Employees":
        - /url: "#"
    - listitem:
      - link "vs. Agencies":
        - /url: "#"
    - listitem:
      - link "FAQ":
        - /url: "#"
  - heading "For Freelancers" [level=4]
  - list:
    - listitem:
      - link "Benefits":
        - /url: "#"
    - listitem:
      - link "How It Works":
        - /url: "#"
    - listitem:
      - link "How To Join":
        - /url: "#"
    - listitem:
      - link "FAQ":
        - /url: "#"
  - heading "Company" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: "#"
    - listitem:
      - link "Press":
        - /url: "#"
    - listitem:
      - link "Why We Do This":
        - /url: "#"
    - listitem:
      - link "Our Partners":
        - /url: "#"
    - listitem:
      - link "Who We Are":
        - /url: "#"
    - listitem:
      - link "Careers":
        - /url: "#"
  - text: © 2024 Mawaheb. All rights reserved.
  - link "Privacy Policy":
    - /url: "#"
  - link "Terms of Service":
    - /url: "#"
  - link "Cookies Settings":
    - /url: "#"
  - link:
    - /url: "#"
  - link:
    - /url: "#"
  - link:
    - /url: "#"
  - link:
    - /url: "#"
  - link:
    - /url: "#"
- region "Notifications (F8)":
  - list
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
   9 |     await page.goto('/signup-employer');
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
> 64 |     await expect(page.getByText(/A verification email has been sent/i)).toBeVisible({
     |                                                                         ^ Error: expect(locator).toBeVisible()
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