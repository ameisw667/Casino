import { test, expect } from '@playwright/test';

// Regression test for the retired /fairness route (see src/proxy.ts PUBLIC_ROUTES
// comment: "must reach Next.js so it returns a real 404 instead of an auth redirect").
// Found via a Playwright MCP pilot run (worldmap/01_Playwright-CLI-MCP.md) navigating
// to /fairness and observing HTTP 404 instead of a sign-in redirect.
test('retired /fairness route returns a real 404 instead of an auth redirect', async ({ page }) => {
  const response = await page.goto('/fairness');

  expect(response?.status()).toBe(404);
  expect(page.url()).toContain('/fairness');
});
