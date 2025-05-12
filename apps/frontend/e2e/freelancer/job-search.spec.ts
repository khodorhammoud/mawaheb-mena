/*
this file defines the ACTUAL TEST CASES for the freelancer job search functionality, including:
 - the page object files (POM) → used to log in before each test
 - (no fixture here since we manually login and go to jobs page inside beforeEach)

✅ It uses direct Page Object instantiation for the LoginPage
✅ Tests focus on job search actions like:
   - searching by keyword
   - filtering by salary range
   - filtering by required skills
*/

// ✅ Import Playwright's `test` and `expect` directly from @playwright/test
import { test, expect } from '@playwright/test';

// ✅ Import LoginPage Page Object → used to perform login
import { LoginPage } from '../pages/login.page';

// ✅ Group tests under "Job search functionality" → useful for organizing + reports
test.describe('Job search functionality', () => {

  // ✅ Setup → runs before every test in this group
  // → Logs in as freelancer and navigates to the jobs page
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page); // create LoginPage instance
    await loginPage.goto(); // go to login page
    await loginPage.login('freelancer@example.com', 'password123'); // login with test user
    await page.getByRole('link', { name: /jobs/i }).click(); // navigate to jobs section
  });

  // ✅ First test → search jobs by keyword
  test('can search for jobs by keyword', async ({ page }) => {
    await page.getByPlaceholder('Search jobs...').fill('developer'); // type search keyword
    await page.getByRole('button', { name: /search/i }).click(); // click search button

    const jobTitles = page.locator('.job-title'); // locate job title elements

    // ✅ Assert → job results must contain the keyword
    await expect(jobTitles).toContainText(/developer/i);
  });

  // ✅ Second test → filter jobs by salary range
  test('can filter jobs by salary range', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click(); // open filters panel

    await page.getByLabel('Min Salary').fill('4000'); // enter minimum salary
    await page.getByLabel('Max Salary').fill('6000'); // enter maximum salary

    await page.getByRole('button', { name: /apply filters/i }).click(); // apply filters

    // ✅ Assert → results appear (further checks can be added based on how salary is shown)
    await expect(page.locator('.job-card')).toBeVisible();
  });

  // ✅ Third test → filter jobs by skills
  test('can filter jobs by skills', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click(); // open filters panel

    await page.getByRole('checkbox', { name: /react/i }).check(); // check "React" skill

    await page.getByRole('button', { name: /apply filters/i }).click(); // apply filters

    // ✅ Assert → job results should mention "React" in their skills
    await expect(page.locator('.job-skills')).toContainText(/react/i);
  });
});

// ✅ first test → tests "search by keyword" path (freelancer searches "developer" → sees matched jobs)
// ✅ second test → tests "filter by salary" path (freelancer filters jobs by salary range)
// ✅ third test → tests "filter by skills" path (freelancer filters jobs to only show React positions)

// ✅ overall: these 3 tests cover the main search and filtering functionality:
//    1. keyword search
//    2. salary filter
//    3. skill filter
// → all tests start with login + navigation and assert real job result behavior
