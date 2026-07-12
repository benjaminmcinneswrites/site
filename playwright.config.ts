import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;
const serverCommand = process.platform === 'win32'
  ? `"C:\\Program Files\\nodejs\\node.exe" local-server.js ${port}`
  : `node local-server.js ${port}`;

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
    command: serverCommand,
    url: `${baseURL}/`,
    reuseExistingServer: true,
    timeout: 10_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
