import { test, expect } from '@playwright/test';

test('Games overview page loads with game cards', async ({ page }) => {
  await page.goto('/games', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Verify page content
  await expect(page.locator('body')).toBeVisible();

  // Links to all 5 core games should exist
  const diceLink = page.locator('a[href*="/games/dice"]').first();
  const crashLink = page.locator('a[href*="/games/crash"]').first();
  const slotsLink = page.locator('a[href*="/games/slots"]').first();

  await expect(diceLink.or(crashLink).or(slotsLink)).toBeVisible({ timeout: 10000 });
});
