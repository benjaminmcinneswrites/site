import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  timeout: 10_000,
  expect: {
    timeout: 1_000,
  },
  use: {
    baseURL,
    headless: true,
    screenshot: 'off',
    trace: 'off',
    video: 'off',
    actionTimeout: 3_000,
    navigationTimeout: 5_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `python local-server.py ${port}`,
    url: `${baseURL}/`,
    reuseExistingServer: true,
    timeout: 10_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
