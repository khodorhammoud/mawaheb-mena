/*
api-helpers.ts is a tiny utility module that lets your Playwright tests create and destroy test data by calling special back‑end endpoints,
rather than clicking through the UI. It speeds up test setup, makes data management deterministic, and keeps your database clean.
*/

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// ---------------------------------------------------------------------------
// createTestUser
// ---------------------------------------------------------------------------
export async function createTestUser(
  userType: 'freelancer' | 'employer',
  data: Record<string, unknown>
) {
  const res = await fetch(`${API_URL}/test/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userType, ...data })
  });

  return res.json(); // e.g. { id: 'usr_123', email: 'new@ex.com', ... }
}

// ---------------------------------------------------------------------------
// createTestJob
// ---------------------------------------------------------------------------
export async function createTestJob(
  employerId: string,
  jobData: Record<string, unknown>
) {
  const res = await fetch(`${API_URL}/test/create-job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employerId, ...jobData })
  });

  return res.json();
}

// ---------------------------------------------------------------------------
// cleanupTestData
// ---------------------------------------------------------------------------
export async function cleanupTestData(ids: string[]) {
  await fetch(`${API_URL}/test/cleanup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
}

// ============================================================================
// SAMPLE USAGE inside a Playwright spec (inside a test)
// ============================================================================
//
// import { test, expect } from '@playwright/test';
// import { createTestUser, createTestJob, cleanupTestData } from '../utils/api-helpers';
// import { generateEmployer, generateJob } from '../utils/test-data';
//
// test('dashboard shows newly‑seeded job', async ({ page }) => {
//   // ---- seed -------------------------------------------------------------
//   const employer = await createTestUser('employer', generateEmployer());
//   const job      = await createTestJob(employer.id, generateJob());
//
//   // ---- exercise (UI) ----------------------------------------------------
//   const login = new LoginPage(page);
//   await login.goto();
//   await login.login(employer.email, employer.password);
//
//   await page.getByRole('link', { name: /my jobs/i }).click();
//   await expect(page.getByText(job.title)).toBeVisible();
//
//   // ---- cleanup ----------------------------------------------------------
//   await cleanupTestData([employer.id, job.id]);
// });
//
// ============================================================================