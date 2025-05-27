/*
In this file, we are creating our custom test, and we wil give it access to homePage, loginPage, and authenticationPage,
without the need to rewrite a function that checks login every time, and these staff
*/

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';

// ✅ Define the type for our custom fixtures
type AuthFixtures = {
  loginPage: LoginPage; // fixture for LoginPage instance
  homePage: HomePage; // fixture for HomePage instance
  authenticatedPage: any; // fixture that will return a page already logged in
};

  
export const test = base.extend<AuthFixtures>({

  // ✅ Define the "loginPage" fixture
  //    → whenever a test asks for "loginPage", this code will run
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page)); // → create LoginPage object and provide it to the test
  },

  // ✅ Define the "homePage" fixture
  //    → whenever a test asks for "homePage", this code will run
  homePage: async ({ page }, use) => {
    await use(new HomePage(page)); // → create HomePage object and provide it to the test
  },
    
  // ✅ Define the "authenticatedPage" fixture
  //    → this fixture will log in the user BEFORE giving the page to the test
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page); // → create LoginPage helper
    await loginPage.goto(); // → navigate to the login page
    await loginPage.login('test@example.com', 'password123'); // → log in with test user
    await page.waitForSelector('.dashboard'); // → wait for dashboard element to confirm login success
    await use(page); // → provide the already-logged-in page to the test
  },
});
  
// ✅ Re-export Playwright's expect function
// → so tests that import this file can also use expect without separate import
export { expect } from '@playwright/test';


// ✅ instead of using that:
/*
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('test@example.com', 'password123');
await page.waitForSelector('.dashboard');
const homePage = new HomePage(page);
*/

// we will use that:
/*
test('user sees dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('.dashboard')).toBeVisible();
});
*/

// ⚠️ When your app has 100+ tests → and many of them need to login →
// → do you want to copy/paste login code in every test?
// ❌ → NO.
// ✅ → we abstract it → write it ONCE → inject it → that’s what fixture does.