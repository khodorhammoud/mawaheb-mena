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
} from '../pages/new-job.page';

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sessions
const dashboardEmployerFile = path.join(__dirname, '../.auth/employer-dashboard.json');
const dashboardEmployerNoJobsFile = path.resolve(__dirname, '../.auth/employer-nojobs.json');

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
    });
  });

  // test 2 → redirects restricted employer away from /new-job
  test.describe('Restricted (not published employer)', () => {
    const onboardingEmployerFile = path.join(__dirname, '../.auth/employer-onboarding.json');
    test.use({ storageState: onboardingEmployerFile });
    test('redirects restricted employer away from /new-job', async ({ page }) => {
      await page.goto('/new-job', { waitUntil: 'domcontentloaded' });
      // Your app’s canonical redirect:
      await page.waitForURL(/\/login-employer(?:$|[/?#])/);
      await expect(page).not.toHaveURL(/\/new-job(?:$|[/?#])/);
      await expect(page).toHaveURL(/\/login-employer(?:$|[/?#])/);
    });
  });

  // ======================================
  // SUITE 1: Native HTML5 validations
  // ======================================
  test.describe('New Job — Native required validations', () => {
    test.use({ storageState: dashboardEmployerFile });
    // test 3 → runs all validations sequentially in one flow - Done
    test('1) empty form → native required on Job Title', async ({ page }) => {
      await gotoNewJob(page);
      await page.getByRole('button', { name: /post job/i }).click();
      // Assert native validity on Job Title
      const { missing, msg } = await page.$eval('#jobTitle', (el: HTMLInputElement) => ({
        missing: el.validity.valueMissing,
        msg: el.validationMessage,
      }));
      expect(missing).toBeTruthy();
      expect(String(msg).length).toBeGreaterThan(0); // e.g. "Please fill out this field."
    });
    // test 4 → fill title → native required moves to Working Hours - Done
    test('2) fill title → next invalid is among required fields', async ({ page }) => {
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
    });
    // test 5 → fill title + hours + location → native required on Project Type - Done
    test('3) fill title + hours + location → native required on Project Type', async ({ page }) => {
      await gotoNewJob(page);
      await page.getByLabel('Job Title').fill('Any valid title here');
      await page.getByLabel('Working Hours per week').fill('40');
      await page.getByLabel('Location Preferences').fill('Remote');
      await page.getByRole('button', { name: /post job/i }).click();
      const { missing } = await page.$eval('#projectType', (el: HTMLSelectElement) => ({
        missing: el.validity.valueMissing,
      }));
      expect(missing).toBeTruthy();
    });
  });

  // ======================================
  // SUITE 2: Custom client-side toasts
  // (Disable native so onSubmit runs)
  // ======================================
  test.describe('New Job — Custom validations (toasts)', () => {
    test.use({ storageState: dashboardEmployerFile });

    // test 6 → title min length (short non-empty) - Done
    test('title min length (short non-empty)', async ({ page }) => {
      await gotoNewJob(page);
      await disableNativeValidation(page);

      const urlBefore = page.url();
      await page.getByLabel('Job Title').fill('short'); // 5 chars
      await setEditor(page, '…long enough…');
      await expect(page.locator('input[name="jobDescription"]')).toHaveValue(/long enough/i);

      await page.getByRole('button', { name: /post job/i }).click();
      await expectToast(page, /Job title must be minimum 10 characters/i);
      await expect(page).toHaveURL(urlBefore);
    });

    // test 7 → title too long (>100) - Done
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
      await expectToast(page, /Job title must be less than 100 characters/i);
      await expect(page).toHaveURL(urlBefore);
    });

    // test 8 → description min words (<20) - Done
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
      await expectToast(page, /minimum of 20 words/i);
      await expect(page).toHaveURL(urlBefore);
    });

    // test 9 → missing fields toast (any required field empty) - Done
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
      await expectToast(page, /Please fill in all required fields/i);
      await expect(page).toHaveURL(urlBefore);
    });

    // test 10 → missing category toast - Done
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
      await expectToast(page, /Missing Category|select at least one job category/i);
      await expect(page).toHaveURL(urlBefore);
    });

    // test 11 → missing experience toast - Done
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

      // Must be the experience toast (title OR description text)
      await expectToast(page, /(Missing Experience Level|job's experience level)/i);

      // No navigation (submit blocked by validation)
      await expect(page).toHaveURL(urlBefore);
    });

    // test 12 → missing skills toast - Done
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
      await expectToast(page, /Missing Skills|Please select at least one required skill/i);
      await expect(page).toHaveURL(urlBefore); // no navigation
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

      await expectToast(page, /Working hours, budget, and expected rate must be greater than 0/i);
      await expect(page).toHaveURL(urlBefore);
    });
  });

  // ======================================
  // SUITE 3: Successful submission
  // ======================================
  test.describe('New Job — Successful submit', () => {
    // Use the published employer with **no jobs**
    test.use({ storageState: dashboardEmployerNoJobsFile });

    // Deterministic start
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      // reset to zero jobs/apps for this employer
      const res = await page.request.post('/e2e/jobs', { form: { op: 'reset', debug: '1' } });
      const text = await res.text();
      console.log('RESET payload (beforeEach):', text);
      expect(res.ok(), `reset http failed: ${res.status()} ${text}`).toBeTruthy();

      const payload = JSON.parse(text);
      expect(payload.ok, `reset logic failed: ${text}`).toBeTruthy();
      expect(payload.remainingJobs, `still have jobs: ${text}`).toBe(0);
      expect(payload.remainingApps, `still have apps: ${text}`).toBe(0);

      // optional: land on dashboard
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);
    });

    // Deterministic end (soft cleanup — never fails the test)
    test.afterEach(async ({ page }) => {
      try {
        const res = await page.request.post('/e2e/jobs', { form: { op: 'reset' } });
        console.log('RESET status (afterEach):', res.status());
        // no assertions on purpose
      } catch (err) {
        console.warn('post-test reset skipped:', err);
      }
    });

    // test 14 → posts job and redirects to dashboard?job_added=1
    test('creates job and redirects to /dashboard?job_added=1', async ({ page }) => {
      // 1) Open /new-job
      await gotoNewJob(page);
      await disableNativeValidation(page);

      // 2) Fill a fully valid job
      const title = `Senior Full-Stack Engineer (Remix + NestJS) — E2E ${Date.now()}`;
      await page.getByLabel('Job Title').fill(title);

      await setEditor(
        page,
        'This description clearly contains more than the required twenty words so that the client-side validation passes and allows submitting this job without any issues at all.'
      );

      await fillRequiredBasics(page); // hours, location, project type, budget, expected rate (>0)
      await selectFirstCategory(page); // choose a job category
      await selectExperience(page, 'Mid Level'); // required field
      await ensureSkill(page, 'PlaywrightE2E'); // idempotent: select or add

      // 3) Submit
      await page.getByRole('button', { name: /post job/i }).click();

      // 4) Assert redirect exactly to /dashboard?job_added=1
      await page.waitForURL(/\/dashboard(?:\?|$).*job_added=1/i, { timeout: 15000 });
      await expect(page).toHaveURL(/\/dashboard(?:\?|$).*job_added=1/i);

      // 5) Dashboard should no longer show the "no jobs" empty state
      await expect(page.getByTestId('no-jobs-ui')).toHaveCount(0);

      // 6) Active Jobs should now be 1 (we reset to 0 in beforeEach)
      const activeHeading = page.getByRole('heading', { name: 'Active Jobs', exact: true });
      await expect(activeHeading).toBeVisible();
      const activeCount = activeHeading.locator('xpath=./following-sibling::div[1]//p[1]');
      const txt = (await activeCount.textContent())?.trim() ?? '';
      expect(/^\d+$/.test(txt), `Active Jobs count must be an integer, got "${txt}"`).toBeTruthy();
      expect(Number(txt)).toBe(1);
    });
  });
});
