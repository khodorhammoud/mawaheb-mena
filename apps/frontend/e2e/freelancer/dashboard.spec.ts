/*
this file defines the ACTUAL TEST CASES for the freelancer dashboard, including:
 - logging in before each test (with manual login using Page Object)
 - testing navigation to profile and jobs sections
 - testing interaction: applying for a job

✅ This test doesn't use fixtures → it uses direct Page Object instantiation
✅ Login is performed manually in `beforeEach()` block for all tests
*/

import { test, expect } from '@playwright/test'; // ✅ import standard Playwright testing functions
import { LoginPage } from '../pages/login.page'; // ✅ import the Page Object for login functionality

// ✅ Grouping all tests under "Freelancer dashboard"
test.describe('Freelancer dashboard', () => {

  // ✅ beforeEach: runs before each test
  // Used to log in as a freelancer before every test in this group
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page); // create LoginPage helper
    await loginPage.goto(); // navigate to /login
    await loginPage.login('freelancer@example.com', 'password123'); // perform login

    // ✅ make sure user was redirected to dashboard after login
    await expect(page).toHaveURL(/dashboard/);
  });

  // ✅ Test 1: Check if freelancer can access their profile page
  test('can view profile', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click(); // click "Profile" link
    await expect(page).toHaveURL(/profile/); // URL should contain /profile
    await expect(page.getByText(/personal information/i)).toBeVisible(); // page should show "Personal Information" section
  });
  
  // ✅ Test 2: Check if freelancer can view job listings
  test('can browse job listings', async ({ page }) => {
    await page.getByRole('link', { name: /jobs/i }).click(); // click "Jobs" in the sidebar/header
    await expect(page).toHaveURL(/jobs/); // URL should contain /jobs
    await expect(page.getByText(/available jobs/i)).toBeVisible(); // should see "Available Jobs" heading or similar
  });

  // ✅ Test 3: Check if freelancer can apply to a job
  test('can apply for a job', async ({ page }) => {
    await page.getByRole('link', { name: /jobs/i }).click(); // go to jobs listing page

    await page.getByRole('link', { name: /view job/i }).first().click(); // click the first "View Job" button/link
    
    await page.getByRole('button', { name: /apply/i }).click(); // click "Apply" button on job detail page

    await page.getByLabel('Cover Letter').fill('I am interested in this position...'); // fill in cover letter

    await page.getByRole('button', { name: /submit application/i }).click(); // click "Submit Application"

    await expect(page.getByText(/application submitted/i)).toBeVisible(); // check success message
  });
});
