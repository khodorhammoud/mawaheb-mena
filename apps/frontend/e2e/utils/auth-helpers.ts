// Authentication helpers for e2e tests
// This file provides utilities for creating authenticated sessions for different user types
// Supports both employer and freelancer authentication for testing protected routes

import { Page } from '@playwright/test';
import { generateEmployer, generateFreelancer } from './test-data';

export interface AuthenticatedUser {
  email: string;
  password: string;
  userType: 'employer' | 'freelancer';
}

// Create and authenticate a NON-ONBOARDED employer user session for onboarding tests
export async function createAuthenticatedEmployer(
  page: Page,
  maxRetries: number = 3
): Promise<AuthenticatedUser> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Creating non-onboarded employer for onboarding tests... (Attempt ${attempt}/${maxRetries})`
      );

      // Create a fresh employer user who is NOT onboarded (for onboarding tests)
      const employer = generateEmployer();
      const password = 'TestPassword123!';

      return await createEmployerWithRetry(page, employer, password);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        console.log(`Retrying in 2 seconds...`);
        await page.waitForTimeout(2000);
      }
    }
  }

  throw new Error(
    `Failed to create authenticated employer after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

async function createEmployerWithRetry(
  page: Page,
  employer: any,
  password: string
): Promise<AuthenticatedUser> {
  console.log(`Attempting to create employer: ${employer.email}`);

  // Navigate to employer signup
  await page.goto('/signup-employer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-employer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(employer.email);
  await signupForm.getByLabel('First Name').fill('Test');
  await signupForm.getByLabel('Last Name').fill('Employer');

  // Fill password fields using keyboard input for controlled components
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').check();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();

  // Wait for signup to complete
  await page.waitForTimeout(4000);

  // After signup, we need to manually login (signup doesn't auto-login)
  console.log('Signup completed, now logging in...');

  // Navigate to login page
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Find and fill the login form
  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });

  console.log(`Attempting login with email: ${employer.email}`);
  await loginForm.getByLabel('Email Address').fill(employer.email);
  await loginForm.getByLabel('Password').fill(password);

  // Submit the login form
  const continueButton = loginForm.getByRole('button', { name: 'Continue', exact: true });
  await continueButton.click();

  // Wait for login to complete and check result
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log(`After login attempt, current URL: ${currentUrl}`);

  // Check if login was successful (should not be on login page anymore)
  if (currentUrl.includes('/login')) {
    console.error('Login failed - still on login page');
    // Check for error messages with timeout
    try {
      const errorMessage = await page
        .locator('.error, [role="alert"], .text-red-500')
        .textContent({ timeout: 2000 });
      if (errorMessage) {
        console.error(`Login error message: ${errorMessage}`);
      }
    } catch (error) {
      console.warn('No error message found on login page');
    }
    // Throw error to fail the test if login fails
    throw new Error(`Login failed for ${employer.email}. Still on login page: ${currentUrl}`);
  } else {
    console.log('Login successful - redirected away from login page');
  }

  return {
    email: employer.email,
    password: password,
    userType: 'employer',
  };
}

// Create and authenticate a freelancer user session
export async function createAuthenticatedFreelancer(page: Page): Promise<AuthenticatedUser> {
  const freelancer = generateFreelancer();
  const password = 'VeryStrongPassword123!@#';

  // Navigate to freelancer signup
  await page.goto('/signup-freelancer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-freelancer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(freelancer.email);
  await signupForm.getByLabel('First Name').fill('Test');
  await signupForm.getByLabel('Last Name').fill('Freelancer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 1 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 1 });

  // Accept terms
  await signupForm.locator('#termsAccepted').check();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();

  // Wait for signup to complete
  await page.waitForTimeout(3000);

  // If not automatically logged in, perform login
  if (await page.locator('form[action*="login"]').isVisible()) {
    await page.getByLabel('Email Address').fill(freelancer.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForTimeout(2000);
  }

  return {
    email: freelancer.email,
    password: password,
    userType: 'freelancer',
  };
}

// Login with existing credentials
export async function loginUser(
  page: Page,
  email: string,
  password: string,
  userType: 'employer' | 'freelancer'
) {
  const loginUrl = userType === 'employer' ? '/login-employer' : '/login-freelancer';

  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });

  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();

  // Wait for login to complete
  await page.waitForTimeout(2000);
}

// Logout user
export async function logoutUser(page: Page) {
  // Try UI logout first
  const logoutButton = page
    .getByRole('link', { name: /logout|sign out/i })
    .or(page.getByRole('button', { name: /logout|sign out/i }));

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Fallback to API logout
    await page.evaluate(() => fetch('/auth/logout', { method: 'POST' }));
  }

  await page.waitForTimeout(1000);
}

// Create and authenticate using a pre-seeded employer (already onboarded)
export async function createSeededEmployer(page: Page): Promise<AuthenticatedUser> {
  // Use seeded test employer from the database (from seeder.ts) - already onboarded
  const email = 'employer1@example.com';
  const password = '123'; // Password from seeder.ts

  console.log('Authenticating with seeded employer credentials...');

  // Navigate to employer login page
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });

  // Wait for page to load
  await page.waitForTimeout(1000);

  // Find and fill the login form
  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });

  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);

  // Submit login form
  const continueButton = loginForm.getByRole('button', { name: 'Continue', exact: true });
  await continueButton.click();

  // Wait for login to complete and redirect
  await page.waitForTimeout(3000);

  console.log(`Seeded employer authenticated. Current URL: ${page.url()}`);

  return {
    email: email,
    password: password,
    userType: 'employer',
  };
}

// Check if user is authenticated by trying to access a protected route
export async function isAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  return page.url().includes('/dashboard');
}
