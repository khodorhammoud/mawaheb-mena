/*
this file defines the ACTUAL TEST CASES for the employer dashboard, including:
 - the page object files (POM) → used to log in before every test
 - (no fixture used here since login is handled manually inside beforeEach)

✅ It uses direct Page Object instantiation for the LoginPage
✅ Tests focus on employer features like:
   - creating job postings
   - viewing received applications
*/

// ✅ Import Playwright's `test` and `expect` directly from @playwright/test
// → we don't use the auth.fixture here — we login manually in each test setup
import { test, expect } from '@playwright/test';

// ✅ Import LoginPage Page Object → used to perform login
import { LoginPage } from '../pages/login.page';

// ✅ Group tests under "Employer job posting" → useful for organizing + reports
test.describe('Employer job posting', () => {

  // ✅ Setup → runs before every test inside this group
  // → Logs in as employer using LoginPage class
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page); // create LoginPage helper instance
    await loginPage.goto(); // navigate to login page
    await loginPage.login('employer@example.com', 'password123'); // perform login with known employer credentials

    // ✅ Assert → after login, user should be on dashboard page
    await expect(page).toHaveURL(/dashboard/);
  });

  // ✅ First test → checks that employer can create a job posting
  test('can create a new job posting', async ({ page }) => {
    // ✅ Navigate to job posting form
    await page.getByRole('link', { name: /post a job/i }).click();

    // ✅ Fill out form fields
    await page.getByLabel('Job Title').fill('Senior Frontend Developer');
    await page.getByLabel('Description').fill('We are looking for a senior frontend developer...');

    // ✅ Select multiple required skills
    await page.getByRole('combobox', { name: /skills/i }).click(); // open skill dropdown
    await page.getByRole('option', { name: /react/i }).click();    // select "React"
    await page.getByRole('option', { name: /typescript/i }).click(); // select "TypeScript"
    await page.press('body', 'Escape'); // close dropdown (Escape key)

    // ✅ Set salary range
    await page.getByLabel('Minimum Salary').fill('5000');
    await page.getByLabel('Maximum Salary').fill('8000');

    // ✅ Submit the job form
    await page.getByRole('button', { name: /publish job/i }).click();

    // ✅ Assert → check for success message and redirection
    await expect(page.getByText(/job posted successfully/i)).toBeVisible(); // confirmation appears
    await expect(page).toHaveURL(/jobs/); // redirected to job listings
  });

  // ✅ Second test → checks that employer can view applications for a job
  test('can view applications for a job', async ({ page }) => {
    // ✅ Navigate to employer's job listings
    await page.getByRole('link', { name: /my jobs/i }).click();

    // ✅ Click the first job's "View Applications" button
    await page.getByRole('link', { name: /view applications/i }).first().click();

    // ✅ Assert → applications should be visible
    await expect(page.getByText(/applications received/i)).toBeVisible(); // title/heading appears
    await expect(page.locator('.application-card')).toBeVisible(); // at least one application card shows up
  });
});

// ✅ first test → tests the "job creation path" (fill job form → publish → see success message)
// ✅ second test → tests the "application review path" (open job → view candidates who applied)

// ✅ overall: these 2 tests cover the main employer dashboard functionality:
//    1. posting jobs   
//    2. viewing received applications
// → all tests begin with login setup and assert key UI interactions
