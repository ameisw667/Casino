import { test, expect } from '@playwright/test';

test('Landing page loads and has correct elements', async ({ page }) => {
  // Increase timeout for first load (compilation)
  await page.goto('http://localhost:3000/landing', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  // Check for the main heading
  const heading = page.locator('h1');
  await expect(heading).toBeVisible({ timeout: 10000 });
  await expect(heading).toContainText('ASCEND TO THE VAULT');

  // Check for the "Trial" section
  const trialSection = page.locator('#trial');
  await expect(trialSection).toBeVisible({ timeout: 10000 });

  // Check for the "Live Ticker"
  const ticker = page.locator('text=LIVE WIN:');
  await expect(ticker).toBeVisible({ timeout: 10000 });
});
