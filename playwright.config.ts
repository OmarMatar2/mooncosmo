import { defineConfig, devices } from '@playwright/test';

/** Viewports the site must work at, per the responsive requirements. */
export const VIEWPORTS = {
  'phone-small': { width: 320, height: 568 },
  'phone-large': { width: 390, height: 844 },
  'phone-landscape': { width: 844, height: 390 },
  'tablet-portrait': { width: 768, height: 1024 },
  'tablet-landscape': { width: 1024, height: 768 },
  laptop: { width: 1440, height: 900 },
  desktop: { width: 2560, height: 1440 },
} as const;

const BASE_URL = 'http://127.0.0.1:4300';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.laptop },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: VIEWPORTS.laptop },
    },
  ],

  webServer: {
    command: 'npx ng serve --port 4300 --host 127.0.0.1',
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
