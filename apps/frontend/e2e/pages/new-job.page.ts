import { Locator, Page, expect } from '@playwright/test';

// ---------- helpers ----------
export const gotoNewJob = async (page: Page) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/new-job', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/new-job(?:$|[/?#])/);
};

export const setEditor = async (page: Page, text: string) => {
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible' });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await editor.type(text);
};

export const expectToast = async (page: Page, text: RegExp | string) => {
  const rx = typeof text === 'string' ? new RegExp(text, 'i') : text;
  const toast = page
    .locator(
      [
        '[data-sonner-toast]',
        '[data-sonner-toaster]',
        '[data-radix-toast]',
        '[data-radix-toast-viewport]',
        '[role="status"]',
        '.sonner-toaster',
        '.toast',
      ].join(', ')
    )
    .filter({ hasText: rx });
  await expect(toast).toBeVisible({ timeout: 10000 });
};

// Turn off native validation so custom onSubmit validations can run
export const disableNativeValidation = async (page: Page) => {
  await page.evaluate(() => {
    document.querySelectorAll('form').forEach(f => f.setAttribute('novalidate', 'true'));
    document
      .querySelectorAll('button[type="submit"], input[type="submit"]')
      .forEach(el => el.setAttribute('formnovalidate', 'true'));
  });
};

// Basic fillers for required fields (used in some tests)
export const fillRequiredBasics = async (page: Page) => {
  await page.getByLabel('Working Hours per week').fill('40');
  await page.getByLabel('Location Preferences').fill('Remote');
  await page.getByLabel('Project Type').selectOption('long-term');
  await page.getByLabel('Budget').fill('1200');
  await page.getByLabel('Expected Hourly Rate').fill('15');
};

// Select first Job Category badge (if any)
export const selectFirstCategory = async (page: Page) => {
  const group = page.locator('#jobCategory');
  await expect(group).toBeVisible();
  await group.locator('.cursor-pointer').first().click();
};

// Pick an Experience Level badge
export const selectExperience = async (
  page: Page,
  label: 'Entry Level' | 'Mid Level' | 'Expert Level'
) => {
  await page.getByText(label, { exact: true }).click();
};

// utils for this spec file
export const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Assert the hidden input now contains the skill, no matter the format (CSV or JSON). */
export async function expectHiddenHasSkill(page: Page, skillName: string) {
  await expect(async () => {
    const val = await page.locator('input[name="jobSkills"]').first().inputValue();
    let ok = false;

    // try JSON format first
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) {
        ok = arr.some((s: any) => (s?.name ?? '').toLowerCase() === skillName.toLowerCase());
      }
    } catch {
      // not JSON → treat as CSV of names
      const names = val
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      ok = names.includes(skillName.toLowerCase());
    }

    expect(ok).toBeTruthy();
  }).toPass({ timeout: 3000 });
}

/** Ensure a skill is selected; add it if it's not in the DB yet. */
export async function ensureSkill(page: Page, skillName = 'PlaywrightE2E') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Open the Required Skills popover
  await page.getByText(/^Required Skills$/).click();
  const dialog = page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();

  // CommandInput -> an <input> with placeholder "Search skills…"
  const search = dialog.locator('input[placeholder*="Search"][placeholder*="skill" i]').first();
  await search.fill(''); // clear any prior state
  await search.fill(skillName); // type our target
  await page.waitForTimeout(400); // cover the 250ms debounce + fetch

  // Either it already exists…
  const option = dialog
    .locator('[role="option"]')
    .filter({ hasText: new RegExp(`^${esc(skillName)}$`, 'i') })
    .first();

  // …or we see the “+ Add "<name>" as a new skill” CTA (curly or straight quotes)
  const addBtn = dialog.getByRole('button', {
    name: new RegExp(
      `^\\+\\s*Add\\s*(?:“|")?${esc(skillName)}(?:”|")?\\s*as\\s*a\\s*new\\s*skill$`,
      'i'
    ),
  });

  if (await option.isVisible({ timeout: 800 })) {
    await option.click();
  } else {
    await addBtn.waitFor({ state: 'visible', timeout: 3000 });
    await addBtn.click({ force: true });
  }

  // The picker shows a chip in "Choosed Skills" section — quick visual assert
  await expect(dialog.getByText(skillName).first()).toBeVisible({ timeout: 1500 });

  // Prove the form will carry the skill on submit (CSV or JSON)
  await expectHiddenHasSkill(page, skillName);

  // Close the popover so the rest of the test interacts with the page normally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await page.keyboard.press('Escape').catch(() => {});
}

// --------- dashboard helpers ----------
export async function getDashboardCounts(page: Page) {
  const get = async (headingExact: string) => {
    const h = page.getByRole('heading', { name: headingExact, exact: true });
    await expect(h).toBeVisible();
    const countEl = h.locator('xpath=./following-sibling::div[1]//p[1]');
    const txt = (await countEl.textContent())?.trim() ?? '0';
    return Number(/^\d+$/.test(txt) ? txt : '0');
  };
  return {
    active: await get('Active Jobs'),
    drafted: await get('Drafted Jobs'),
    closed: await get('Closed Jobs'),
    paused: await get('Paused Jobs'),
  };
}

// small helper: be tolerant to styling differences
export async function expectSelectedVisual(el: Locator) {
  const cls = (await el.getAttribute('class')) || '';
  const aria = await el.getAttribute('aria-pressed');
  const dataSel = await el.getAttribute('data-selected');
  expect(
    aria === 'true' ||
      dataSel === 'true' ||
      /bg-(?:primary|blue)|text-white|ring-(?:primary|blue)|border-(?:primary|blue)/i.test(cls)
  ).toBeTruthy();
}
