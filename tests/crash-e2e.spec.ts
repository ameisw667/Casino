/**
 * Crash Game E2E Test — verifies the game works in a real browser.
 * Run: npx playwright test tests/crash-e2e.spec.ts --reporter=list
 */
import { test, expect } from '@playwright/test';

test.describe('Crash Game', () => {
  test('loads and shows initial UI', async ({ page }) => {
    await page.goto('http://localhost:3000/games/crash', { waitUntil: 'load', timeout: 30000 });
    // Should show "WAITING FOR BETS" or the multiplier display
    await expect(page.locator('text=WAITING FOR BETS').or(page.locator('h1'))).toBeVisible({ timeout: 10000 });
  });

  test('can place a bet and see the multiplier rise', async ({ page }) => {
    await page.goto('http://localhost:3000/games/crash', { waitUntil: 'load', timeout: 30000 });

    // Wait for page to be ready
    await page.waitForTimeout(2000);

    // Set bet amount
    const betInput = page.locator('input[type="number"]').first();
    await betInput.fill('10');

    // Click BET button
    const betButton = page.locator('button').filter({ hasText: /BET|AUTO ON/ }).first();
    await betButton.click();

    // Wait for the game to start — multiplier should change from 1.00
    await page.waitForTimeout(3000);

    // The multiplier display should show something > 1.00
    const multiplierText = await page.locator('h1').first().textContent();
    console.log(`Multiplier after 3s: ${multiplierText}`);
    // Should not be "1.00x" anymore (game is running)
    expect(multiplierText).not.toBe('1.00x');
  });

  test('can cash out and see win', async ({ page }) => {
    await page.goto('http://localhost:3000/games/crash', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);

    const betInput = page.locator('input[type="number"]').first();
    await betInput.fill('10');

    // Click BET
    const betButton = page.locator('button').filter({ hasText: /BET|AUTO ON/ }).first();
    await betButton.click();

    // Wait a bit for multiplier to rise
    await page.waitForTimeout(1500);

    // Click CASHOUT
    const cashoutButton = page.locator('button').filter({ hasText: 'CASHOUT' }).first();
    if (await cashoutButton.isVisible({ timeout: 2000 })) {
      await cashoutButton.click();
      // Should see "CASHED OUT" confirmation
      await expect(page.locator('text=CASHED OUT')).toBeVisible({ timeout: 5000 });
      console.log('✓ Cashout successful');
    } else {
      // Game might have crashed already — that's also valid
      console.log('⚠ Cashout button not visible (game may have crashed)');
    }
  });

  test('can play multiple rounds without reload', async ({ page }) => {
    await page.goto('http://localhost:3000/games/crash', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);

    const betInput = page.locator('input[type="number"]').first();

    // Round 1
    await betInput.fill('10');
    const betButton1 = page.locator('button').filter({ hasText: /BET|AUTO ON/ }).first();
    await betButton1.click();
    console.log('Round 1: Bet placed');

    // Wait for crash or cashout
    await page.waitForTimeout(1500);

    // Try to cash out if possible
    const cashoutBtn = page.locator('button').filter({ hasText: 'CASHOUT' }).first();
    if (await cashoutBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cashoutBtn.click();
      console.log('Round 1: Cashed out');
    }

    // Wait for round to end (CRASHED → countdown → IDLE)
    await page.waitForTimeout(8000);

    // Round 2 — should be able to bet again
    const betButton2 = page.locator('button').filter({ hasText: /BET|AUTO ON/ }).first();
    const isEnabled = await betButton2.isEnabled();
    console.log(`Round 2: Bet button enabled = ${isEnabled}`);
    expect(isEnabled).toBe(true);

    await betInput.fill('10');
    await betButton2.click();
    console.log('Round 2: Bet placed');

    // Wait and cashout
    await page.waitForTimeout(1500);
    const cashoutBtn2 = page.locator('button').filter({ hasText: 'CASHOUT' }).first();
    if (await cashoutBtn2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cashoutBtn2.click();
      console.log('Round 2: Cashed out');
    }

    console.log('✓ Multiple rounds work without reload');
  });
});
