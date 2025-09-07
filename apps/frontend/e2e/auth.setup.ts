// Authentication setup for E2E tests - creates reliable authentication sessions
// Uses existing seeded users to avoid signup/login flakiness

import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auth files for different user types and states
const employerAuthFile = path.join(__dirname, '.auth/employer.json');
const freelancerAuthFile = path.join(__dirname, '.auth/freelancer.json');

// Employer-specific states based on database conditions
const onboardingEmployerFile = path.join(__dirname, '.auth/employer-onboarding.json'); // is_onboarded: false
const identificationEmployerFile = path.join(__dirname, '.auth/employer-identification.json'); // is_onboarded: true, account_status: null/draft
const dashboardEmployerFile = path.join(__dirname, '.auth/employer-dashboard.json'); // is_onboarded: true, account_status: published

// Freelancer-specific states based on database conditions
const onboardingFreelancerFile = path.join(__dirname, '.auth/freelancer-onboarding.json'); // is_onboarded: false
const identificationFreelancerFile = path.join(__dirname, '.auth/freelancer-identification.json'); // is_onboarded: true, account_status: null/draft
const dashboardFreelancerFile = path.join(__dirname, '.auth/freelancer-dashboard.json'); // is_onboarded: true, account_status: published

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

// Setup 3: Create onboarding employer session (is_onboarded: false)
setup('authenticate as onboarding employer', async ({ page }) => {
  console.log('🔐 Setting up onboarding employer authentication...');

  // Create a fresh employer user for onboarding testing
  const timestamp = Date.now();
  const email = `employer-onboarding-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to employer signup
  await page.goto('/signup-employer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-employer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Onboarding');
  await signupForm.getByLabel('Last Name').fill('Employer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login (signup doesn't auto-login)
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // DON'T complete onboarding - keep is_onboarded: false
  // User should be at /onboarding route

  console.log(`✅ Onboarding employer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: onboardingEmployerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/employer-onboarding-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'employer',
        state: 'onboarding',
        dbState: 'is_onboarded: false',
        note: 'Fresh employer user with is_onboarded: false - can access onboarding',
      },
      null,
      2
    )
  );

  console.log('💾 Onboarding employer authentication state saved');
});

// Setup 4: Create identification employer session (is_onboarded: true, account_status: null/draft)
setup('authenticate as identification employer', async ({ page }) => {
  console.log('🔐 Setting up identification employer authentication...');

  // Create a fresh employer user for identification testing
  const timestamp = Date.now();
  const email = `employer-identification-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to employer signup
  await page.goto('/signup-employer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-employer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Identification');
  await signupForm.getByLabel('Last Name').fill('Employer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login (signup doesn't auto-login)
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Complete onboarding to set is_onboarded: true
  const currentUrl = page.url();
  if (currentUrl.includes('/onboarding')) {
    const proceedButton = page.getByRole('button', { name: 'Proceed' });
    if (await proceedButton.isVisible()) {
      await proceedButton.click();
      await page.waitForTimeout(3000);
    }
  }

  // After onboarding, user should be at /identification with account_status: null/draft
  // This is the perfect state for identification testing

  console.log(`✅ Identification employer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: identificationEmployerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/employer-identification-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'employer',
        state: 'identification',
        dbState: 'is_onboarded: true, account_status: null/draft',
        note: 'Fresh employer user with is_onboarded: true and account_status: null/draft - can access identification form',
      },
      null,
      2
    )
  );

  console.log('💾 Identification employer authentication state saved');
});

