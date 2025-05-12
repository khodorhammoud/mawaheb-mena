// ✅ Responsive‑UI Spec File for Mobile Navigation
// Location: apps/frontend/e2e/responsive/mobile‑navigation.spec.ts
/*
this file defines the ACTUAL TEST CASES for **mobile‑only** navigation, using:
 - Playwright’s built‑in mobile emulation projects (Pixel 5, iPhone 12, etc.)
 - no extra fixtures or POMs; we interact with raw selectors that only exist
   in the mobile breakpoint (hamburger button, collapsed nav).

Why create a dedicated mobile spec?
 • Desktop and mobile break‑points often diverge (hidden nav, single‑column cards).
 • Visual regressions on small screens can slip through if you only test desktop.
 • Limiting these assertions to “mobile projects” keeps the desktop suite lean.

How Playwright knows it’s mobile:
 • In **playwright.config.ts** you defined projects such as
       { name: 'Mobile Chrome',  use: { …devices['Pixel 5']   } },
       { name: 'Mobile Safari',  use: { …devices['iPhone 12'] } }.
   This spec automatically runs for each mobile project in the matrix.
*/

import { test, expect } from '@playwright/test';   // Playwright helpers

// ✅ Group tests under "Mobile navigation" for nice report grouping
test.describe('Mobile navigation', () => {
  // -----------------------------------------------------------------------
  // beforeEach  – get a clean home page before every assertion
  // -----------------------------------------------------------------------
  test.beforeEach(async ({ page }) => {
    await page.goto('/');                         // open landing page
  });

  // -----------------------------------------------------------------------
  // TEST 1 – Hamburger toggle & navigation
  // -----------------------------------------------------------------------
  test('hamburger menu works on mobile', async ({ page }) => {
    // 1️⃣  Assert: nav links are hidden on first render (collapsed menu)
    await expect(page.locator('nav .nav-links')).not.toBeVisible();

    // 2️⃣  Tap the hamburger button to open the menu
    await page.locator('.hamburger-button').click();

    // 3️⃣  Assert: nav links list becomes visible
    await expect(page.locator('nav .nav-links')).toBeVisible();

    // 4️⃣  Click “Login” link inside the expanded menu
    await page.locator('nav .nav-links').getByText('Login').click();

    // 5️⃣  Assert: browser navigated to /login
    await expect(page).toHaveURL(/login/);
  });

  // -----------------------------------------------------------------------
  // TEST 2 – Job‑card layout at the mobile breakpoint
  // -----------------------------------------------------------------------
  test('job listings are properly formatted on mobile', async ({ page }) => {
    // 1️⃣  Visit the Jobs page directly
    await page.goto('/jobs');

    // 2️⃣  Locate all job‑card elements
    const jobCards = page.locator('.job-card');

    // 3️⃣  Assert: first card should fit full width (or nearly full width
    //              if padding/gap subtracts a few pixels)
    await expect(jobCards.first()).toHaveCSS(
      'width',
      /100%|calc\(100% - \d+px\)/
    );
  });
});

/*
✅ Summary:
   • beforeEach → always lands on "/".
   • Test 1    → hamburger hidden → click → visible → navigate to /login.
   • Test 2    → /jobs cards render single‑column (full width).

🧠 Tip:
If you ever need to *skip* these on desktop projects:
    test.skip(!testInfo.project.name.includes('Mobile'), 'Mobile only');

These assertions keep your responsive layer safe from accidental CSS regressions 🔒
*/
