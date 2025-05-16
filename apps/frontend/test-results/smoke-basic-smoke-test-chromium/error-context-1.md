# Test info

- Name: basic smoke test
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\smoke.spec.ts:6:1

# Error details

```
Error: browserContext._wrapApiCall: Test ended.
Browser logs:

<launching> C:\Users\user\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\user\AppData\Local\Temp\playwright_chromiumdev_profile-XXXXXXSv7kKL --remote-debugging-pipe --no-startup-window
<launched> pid=128212
```

# Test source

```ts
   1 | // Direct Playwright tests
   2 |
   3 | import { test, expect } from '@playwright/test';
   4 |
   5 | // 📝 this test is validating the "/" route (home page)
>  6 | test('basic smoke test', async ({ page }, testInfo) => {
     | ^ Error: browserContext._wrapApiCall: Test ended.
   7 |   // 📝 load the home page (this renders the Layout component)
   8 |   await page.goto('/');
   9 |
  10 |   // ✅ COMPONENT CALLED: Layout → returns <Header />, <Outlet />, <Footer />
  11 |   //    → since it's "/", Outlet renders home content
  12 |   //    → and <Header /> is rendered at top
  13 |
  14 |   // 📝 check the page title contains "Mawaheb mena" (case-insensitive)
  15 |   await expect(page).toHaveTitle(/Mawaheb mena/i);
  16 |
  17 |   // ✅ COMPONENT INVOLVED:
  18 |   //   → title is set from <head> → likely via loader or meta inside Remix route
  19 |
  20 |   if (['Mobile Chrome', 'Mobile Safari'].includes(testInfo.project.name)) {
  21 |     // 📝 MOBILE: need to click burger menu to show nav
  22 |     await page.locator('button.focus\\:outline-none').click();
  23 |
  24 |     // ✅ COMPONENT CALLED: <Header />
  25 |     //   → contains burger <button> with class `focus:outline-none`
  26 |     //   → clicking it toggles mobile <nav class="overflow-hidden md:hidden">
  27 |
  28 |     // 📝 verify the mobile <nav> is visible after clicking burger
  29 |     await expect(page.locator('nav.overflow-hidden.md\\:hidden')).toBeVisible();
  30 |
  31 |     // ✅ COMPONENT VERIFIED:
  32 |     //   → <nav class="overflow-hidden md:hidden"> inside <Header />
  33 |     //   → shown only after clicking burger
  34 |   } else {
  35 |     // 📝 DESKTOP: nav already visible → no click needed
  36 |     await expect(page.locator('nav').first()).toBeVisible();
  37 |
  38 |     // ✅ COMPONENT VERIFIED:
  39 |     //   → first <nav> element on desktop (since multiple <nav> exist)
  40 |     //   → nav rendered from <Header /> for desktop
  41 |   }
  42 | });
  43 |
```