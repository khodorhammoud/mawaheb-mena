# Test info

- Name: Mobile navigation >> job listings are properly formatted on mobile
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\responsive\mobile‑navigation.spec.ts:55:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\responsive\mobile‑navigation.spec.ts:29:16
```

# Test source

```ts
   1 | // ✅ Responsive‑UI Spec File for Mobile Navigation
   2 | // Location: apps/frontend/e2e/responsive/mobile‑navigation.spec.ts
   3 | /*
   4 | this file defines the ACTUAL TEST CASES for **mobile‑only** navigation, using:
   5 |  - Playwright’s built‑in mobile emulation projects (Pixel 5, iPhone 12, etc.)
   6 |  - no extra fixtures or POMs; we interact with raw selectors that only exist
   7 |    in the mobile breakpoint (hamburger button, collapsed nav).
   8 |
   9 | Why create a dedicated mobile spec?
  10 |  • Desktop and mobile break‑points often diverge (hidden nav, single‑column cards).
  11 |  • Visual regressions on small screens can slip through if you only test desktop.
  12 |  • Limiting these assertions to “mobile projects” keeps the desktop suite lean.
  13 |
  14 | How Playwright knows it’s mobile:
  15 |  • In **playwright.config.ts** you defined projects such as
  16 |        { name: 'Mobile Chrome',  use: { …devices['Pixel 5']   } },
  17 |        { name: 'Mobile Safari',  use: { …devices['iPhone 12'] } }.
  18 |    This spec automatically runs for each mobile project in the matrix.
  19 | */
  20 |
  21 | import { test, expect } from '@playwright/test';   // Playwright helpers
  22 |
  23 | // ✅ Group tests under "Mobile navigation" for nice report grouping
  24 | test.describe('Mobile navigation', () => {
  25 |   // -----------------------------------------------------------------------
  26 |   // beforeEach  – get a clean home page before every assertion
  27 |   // -----------------------------------------------------------------------
  28 |   test.beforeEach(async ({ page }) => {
> 29 |     await page.goto('/');                         // open landing page
     |                ^ Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
  30 |   });
  31 |
  32 |   // -----------------------------------------------------------------------
  33 |   // TEST 1 – Hamburger toggle & navigation
  34 |   // -----------------------------------------------------------------------
  35 |   test('hamburger menu works on mobile', async ({ page }) => {
  36 |     // 1️⃣  Assert: nav links are hidden on first render (collapsed menu)
  37 |     await expect(page.locator('nav .nav-links')).not.toBeVisible();
  38 |
  39 |     // 2️⃣  Tap the hamburger button to open the menu
  40 |     await page.locator('.hamburger-button').click();
  41 |
  42 |     // 3️⃣  Assert: nav links list becomes visible
  43 |     await expect(page.locator('nav .nav-links')).toBeVisible();
  44 |
  45 |     // 4️⃣  Click “Login” link inside the expanded menu
  46 |     await page.locator('nav .nav-links').getByText('Login').click();
  47 |
  48 |     // 5️⃣  Assert: browser navigated to /login
  49 |     await expect(page).toHaveURL(/login/);
  50 |   });
  51 |
  52 |   // -----------------------------------------------------------------------
  53 |   // TEST 2 – Job‑card layout at the mobile breakpoint
  54 |   // -----------------------------------------------------------------------
  55 |   test('job listings are properly formatted on mobile', async ({ page }) => {
  56 |     // 1️⃣  Visit the Jobs page directly
  57 |     await page.goto('/jobs');
  58 |
  59 |     // 2️⃣  Locate all job‑card elements
  60 |     const jobCards = page.locator('.job-card');
  61 |
  62 |     // 3️⃣  Assert: first card should fit full width (or nearly full width
  63 |     //              if padding/gap subtracts a few pixels)
  64 |     await expect(jobCards.first()).toHaveCSS(
  65 |       'width',
  66 |       /100%|calc\(100% - \d+px\)/
  67 |     );
  68 |   });
  69 | });
  70 |
  71 | /*
  72 | ✅ Summary:
  73 |    • beforeEach → always lands on "/".
  74 |    • Test 1    → hamburger hidden → click → visible → navigate to /login.
  75 |    • Test 2    → /jobs cards render single‑column (full width).
  76 |
  77 | 🧠 Tip:
  78 | If you ever need to *skip* these on desktop projects:
  79 |     test.skip(!testInfo.project.name.includes('Mobile'), 'Mobile only');
  80 |
  81 | These assertions keep your responsive layer safe from accidental CSS regressions 🔒
  82 | */
  83 |
```