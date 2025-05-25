# Test info

- Name: Visual regression >> homepage looks correct
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\visual\homepage.spec.ts:20:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\visual\homepage.spec.ts:21:16
```

# Test source

```ts
   1 | /*
   2 | this file defines the ACTUAL TEST CASES for **visual regression**, using:
   3 |  - Playwright’s screenshot/compare helpers → the “TOOLS” that diff pixels
   4 |  - (no fixture here because we don’t need injected page objects; we only
   5 |    render pages and compare their screenshots)
   6 |
   7 | Why visual tests?
   8 |  - catch unintended CSS / layout changes early
   9 |  - protect brand / UI polish
  10 |  - compliment functional tests that check behaviour
  11 | */
  12 |
  13 | // ✅ Import Playwright's `test` and `expect` directly from @playwright/test
  14 | // → we don’t need any POM; we just navigate and take screenshots
  15 | import { test, expect } from '@playwright/test';
  16 |
  17 | // ✅ Group tests under "Visual regression" → useful for organising reports
  18 | test.describe('Visual regression', () => {
  19 |   // ✅ First test → full‑page snapshot for the home route
  20 |   test('homepage looks correct', async ({ page }) => {
> 21 |     await page.goto('/');                     // open home page
     |                ^ Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
  22 |
  23 |     // 📸 Take a full‑page screenshot
  24 |     // • On first run: saves baseline as   e2e/visual/__snapshots__/homepage.png
  25 |     // • Next runs   : diffs new screenshot against baseline
  26 |     //   and fails if pixels differ beyond Playwright’s threshold
  27 |     expect(await page.screenshot()).toMatchSnapshot('homepage.png');
  28 |   });
  29 |
  30 |   // ✅ Second test → component snapshot for the login form
  31 |   test('login page looks correct', async ({ page }) => {
  32 |     await page.goto('/login');                // open login page
  33 |
  34 |     // 📸 Screenshot only the login form element (less brittle than full page)
  35 |     expect(
  36 |       await page.locator('.login-form').screenshot()
  37 |     ).toMatchSnapshot('login-form.png');
  38 |   });
  39 | });
  40 |
  41 | // ✅ first test → protects overall home‑page layout / hero / nav
  42 | // ✅ second test → protects the styling of the login form component
  43 | //
  44 | // ✅ overall: these 2 tests guard your most‑visited pages against
  45 | //    accidental CSS regressions.  Update snapshots intentionally with:
  46 | //        npx playwright test --update-snapshots
  47 |
```