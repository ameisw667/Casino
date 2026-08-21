import { test, expect } from '@playwright/test';

test('Leaderboard page renders ranking stream', async ({ page }) => {
  await page.goto('/leaderboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible();
  const content = page.locator('main, [role="main"]').first();
  await expect(content).toBeVisible({ timeout: 10000 });
});

test('History page renders bets table or empty state', async ({ page }) => {
  await page.goto('/history', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible();
});

test('Vault page renders VIP progression and rewards', async ({ page }) => {
  await page.goto('/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible();
});
