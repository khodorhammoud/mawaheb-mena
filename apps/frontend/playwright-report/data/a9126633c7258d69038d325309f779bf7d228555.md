# Test info

- Name: Signup flows >> freelancer signup process
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\signup.spec.ts:18:3

# Error details

```
Error: browserContext._wrapApiCall: Test ended.
Browser logs:

<launching> C:\Users\user\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\user\AppData\Local\Temp\playwright_chromiumdev_profile-XXXXXXOQUbLq --remote-debugging-pipe --no-startup-window
<launched> pid=145732
```

# Test source

```ts
   1 | /*
   2 | this file defines the ACTUAL TEST CASES for the signup, using:
   3 |  - the page object files (POM) → defined the TOOLS (methods + selectors)
   4 |  - (no fixture here because signup doesn’t need pre-injected helpers like loginPage)
   5 | */
   6 |
   7 | // ✅ Import Playwright's `test` and `expect` directly from @playwright/test
   8 | // → we don't import from auth.fixture since we don't need injected loginPage/homePage here
   9 | import { test, expect } from '@playwright/test';
  10 |
  11 | // ✅ Import HomePage Page Object → used to navigate from home to signup pages
  12 | import { HomePage } from '../pages/home.page';
  13 |
  14 | // ✅ Group tests under "Signup flows" → useful for organizing + reports
  15 | test.describe('Signup flows', () => {
  16 |
  17 |   // ✅ First test → checks freelancer signup process
> 18 |   test('freelancer signup process', async ({ page }) => {
     |   ^ Error: browserContext._wrapApiCall: Test ended.
  19 |     const homePage = new HomePage(page); // create HomePage helper instance
  20 |     await homePage.goto(); // navigate to home page
  21 |     await homePage.navigateToFreelancerSignup(); // click "Signup as Freelancer" link
  22 |
  23 |     // ✅ Fill out signup form
  24 |     await page.getByLabel('Full Name').fill('Test Freelancer'); // fill name field
  25 |     await page.getByLabel('Email').fill(`test-freelancer-${Date.now()}@example.com`); // generate unique email
  26 |     await page.getByLabel('Password').fill('Password123!'); // enter password
  27 |     await page.getByLabel('Confirm Password').fill('Password123!'); // confirm password
  28 |
  29 |     await page.getByRole('button', { name: /sign up/i }).click(); // click "Sign Up" button
  30 |
  31 |     // ✅ Assert → after signup, user redirected to verification page
  32 |     await expect(page).toHaveURL(/verification-sent/); // URL should contain "verification-sent"
  33 |     await expect(page.getByText(/verification email/i)).toBeVisible(); // confirmation message should appear
  34 |   });
  35 |
  36 |   // ✅ Second test → checks employer signup process
  37 |   test('employer signup process', async ({ page }) => {
  38 |     const homePage = new HomePage(page); // create HomePage helper instance
  39 |     await homePage.goto(); // navigate to home page
  40 |     await homePage.navigateToEmployerSignup(); // click "Signup as Employer" link
  41 |
  42 |     // ✅ Fill out signup form
  43 |     await page.getByLabel('Company Name').fill('Test Company'); // fill company name
  44 |     await page.getByLabel('Email').fill(`test-employer-${Date.now()}@example.com`); // generate unique email
  45 |     await page.getByLabel('Password').fill('Password123!'); // enter password
  46 |     await page.getByLabel('Confirm Password').fill('Password123!'); // confirm password
  47 |
  48 |     await page.getByRole('button', { name: /sign up/i }).click(); // click "Sign Up" button
  49 |
  50 |     // ✅ Assert → after signup, user redirected to verification page
  51 |     await expect(page).toHaveURL(/verification-sent/); // URL should contain "verification-sent"
  52 |     await expect(page.getByText(/verification email/i)).toBeVisible(); // confirmation message should appear
  53 |   });
  54 | });
  55 |
  56 | // ✅ first test → tests the "freelancer signup path" (user signs up as freelancer → redirected → sees confirmation)
  57 | // ✅ second test → tests the "employer signup path" (user signs up as employer → redirected → sees confirmation)
  58 |
  59 | // ✅ overall: these 2 tests cover the main signup page functionality:
  60 | //    1. successful signup as freelancer
  61 | //    2. successful signup as employer
  62 | // → both check: navigation to signup form → form submission → confirmation page
  63 |
```