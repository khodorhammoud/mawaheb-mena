import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

// Load test env vars from .env.test
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
  globalSetup: './e2e/setup/global-setup.ts',
  globalTeardown: './e2e/setup/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // browsers to test on
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      // Use the same DATABASE_URL as global setup/teardown
      DATABASE_URL: process.env.DATABASE_URL || '',
    },
  },
});
