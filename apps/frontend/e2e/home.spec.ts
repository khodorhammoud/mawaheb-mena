import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should load the home page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify the page has loaded successfully
    const title = await page.title();
    expect(title).toBeTruthy();

    // This test is primarily to verify the test environment works correctly
    // with the database connection
  });
});
