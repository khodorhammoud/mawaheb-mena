import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  gotoNewJob,
  setEditor,
  expectToast,
  disableNativeValidation,
  fillRequiredBasics,
  selectFirstCategory,
  selectExperience,
  ensureSkill,
  getDashboardCounts,
  expectSelectedVisual,
} from '../pages/new-job.page';

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sessions
const dashboardEmployerFile = path.join(__dirname, '../.auth/employer-dashboard.json');
const dashboardEmployerNoJobsFile = path.resolve(__dirname, '../.auth/employer-nojobs.json');
const onboardingEmployerFile = path.join(__dirname, '../.auth/employer-onboarding.json');
const employerDeactivatedFile = path.join(__dirname, '../.auth/employer-deactivated.json');

test.describe('New Job — Access & Form', () => {
  // test 1 → loads /new-job with all key fields visible
  test.describe('Authorized (published employer)', () => {
    test.use({ storageState: dashboardEmployerFile });

    test('loads /new-job with all key fields visible', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/new-job', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/new-job(?:$|[/?#])/);
      // Heading
      await expect(page.getByRole('heading', { name: 'Job Posting Form' })).toBeVisible();
      // Left column: title + description + counter
      await expect(page.getByLabel('Job Title')).toBeVisible();
      await expect(page.getByText('Job Description')).toBeVisible();
      await expect(page.getByText(/0\s*\/\s*2000 characters/i)).toBeVisible();
      // Right column fields
      await expect(page.getByLabel('Working Hours per week')).toBeVisible();
      await expect(page.getByLabel('Location Preferences')).toBeVisible();
      await expect(page.getByText('Required Skills')).toBeVisible(); // component label
      await expect(page.getByLabel('Project Type')).toBeVisible();
      await expect(page.getByLabel('Budget')).toBeVisible();
      await expect(page.getByLabel('Expected Hourly Rate')).toBeVisible();
      // Job Category section
      const categoryGroup = page.locator('#jobCategory');
      await expect(categoryGroup).toBeVisible();
      const badgeCount = await categoryGroup.locator('.cursor-pointer').count();
      expect(badgeCount, 'At least one job category badge should be rendered').toBeGreaterThan(0);
      // Experience Level section
      await expect(page.getByRole('heading', { name: 'Experience Level' })).toBeVisible();
      await expect(page.getByText('Entry Level')).toBeVisible();
      await expect(page.getByText('Mid Level')).toBeVisible();
      await expect(page.getByText('Expert Level')).toBeVisible();
      // Actions
      await expect(page.getByRole('button', { name: 'Save as Draft' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Post Job' })).toBeVisible();

      console.log('✅ loads /new-job with all key fields visible test passed');
    });
  });

  // test 2 → redirects restricted employers away from /new-job
  test.describe('Restricted (not published employer)', () => {
    test.use({ storageState: onboardingEmployerFile });

    test('redirects restricted employer away from /new-job', async ({ page }) => {
      await page.goto('/new-job', { waitUntil: 'domcontentloaded' });

      // Wait until we land on either /login-employer or /identification
      await page.waitForURL(/\/(?:login-employer|identification)(?:[/?#]|$)/, { timeout: 15000 });

      // Assert we’re not on /new-job anymore
      await expect(page).not.toHaveURL(/\/new-job(?:[/?#]|$)/);

      // Assert target is one of the two accepted routes
      await expect(page).toHaveURL(/\/(?:login-employer|identification)(?:[/?#]|$)/);

      // Optional: sanity-check the destination content
      // if (page.url().includes('/identification')) {
      //   await expect(page.getByRole('heading', { name: /identity verification/i })).toBeVisible();
      // } else {
      //   await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
      // }

      console.log('✅ redirects restricted employer away from /new-job test passed');
    });
  });

  // ======================================
  // SUITE 1: Native HTML5 validations
  // ======================================
  test.describe('New Job — Native required validations', () => {
    test.use({ storageState: dashboardEmployerFile });

    // test 3 → runs all validations sequentially in one flow
    test('empty form → native required on Job Title', async ({ page }) => {
      await gotoNewJob(page);
      await page.getByRole('button', { name: /post job/i }).click();
      // Assert native validity on Job Title
      const { missing, msg } = await page.$eval('#jobTitle', (el: HTMLInputElement) => ({
        missing: el.validity.valueMissing,
        msg: el.validationMessage,
      }));
      expect(missing).toBeTruthy();
      expect(String(msg).length).toBeGreaterThan(0); // e.g. "Please fill out this field."

      console.log('✅ empty form → native required on Job Title test passed');
    });

    // test 4 → fill title → native required moves to Working Hours
    test('fill title → next invalid is among required fields', async ({ page }) => {
      await gotoNewJob(page);
      // Fill only the title and try to submit
      await page.getByLabel('Job Title').fill('Any valid title here');
      await page.getByRole('button', { name: /post job/i }).click();
      // Ensure native validity UI ran (forces constraint validation cycle)
      await page.evaluate(() => {
        const f = document.querySelector('form') as HTMLFormElement | null;
        if (f) f.reportValidity();
      });
      // Collect validity state from the DOM
      const state = await page.evaluate(() => {
        const form = document.querySelector('form') as HTMLFormElement | null;
        const jobTitle = document.getElementById('jobTitle') as HTMLInputElement | null;
        const invalid = form
          ? Array.from(form.querySelectorAll(':invalid')).map(el => {
              const i = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
              return {
                id: i.id || '',
                name: (i as HTMLInputElement).name || '',
                required: (i as HTMLInputElement).required ?? false,
                type: i.getAttribute('type') || i.tagName.toLowerCase(),
                valueMissing: (i as HTMLInputElement).validity?.valueMissing ?? false,
              };
            })
          : [];
        return {
          titleValid: jobTitle ? jobTitle.validity.valid : false,
          invalid,
        };
      });
      // Helpful debug if it ever fails
      console.log('❗ Invalid controls after submit:', state.invalid);
      // 1) Title should now be valid
      expect(state.titleValid).toBeTruthy();
      // 2) At least one remaining invalid control should be one of our required fields
      const requiredIdsOrNames = [
        'workingHours',
        'location',
        'projectType',
        'budget',
        'expectedHourlyRate',
      ];
      const invalidIdsOrNames = state.invalid.map(x => x.id || x.name);
      expect(invalidIdsOrNames.some(v => requiredIdsOrNames.includes(v))).toBeTruthy();

      console.log('✅ fill title → next invalid is among required fields test passed');
    });
    // test 5 → fill title + hours + location → native required on Project Type
    test('fill title + hours + location → native required on Project Type', async ({ page }) => {
      await gotoNewJob(page);
      await page.getByLabel('Job Title').fill('Any valid title here');
      await page.getByLabel('Working Hours per week').fill('40');
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByRole('button', { name: /post job/i }).click();
      const { missing } = await page.$eval('#projectType', (el: HTMLSelectElement) => ({
        missing: el.validity.valueMissing,
      }));
      expect(missing).toBeTruthy();

      console.log('✅ fill title + hours + location → native required on Project Type test passed');
    });
  });

  // ======================================
  // SUITE 2: Custom client-side toasts
  // (Disable native so onSubmit runs)
  // ======================================
  test.describe('New Job — Custom validations (toasts)', () => {
    test.use({ storageState: dashboardEmployerFile });

    // test 6 → title min length (short non-empty)
    test('title min length (short non-empty)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      const urlBefore = page.url();
      await page.getByLabel('Job Title').fill('short'); // 5 chars
      await setEditor(page, '…long enough…');
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(/long enough/i);

      await page.getByRole('button', { name: /post job/i }).click();
      //   await expectToast(page, /Job title must be minimum 10 characters/i);
      await expect(page.locator('text=Job title must be at least 10 characters.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ title min length (short non-empty) test passed');
    });

    // test 7 → title too long (>100)
    test('title too long (>100)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      const urlBefore = page.url();
      await page.getByLabel('Job Title').fill('A'.repeat(101));

      const longDesc =
        'This description is long enough to exceed the minimum of twenty words so that the title length validation is the only check that triggers when we submit this form right now for the test.';
      await setEditor(page, longDesc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /minimum of twenty words/i
      );

      await page.getByRole('button', { name: /post job/i }).click();
      await expect(page.locator('text=Job title must be less than 100 characters.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ title too long (>100) test passed');
    });

    // test 8 → description min words (<20)
    test('description min words (<20)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      await page.getByLabel('Job Title').fill('Senior Full-Stack Engineer (Remix + NestJS)');
      await setEditor(page, 'too short description'); // < 20 words
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(/too short/i);

      // make other requireds valid so description is the one that fails
      await page.getByLabel('Working Hours per week').fill('40');
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByLabel('Project Type').selectOption('long-term');
      await page.getByLabel('Budget').fill('1200');
      await page.getByLabel('Expected Hourly Rate').fill('15');

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();
      await expect(page.locator('text=Description must be at least 20 words.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ description min words (<20) test passed');
    });

    // test 9 → missing fields toast (any required field empty)
    test('missing fields toast (any required field empty)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      await page.getByLabel('Job Title').fill('Valid Title Over Ten Characters');

      const longDesc =
        'Here is a deliberately long description that clearly contains more than twenty distinct words so that description validation passes and we can assert the generic missing fields message next.';
      await setEditor(page, longDesc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /deliberately long description/i
      );

      // leave Working Hours EMPTY to trigger the "Missing Field" toast
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByLabel('Project Type').selectOption('long-term');
      await page.getByLabel('Budget').fill('1200');
      await page.getByLabel('Expected Hourly Rate').fill('15');

      await expect(page.locator('input[name="jobCategory"]')).toHaveValue('');
      await expect(page.locator('input[name="experienceLevel"]')).toHaveValue('');

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();
      await expect(page.locator('text=Working hours are required.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ missing fields toast (any required field empty) test passed');
    });

    // test 10 → missing category toast
    test('missing category toast', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      await page.getByLabel('Job Title').fill('Valid Title Over Ten Characters');

      const longDesc =
        'Another sufficiently long description that comfortably exceeds the threshold of twenty words so the system will not complain about the description and can proceed to the category and experience validations in order for this scenario.';
      await setEditor(page, longDesc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /sufficiently long description/i
      );

      await fillRequiredBasics(page); // hours, location, projectType, budget, rate
      await expect(page.locator('input[name="experienceLevel"]')).toHaveValue(''); // not chosen
      await expect(page.locator('input[name="jobCategory"]')).toHaveValue(''); // not chosen

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();
      await expect(page.locator('text=Please select a job category.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ missing category toast test passed');
    });

    // test 11 → missing experience toast
    test('missing experience toast (only experience can block)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      // Title + description valid
      await page.getByLabel('Job Title').fill('Valid Title Over Ten Characters');
      const longDesc =
        'This description definitely contains more than twenty words so the description validation will pass and the next check becomes experience level for this case.';
      await setEditor(page, longDesc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /definitely contains more/i
      );

      // Fill all native-required fields
      await page.getByLabel('Working Hours per week').fill('40');
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByLabel('Project Type').selectOption('long-term');
      await page.getByLabel('Budget').fill('1200');
      await page.getByLabel('Expected Hourly Rate').fill('15');

      // Select category; do NOT select experience
      await selectFirstCategory(page);

      // Sanity: everything else is indeed set
      await expect(page.getByLabel('Working Hours per week')).toHaveValue('40');
      await expect(page.getByLabel('Location Preferences')).toHaveValue('Remote');
      await expect(page.getByLabel('Project Type')).toHaveValue('long-term');
      await expect(page.getByLabel('Budget')).toHaveValue('1200');
      await expect(page.getByLabel('Expected Hourly Rate')).toHaveValue('15');
      await expect(page.locator('input[name="jobCategory"]')).not.toHaveValue(''); // category chosen
      await expect(page.locator('input[name="experienceLevel"]')).toHaveValue(''); // experience missing

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();

      // Must be the experience error message
      await expect(page.locator('text=Please select an experience level.')).toBeVisible();

      // No navigation (submit blocked by validation)
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ missing experience toast test passed');
    });

    // test 12 → missing skills toast
    test('missing skills toast', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      // Title is valid
      await page.getByLabel('Job Title').fill('Valid Title Over Ten Characters');

      // Description: clearly > 20 words and wait for hidden input to update
      const longDesc =
        'This description definitely contains more than twenty words so that the description validation passes successfully and the next check executed by the submit handler becomes the missing skills validation for this scenario.';
      await setEditor(page, longDesc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /definitely contains more/i
      );

      // Fill all other required fields
      await fillRequiredBasics(page); // hours, location, project type, budget, rate

      // Pick category and experience so they cannot block
      await selectFirstCategory(page);
      await selectExperience(page, 'Entry Level');

      // Assert the hidden inputs reflect those selections
      await expect(page.locator('input[name="jobCategory"]')).not.toHaveValue('');
      await expect(page.locator('input[name="experienceLevel"]')).not.toHaveValue('');

      // Ensure no skills are selected (this is what we want to trigger)
      await expect(page.locator('input[name="jobSkills"]')).toHaveValue('[]');

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();

      // Now the only failing rule should be "Missing Skills"
      await expect(page.locator('text=Please select at least one skill.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore); // no navigation

      console.log('✅ missing skills toast test passed');
    });

    // test 13 → invalid numeric values (<= 0) toast
    test('invalid numeric values (<= 0) toast', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      await page.getByLabel('Job Title').fill('Valid Title Over Ten Characters');
      await setEditor(
        page,
        'This description is comfortably longer than twenty words so description validation passes, allowing us to reach the numeric values rule we want to test in this scenario.'
      );

      await page.getByLabel('Working Hours per week').fill('40');
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByLabel('Project Type').selectOption('long-term');
      await page.getByLabel('Budget').fill('1200');
      await page.getByLabel('Expected Hourly Rate').fill('0'); // trigger invalid

      await selectFirstCategory(page);
      await selectExperience(page, 'Entry Level');

      // ✅ idempotent: will click the option if it exists, or click "+ Add" if it doesn't
      await ensureSkill(page, 'PlaywrightE2E');

      const urlBefore = page.url();
      await page.getByRole('button', { name: /post job/i }).click();

      await expect(page.locator('text=Expected rate must be greater than 0.')).toBeVisible();
      await expect(page).toHaveURL(urlBefore);

      console.log('✅ invalid numeric values (<= 0) toast test passed');
    });
  });

  // ======================================
  // SUITE 3: Successful submission
  // ======================================
  test.describe('New Job — Successful submit', () => {
    test.use({ storageState: dashboardEmployerNoJobsFile });

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      const res = await page.request.post('/e2e/jobs', { form: { op: 'reset', debug: '1' } });
      const txt = await res.text();
      const payload = JSON.parse(txt);
      expect(res.ok(), `reset http failed: ${res.status()} ${txt}`).toBeTruthy();
      expect(payload.ok).toBeTruthy();
      expect(payload.remainingJobs).toBe(0);
      expect(payload.remainingApps).toBe(0);

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);
    });

    test.afterEach(async ({ page }) => {
      await page.request.post('/e2e/jobs', { form: { op: 'reset' } }).catch(() => {});
    });

    // test 14 → posts job and redirects; Active increases, Draft unchanged
    test('posts job and redirects; Active increases, Draft unchanged', async ({ page }) => {
      const before = await getDashboardCounts(page);

      await gotoNewJob(page);
      await disableNativeValidation(page);

      const title = `Senior Full-Stack Engineer (Remix + NestJS) — E2E ${Date.now()}`;
      await page.getByLabel('Job Title').fill(title);
      await setEditor(
        page,
        'This description clearly contains more than the required twenty words so that the client-side validation passes and allows submitting this job without any issues at all.'
      );

      await fillRequiredBasics(page);
      await selectFirstCategory(page);
      await selectExperience(page, 'Mid Level');
      await ensureSkill(page, 'PlaywrightE2E');

      await page.getByRole('button', { name: /post job/i }).click();

      // Your app currently sends ?job_added=1 on success – assert it, but counts are the main proof:
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);

      const after = await getDashboardCounts(page);
      expect(after.active).toBe(before.active + 1);
      expect(after.drafted).toBe(before.drafted);

      // Optional: verify latest job status via test-only API if available
      try {
        const latest = await page.request.post('/e2e/jobs', { form: { op: 'latest' } });
        if (latest.ok()) {
          const { job } = JSON.parse(await latest.text());
          expect(String(job?.status).toLowerCase()).toBe('active');
        }
      } catch {}

      console.log('✅ posts job and redirects; Active increases, Draft unchanged test passed');
    });
  });

  // ======================================
  // SUITE 4: Save as Draft
  // ======================================
  test.describe('New Job — Save as Draft', () => {
    test.use({ storageState: dashboardEmployerNoJobsFile });

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      const res = await page.request.post('/e2e/jobs', { form: { op: 'reset', debug: '1' } });
      const txt = await res.text();
      const payload = JSON.parse(txt);
      expect(res.ok(), `reset http failed: ${res.status()} ${txt}`).toBeTruthy();
      expect(payload.ok).toBeTruthy();
      expect(payload.remainingJobs).toBe(0);
      expect(payload.remainingApps).toBe(0);

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);
    });

    test.afterEach(async ({ page }) => {
      await page.request.post('/e2e/jobs', { form: { op: 'reset' } }).catch(() => {});
    });

    // test 15 → saves draft and redirects; Draft increases, Active unchanged
    test('saves draft and redirects; Draft increases, Active unchanged', async ({ page }) => {
      const before = await getDashboardCounts(page);

      await gotoNewJob(page);
      await disableNativeValidation(page);

      const title = `Senior FS (Remix + Nest) — Draft — ${Date.now()}`;
      await page.getByLabel('Job Title').fill(title);
      await setEditor(
        page,
        'This description clearly exceeds the twenty-word threshold so validation passes and we can save a draft without any issues while keeping the rest of the form valid.'
      );

      await fillRequiredBasics(page);
      await selectFirstCategory(page);
      await selectExperience(page, 'Mid Level');
      await ensureSkill(page, 'PlaywrightE2E');

      const oldUrl = page.url();
      await page.getByRole('button', { name: /^save as draft$/i }).click();

      // Be robust: just ensure we land on /dashboard (your app may not use a special query param)
      await expect.poll(() => page.url(), { timeout: 15_000 }).not.toBe(oldUrl);
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);

      const after = await getDashboardCounts(page);
      expect(after.drafted).toBe(before.drafted + 1);
      expect(after.active).toBe(before.active);

      // Optional: verify latest job really is draft
      try {
        const latest = await page.request.post('/e2e/jobs', { form: { op: 'latest' } });
        if (latest.ok()) {
          const { job } = JSON.parse(await latest.text());
          expect(String(job?.status).toLowerCase()).toBe('draft');
        }
      } catch {}

      console.log('✅ saves draft and redirects; Draft increases, Active unchanged test passed');
    });
  });

  // ======================================
  // SUITE 5: Job Category
  // ======================================
  test.describe('New Job — Job Category', () => {
    test.use({ storageState: dashboardEmployerNoJobsFile });

    // test 16 → category click updates hidden input
    test('category click updates hidden input', async ({ page }) => {
      await gotoNewJob(page);

      const hidden = page.locator('input[name="jobCategory"]');
      const first = page.locator('#jobCategory .cursor-pointer').first();

      await expect(hidden).toHaveValue('');

      // keep clicking until hydration attaches the onClick and value changes
      await expect
        .poll(
          async () => {
            await first.scrollIntoViewIfNeeded();
            await first.click();
            return await hidden.inputValue();
          },
          { timeout: 10_000, message: 'jobCategory hidden input should become non-empty' }
        )
        .not.toBe('');

      console.log('✅ category click updates hidden input test passed');
    });
  });

  // ======================================
  // SUITE 6: Account Status — Deactivated employer
  // ======================================
  test.describe('Account Status — Deactivated employer', () => {
    test.use({ storageState: employerDeactivatedFile });

    // 17 → Deactivated cannot access /new-job (loader)
    test('loader: /new-job is blocked and redirects away with a message', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/new-job', { waitUntil: 'domcontentloaded' });

      // Contract: bounce away (your app currently redirects to /dashboard for blocked employers)
      await expect(page).not.toHaveURL(/\/new-job(?:[\/?#]|$)/);
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);

      // Try to see a visible banner/toast; tweak the selectors if you have a specific testid.
      const candidates = [
        page.getByRole('alert').filter({ hasText: /deactiv/i }),
        page.getByRole('status').filter({ hasText: /deactiv/i }),
        page.getByText(/account.*deactiv/i),
        page.locator('[data-testid="account-status-banner"]'),
        page.locator('[data-sonner-toaster]').filter({ hasText: /deactiv/i }),
      ];

      let seen = false;
      for (const c of candidates) {
        try {
          await expect(c).toBeVisible({ timeout: 3000 });
          seen = true;
          break;
        } catch {}
      }

      // If you don't show a UI message, replace with expect.soft(seen).toBeTruthy()
      expect(seen, 'A deactivated-account message/banner/toast should be visible').toBeTruthy();

      console.log('✅ deactivated employer loader guard passed');
    });

    // 18 → Verify redirect behavior for deactivated users
    test('deactivated users are redirected away from /new-job to /dashboard and see a banner', async ({
      page,
    }) => {
      await page.goto('/new-job', { waitUntil: 'domcontentloaded' });

      // redirected
      await expect(page).not.toHaveURL(/\/new-job(?:[\/?#]|$)/);
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);

      // give dashboard/hydration any fetch time, then assert banner by test id
      await page.waitForLoadState('networkidle');
      const banner = page.locator('[data-testid="account-status-banner"]');
      await expect(banner).toBeVisible({ timeout: 10_000 });
      await expect(banner).toContainText(/account deactivated/i);
      await expect(banner).toContainText(/your account has been deactivated/i);

      // (optional) if your "no jobs" CTA is present only when not deactivated, ensure it’s hidden
      // await expect(page.getByTestId('no-jobs-cta')).toBeHidden();

      console.log('✅ deactivated employer redirect + banner verified');
    });
  });

  // ======================================
  // SUITE 7: Double-click Post
  // ======================================
  test.describe('Double-click Post', () => {
    test.use({ storageState: dashboardEmployerFile });

    // 19 → Double-click Post creates only one job
    test('double-click Post creates only one job', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      const before = await getDashboardCounts(page);

      await gotoNewJob(page);
      await disableNativeValidation(page);

      const title = `E2E Double Submit Guard — ${Date.now()}`;
      await page.getByLabel('Job Title').fill(title);

      const desc =
        'This description clearly contains more than the required twenty words so the client side validation passes successfully and allows submitting this job without any problems at all for this test case.';
      await setEditor(page, desc);
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(
        /passes successfully/i
      );

      await fillRequiredBasics(page);
      await selectFirstCategory(page);
      await selectExperience(page, 'Mid Level');
      await ensureSkill(page, 'PlaywrightE2E');

      const postBtn = page.getByRole('button', { name: /post job/i });

      // Optionally assert the button disables on first click (if your UI does that)
      // await postBtn.click();
      // await expect(postBtn).toBeDisabled();
      // await postBtn.click(); // ignored

      await Promise.all([
        page.waitForURL(/\/dashboard(?:[\/?#]|$)/, { timeout: 15000 }),
        postBtn.dblclick(),
      ]);

      const after = await getDashboardCounts(page);
      expect(after.active).toBe(before.active + 1);
      expect(after.drafted).toBe(before.drafted);

      // (optional) verify latest job title via your test-only API
      try {
        const r = await page.request.post('/e2e/jobs', { form: { op: 'latest' } });
        if (r.ok()) {
          const { job } = JSON.parse(await r.text());
          expect(job.title).toBe(title);
        }
      } catch {}
    });
  });
});