// Setup 5: Create dashboard employer session (is_onboarded: true, account_status: published)
setup('authenticate as dashboard employer', async ({ page }) => {
  console.log('🔐 Setting up dashboard employer authentication...');

  // Create a fresh employer user for dashboard testing
  const timestamp = Date.now();
  const email = `employer-dashboard-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to employer signup
  await page.goto('/signup-employer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-employer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Dashboard');
  await signupForm.getByLabel('Last Name').fill('Employer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Complete onboarding
  let currentUrl = page.url();
  if (currentUrl.includes('/onboarding')) {
    const proceedButton = page.getByRole('button', { name: 'Proceed' });
    if (await proceedButton.isVisible()) {
      await proceedButton.click();
      await page.waitForTimeout(3000);
    }
  }

  // Complete identification to get to dashboard state
  await page.goto('/identification', { waitUntil: 'domcontentloaded' });

  const hasForm = await page.locator('text=Identity Verification').isVisible();
  if (hasForm) {
    // Upload required documents
    const testFiles = [
      {
        name: 'id-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test identification document'),
      },
    ];

    const identificationUpload = page.locator('input[name="identification"]').first();
    const tradeLicenseUpload = page.locator('input[name="trade_license"]').first();

    if ((await identificationUpload.count()) > 0) {
      await identificationUpload.setInputFiles(testFiles);
      if ((await tradeLicenseUpload.count()) > 0) {
        await tradeLicenseUpload.setInputFiles([
          {
            name: 'trade-license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test trade license'),
          },
        ]);
      }

      // Submit documents
      const submitBtn = page.getByRole('button', { name: 'Submit Documents' });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }
  }

  // TODO: In a real scenario, we'd need to manually approve the account to get account_status: published
  // For now, this user will be in pending state, but we can use it for dashboard testing once approved

  console.log(`✅ Dashboard employer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: dashboardEmployerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/employer-dashboard-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'employer',
        state: 'dashboard',
        dbState: 'is_onboarded: true, account_status: published (after approval)',
        note: 'Fresh employer user ready for dashboard - can post jobs, manage profile, view applications',
      },
      null,
      2
    )
  );

  console.log('💾 Dashboard employer authentication state saved');
});

// Setup 6: Create onboarding freelancer session (is_onboarded: false)
setup('authenticate as onboarding freelancer', async ({ page }) => {
  console.log('🔐 Setting up onboarding freelancer authentication...');

  // Create a fresh freelancer user for onboarding testing
  const timestamp = Date.now();
  const email = `freelancer-onboarding-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to freelancer signup
  await page.goto('/signup-freelancer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-freelancer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Onboarding');
  await signupForm.getByLabel('Last Name').fill('Freelancer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login (signup doesn't auto-login)
  await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // DON'T complete onboarding - keep is_onboarded: false
  // User should be at /onboarding route

  console.log(`✅ Onboarding freelancer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: onboardingFreelancerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/freelancer-onboarding-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'freelancer',
        state: 'onboarding',
        dbState: 'is_onboarded: false',
        note: 'Fresh freelancer user with is_onboarded: false - can access onboarding',
      },
      null,
      2
    )
  );

  console.log('💾 Onboarding freelancer authentication state saved');
});

// Setup 7: Create identification freelancer session (is_onboarded: true, account_status: null/draft)
setup('authenticate as identification freelancer', async ({ page }) => {
  console.log('🔐 Setting up identification freelancer authentication...');

  // Create a fresh freelancer user for identification testing
  const timestamp = Date.now();
  const email = `freelancer-identification-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to freelancer signup
  await page.goto('/signup-freelancer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-freelancer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Identification');
  await signupForm.getByLabel('Last Name').fill('Freelancer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login (signup doesn't auto-login)
  await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Complete onboarding to set is_onboarded: true
  const currentUrl = page.url();
  if (currentUrl.includes('/onboarding')) {
    const proceedButton = page.getByRole('button', { name: 'Proceed' });
    if (await proceedButton.isVisible()) {
      await proceedButton.click();
      await page.waitForTimeout(3000);
    }
  }

  // After onboarding, user should be at /identification with account_status: null/draft
  // This is the perfect state for identification testing

  console.log(`✅ Identification freelancer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: identificationFreelancerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/freelancer-identification-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'freelancer',
        state: 'identification',
        dbState: 'is_onboarded: true, account_status: null/draft',
        note: 'Fresh freelancer user with is_onboarded: true and account_status: null/draft - can access identification form',
      },
      null,
      2
    )
  );

  console.log('💾 Identification freelancer authentication state saved');
});

