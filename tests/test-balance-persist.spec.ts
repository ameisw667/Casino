import { test, expect } from '@playwright/test';

const serverWallet = {
  balance: 321.45,
  xp: 900,
  level: 4,
  rank: 'Bronze',
  transactionId: '00000000-0000-0000-0000-000000000000',
};

test('localStorage wallet fields cannot override the server snapshot after reload', async ({ page }) => {
  await page.route('**/api/user/balance', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(serverWallet) });
  });
  await page.addInitScript(() => {
    localStorage.setItem('casino-storage', JSON.stringify({
      state: { balance: 7777.77, xp: 999999, level: 99, rank: 'Diamond' },
      version: 1,
    }));
  });

  await page.goto('/games/dice', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('$321.45').first()).toBeVisible({ timeout: 15000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('$321.45').first()).toBeVisible({ timeout: 15000 });
});