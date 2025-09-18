import { expect, test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { db } from '@mawaheb/db/server';
import { accountsTable, UsersTable } from '@mawaheb/db';
import { eq, sql } from 'drizzle-orm';
import { AccountType } from '@mawaheb/db/enums';

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Where to write storage states
const authDir = path.join(__dirname, '..', '.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

const employerDeactivatedFile = path.join(authDir, 'employer-deactivated.json');
const freelancerDeactivatedFile = path.join(authDir, 'freelancer-deactivated.json');

const employerCredsFile = path.join(authDir, 'employer-deactivated-credentials.json');
const freelancerCredsFile = path.join(authDir, 'freelancer-deactivated-credentials.json');

// Use dedicated seeded users for this (recommended to avoid side effects)
const EMPLOYER_EMAIL = 'employer-deactivated-e2e@example.com';
const FREELANCER_EMAIL = 'freelancer-deactivated-e2e@example.com';
const PASSWORD = '123';

async function enforceUserState(email: string, mustBe: 'Employer' | 'Freelancer') {
  const user = await db.query.UsersTable.findFirst({ where: eq(UsersTable.email, email) });
  if (!user) throw new Error(`Seeded user not found: ${email}`);

  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, user.id),
  });
  if (!account) throw new Error(`Account row missing for user ${user.id} (${email})`);

  const expectedType = mustBe === 'Employer' ? AccountType.Employer : AccountType.Freelancer;

  if (account.accountType !== expectedType) {
    throw new Error(`Account for ${email} is not ${mustBe} (got ${account.accountType})`);
  }

  // Ensure is_onboarded = true
  if (!user.isOnboarded) {
    await db.execute(sql`update "users" set "is_onboarded" = true where "id" = ${user.id}`);
  }

  // Ensure account_status = 'deactivated'
  // (Using raw string keeps it simple regardless of enum mapping.)
  await db.execute(sql`
    update "accounts"
       set "account_status" = ${'deactivated'}
     where "id" = ${account.id}
  `);

  return { userId: user.id, accountId: account.id };
}

async function loginAndSave(page, loginPath: string, email: string, statePath: string) {
  await page.goto(loginPath, { waitUntil: 'domcontentloaded' });
  // Use more specific selector to avoid footer email field
  await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
  await page.getByLabel(/password/i).fill(PASSWORD);
  // Target the main login button specifically - it's the first button in the main form
  await page.locator('form:has(input[name="email"]) button[type="submit"]').first().click();
  // Don’t assert dashboard here; deactivated may redirect/bounce. Just ensure not stuck on login.
  await expect(page).not.toHaveURL(/\/login/i);
  await page.context().storageState({ path: statePath });
}

setup('authenticate as EMPLOYER (DEACTIVATED)', async ({ page }) => {
  await enforceUserState(EMPLOYER_EMAIL, 'Employer');
  await loginAndSave(page, '/login-employer', EMPLOYER_EMAIL, employerDeactivatedFile);
  await writeFile(
    employerCredsFile,
    JSON.stringify(
      {
        email: EMPLOYER_EMAIL,
        password: PASSWORD,
        userType: 'employer',
        state: 'deactivated',
        note: 'is_onboarded=true, account_status=deactivated',
      },
      null,
      2
    )
  );
  console.log('💾 employer deactivated state saved:', employerDeactivatedFile);
});

setup('authenticate as FREELANCER (DEACTIVATED)', async ({ page }) => {
  await enforceUserState(FREELANCER_EMAIL, 'Freelancer');
  await loginAndSave(page, '/login-freelancer', FREELANCER_EMAIL, freelancerDeactivatedFile);
  await writeFile(
    freelancerCredsFile,
    JSON.stringify(
      {
        email: FREELANCER_EMAIL,
        password: PASSWORD,
        userType: 'freelancer',
        state: 'deactivated',
        note: 'is_onboarded=true, account_status=deactivated',
      },
      null,
      2
    )
  );
  console.log('💾 freelancer deactivated state saved:', freelancerDeactivatedFile);
});
