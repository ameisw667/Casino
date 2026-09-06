import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/7e74155b-3b16-404c-87b8-d1d89aa8ebc8';

test('Audit 5 Live Crash Rounds with console monitoring and screenshots', async ({ page }) => {
  const consoleLogs: string[] = [];
  const networkEvents: string[] = [];

  page.on('console', (msg) => {
    const text = `[Console ${msg.type()}]: ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', (err) => {
    const text = `[PageError]: ${err.message}`;
    consoleLogs.push(text);
    console.error(text);
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/casino/bet')) {
      const status = res.status();
      try {
        const body = await res.json();
        networkEvents.push(`[API Response ${status}]: ${JSON.stringify(body)}`);
        console.log(`[API Response ${status}]:`, JSON.stringify(body).slice(0, 180));
      } catch {
        networkEvents.push(`[API Response ${status}]: <non-json>`);
      }
    }
  });

  await page.setViewportSize({ width: 1400, height: 900 });

  console.log('Navigating to /games/crash...');
  await page.goto('http://localhost:3015/games/crash', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // Initial stage
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'audit_round_0_initial.png'),
  });

  for (let i = 1; i <= 5; i++) {
    console.log(`\n=================== AUDIT ROUND ${i} ===================`);
    const launchBtn = page.locator('button:has-text("LAUNCH BET")');
    await expect(launchBtn).toBeVisible({ timeout: 15000 });
    await expect(launchBtn).toBeEnabled({ timeout: 15000 });

    await launchBtn.click();
    console.log(`Round ${i}: Clicked LAUNCH BET`);

    const cashoutBtn = page.locator('button.emerald-btn');
    let wasAirborne = false;

    // Check if flight starts or early busts
    for (let t = 0; t < 25; t++) {
      if (await cashoutBtn.isVisible()) {
        wasAirborne = true;
        break;
      }
      await page.waitForTimeout(100);
    }

    if (wasAirborne) {
      const targetTime = i === 1 ? 600 : i === 2 ? 1600 : i === 3 ? 4000 : i === 4 ? 1200 : 3500;
      console.log(`Round ${i}: In flight! Waiting up to ${targetTime}ms for high climb...`);
      let elapsed = 0;
      while (elapsed < targetTime && (await cashoutBtn.isVisible())) {
        await page.waitForTimeout(200);
        elapsed += 200;
      }
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `audit_round_${i}_flight.png`),
      });

      // Cashout attempt for rounds 1, 2 if still airborne
      if ((i === 1 || i === 2) && (await cashoutBtn.isVisible())) {
        console.log(`Round ${i}: Attempting Cashout...`);
        await cashoutBtn.click().catch(() => {});
      } else {
        console.log(`Round ${i}: Riding flight to synchronous bust / target...`);
      }
    } else {
      console.log(`Round ${i}: Instant bust / settled before cashout appeared.`);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `audit_round_${i}_flight.png`),
      });
    }

    // Wait for settlement to show
    await page.waitForTimeout(1500);

    // Screenshot settled state
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `audit_round_${i}_settled.png`),
    });

    // Wait until launch button is visible and enabled again (waiting out the 3s crash countdown if needed)
    const nextLaunchBtn = page.locator('button:has-text("LAUNCH BET")');
    await expect(nextLaunchBtn).toBeVisible({ timeout: 15000 });
    await expect(nextLaunchBtn).toBeEnabled({ timeout: 15000 });
    await page.waitForTimeout(800);
  }

  console.log('\n--- 5 AUDIT ROUNDS COMPLETE ---');
});
