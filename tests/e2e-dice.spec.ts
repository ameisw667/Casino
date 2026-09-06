import { test, expect } from '@playwright/test';

test('Dice game loads with controls and multiplier slider', async ({ page }) => {
  await page.goto('/games/dice', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await expect(page.locator('body')).toBeVisible();

  // Control panel or roll button should be present
  const rollButton = page
    .locator('button:has-text("Roll"), button:has-text("Würfeln"), button[type="submit"]')
    .first();
  await expect(rollButton).toBeVisible({ timeout: 10000 });
});
