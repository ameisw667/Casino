import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3015',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3015',
    reuseExistingServer: true,
    timeout: 120000,
    // NEXT_PUBLIC_E2E_HOOKS enables the Playwright-only analytics bridge (see
    // src/lib/testing/e2e-analytics-hooks.ts) used by tests/e2e-analytics-tracking.spec.ts.
    // Never set for a Vercel build — this only reaches the dev server Playwright itself starts.
    // NOTE: if a dev server on this port was already running before this var was added, it must
    // be restarted once to pick it up (Next.js inlines NEXT_PUBLIC_* at process start).
    env: {
      NEXT_PUBLIC_E2E_HOOKS: '1',
    },
  },
});
