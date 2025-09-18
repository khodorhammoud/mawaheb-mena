import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test env vars from .env.test
loadEnv({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './e2e',
  timeout: 40000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // These run once for the whole run
  globalSetup: './e2e/setup/global-setup.ts',
  globalTeardown: './e2e/setup/global-teardown.ts',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1) General auth setup
    {
      name: 'setup:auth',
      testMatch: /e2e\/setup\/auth\.setup\.ts/,
    },
    // 2) No-jobs auth setup
    {
      name: 'setup:nojobs',
      testMatch: /e2e\/setup\/auth\.nojobs\.setup\.ts/,
    },
    // 3) Deactivated auth setup
    { name: 'setup:deactivated', testMatch: /e2e\/setup\/auth\.deactivated\.setup\.ts/ },

    // --- Browser projects (depend on the setup projects) ---
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup:auth', 'setup:nojobs', 'setup:deactivated'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup:auth', 'setup:nojobs', 'setup:deactivated'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup:auth', 'setup:nojobs', 'setup:deactivated'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup:auth', 'setup:nojobs', 'setup:deactivated'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup:auth', 'setup:nojobs', 'setup:deactivated'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL || '',
    },
  },
});
