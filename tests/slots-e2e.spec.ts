/**
 * Slots E2E Test — verifies the redesigned /games/slots page.
 * Run: npx playwright test tests/slots-e2e.spec.ts --reporter=list
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3015';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.use({
  // Block Clerk JS / accounts.dev noise so headless runs stay fast and offline-safe
  contextOptions: {
    viewport: { width: 1440, height: 900 },
  },
});

test.beforeEach(async ({ context }) => {
  let nonce = 0;
  await context.route('**/api/casino/bet', async (route) => {
    nonce += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `slots-e2e-${nonce}`,
        symbols: [0, 0, 0, 1, 2],
        payout: 50,
        win: true,
        serverSeedHash: 'slots-e2e-seed-hash',
        nonce,
      }),
    });
  });
  await context.route(/clerk\.accounts\.dev|clerk\./, (route) => route.abort('blockedbyclient'));
});

test.describe('Slots', () => {
  test('loads and shows the slot machine above the fold', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/slots`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for hydration / mount
    await page.waitForTimeout(1000);

    // Machine frame, reels and spin button must be visible without scrolling
    const machine = page.locator('.slot-machine');
    const reels = page.locator('.slot-reels-frame');
    const spinBtn = page.locator('button').filter({ hasText: /SPIN|SPINNING/ }).first();

    await expect(machine).toBeVisible({ timeout: 10000 });
    await expect(reels).toBeVisible({ timeout: 10000 });
    await expect(spinBtn).toBeVisible({ timeout: 10000 });

    // Verify no vertical overflow hides the spin button
    const spinBox = await spinBtn.boundingBox();
    expect(spinBox).not.toBeNull();
    expect(spinBox!.y).toBeLessThan(900);
  });

  test('can play three consecutive spins without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/slots`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const betInput = page.locator('input[type="number"]').first();
    const spinBtn = page.locator('button').filter({ hasText: /SPIN|SPINNING/ }).first();

    // Ensure a sane default bet amount
    await betInput.fill('5');
    await page.waitForTimeout(200);

    // Spin 1
    await spinBtn.click();
    console.log('Spin 1 started');
    await wait(2500);
    await expect(page.locator('.slot-reel-window.spinning')).toHaveCount(0, { timeout: 10000 });
    console.log('Spin 1 settled');

    // Spin 2
    await spinBtn.click();
    console.log('Spin 2 started');
    await wait(2500);
    await expect(page.locator('.slot-reel-window.spinning')).toHaveCount(0, { timeout: 10000 });
    console.log('Spin 2 settled');

    // Spin 3
    await spinBtn.click();
    console.log('Spin 3 started');
    await wait(2500);
    await expect(page.locator('.slot-reel-window.spinning')).toHaveCount(0, { timeout: 10000 });
    console.log('Spin 3 settled');

    // After 3 spins the session stats should show 3 spins
    const spinsReadout = page.locator('.slot-readout-value.idle').filter({ hasText: /3/ });
    await expect(spinsReadout).toBeVisible({ timeout: 5000 });

    // No error toast should be present
    const errorToast = page.locator('[role="status"], .toast').filter({ hasText: /error|failed/i });
    expect(await errorToast.count()).toBe(0);

    console.log('✓ Three consecutive spins completed successfully');
  });

  test('right-side control panel is visible and usable', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/slots`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    const controlPanel = page.locator('.slot-control-panel');
    const balanceCard = page.locator('.slot-balance-value');
    const quickBet = page.locator('.slot-quick-bet').first();
    const autoToggle = page.locator('.slot-auto-toggle');

    await expect(controlPanel).toBeVisible({ timeout: 10000 });
    await expect(balanceCard).toBeVisible({ timeout: 10000 });
    await expect(quickBet).toBeVisible({ timeout: 10000 });

    // Quick-bet chip should update the input
    await quickBet.click();
    const betInput = page.locator('input[type="number"]').first();
    const inputValue = await betInput.inputValue();
    expect(inputValue).toBe('1');

    // AUTO toggle should be clickable
    await autoToggle.click();
    await expect(autoToggle).toHaveClass(/active/);
  });
});
