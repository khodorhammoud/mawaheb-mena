/*
this file defines the ACTUAL TEST CASES for **visual regression**, using:
 - Playwright’s screenshot/compare helpers → the “TOOLS” that diff pixels
 - (no fixture here because we don’t need injected page objects; we only
   render pages and compare their screenshots)

Why visual tests?
 - catch unintended CSS / layout changes early
 - protect brand / UI polish
 - compliment functional tests that check behaviour
*/

// ✅ Import Playwright's `test` and `expect` directly from @playwright/test
// → we don’t need any POM; we just navigate and take screenshots
import { test, expect } from '@playwright/test';

// ✅ Group tests under "Visual regression" → useful for organising reports
test.describe('Visual regression', () => {
  // ✅ First test → full‑page snapshot for the home route
  test('homepage looks correct', async ({ page }) => {
    await page.goto('/');                     // open home page

    // 📸 Take a full‑page screenshot
    // • On first run: saves baseline as   e2e/visual/__snapshots__/homepage.png
    // • Next runs   : diffs new screenshot against baseline
    //   and fails if pixels differ beyond Playwright’s threshold
    expect(await page.screenshot()).toMatchSnapshot('homepage.png');
  });

  // ✅ Second test → component snapshot for the login form
  test('login page looks correct', async ({ page }) => {
    await page.goto('/login');                // open login page

    // 📸 Screenshot only the login form element (less brittle than full page)
    expect(
      await page.locator('.login-form').screenshot()
    ).toMatchSnapshot('login-form.png');
  });
});

// ✅ first test → protects overall home‑page layout / hero / nav
// ✅ second test → protects the styling of the login form component
//
// ✅ overall: these 2 tests guard your most‑visited pages against
//    accidental CSS regressions.  Update snapshots intentionally with:
//        npx playwright test --update-snapshots
