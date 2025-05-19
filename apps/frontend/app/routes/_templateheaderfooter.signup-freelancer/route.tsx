import { test, expect } from '@playwright/test';
import { generateFreelancer } from '../utils/test-data'; // Use your real function!

test.describe('Freelancer Signup Flow', () => {
  test('signs up a new freelancer successfully', async ({ page }) => {
    const freelancer = generateFreelancer();

    await page.goto('/signup-freelancer');

    await page.getByLabel(/Email Address/i).fill(freelancer.email);
    await page.getByLabel(/First Name/i).fill('Freela');
    await page.getByLabel(/Last Name/i).fill('Tester');
    await page.getByLabel(/Password/i).fill(freelancer.password);

    // Accept terms checkbox
    await page.getByLabel(/I accept the terms/i).check();

    // Click the *first* "Continue" button (not the Google button)
    await page.getByRole('button', { name: /^Continue$/ }).click();

    // Wait for the success message
    await expect(page.getByText(/A verification email has been sent to you/i)).toBeVisible({
      timeout: 60_000,
    });
  });

  test('should show validation errors for missing fields', async ({ page }) => {
    await page.goto('/signup-freelancer');

    await page.getByLabel(/I accept the terms/i).click({ force: true });

    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page.getByText(/Email Address is required/i)).toBeVisible();
    await expect(page.getByText(/First Name is required/i)).toBeVisible();
    await expect(page.getByText(/Last Name is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page }) => {
    const freelancer = generateFreelancer();

    // First, sign up
    await page.goto('/signup-freelancer');
    await page.getByLabel(/Email Address/i).fill(freelancer.email);
    await page.getByLabel(/First Name/i).fill('Dup');
    await page.getByLabel(/Last Name/i).fill('User');
    await page.getByLabel(/Password/i).fill(freelancer.password);
    await page.getByLabel(/I accept the terms/i).check();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByText(/A verification email has been sent/i)).toBeVisible();

    // Try to sign up again with the same email
    await page.goto('/signup-freelancer');
    await page.getByLabel(/Email Address/i).fill(freelancer.email);
    await page.getByLabel(/First Name/i).fill('Dup');
    await page.getByLabel(/Last Name/i).fill('User');
    await page.getByLabel(/Password/i).fill(freelancer.password);
    await page.getByLabel(/I accept the terms/i).check();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.locator('div.bg-red-100')).toHaveText(/already registered/i);
  });
});
