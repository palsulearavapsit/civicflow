import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // TEST-11: Include all E2E test directories
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // TEST-11: Cross-browser testing
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'edge', use: { ...devices['Desktop Edge'] } },
    // TEST-09: Mobile-specific
    { name: 'iPhone 14', use: { ...devices['iPhone 14'] } },
    { name: 'Galaxy S9+', use: { ...devices['Galaxy S9+'] } },
    // Smoke tests run on Chromium only (fast)
    {
      name: 'smoke-chromium',
      testMatch: '**/smoke/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // A11Y tests run on Chromium (axe-core works best there)
    {
      name: 'a11y-chromium',
      testMatch: '**/a11y/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
