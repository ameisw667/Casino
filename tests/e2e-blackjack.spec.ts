import { test, expect } from '@playwright/test';

test('Blackjack table loads with betting controls', async ({ page }) => {
  await page.goto('/games/blackjack', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await expect(page.locator('body')).toBeVisible();

  // Deal or bet button should be present
  const dealButton = page.locator('button:has-text("Deal"), button:has-text("Karten geben"), button:has-text("Bet")').first();
  await expect(dealButton).toBeVisible({ timeout: 10000 });
});
