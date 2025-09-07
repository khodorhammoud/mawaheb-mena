// Authentication setup for E2E tests - creates reliable authentication sessions
// Uses existing seeded users to avoid signup/login flakiness

import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auth files for different user types
const employerAuthFile = path.join(__dirname, '.auth/employer.json');
const freelancerAuthFile = path.join(__dirname, '.auth/freelancer.json');

// Setup 1: Create employer session using seeded user
setup('authenticate as employer', async ({ page }) => {
  console.log('🔐 Setting up employer authentication using seeded user...');

  // Use seeded employer from database (reliable, no signup needed)
  const email = 'employer1@example.com';
  const password = '123'; // From seeder.ts

  console.log(`Logging in with seeded employer: ${email}`);

  // Navigate to login page
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Fill login form
  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Verify login success
  const currentUrl = page.url();
  console.log(`After employer login: ${currentUrl}`);

  // For seeded users, they might redirect to dashboard (already onboarded)
  // This is fine - we just need the authentication state
  if (currentUrl.includes('/login')) {
    throw new Error(`Employer login failed. Still on login page: ${currentUrl}`);
  }

  console.log(`✅ Employer authenticated successfully: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: employerAuthFile });

  // Save employer credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/employer-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'employer',
        isSeeded: true,
        note: 'This is a seeded user from the database',
      },
      null,
      2
    )
  );

  console.log('💾 Employer authentication state saved');
});

// Setup 2: Create freelancer session using seeded user
setup('authenticate as freelancer', async ({ page }) => {
  console.log('🔐 Setting up freelancer authentication using seeded user...');

  // Use seeded freelancer from database (reliable, no signup needed)
  const email = 'freelancer1@example.com';
  const password = '123'; // From seeder.ts

  console.log(`Logging in with seeded freelancer: ${email}`);

  // Navigate to login page
  await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Fill login form
  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Verify login success
  const currentUrl = page.url();
  console.log(`After freelancer login: ${currentUrl}`);

  // For seeded users, they might redirect to dashboard (already onboarded)
  // This is fine - we just need the authentication state
  if (currentUrl.includes('/login')) {
    throw new Error(`Freelancer login failed. Still on login page: ${currentUrl}`);
  }

  console.log(`✅ Freelancer authenticated successfully: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: freelancerAuthFile });

  // Save freelancer credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/freelancer-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'freelancer',
        isSeeded: true,
        note: 'This is a seeded user from the database',
      },
      null,
      2
    )
  );

  console.log('💾 Freelancer authentication state saved');
});