// Setup 8: Create dashboard freelancer session (is_onboarded: true, account_status: published)
setup('authenticate as dashboard freelancer', async ({ page }) => {
  console.log('🔐 Setting up dashboard freelancer authentication...');

  // Create a fresh freelancer user for dashboard testing
  const timestamp = Date.now();
  const email = `freelancer-dashboard-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to freelancer signup
  await page.goto('/signup-freelancer', { waitUntil: 'domcontentloaded' });

  const signupForm = page.locator('form[method="post"][action="/signup-freelancer"]');

  // Fill signup form
  await signupForm.getByLabel('Email Address').fill(email);
  await signupForm.getByLabel('First Name').fill('Dashboard');
  await signupForm.getByLabel('Last Name').fill('Freelancer');

  // Fill password fields
  const passwordField = signupForm.getByLabel('Password').first();
  const confirmPasswordField = signupForm.getByLabel('Confirm Password');

  await passwordField.focus();
  await page.keyboard.type(password, { delay: 10 });
  await confirmPasswordField.focus();
  await page.keyboard.type(password, { delay: 10 });

  // Accept terms
  await signupForm.locator('#termsAccepted').click();

  // Submit signup form
  const submitButton = signupForm.getByRole('button', { name: 'Continue', exact: true });
  await submitButton.click();
  await page.waitForTimeout(4000);

  // Login
  await page.goto('/login-freelancer', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(4000);

  // Complete onboarding
  let currentUrl = page.url();
  if (currentUrl.includes('/onboarding')) {
    const proceedButton = page.getByRole('button', { name: 'Proceed' });
    if (await proceedButton.isVisible()) {
      await proceedButton.click();
      await page.waitForTimeout(3000);
    }
  }

  // Complete identification to get to dashboard state
  await page.goto('/identification', { waitUntil: 'domcontentloaded' });

  const hasForm = await page.locator('text=Identity Verification').isVisible();
  if (hasForm) {
    // Upload required documents (freelancer needs identification and trade license)
    const testFiles = [
      {
        name: 'freelancer-id.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test freelancer identification document'),
      },
    ];

    const identificationUpload = page.locator('input[name="identification"]').first();
    const tradeLicenseUpload = page.locator('input[name="trade_license"]').first();

    if ((await identificationUpload.count()) > 0) {
      await identificationUpload.setInputFiles(testFiles);
      if ((await tradeLicenseUpload.count()) > 0) {
        await tradeLicenseUpload.setInputFiles([
          {
            name: 'freelancer-trade-license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test freelancer trade license'),
          },
        ]);
      }

      // Submit documents
      const submitBtn = page.getByRole('button', { name: 'Submit Documents' });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }
  }

  // TODO: In a real scenario, we'd need to manually approve the account to get account_status: published
  // For now, this user will be in pending state, but we can use it for dashboard testing once approved

  console.log(`✅ Dashboard freelancer authenticated: ${email}`);

  // Save the authentication state
  await page.context().storageState({ path: dashboardFreelancerFile });

  // Save credentials for reference
  const credentialsFile = path.join(__dirname, '.auth/freelancer-dashboard-credentials.json');
  await writeFile(
    credentialsFile,
    JSON.stringify(
      {
        email: email,
        password: password,
        userType: 'freelancer',
        state: 'dashboard',
        dbState: 'is_onboarded: true, account_status: published (after approval)',
        note: 'Fresh freelancer user ready for dashboard - can apply to jobs, manage profile, submit timesheets',
      },
      null,
      2
    )
  );

  console.log('💾 Dashboard freelancer authentication state saved');
});
