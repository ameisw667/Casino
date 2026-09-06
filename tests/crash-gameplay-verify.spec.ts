import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/7e74155b-3b16-404c-87b8-d1d89aa8ebc8';

test('Verify 3 full live rounds of Crash with Cosmic Orbital Backdrop', async ({ page }) => {
  // Set viewport for crisp desktop view
  await page.setViewportSize({ width: 1400, height: 900 });

  console.log('Navigating to /games/crash...');
  await page.goto('http://localhost:3015/games/crash', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // 1. Initial visual check: canvas and backdrop
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10000 });

  const launchBtn = page.locator('button:has-text("LAUNCH BET")');
  await expect(launchBtn).toBeVisible({ timeout: 10000 });

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crash_round_0_initial.png'),
    fullPage: false,
  });
  console.log('Screenshot saved: crash_round_0_initial.png');

  // Play 3 consecutive rounds
  for (let roundNum = 1; roundNum <= 3; roundNum++) {
    console.log(`\n--- Starting Playwright Live Round ${roundNum} ---`);

    // Wait until launch button is enabled and ready
    const currentLaunchBtn = page.locator('button:has-text("LAUNCH BET")');
    await expect(currentLaunchBtn).toBeVisible({ timeout: 15000 });
    await expect(currentLaunchBtn).toBeEnabled({ timeout: 15000 });

    // Click LAUNCH BET
    await currentLaunchBtn.click();
    console.log(`Round ${roundNum}: Clicked LAUNCH BET`);

    // Wait for the action button to transition into RUNNING / Cashout state
    const cashoutBtn = page.locator('button.emerald-btn');
    await expect(cashoutBtn).toBeVisible({ timeout: 10000 });
    console.log(`Round ${roundNum}: Rocket airborne, cashout button visible`);

    // Wait 1.2 seconds for the rocket to ascend through the cosmic nebula
    await page.waitForTimeout(1200);

    // Take mid-flight screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `crash_round_${roundNum}_flight.png`),
      fullPage: false,
    });
    console.log(`Screenshot saved: crash_round_${roundNum}_flight.png`);

    // Cash out if still running
    if (await cashoutBtn.isVisible()) {
      try {
        await cashoutBtn.click({ timeout: 2000 });
        console.log(`Round ${roundNum}: Cashout clicked`);
      } catch {
        console.log(`Round ${roundNum}: Round crashed before manual cashout`);
      }
    }

    // Wait for settlement animation
    await page.waitForTimeout(2000);

    // Screenshot result state
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `crash_round_${roundNum}_settled.png`),
      fullPage: false,
    });
    console.log(`Screenshot saved: crash_round_${roundNum}_settled.png`);

    // Wait for the game to cycle back to IDLE ready for next round
    await expect(page.locator('button:has-text("LAUNCH BET")')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log(`Round ${roundNum}: Completed and returned to IDLE cleanly`);
  }

  console.log('\nAll 3 Live Crash rounds completed successfully!');
});
