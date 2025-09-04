### End-to-End (E2E) Testing Guide

This document explains how E2E tests are structured and executed locally using Playwright in the monorepo, with the “Employer login” test as a reference.

### Overview

- **Runner**: Playwright runs against the Remix frontend dev server.
- **DB**: A dedicated local Postgres database is created, migrated, and seeded during global setup, and dropped on teardown.
- **Scope**: Docker-based test scripts are preserved but not used for local E2E runs.

### Key Files

- **Playwright config**: `apps/frontend/playwright.config.ts`
  - `testDir`: `./e2e`
  - `globalSetup`: `./e2e/setup/global-setup.ts`
  - `globalTeardown`: `./e2e/setup/global-teardown.ts`
  - `use.baseURL`: `http://localhost:5173`
  - `webServer`: starts the Remix dev server and injects `DATABASE_URL` from `.env.test`
  - Reporter: HTML (opens at `apps/frontend/playwright-report/index.html`)
- **Global setup**: `apps/frontend/e2e/setup/global-setup.ts`
  - Loads `apps/frontend/.env.test`
  - Ensures the test DB exists (creates if missing)
  - Runs migrations and seeds via `packages/db` scripts (uses the same `DATABASE_URL`)
- **Global teardown**: `apps/frontend/e2e/setup/global-teardown.ts`
  - Loads `apps/frontend/.env.test`
  - Terminates connections and drops the test DB
- **Reference test (Employer login)**: `apps/frontend/e2e/auth/employer-login.spec.ts`
  - `beforeEach`: ensures logged-out state
  - Flow:
    - Go to `/login-employer`
    - Login with `employer2@example.com` / `123`
    - Click “Manage Jobs”
    - Assert seeded job visible (e.g., “Senior React Developer”)
    - Logout
    - Visit `/manage-jobs` and assert redirect to login
  - `afterEach`: logs out again to keep test isolation

### Environment

- **Required**: A local Postgres instance that can create/drop databases.
- **Test env file**: `apps/frontend/.env.test`

```dotenv
NODE_ENV=test
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mawaheb_e2e
```

- Adjust DB name/user/password/port to match your local setup. The global setup will:
  - Connect to the server database (`.../postgres`)
  - Create `mawaheb_e2e` if it doesn’t exist
  - Apply migrations and seed data
- The Playwright dev server and DB scripts use this same `DATABASE_URL`.

### How Tests Start/Stop

- **Pre-test startup**:
  - Playwright launches the Remix dev server from `apps/frontend` (`npm run dev`) as configured in `playwright.config.ts`.
- **Global setup**:
  - `apps/frontend/e2e/setup/global-setup.ts`
  - Creates the DB, runs migrations and seeds.
- **Per-test setup/teardown**:
  - The example test manages auth state in `beforeEach/afterEach` (logout).
  - DB is not recreated per test; it’s prepared once globally.
- **Global teardown**:
  - `apps/frontend/e2e/setup/global-teardown.ts`
  - Drops the test DB.

### Running Tests

- From repo root:
  - **Run all tests (headless)**:
    - `pnpm --filter frontend e2e`
  - **Run UI Mode**:
    - `pnpm --filter frontend e2e:ui`
  - **Run in Debug Mode**:
    - `pnpm --filter frontend e2e:debug`
- **Run a single test file**:
  - `pnpm --filter frontend e2e -- apps/frontend/e2e/auth/employer-login.spec.ts`
- **Reports**:
  - After a run, open `apps/frontend/playwright-report/index.html`

### Reference Data and Assertions

- The seed script `packages/db/src/seeders/seeder.ts` creates:
  - Employer user: `employer2@example.com` / `123`
  - Active jobs including “Senior React Developer”
- The employer login test asserts “Senior React Developer” appears on the Manage Jobs page.

### Notes and Troubleshooting

- Ensure your local Postgres is reachable and the user can create/drop databases.
- If port `5173` is busy, update `webServer.port` and `use.baseURL` consistently in `apps/frontend/playwright.config.ts`.
- If your local Postgres differs, update `apps/frontend/.env.test` `DATABASE_URL` accordingly.
