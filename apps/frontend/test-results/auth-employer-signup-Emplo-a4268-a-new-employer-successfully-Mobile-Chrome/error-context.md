# Test info

- Name: Employer Signup Flow >> should sign up a new employer successfully
- Location: C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:5:5

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for getByLabel(/I accept the terms/i)
    - locator resolved to <button value="on" type="button" role="checkbox" id="termsAccepted" aria-checked="false" aria-required="true" data-state="unchecked" class="peer h-4 w-4 shrink-0 border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primaryColor data-[state=checked]:text-white data-[state=checked]:border-primaryColor peer"></button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

    at C:\Users\Moussa\Desktop\WIX\mawaheb-mena\apps\frontend\e2e\auth\employer-signup.spec.ts:18:54
```

# Page snapshot

```yaml
- banner:
  - text: MAWAHEB MENA
  - button:
    - img
  - navigation:
    - link "For Employers":
      - /url: /for-employers
    - link "For Freelancers":
      - /url: /for-freelancers
    - link "About Us":
      - /url: /about-us
    - link "Contact Us":
      - /url: /contact-us
    - link "Hire Now":
      - /url: /signup-employer
    - link "Join Our Team":
      - /url: /signup-freelancer
- heading "Sign Up" [level=1]
- paragraph: Select user type
- paragraph: You can change your account at any time
- button "👤 Personal Set Up Your Dream Team"
- button "🏢 Company Hire Top Talent"
- textbox "Email Address Enter your email": employer-1747194905421@example.com
- text: Email Address
- textbox "First Name": John
- text: First Name
- textbox "Last Name": Doe
- text: Last Name
- textbox "Password": Password123!
- text: Password
- button "👁️"
- paragraph: Password must be 8 characters, upper capital, lower case, symbols
- checkbox "I accept the terms and conditions"
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
- paragraph: Working with Mawaheb MENA has been a game-changer for our company. The platform provided us with access to a pool of highly skilled freelancers who delivered exceptional results on every job. From web development to graphic design, we found top-tier talent for all our needs.
- paragraph: Ahmad Ramal
- paragraph: CEO, Waxy
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
> 18 |         await page.getByLabel(/I accept the terms/i).check();
     |                                                      ^ Error: locator.check: Clicking the checkbox did not change its state
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
  51 |         await page.goto('/signup-employer');
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