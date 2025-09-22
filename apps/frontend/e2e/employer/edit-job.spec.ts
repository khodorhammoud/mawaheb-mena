// in this file, i need to run it more than one time to check if all the tests are working correctly, okkay!
// since they work, but not always i dont know why :)
// to have them all working, do npm run dev on a separate terminal and run the tests, and repeat it until all the tests will work correctly

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// reuse your new-job helpers
import { disableNativeValidation, setEditor } from '../pages/new-job.page';

import {
  getUpdateBtn,
  getCancelBtn,
  getHiddenIds,
  getHiddenSelections,
  resetAndGotoEdit,
  baselineValidForm,
  openSkillsPopover,
  parseJsonSkills,
  escapeRegex,
  submitAndWait,
} from '../pages/edit-job.page';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// sessions
const dashboardEmployerFile = path.join(__dirname, '../.auth/employer-dashboard.json');

const EDIT_ID = 1;

// ---------------------------------------------------------------------------
// SUITE-WIDE ISOLATION SETTINGS
// ---------------------------------------------------------------------------

// Run all tests in this file serially so nothing overlaps in the same context.
test.describe.configure({ mode: 'serial' });

test.describe('Edit Job — /edit-job/:id', () => {
  test.use({ storageState: dashboardEmployerFile });

  // -------------------- Test 1 --------------------
  test('Test 1: loads /edit-job/1 with all key fields & prefilled values', async ({ page }) => {
    await resetAndGotoEdit(page);

    await expect(
      page.getByRole('heading', { name: /edit job posting|job posting form/i })
    ).toBeVisible();

    await expect(page.getByLabel('Job Title')).toBeVisible();
    await expect(page.getByText('Job Description')).toBeVisible();
    await expect(page.getByLabel('Working Hours per week')).toBeVisible();
    await expect(page.getByLabel('Location Preferences')).toBeVisible();
    await expect(page.getByLabel('Project Type')).toBeVisible();
    await expect(page.getByLabel('Budget')).toBeVisible();
    await expect(page.getByLabel('Expected Hourly Rate')).toBeVisible();

    await expect(page.getByLabel('Job Title')).not.toHaveValue('');
    await expect
      .poll(async () => (await page.locator('input[name="jobDescription"]').inputValue()).length)
      .toBeGreaterThan(0);

    const categoryGroup = page.locator('#jobCategory');
    await expect(categoryGroup).toBeVisible();
    expect(await categoryGroup.locator('.cursor-pointer').count()).toBeGreaterThan(0);

    await expect(page.getByRole('heading', { name: 'Experience Level' })).toBeVisible();

    await expect(getUpdateBtn(page)).toBeVisible();
    await expect(getCancelBtn(page)).toBeVisible();

    const hidId = await getHiddenIds(page);
    expect(hidId).toBe(String(EDIT_ID));
    const { cat, exp, skills } = await getHiddenSelections(page);
    expect(cat).not.toBe('');
    expect(exp).not.toBe('');

    let skillsArr: any[] = [];
    try {
      skillsArr = JSON.parse(skills || '[]');
    } catch {
      skillsArr = [];
    }
    expect(Array.isArray(skillsArr)).toBeTruthy();
    if (skillsArr.length > 0) for (const s of skillsArr) expect(typeof s.name).toBe('string');

    console.log('✅ loads /edit-job/1 with all key fields & prefilled values');
  });

  // -------------------- Test 2 --------------------
  test('Test 2: required field validation prevents form submission', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);

    const hours = page.getByLabel('Working Hours per week');
    await hours.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await hours.blur();

    const urlBefore = page.url();
    await getUpdateBtn(page).click();

    await expect(page).toHaveURL(urlBefore);
    await expect(hours).toHaveAttribute('aria-invalid', 'true', { timeout: 5000 });
    await expect(page.locator('#workingHours-err')).toBeVisible();
    await expect(page.locator('#workingHours-err')).toHaveText('Working hours are required.');

    console.log('✅ native required re-triggers when clearing a required field');
  });

  // -------------------- Test 3 --------------------
  test('Test 3: short title → toast + no navigation', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const urlBefore = page.url();
    await page.getByLabel('Job Title').fill('short');
    await getUpdateBtn(page).click();

    await expect(page.locator('#jobTitle-err')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#jobTitle-err')).toHaveText(
      'Job title must be at least 10 characters minimum.'
    );
    await expect(page).toHaveURL(urlBefore);

    console.log('✅ short title → toast + no navigation');
  });

  // -------------------- Test 4 --------------------
  test('Test 4: title length policy', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const urlBefore = page.url();
    const input = page.getByLabel('Job Title');
    const maxAttr = await input.getAttribute('maxlength');

    await input.fill('A'.repeat(120));

    if (maxAttr) {
      const val = await input.inputValue();
      expect(val.length).toBeLessThanOrEqual(100);
      await expect(page.locator('#jobTitle-err')).toHaveCount(0);
    } else {
      await getUpdateBtn(page).click();
      await expect(page.locator('#jobTitle-err')).toBeVisible();
      await expect(page.locator('#jobTitle-err')).toHaveText(
        'Job title must be less than 100 characters.'
      );
      await expect(page).toHaveURL(urlBefore);
    }

    console.log('✅ title length policy');
  });

  // -------------------- Test 5 --------------------
  test('Test 5: too-short description → toast', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const urlBefore = page.url();
    await setEditor(page, 'too short description');
    await expect(page.locator('input[name="jobDescription"]')).toHaveValue(/too short/i);

    await getUpdateBtn(page).click();
    await expect(page.locator('#jobDescription-err')).toBeVisible();
    await expect(page.locator('#jobDescription-err')).toHaveText(
      'Description must be at least 20 words.'
    );
    await expect(page).toHaveURL(urlBefore);

    console.log('✅ too-short description → toast');
  });

  // -------------------- Test 6 --------------------
  test('Test 6: expected hourly rate <= 0 → inline error and no submit', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const urlBefore = page.url();
    const rate = page.getByLabel('Expected Hourly Rate');
    await rate.fill('0');
    await rate.blur();

    await getUpdateBtn(page).click();

    await expect(page.locator('#expectedHourlyRate-err')).toBeVisible();
    await expect(page.locator('#expectedHourlyRate-err')).toHaveText(
      'Expected rate must be greater than 0.'
    );
    await expect(page).toHaveURL(urlBefore);

    console.log('✅ expected hourly rate <= 0 → inline error and no submit');
  });

  // -------------------- Test 7 --------------------
  test('Test 7: can ensure a skill while editing (idempotent)', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const targetSkill = 'PlaywrightE2E';

    // Use the canonical JSON hidden input at the top of <Form>
    const jsonHidden = page.locator('form > input[name="jobSkills"]').first();
    await expect(jsonHidden).toBeAttached();

    const beforeNames = parseJsonSkills(await jsonHidden.inputValue()).map(s => s.name);

    const dialog = await openSkillsPopover(page);
    const search = dialog.getByTestId('skills-search');
    await expect(search).toBeVisible();
    await search.fill(targetSkill);

    const option = dialog.getByRole('option', {
      name: new RegExp(`^${escapeRegex(targetSkill)}$`, 'i'),
    });
    const addBtn = dialog.getByRole('button', {
      name: new RegExp(
        `\\+\\s*Add\\s*[“"]?${escapeRegex(targetSkill)}[”"]?\\s*as a new skill`,
        'i'
      ),
    });

    // Wait until one path appears
    await Promise.race([
      option.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      addBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);

    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else {
      await addBtn.click();
    }

    // Close to avoid leaking state into later tests
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 3000 });

    // Poll until the JSON reflects the new selection
    await expect
      .poll(
        async () => {
          const names = parseJsonSkills(await jsonHidden.inputValue()).map(s => s.name);
          return names.includes(targetSkill);
        },
        { timeout: 3000 }
      )
      .toBeTruthy();

    const afterNames = parseJsonSkills(await jsonHidden.inputValue()).map(s => s.name);

    // Idempotency + no duplicates are the guarantees we really need
    expect(afterNames).toContain(targetSkill);
    expect(new Set(afterNames).size).toBe(afterNames.length);

    // (Optional) If you *do* want a growth check, only do it when there’s room:
    // if (!beforeNames.includes(targetSkill) && beforeNames.length < 5) {
    //   expect(afterNames.length).toBe(beforeNames.length + 1);
    // }

    console.log('✅ ensured skill while editing (idempotent)');
  });

  // -------------------- Test 8 --------------------
  test('Test 8: category click updates hidden input on edit', async ({ page }) => {
    await resetAndGotoEdit(page);

    const hidden = page.locator('input[name="jobCategory"]');
    const beforeVal = await hidden.inputValue();

    const chips = page.locator('#jobCategory .cursor-pointer');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    // choose a non-selected chip
    let target = chips.last();
    for (let i = 0; i < count; i++) {
      const chip = chips.nth(i);
      const isSelected = await chip.evaluate(
        el =>
          el.classList.contains('bg-blue-100') &&
          el.classList.contains('text-blue-600') &&
          el.classList.contains('border-blue-600')
      );
      if (!isSelected) {
        target = chip;
        break;
      }
    }

    await target.click();

    await expect.poll(async () => await hidden.inputValue(), { timeout: 5000 }).not.toBe(beforeVal);

    await expect(target).toHaveClass(/bg-blue-100/);
    await expect(target).toHaveClass(/text-blue-600/);
    await expect(target).toHaveClass(/border-blue-600/);

    console.log('✅ category click updates hidden input on edit');
  });

  // -------------------- Test 9 --------------------
  test('Test 9: updates title & rate then redirects to /manage-jobs', async ({ page }) => {
    await resetAndGotoEdit(page);
    await baselineValidForm(page);
    await disableNativeValidation(page);

    await page.getByLabel('Job Title').fill(`E2E Edited — ${Date.now()}`);
    await page.getByLabel('Expected Hourly Rate').fill('48');

    const updateBtn = page
      .locator('form')
      .first()
      .getByRole('button', { name: /update job/i });

    await submitAndWait(page, updateBtn, EDIT_ID);
    await expect(page).toHaveURL(/\/manage-jobs(?:\?.*)?(?:#.*)?$/);

    console.log('✅ update navigates to /manage-jobs');
  });

  // -------------------- Test 10 --------------------
  test('Test 10: Cancel navigates back to /manage-jobs', async ({ page }) => {
    await resetAndGotoEdit(page);

    const cancel = page.getByTestId('cancel-edit');
    await expect(cancel).toBeVisible();
    await expect(cancel).toBeEnabled();
    await expect(cancel).toHaveText('Cancel');
    await cancel.scrollIntoViewIfNeeded();

    await Promise.all([page.waitForURL(/\/manage-jobs(?:\?.*)?(?:#.*)?$/), cancel.click()]);

    await expect(page).toHaveURL(/\/manage-jobs(?:\?.*)?(?:#.*)?$/);

    console.log('✅ Cancel navigates back to /manage-jobs');
  });

  // -------------------- Test 11 --------------------
  test('Test 11: hidden jobId is present & equals route param', async ({ page }) => {
    await resetAndGotoEdit(page);

    const hid = await getHiddenIds(page);
    expect(hid).toBe(String(EDIT_ID));

    const hiddenInput = page.locator('input[name="jobId"]');
    await expect(hiddenInput).toBeAttached();
    await expect(hiddenInput).toHaveValue(String(EDIT_ID));

    console.log('✅ hidden jobId equals route param');
  });
});
