/*
this file defines the ACTUAL TEST CASES for the login, using:
 - the page object files (POM) → defined the TOOLS (methods + selectors)
 - the fixture file → defined the AUTOMATIC INJECTION of those tools
*/

// ✅ Import our custom `test` and `expect` from the auth fixture file instead of the @playwright normal one,
// → this automatically gives access to `loginPage`, `homePage`, `authenticatedPage`, unlike the normal `test` from @playwright/test
import { test, expect } from "../fixtures/auth.fixture"

// ✅ Group tests under "Login functionality" → useful for organizing + reports
test.describe('Login functionality', () => {

    // ✅ First test → checks successful login redirects to dashboard
  test('successful login redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.goto(); // navigate to login page
    // ✅ here, we can use goto() since loginPage was automatically injected from the fixture

    await loginPage.login('test@example.com', 'password123'); // → fill form + submit credentials
    
    // ✅ Assert → we are redirected to a URL containing "dashboard"
    await expect(page).toHaveURL(/dashboard/);

    // ✅ Assert → check that a welcome message exists on the dashboard
    await expect(page.locator('.welcome-message')).toContainText(/welcome/i);
  });

  // ✅ Second test → checks login failure shows error
  test('login with invalid credentials shows error', async ({ loginPage }) => {
    await loginPage.goto(); // → navigate to /login page
    await loginPage.login('invalid@example.com', 'wrongpassword'); // → submit bad credentials
  
    // ✅ Assert → error message element is visible
    await expect(loginPage.errorMessage).toBeVisible();

    // ✅ Assert → error message text contains "invalid credentials"
    await expect(loginPage.errorMessage).toContainText(/invalid credentials/i);
  });

  // ✅ Third test → checks that signup link from login page works
  test('can navigate to signup from login page', async ({ loginPage, page }) => {
    await loginPage.goto(); // → navigate to /login page

    // ✅ Click the "Don't have an account? Sign up" link
    await page.getByText('Don\'t have an account? Sign up').click();
  
    // ✅ Assert → URL changed to include "/signup"
    await expect(page).toHaveURL(/signup/);
  });
});

// first test → tests the "happy path" (successful login → user is redirected → dashboard shows welcome message)
// second test → tests the "negative path" (invalid login → error message shown → user stays on login page)
// third test → tests navigation flow (link from login → navigates user to signup page)

// overall: these 3 tests cover the main functionality of the login page:
//    1. successful login
//    2. failed login
//    3. navigation to signup