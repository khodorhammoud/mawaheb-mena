# Test info

- Name: Login functionality >> can navigate to signup from login page
- Location: C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\login.spec.ts:41:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Don\'t have an account? Sign up')

    at C:\Users\user\Desktop\work\GIG Platform\code\mawaheb-mena\apps\frontend\e2e\auth\login.spec.ts:45:61
```

# Page snapshot

```yaml
- text: Unexpected Server Error
```

# Test source

```ts
   1 | /*
   2 | this file defines the ACTUAL TEST CASES for the login, using:
   3 |  - the page object files (POM) → defined the TOOLS (methods + selectors)
   4 |  - the fixture file → defined the AUTOMATIC INJECTION of those tools
   5 | */
   6 |
   7 | // ✅ Import our custom `test` and `expect` from the auth fixture file instead of the @playwright normal one,
   8 | // → this automatically gives access to `loginPage`, `homePage`, `authenticatedPage`, unlike the normal `test` from @playwright/test
   9 | import { test, expect } from "../fixtures/auth.fixture"
  10 |
  11 | // ✅ Group tests under "Login functionality" → useful for organizing + reports
  12 | test.describe('Login functionality', () => {
  13 |
  14 |     // ✅ First test → checks successful login redirects to dashboard
  15 |   test('successful login redirects to dashboard', async ({ loginPage, page }) => {
  16 |     await loginPage.goto(); // navigate to login page
  17 |     // ✅ here, we can use goto() since loginPage was automatically injected from the fixture
  18 |
  19 |     await loginPage.login('test@example.com', 'password123'); // → fill form + submit credentials
  20 |     
  21 |     // ✅ Assert → we are redirected to a URL containing "dashboard"
  22 |     await expect(page).toHaveURL(/dashboard/);
  23 |
  24 |     // ✅ Assert → check that a welcome message exists on the dashboard
  25 |     await expect(page.locator('.welcome-message')).toContainText(/welcome/i);
  26 |   });
  27 |
  28 |   // ✅ Second test → checks login failure shows error
  29 |   test('login with invalid credentials shows error', async ({ loginPage }) => {
  30 |     await loginPage.goto(); // → navigate to /login page
  31 |     await loginPage.login('invalid@example.com', 'wrongpassword'); // → submit bad credentials
  32 |   
  33 |     // ✅ Assert → error message element is visible
  34 |     await expect(loginPage.errorMessage).toBeVisible();
  35 |
  36 |     // ✅ Assert → error message text contains "invalid credentials"
  37 |     await expect(loginPage.errorMessage).toContainText(/invalid credentials/i);
  38 |   });
  39 |
  40 |   // ✅ Third test → checks that signup link from login page works
  41 |   test('can navigate to signup from login page', async ({ loginPage, page }) => {
  42 |     await loginPage.goto(); // → navigate to /login page
  43 |
  44 |     // ✅ Click the "Don't have an account? Sign up" link
> 45 |     await page.getByText('Don\'t have an account? Sign up').click();
     |                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  46 |   
  47 |     // ✅ Assert → URL changed to include "/signup"
  48 |     await expect(page).toHaveURL(/signup/);
  49 |   });
  50 | });
  51 |
  52 | // first test → tests the "happy path" (successful login → user is redirected → dashboard shows welcome message)
  53 | // second test → tests the "negative path" (invalid login → error message shown → user stays on login page)
  54 | // third test → tests navigation flow (link from login → navigates user to signup page)
  55 |
  56 | // overall: these 3 tests cover the main functionality of the login page:
  57 | //    1. successful login
  58 | //    2. failed login
  59 | //    3. navigation to signup
```