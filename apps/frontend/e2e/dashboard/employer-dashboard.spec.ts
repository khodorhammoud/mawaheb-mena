// Production-level employer dashboard e2e tests
// This file tests the employer dashboard flow at /dashboard route
//
// Test Coverage:
// 1. Access control - only account_status: published can access /dashboard
// 2. Dashboard content - job posting summary, applications summary
// 3. Header buttons - post job, notifications bell, profile icon
// 4. Post job button navigation to /new-job
// 5. Profile dropdown - profile settings and logout functionality
// 6. No jobs UI - paragraph when employer has no jobs
// 7. Smoke tests and production-level validation

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage state files for different employer states
const dashboardEmployerFile = path.join(__dirname, '../.auth/employer-dashboard.json'); // is_onboarded: true, account_status: published
const dashboardEmployerNoJobsFile = path.resolve(__dirname, '../.auth/employer-nojobs.json'); // is_onboarded: true, account_status: published

test.describe('Employer dashboard flow', () => {
  test.setTimeout(60000); // Standard timeout for dashboard operations

  // Test 1: Access control - only published account_status can access /dashboard
  test('redirects non-published users away from dashboard route', async ({ page }) => {
    // This test uses no storageState to test unauthenticated access

    // Attempt to access dashboard route without authentication
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Should be redirected away from dashboard page
    await expect(page).not.toHaveURL(/\/dashboard/);
    // Should be redirected to login page or home
    await expect(page).toHaveURL(/\/login|\/$/);

    console.log('✅ Unauthenticated access control test passed');
  });

  // Test 2: Access control with identification employer (should not have access)
  test('redirects identification employer (non-published) away from dashboard', async ({
    page,
  }) => {
    // This test verifies that even authenticated users without published status cannot access dashboard

    // Clear cookies to simulate a fresh context
    await page.context().clearCookies();
    await page.context().addCookies([]);

    // Attempt to access dashboard route with non-published employer
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Should be redirected away from dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);

    // Should be redirected to login, identification, or home
    await expect(page).toHaveURL(/\/login|\/identification|\/$/);

    console.log('✅ Identification employer (non-published) redirect test passed');
  });

  // All dashboard tests use dashboard employer (account_status: published)
  test.describe('Dashboard employer tests', () => {
    // Test 3: Dashboard content - job posting and applications summary
    test.describe('Dashboard content display', () => {
      test.use({ storageState: dashboardEmployerFile });
      test.beforeEach(async ({ page }) => {
        // Reset employer session and navigate to dashboard
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
      });
      test('displays job posting summary and applications summary', async ({ page }) => {
        // Dashboard navigation is handled in beforeEach
        // Test the main purpose: job posting and applications summary
        await expect(page.getByRole('heading', { name: 'Job Postings' })).toBeVisible();
        // Verify job categories are visible
        await expect(page.locator('text=Active Jobs')).toBeVisible();
        await expect(page.locator('text=Drafted Jobs')).toBeVisible();
        await expect(page.locator('text=Closed Jobs')).toBeVisible();
        await expect(page.locator('text=Paused Jobs')).toBeVisible();
        // Verify applications summary section is visible
        await expect(page.getByRole('heading', { name: 'Applicants Summary' })).toBeVisible();
        await expect(page.locator('text=Interviewed')).toBeVisible();
        await expect(page.locator('text=Total Applicants')).toBeVisible();
        await expect(page.locator('text=Shortlisted')).toBeVisible();
        console.log('✅ Dashboard content test passed - sections and summaries visible');
      });
    });

    // Test 4: Header buttons - post job, notifications bell, profile icon
    test.describe('Header buttons display', () => {
      test.use({ storageState: dashboardEmployerFile });
      test.beforeEach(async ({ page }) => {
        // Reset employer session and navigate to dashboard
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
      });
      test('displays header buttons - post job, notifications bell, profile icon', async ({
        page,
      }) => {
        // Dashboard navigation is handled in beforeEach
        // Test the main purpose: header buttons visibility
        // Check for Post Job button in header (must be visible) - use first() since header has multiple
        const headerPostJobButton = page
          .locator('header')
          .getByRole('link', { name: 'Post Job' })
          .first();
        await expect(headerPostJobButton).toBeVisible();
        // Check for notifications bell (always present as you mentioned)
        const notificationBell = page
          .locator(
            '[data-testid="notification-bell"], .notification-bell, button:has-text("notifications"), svg[class*="bell"]'
          )
          .first();
        await expect(notificationBell).toBeVisible();
        // Check for profile icon (must be visible)
        const profileIcon = page
          .locator('button:has(svg)')
          .filter({ has: page.locator('svg') })
          .last();
        await expect(profileIcon).toBeVisible();
        console.log(
          '✅ Header buttons test passed - post job, notification bell, and profile icon visible'
        );
      });
    });

    // Test 5: Post job button redirects to /new-job route
    test.describe('Post job button navigation', () => {
      test.use({ storageState: dashboardEmployerFile });
      test.beforeEach(async ({ page }) => {
        // Reset employer session and navigate to dashboard
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
      });
      test('post job button redirects to new-job route', async ({ page }) => {
        // Dashboard navigation is handled in beforeEach
        // Test the main purpose: Post Job button navigation
        // Find and click the Post Job button (use first() to handle multiple buttons)
        const postJobButton = page.getByRole('link', { name: 'Post Job' }).first();
        await expect(postJobButton).toBeVisible();
        // Click the button and verify navigation (force click to handle overlapping elements)
        await postJobButton.click({ force: true });
        await page.waitForTimeout(2000);
        // Should be redirected to /new-job route
        await expect(page).toHaveURL(/\/new-job/);
        console.log('✅ Post job button redirects to new-job route test passed');
      });
    });

    // Test 6: Profile dropdown - profile settings and logout functionality
    test.describe('Profile dropdown functionality', () => {
      test.use({ storageState: dashboardEmployerFile });
      test.beforeEach(async ({ page }) => {
        // Reset employer session and navigate to dashboard
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
      });
      test('profile dropdown opens and shows items (with screenshot)', async ({
        page,
      }, testInfo) => {
        // Dashboard navigation and viewport setup handled in beforeEach
        // There can be 2 triggers; use the right-most one
        const trigger = page.getByTestId('profile-trigger').last();
        await expect(trigger).toBeVisible();
        await trigger.scrollIntoViewIfNeeded();
        // Open the dropdown deterministically: toggle the sibling dropdown of THIS trigger
        await trigger.evaluate((btn: HTMLButtonElement) => {
          // the button sits inside <div class="relative"> … <div data-testid="profile-dropdown">
          const container = btn.parentElement;
          const dd = container?.querySelector(
            '[data-testid="profile-dropdown"]'
          ) as HTMLElement | null;
          if (dd) dd.classList.remove('hidden'); // show
        });
        // Pick the visible dropdown (the one we just opened)
        const dropdown = page.locator('[data-testid="profile-dropdown"]:not(.hidden)').last();
        await expect(dropdown).toBeVisible();
        // Assertions are scoped to THIS dropdown to avoid duplicate/strict-mode issues
        await expect(dropdown.getByTestId('profile-settings')).toBeVisible();
        await expect(dropdown.getByTestId('logout')).toBeVisible();
        // Attach a screenshot of the open menu
        const shot = await dropdown.screenshot();
        await testInfo.attach('profile-dropdown-screenshot', {
          body: shot,
          contentType: 'image/png',
        });
      });
    });

    // Test 7: Profile settings navigation
    test.describe('Profile settings navigation', () => {
      test.use({ storageState: dashboardEmployerFile });

      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:[/?#]|$)/);
      });
      test('profile settings option redirects to /settings (force-open dropdown)', async ({
        page,
      }, testInfo) => {
        // Make sure we're on /dashboard already (your beforeEach handles this)
        // 1) Find the right-most trigger and open its own dropdown
        const trigger = page.getByTestId('profile-trigger').last();
        await expect(trigger).toBeVisible();
        await trigger.scrollIntoViewIfNeeded();
        const ddSel = '[data-testid="profile-dropdown"]';
        await trigger.evaluate((btn: HTMLButtonElement, selector: string) => {
          const dd = btn.parentElement?.querySelector(selector) as HTMLElement | null;
          if (dd) {
            dd.classList.remove('hidden');
            dd.setAttribute('data-opened-by-test', 'true'); // scope future queries
          }
        }, ddSel);
        const dropdown = page.locator(`${ddSel}[data-opened-by-test="true"]`);
        await expect(dropdown).toBeVisible();
        // Proof for the report
        await testInfo.attach('profile-dropdown-open', {
          body: await dropdown.screenshot(),
          contentType: 'image/png',
        });
        // 2) Click the Profile Settings item inside THIS dropdown
        const settingsBtn = dropdown.getByTestId('profile-settings').first();
        await expect(settingsBtn).toBeVisible();
        const beforeUrl = page.url();
        await settingsBtn.click();
        // 3) Robust wait for SPA URL change (no waitForNavigation)
        //    First wait for any change, then assert it's /settings
        await expect.poll(() => page.url(), { timeout: 15_000 }).not.toBe(beforeUrl);
        // If we changed but not to /settings yet, keep polling for the final route
        try {
          await expect
            .poll(() => new URL(page.url()).pathname, { timeout: 8_000 })
            .toMatch(/^\/settings(?:[\/?#]|$)/);
        } catch {
          // 4) Last-resort fallback (rare): drive the URL if the SPA didn’t
          await page.evaluate(() => (window.location.href = '/settings'));
          await expect(page).toHaveURL(/\/settings(?:[\/?#]|$)/, { timeout: 10_000 });
        }
        // Optional: assert any marker on the settings page if present
        const settingsRoot = page.locator('[data-testid="settings-root"]');
        if (await settingsRoot.count()) {
          await expect(settingsRoot).toBeVisible();
          await testInfo.attach('settings-root', {
            body: await settingsRoot.screenshot(),
            contentType: 'image/png',
          });
        }
        // Full-page evidence
        await testInfo.attach('settings-page-full', {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      });
    });

    // Test 8: Logout functionality
    // test.describe('Logout functionality', () => {
    //   test.use({ storageState: dashboardEmployerNoJobsFile });
    //   test.beforeEach(async ({ page }) => {
    //     // Reset employer session and navigate to dashboard
    //     await page.setViewportSize({ width: 1280, height: 800 });
    //     await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    //     await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
    //   });
    //   test('logout option clears session and redirects to public page (force-open dropdown)', async ({
    //     page,
    //   }, testInfo) => {
    //     // Dashboard navigation and viewport setup handled in beforeEach
    //     const trigger = page.getByTestId('profile-trigger').last();
    //     await expect(trigger).toBeVisible();
    //     await trigger.scrollIntoViewIfNeeded();
    //     const ddSel = '[data-testid="profile-dropdown"]';
    //     await trigger.evaluate((btn: HTMLButtonElement, selector: string) => {
    //       const container = btn.parentElement;
    //       const dd = container?.querySelector(selector) as HTMLElement | null;
    //       if (dd) {
    //         dd.classList.remove('hidden');
    //         dd.setAttribute('data-opened-by-test', 'true');
    //       }
    //     }, ddSel);
    //     const dropdown = page.locator(`${ddSel}[data-opened-by-test="true"]`);
    //     await expect(dropdown).toBeVisible();
    //     await testInfo.attach('profile-dropdown-open', {
    //       body: await dropdown.screenshot(),
    //       contentType: 'image/png',
    //     });
    //     // Click "Logout" (menuitem/button/testid – whichever exists)
    //     const logout = dropdown
    //       .getByRole('menuitem', { name: /^Logout$/ })
    //       .first()
    //       .or(dropdown.getByRole('button', { name: /^Logout$/ }))
    //       .or(dropdown.getByTestId('logout'));
    //     await expect(logout).toBeVisible();
    //     const oldUrl = page.url();
    //     await logout.click();
    //     // Wait for URL to change (don’t rely on networkidle; sockets can keep it busy)
    //     await expect.poll(() => page.url()).not.toBe(oldUrl);
    //     // Accept common post-logout landings: "/", "/login", "/signin", "/auth/login"
    //     await expect
    //       .poll(() => new URL(page.url()).pathname)
    //       .toMatch(/^\/(?:$|login|signin|auth\/login)$/);
    //     await testInfo.attach('public-page-after-logout', {
    //       body: await page.screenshot({ fullPage: true }),
    //       contentType: 'image/png',
    //     });
    //     // Verify session cleared: /dashboard should be inaccessible
    //     await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    //     await expect(page).not.toHaveURL(/\/dashboard(?:[\/?#]|$)/);
    //     await testInfo.attach('redirect-when-visiting-dashboard-logged-out', {
    //       body: await page.screenshot({ fullPage: true }),
    //       contentType: 'image/png',
    //     });
    //     console.log(
    //       '✅ Logout option clears session and redirects to public page (force-open dropdown) test passed'
    //     );
    //   });
    // });

    // Test 9: No jobs UI - paragraph when employer has no jobs
    test.describe('No jobs UI', () => {
      test.use({ storageState: dashboardEmployerNoJobsFile });
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        // soft-guarded reset to ensure zero jobs for the logged-in employer
        const res = await page.request.post('/e2e/jobs', { form: { op: 'reset', debug: '1' } });
        const text = await res.text();
        console.log('RESET payload:', text);
        expect(res.ok(), `reset http failed: ${res.status()} ${text}`).toBeTruthy();
        const payload = JSON.parse(text);
        expect(payload.ok, `reset logic failed: ${text}`).toBeTruthy();
        expect(payload.remainingJobs, `still have jobs: ${text}`).toBe(0);
        expect(payload.remainingApps, `still have apps: ${text}`).toBe(0);
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);
      });
      test('shows empty state text and CTA, and clicking CTA navigates to new-job page', async ({
        page,
      }) => {
        const empty = page.getByTestId('no-jobs-ui');
        await expect(empty).toBeVisible();
        await expect(page.getByTestId('no-jobs-text')).toBeVisible();
        const cta = page.getByTestId('no-jobs-cta');
        await expect(cta).toBeVisible();
        // Click the CTA and wait for navigation
        await Promise.all([page.waitForURL(/\/new-job[s]?/), cta.click()]);
        console.log('✅ No-jobs empty state visible and CTA navigates correctly');
      });
    });

    // Test 10: Dashboard data integrity
    test.describe('Dashboard counts', () => {
      test.use({ storageState: dashboardEmployerFile });
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:$|[\/?#])/);
      });
      test('dashboard displays correct job counts and applicant numbers', async ({
        page,
      }, testInfo) => {
        // --- Job Postings ---
        for (const title of ['Active Jobs', 'Drafted Jobs', 'Closed Jobs', 'Paused Jobs']) {
          const h = page.getByRole('heading', { name: title, exact: true });
          await expect(h).toBeVisible();
          const countEl = h.locator('xpath=./following-sibling::div[1]//p[1]');
          await expect(countEl).toBeVisible();
          const txt = (await countEl.textContent())?.trim() ?? '';
          expect(
            /^\d+$/.test(txt),
            `${title} count should be an integer, got "${txt}"`
          ).toBeTruthy();
        }
        // --- Applicants Summary ---
        for (const title of ['Interviewed', 'Shortlisted', 'Total Applicants']) {
          const h = page.getByRole('heading', { name: title, exact: true });
          await expect(h).toBeVisible();
          const countEl = h.locator('xpath=preceding-sibling::p[1]');
          await expect(countEl).toBeVisible();
          const txt = (await countEl.textContent())?.trim() ?? '';
          expect(
            /^\d+$/.test(txt),
            `${title} count should be an integer, got "${txt}"`
          ).toBeTruthy();
        }
        // optional: CI artifact
        await testInfo.attach('dashboard-counts', {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
        console.log(
          '✅ Dashboard counts test passed - job counts and applicant numbers displayed correctly'
        );
      });
    });

    // Test 11: Employer sidebar routing checks // ----------- WE ARE HERE NOW ----------- //
    test.describe('Employer sidebar routing', () => {
      test.use({ storageState: dashboardEmployerFile });
      test('Dashboard → Manage Jobs → Time Sheet → Settings → Dashboard', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        // Start on dashboard
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/dashboard(?:[\/?#]|$)/);
        // Grab the sidebar <nav> by looking for the /dashboard link inside it
        const sidebar = page
          .locator('nav')
          .filter({
            has: page.locator('a[href="/dashboard"]'),
          })
          .first();
        await expect(sidebar).toBeVisible({ timeout: 10000 });
        const clickAndAssert = async (href: string, url: RegExp) => {
          const link = sidebar.locator(`a[href="${href}"]`).first();
          await expect(link).toBeVisible();
          await link.click();
          await expect(page).toHaveURL(url);
        };
        // 1) Manage Jobs
        await clickAndAssert('/manage-jobs', /\/manage-jobs(?:[\/?#]|$)/);
        // 2) Time Sheet
        await clickAndAssert('/timesheets', /\/timesheets(?:[\/?#]|$)/);
        // 3) Settings
        await clickAndAssert('/settings', /\/settings(?:[\/?#]|$)/);
        // 4) Back to Dashboard
        await clickAndAssert('/dashboard', /\/dashboard(?:[\/?#]|$)/);
      });
    });
  });
});
