# Test info

- Name: Home page >> should load the home page
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\home.spec.ts:4:3

# Error details

```
Error: browserContext._wrapApiCall: Test ended.
Browser logs:

<launching> C:\Users\user\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\user\AppData\Local\Temp\playwright_chromiumdev_profile-XXXXXXixjVGl --remote-debugging-pipe --no-startup-window
<launched> pid=155120
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Home page', () => {
>  4 |   test('should load the home page', async ({ page }) => {
     |   ^ Error: browserContext._wrapApiCall: Test ended.
   5 |     // Navigate to home page
   6 |     await page.goto('/');
   7 |
   8 |     // Verify the page has loaded successfully
   9 |     const title = await page.title();
  10 |     expect(title).toBeTruthy();
  11 |
  12 |     // This test is primarily to verify the test environment works correctly
  13 |     // with the database connection
  14 |   });
  15 | });
  16 |
```