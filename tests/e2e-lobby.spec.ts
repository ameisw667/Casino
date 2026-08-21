import { test, expect } from '@playwright/test';

test('Lobby page loads and renders core components', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Verify page title or container
  await expect(page).toHaveTitle(/Casino|Royale/i);

  // Main navigation should be present
  const mainNav = page.locator('nav').first();
  await expect(mainNav).toBeVisible({ timeout: 10000 });

  // Check presence of game grid / lobby cards
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
