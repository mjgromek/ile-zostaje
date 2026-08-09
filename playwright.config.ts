import { defineConfig, devices } from '@playwright/test';

// A real browser against the real dev server. The checker drives the artifact,
// not the diff.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    // The audience is in Poland, so the app defaults to Polish when the browser
    // asks for Polish. Give the browser a Polish locale and the default is PL.
    locale: 'pl-PL',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
