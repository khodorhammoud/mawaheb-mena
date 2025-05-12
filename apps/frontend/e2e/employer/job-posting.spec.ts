import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Employer job posting', () => {
  // Setup: Log in as an employer before each test
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('employer@example.com', 'password123');
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('can create a new job posting', async ({ page }) => {
    // Navigate to job creation page
    await page.getByRole('link', { name: /post a job/i }).click();
    
    // Fill out job details
    await page.getByLabel('Job Title').fill('Senior Frontend Developer');
    await page.getByLabel('Description').fill('We are looking for a senior frontend developer...');
    
    // Select skills required
    await page.getByRole('combobox', { name: /skills/i }).click();
    await page.getByRole('option', { name: /react/i }).click();
    await page.getByRole('option', { name: /typescript/i }).click();
    await page.press('body', 'Escape');
    
    // Set salary range
    await page.getByLabel('Minimum Salary').fill('5000');
    await page.getByLabel('Maximum Salary').fill('8000');
    
    // Submit the form
    await page.getByRole('button', { name: /publish job/i }).click();
    
    // Verify success message and navigation
    await expect(page.getByText(/job posted successfully/i)).toBeVisible();
    await expect(page).toHaveURL(/jobs/);
  });
  
  test('can view applications for a job', async ({ page }) => {
    // Navigate to job listings
    await page.getByRole('link', { name: /my jobs/i }).click();
    
    // Click on a job with applications
    await page.getByRole('link', { name: /view applications/i }).first().click();
    
    // Verify applications are visible
    await expect(page.getByText(/applications received/i)).toBeVisible();
    await expect(page.locator('.application-card')).toBeVisible();
  });
});
