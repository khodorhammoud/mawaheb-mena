// Direct Playwright tests

import { test, expect } from '@playwright/test';

// 📝 this test is validating the "/" route (home page)
test('basic smoke test', async ({ page }, testInfo) => {
  // 📝 load the home page (this renders the Layout component)
  await page.goto('/');

  // ✅ COMPONENT CALLED: Layout → returns <Header />, <Outlet />, <Footer />
  //    → since it's "/", Outlet renders home content
  //    → and <Header /> is rendered at top

  // 📝 check the page title contains "Mawaheb mena" (case-insensitive)
  await expect(page).toHaveTitle(/Mawaheb mena/i);

  // ✅ COMPONENT INVOLVED:
  //   → title is set from <head> → likely via loader or meta inside Remix route

  if (['Mobile Chrome', 'Mobile Safari'].includes(testInfo.project.name)) {
    // 📝 MOBILE: need to click burger menu to show nav
    await page.locator('button.focus\\:outline-none').click();

    // ✅ COMPONENT CALLED: <Header />
    //   → contains burger <button> with class `focus:outline-none`
    //   → clicking it toggles mobile <nav class="overflow-hidden md:hidden">

    // 📝 verify the mobile <nav> is visible after clicking burger
    await expect(page.locator('nav.overflow-hidden.md\\:hidden')).toBeVisible();

    // ✅ COMPONENT VERIFIED:
    //   → <nav class="overflow-hidden md:hidden"> inside <Header />
    //   → shown only after clicking burger
  } else {
    // 📝 DESKTOP: nav already visible → no click needed
    await expect(page.locator('nav').first()).toBeVisible();

    // ✅ COMPONENT VERIFIED:
    //   → first <nav> element on desktop (since multiple <nav> exist)
    //   → nav rendered from <Header /> for desktop
  }
});
