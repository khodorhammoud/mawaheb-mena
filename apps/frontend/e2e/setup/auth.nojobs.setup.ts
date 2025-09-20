// e2e/setup/auth.nojobs.setup.ts
// Authentication setup for E2E tests - creates a reliable "no-jobs" employer session
// Uses an already-seeded user (employer-e2e@example.com) to avoid signup/login flakiness.

import { expect, test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import { db } from '@mawaheb/db/server';
import { accountsTable, employersTable, UsersTable } from '@mawaheb/db';
import { eq, sql } from 'drizzle-orm';
import { AccountStatus, AccountType } from '@mawaheb/db/enums';

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths (write states into e2e/.auth)
const authDir = path.join(__dirname, '..', '.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

export const employerNoJobsAuthFile = path.join(authDir, 'employer-nojobs.json');
const employerNoJobsCredsFile = path.join(authDir, 'employer-nojobs-credentials.json');

// Setup: Create session for seeded "no-jobs" employer
setup('authenticate as employer (NO JOBS)', async ({ page }) => {
  console.log('🔐 Setting up "no-jobs" employer authentication using seeded user...');

  // Must exist in your seeder.ts
  const email = 'employer-e2e@example.com';
  const password = '123';

  // ── DB guardrails: ensure this user is Employer, onboarded, and published ──
  const user = await db.query.UsersTable.findFirst({ where: eq(UsersTable.email, email) });
  if (!user) throw new Error(`Seeded employer not found for ${email}`);

  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, user.id),
  });
  if (!account) throw new Error(`Account row missing for user ${user.id}`);

  if (account.accountType !== AccountType.Employer) {
    throw new Error(`Account for ${email} is not Employer (got ${account.accountType})`);
  }

  // console.log('🔎 Current DB state (pre-enforcement):', {
  //   userIsOnboarded: user.isOnboarded,
  //   accountStatus: account.accountStatus,
  // });

  // Enforce isOnboarded = true
  if (!user.isOnboarded) {
    await db.execute(sql`update "users" set "is_onboarded" = true where "id" = ${user.id}`);
    console.log('🔧 Set users.isOnboarded = true (raw SQL)');
  }

  // Enforce accountStatus = 'published'
  if (account.accountStatus !== 'published') {
    await db.execute(sql`
      update "accounts"
         set "account_status" = ${'published'}
       where "id" = ${account.id}
    `);
    console.log("🔧 Set accounts.accountStatus = 'published' (raw SQL)");
  } else {
    console.log("ℹ️ accounts.accountStatus already 'published' — no update needed");
  }

  // Resolve employerId (needed if you choose to hard-reset via /e2e/jobs later)
  const emp = await db
    .select({ id: employersTable.id })
    .from(employersTable)
    .where(eq(employersTable.accountId, account.id));
  if (!emp?.[0]) throw new Error(`Employer row missing for account ${account.id}`);
  const employerId = emp[0].id;
  // console.log(`✅ Resolved employerId=${employerId}`);

  // ── Login ──
  await page.goto('/login-employer', { waitUntil: 'domcontentloaded' });
  const loginForm = page.locator('form').filter({ has: page.getByLabel('Email Address') });
  await loginForm.getByLabel('Email Address').fill(email);
  await loginForm.getByLabel('Password').fill(password);
  await loginForm.getByRole('button', { name: 'Continue', exact: true }).click();

  // Landed somewhere valid (dashboard / identification / onboarding)
  await expect(page).not.toHaveURL(/\/login/);
  console.log(`✅ "No-jobs" employer authenticated successfully: ${email}`);

  // ── (Optional) Belt & suspenders: reset this employer's jobs to zero via your test route ──
  // If you want the state guaranteed every time, uncomment this:
  //
  // const res = await page.request.post('/e2e/jobs', { form: { op: 'reset', debug: '1' } });
  // const text = await res.text();
  // if (!res.ok()) throw new Error(`Reset failed: ${res.status()} ${text}`);
  // console.log('♻️ Reset jobs/apps for employer via /e2e/jobs:', text);

  // ── Save storage state ──
  await page.context().storageState({ path: employerNoJobsAuthFile });

  // Save creds for reference
  await writeFile(
    employerNoJobsCredsFile,
    JSON.stringify(
      {
        email,
        password,
        userType: 'employer',
        state: 'no-jobs',
        note: 'Seeded employer intended for No Jobs UI tests. DB guardrails enforce onboarded + published.',
      },
      null,
      2
    )
  );

  console.log('💾 "No-jobs" employer authentication state saved:', employerNoJobsAuthFile);
});
