/*
this file defines the ACTUAL TEST CASES for the signup, using:
 - the page object files (POM) → defined the TOOLS (methods + selectors)
 - (no fixture here because signup doesn’t need pre-injected helpers like loginPage)
*/

// ✅ Import Playwright's `test` and `expect` directly from @playwright/test
// → we don't import from auth.fixture since we don't need injected loginPage/homePage here
import { test, expect } from '@playwright/test';

// ✅ Import HomePage Page Object → used to navigate from home to signup pages
import { HomePage } from '../pages/home.page';

// ✅ Group tests under "Signup flows" → useful for organizing + reports
test.describe('Signup flows', () => {

  // ✅ First test → checks freelancer signup process
  test('freelancer signup process', async ({ page }) => {
    const homePage = new HomePage(page); // create HomePage helper instance
    await homePage.goto(); // navigate to home page
    await homePage.navigateToFreelancerSignup(); // click "Signup as Freelancer" link

    // ✅ Fill out signup form
    await page.getByLabel('Full Name').fill('Test Freelancer'); // fill name field
    await page.getByLabel('Email').fill(`test-freelancer-${Date.now()}@example.com`); // generate unique email
    await page.getByLabel('Password').fill('Password123!'); // enter password
    await page.getByLabel('Confirm Password').fill('Password123!'); // confirm password

    await page.getByRole('button', { name: /sign up/i }).click(); // click "Sign Up" button

    // ✅ Assert → after signup, user redirected to verification page
    await expect(page).toHaveURL(/verification-sent/); // URL should contain "verification-sent"
    await expect(page.getByText(/verification email/i)).toBeVisible(); // confirmation message should appear
  });

  // ✅ Second test → checks employer signup process
  test('employer signup process', async ({ page }) => {
    const homePage = new HomePage(page); // create HomePage helper instance
    await homePage.goto(); // navigate to home page
    await homePage.navigateToEmployerSignup(); // click "Signup as Employer" link

    // ✅ Fill out signup form
    await page.getByLabel('Company Name').fill('Test Company'); // fill company name
    await page.getByLabel('Email').fill(`test-employer-${Date.now()}@example.com`); // generate unique email
    await page.getByLabel('Password').fill('Password123!'); // enter password
    await page.getByLabel('Confirm Password').fill('Password123!'); // confirm password

    await page.getByRole('button', { name: /sign up/i }).click(); // click "Sign Up" button

    // ✅ Assert → after signup, user redirected to verification page
    await expect(page).toHaveURL(/verification-sent/); // URL should contain "verification-sent"
    await expect(page.getByText(/verification email/i)).toBeVisible(); // confirmation message should appear
  });
});

// ✅ first test → tests the "freelancer signup path" (user signs up as freelancer → redirected → sees confirmation)
// ✅ second test → tests the "employer signup path" (user signs up as employer → redirected → sees confirmation)

// ✅ overall: these 2 tests cover the main signup page functionality:
//    1. successful signup as freelancer
//    2. successful signup as employer
// → both check: navigation to signup form → form submission → confirmation page
