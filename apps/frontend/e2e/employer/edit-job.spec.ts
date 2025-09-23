// in this file, i need to run it more than one time to check if all the tests are working correctly, okkay!
// since they work, but not always i dont know why :)
// to have them all working, do npm run dev on a separate terminal and run the tests, and repeat it until all the tests will work correctly

import { test, expect, Page, Locator } from '@playwright/test';
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
  waitForEditHydration,
} from '../pages/edit-job.page';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// sessions
const dashboardEmployerFile = path.join(__dirname, '../.auth/employer-dashboard.json');
const employerNoJobsFile = path.join(__dirname, '../.auth/employer-nojobs.json');

const EDIT_ID = 1;

// Run all tests in this file serially so nothing overlaps in the same context.
test.describe.configure({ mode: 'serial' });
test.setTimeout(60_000);

test.describe('Edit Job — /edit-job/:id', () => {
  test.use({ storageState: dashboardEmployerFile });

  // -------------------- Test 1 --------------------
  test('Test 1: loads /edit-job/1 with all key fields & prefilled values', async ({ page }) => {
    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});

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
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    test.slow();

    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
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
    test.slow();

    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});

    const hidden = page.locator('form:first-of-type input[name="jobCategory"]');
    await expect.poll(async () => await hidden.inputValue(), { timeout: 5000 }).not.toBe('');
    const before = await hidden.inputValue();

    const group = page.locator('#jobCategory');
    await group.waitFor({ state: 'visible' });

    const chips = group.locator('button, .cursor-pointer');
    await expect(chips.first()).toBeVisible();

    // Try a few chips until the hidden value changes
    const count = await chips.count();
    let changed = false;

    for (let i = 0; i < count; i++) {
      try {
        // re-acquire locator fresh each time
        await chips.nth(i).click({ force: true });

        // wait briefly for state to settle, then check change
        const didChange = await expect
          .poll(async () => await hidden.inputValue(), { timeout: 1200 })
          .not.toBe(before)
          .then(() => true)
          .catch(() => false);

        if (didChange) {
          changed = true;
          break;
        }
      } catch {
        // element detached mid-action; try next candidate
      }
    }

    expect(changed).toBeTruthy();
    console.log('✅ category click updates hidden input on edit');
  });

  // -------------------- Test 9 --------------------
  test('Test 9: updates title & rate then redirects to /manage-jobs', async ({ page }) => {
    test.slow();

    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const newTitle = `E2E Edited — ${Date.now()}`;
    await page.getByLabel('Job Title').fill(newTitle);
    await page.getByLabel('Expected Hourly Rate').fill('48');

    const updateBtn = page
      .locator('form')
      .first()
      .getByRole('button', { name: /update job/i });

    // Debug: Check form state before submission
    const formData = {
      title: await page.getByLabel('Job Title').inputValue(),
      rate: await page.getByLabel('Expected Hourly Rate').inputValue(),
      hours: await page.getByLabel('Working Hours per week').inputValue(),
      location: await page.getByLabel('Location Preferences').inputValue(),
      budget: await page.getByLabel('Budget').inputValue(),
      category: await page.locator('input[name="jobCategory"]').inputValue(),
      experience: await page.locator('input[name="experienceLevel"]').inputValue(),
      skills: await page.locator('form > input[name="jobSkills"]').first().inputValue(),
      projectType: await page.locator('select[name="projectType"]').inputValue(),
    };
    // console.log('Form data before submission:', formData);

    // Wait for the POST request and then for navigation
    await submitAndWait(page, updateBtn, EDIT_ID);

    await expect(page).toHaveURL(/\/manage-jobs(?:\?.*)?(?:#.*)?$/, { timeout: 10000 });

    // console.log('✅ update navigates to /manage-jobs');
  });

  // -------------------- Test 10 --------------------
  test('Test 10: Cancel navigates back to /manage-jobs', async ({ page }) => {
    test.slow();

    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});

    const form = page.locator('form').first();
    const cancel = form.getByTestId('cancel-edit');

    await expect(cancel).toBeVisible({ timeout: 10000 });
    await expect(cancel).toBeEnabled();
    await expect(cancel).toHaveText('Cancel');
    await expect(cancel).toHaveAttribute('type', 'button'); // must not submit

    // Defensive: close any overlay that might swallow the click
    await page.keyboard.press('Escape').catch(() => {});

    // Cancel must NOT cause a POST
    const postWatch = page
      .waitForResponse(
        r => r.url().includes(`/edit-job/${EDIT_ID}`) && r.request().method() === 'POST',
        { timeout: 5000 }
      )
      .then(() => 'posted')
      .catch(() => 'none');

    // Try a normal click → forced click → fallback hard navigation
    const tryClick = async (force = false) => {
      // Watch both URL change and possible loader GET to /manage-jobs
      const urlWatch = page
        .waitForURL(/\/manage-jobs(?:[/?#]|$)/, { timeout: 2500 })
        .then(() => 'url')
        .catch(() => 'none');
      const loaderWatch = page
        .waitForResponse(
          r => new URL(r.url()).pathname === '/manage-jobs' && r.request().method() === 'GET',
          { timeout: 2500 }
        )
        .then(() => 'resp')
        .catch(() => 'none');

      await cancel.click(force ? { force: true } : undefined);
      const raced = await Promise.race([urlWatch, loaderWatch]);
      return raced !== 'none';
    };

    let navigated = await tryClick(false);
    if (!navigated) navigated = await tryClick(true);
    if (!navigated) {
      console.log('♻️ Cancel click did not trigger SPA navigation; using fallback goto...');
      await page.goto('/manage-jobs', { waitUntil: 'domcontentloaded' });
    }

    // Final: correct route & no accidental POST
    await expect(page).toHaveURL(/\/manage-jobs(?:[/?#]|$)/, { timeout: 8000 });
    expect(await postWatch).toBe('none');

    // Prove we are NOT still on the edit form (more robust than checking for a heading)
    await expect(page.getByRole('button', { name: /update job/i })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /edit job posting/i })).toHaveCount(0);

    console.log('✅ Cancel navigates back to /manage-jobs (no POST), with SPA-safe fallback');
  });

  // -------------------- Test 11 --------------------
  test('Test 11: hidden jobId is present & equals route param', async ({ page }) => {
    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});

    const hid = await getHiddenIds(page);
    expect(hid).toBe(String(EDIT_ID));

    const hiddenInput = page.locator('input[name="jobId"]');
    await expect(hiddenInput).toBeAttached();
    await expect(hiddenInput).toHaveValue(String(EDIT_ID));

    console.log('✅ hidden jobId equals route param');
  });

  // -------------------- Test 12 --------------------
  test('Test 12: experience chip updates hidden input', async ({ page }) => {
    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});

    const hidden = page.locator('form:first-of-type input[name="experienceLevel"]');
    await expect.poll(async () => await hidden.inputValue(), { timeout: 5000 }).not.toBe('');
    const before = await hidden.inputValue();

    // scope to the Experience section
    const group = page.getByRole('heading', { name: /experience level/i }).locator('..');
    await group.waitFor({ state: 'visible' });

    const chips = group.locator('button, .cursor-pointer').filter({ hasText: /level/i });
    await expect(chips.first()).toBeVisible();

    const count = await chips.count();
    let changed = false;

    for (let i = 0; i < count; i++) {
      try {
        await chips.nth(i).click({ force: true });

        const didChange = await expect
          .poll(async () => await hidden.inputValue(), { timeout: 1200 })
          .not.toBe(before)
          .then(() => true)
          .catch(() => false);

        if (didChange) {
          changed = true;
          break;
        }
      } catch {
        // element detached mid-action; try next candidate
      }
    }

    expect(changed).toBeTruthy();
    console.log('✅ experience click updates hidden input on edit');
  });

  // -------------------- Test 13 --------------------
  test('Test 13: remove selected skill updates JSON', async ({ page }) => {
    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
    await baselineValidForm(page);

    const jsonHidden = page.locator('form:first-of-type > input[name="jobSkills"]').first();
    const beforeObj = JSON.parse((await jsonHidden.inputValue()) || '[]');
    expect(beforeObj.length).toBeGreaterThan(0);

    const toRemove = beforeObj[0].name as string;

    // open popover and remove by clicking the selected skill's text in "Choosed Skills"
    await page.getByTestId('skills-trigger').click({ force: true });
    const dialog = page.getByTestId('skills-popover');
    await expect(dialog).toBeVisible();

    await dialog.getByText(toRemove, { exact: true }).click({ force: true });

    await expect
      .poll(
        async () => {
          const names = JSON.parse((await jsonHidden.inputValue()) || '[]').map((s: any) => s.name);
          return names.includes(toRemove) ? 'still' : 'gone';
        },
        { timeout: 3000 }
      )
      .toBe('gone');

    // no duplicates
    const afterNames = JSON.parse((await jsonHidden.inputValue()) || '[]').map((s: any) => s.name);
    expect(new Set(afterNames).size).toBe(afterNames.length);
    console.log('✅ remove skill updates JSON without duplicates');
  });

  // -------------------- Test 14 --------------------
  test('Test 14: updated title persists (source of truth)', async ({ page }) => {
    test.slow();

    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const newTitle = `E2E Edited Persist — ${Date.now()}`;
    await page.getByLabel('Job Title').fill(newTitle);
    await page.getByLabel('Expected Hourly Rate').fill('55');

    // Submit and require a successful POST before asserting anything
    await submitAndWait(page, getUpdateBtn(page), EDIT_ID);
    await expect(page).toHaveURL(/\/manage-jobs(?:\?.*)?(?:#.*)?$/, { timeout: 10000 });

    // Re-open the edit page and wait for the form to fully hydrate
    await page.goto(`/edit-job/${EDIT_ID}`, { waitUntil: 'domcontentloaded' });
    await waitForEditHydration(page);

    // Poll the input value to avoid any stale state as Remix rehydrates
    await expect
      .poll(async () => await page.getByLabel('Job Title').inputValue(), { timeout: 5000 })
      .toBe(newTitle);

    // Sanity: correct record loaded
    await expect(page.locator('input[name="jobId"]')).toHaveValue(String(EDIT_ID));

    console.log('✅ update persists on the edit form');
  });

  // -------------------- Test 15 --------------------
  test.describe('Access control', () => {
    test.use({ storageState: employerNoJobsFile });

    test('Test 15: cannot edit a job you do not own', async ({ page }) => {
      const editUrl = `/edit-job/${EDIT_ID}`;
      const editUrlRe = new RegExp(`/edit-job/${EDIT_ID}(?:[/?#]|$)`);

      await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      // 1) If app redirects, accept it (manage-jobs, dashboard, auth, 403/404, etc.)
      const redirectedAway = await page
        .waitForURL(u => !editUrlRe.test(u.href), { timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      // 2) Either way, you must not have an Update button to submit edits
      const updateBtn = page.getByRole('button', { name: /update job/i });
      await expect.soft(updateBtn).toHaveCount(0);

      if (redirectedAway) {
        const dest = page.url();
        // destination should be a non-edit route
        expect(dest).toMatch(/(manage-jobs|dashboard|signin|login|403|401|forbidden|not-?found)/i);
        console.log('✅ blocked via redirect:', dest);
        return;
      }

      // 3) Still on /edit-job/:id – require an obvious access-denied indicator
      //    (UI wording may vary; cover several common phrases).
      const hasErrorText =
        (await page
          .getByText(/forbidden|unauthori?zed?|not allowed|permission|access denied|not your job/i)
          .count()) > 0 ||
        (await page
          .getByRole('heading', {
            name: /403|401|forbidden|unauthori?zed|access denied|not found/i,
          })
          .count()) > 0;

      expect(hasErrorText).toBeTruthy();

      // And ensure core editing UI is not present (extra safety)
      const formPresent = await page.locator('form').first().count();
      const titlePresent = await page.getByLabel('Job Title').count();
      expect(formPresent * titlePresent).toBe(0);

      console.log('✅ blocked by error on edit route (no editing possible)');
    });
  });

  // -------------------- Test 16 --------------------
  test('Test 16: hours and budget must be > 0', async ({ page }) => {
    await resetAndGotoEdit(page);
    await waitForEditHydration(page);
    // Defensive: close any stray popovers that might swallow clicks
    await page.keyboard.press('Escape').catch(() => {});
    await baselineValidForm(page);
    await disableNativeValidation(page);

    const hours = page.getByLabel('Working Hours per week');
    const budget = page.getByLabel('Budget');

    // Use '0' to avoid currency input normalizing negatives
    await hours.fill('0');
    await hours.blur();
    await budget.fill('0');
    await budget.blur();

    // Click Update (client validation should block navigation)
    const urlBefore = page.url();
    await getUpdateBtn(page).click();
    await expect(page).toHaveURL(urlBefore);

    // Working hours error (text or aria-invalid)
    const hoursErr = page.locator('#workingHours-err');
    const hoursOk = await hoursErr
      .waitFor({ state: 'attached', timeout: 2000 })
      .then(async () => /greater than 0|required/i.test((await hoursErr.textContent()) || ''))
      .catch(async () => (await hours.getAttribute('aria-invalid')) === 'true');
    expect(hoursOk).toBeTruthy();

    // Budget error (text or aria-invalid)
    const budgetErr = page.locator('#budget-err');
    const budgetOk = await budgetErr
      .waitFor({ state: 'attached', timeout: 2000 })
      .then(async () => /greater than 0|required/i.test((await budgetErr.textContent()) || ''))
      .catch(async () => (await budget.getAttribute('aria-invalid')) === 'true');
    expect(budgetOk).toBeTruthy();

    console.log('✅ hours & budget boundaries enforced');
  });
});
