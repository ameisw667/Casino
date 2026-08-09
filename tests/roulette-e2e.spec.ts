/**
 * Roulette E2E Test — verifies /games/roulette board + wheel + betting.
 * Run: npx playwright test tests/roulette-e2e.spec.ts --reporter=list
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3015';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        id: `roulette-e2e-${nonce}`,
        roll: 7,
        payout: 20,
        win: true,
        serverSeedHash: 'roulette-e2e-seed-hash',
        nonce,
      }),
    });
  });
  await context.route(/clerk\.accounts\.dev|clerk\./, (route) => route.abort('blockedbyclient'));
});

test.describe('Roulette', () => {
  test('loads and shows animated wheel and betting board', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/roulette`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(1200);

    const wheel = page.getByTestId('roulette-wheel');
    const board = page.locator('.roulette-board').first();
    const placeBtn = page
      .locator('button')
      .filter({ hasText: /PLACE BET/ })
      .first();

    await expect(wheel).toBeVisible({ timeout: 10000 });
    await expect(board).toBeVisible({ timeout: 10000 });
    await expect(placeBtn).toBeVisible({ timeout: 10000 });

    const boardBox = await board.boundingBox();
    expect(boardBox).not.toBeNull();
    expect(boardBox!.width).toBeGreaterThan(400);
  });

  test('places three consecutive roulette spins', async ({ page }) => {
    await page.goto(`${BASE_URL}/games/roulette`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(1500);

    const placeBtn = page
      .locator('button')
      .filter({ hasText: /PLACE BET/ })
      .first();
    await expect(placeBtn).toBeVisible({ timeout: 10000 });
    await page.getByTitle('Toggle turbo (T)').click();

    async function spinRound(round: number) {
      const tenChip = page.locator('[data-testid="chip-10"]').first();
      if (await tenChip.count()) {
        await tenChip.click();
      } else {
        const chips = page.locator('.roulette-right .chip-coin');
        await chips.nth(2).click();
      }

      const redBtn = page.getByTestId('roulette-bet-red');
      await expect(redBtn).toBeVisible({ timeout: 5000 });
      await redBtn.click();

      await placeBtn.click();
      console.log(`Spin ${round} started`);

      await expect(page.locator('.roulette-page')).toBeVisible();

      const hubNumber = page
        .locator('div')
        .filter({ hasText: /^[0-9]$/ })
        .first();
      await expect(hubNumber).toBeVisible({ timeout: 10000 });
      await expect(placeBtn).toBeEnabled({ timeout: 5000 });
      console.log(`Spin ${round} settled`);

      // The UI keeps the winning bet visible briefly before clearing the table.
      await wait(3700);
    }

    await spinRound(1);
    await spinRound(2);
    await spinRound(3);

    const errorToast = page
      .locator('[role="status"], .toast')
      .filter({ hasText: /error|failed|insufficient/i });
    expect(await errorToast.count()).toBe(0);

    console.log('✓ Three consecutive roulette spins completed successfully');
  });
});
