/**
 * Standalone Roulette E2E — launches a headless Chromium browser,
 * opens /games/roulette and plays three consecutive spins.
 * Run: npx tsx scripts/roulette-e2e.ts
 */
import { chromium, Page } from 'playwright';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3015';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spinRound(page: Page, round: number) {
  const tenChip = page.locator('[data-testid="chip-10"]').first();
  if (await tenChip.count()) {
    await tenChip.click();
  } else {
    const chips = page.locator('.roulette-right .chip-coin');
    await chips.nth(2).click();
  }

  const redBtn = page.locator('div').filter({ hasText: /^RED$/ }).first();
  await redBtn.waitFor({ state: 'visible', timeout: 5000 });
  await redBtn.click();

  const placeBtn = page
    .locator('button')
    .filter({ hasText: /PLACE BET/ })
    .first();
  await placeBtn.click();
  console.log(`Spin ${round} started`);

  // Wait for result badge to appear in the wheel hub after animation
  const hubNumber = page.locator('[data-testid="wheel-hub"] span').first();
  await hubNumber.waitFor({ state: 'visible', timeout: 15000 });
  const text = await hubNumber.textContent();
  if (!text || text === '?' || isNaN(Number(text))) {
    throw new Error(`Wheel hub did not settle on a number (got: ${text})`);
  }
  console.log(`Spin ${round} settled`);

  await wait(1500);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.route(/clerk\.accounts\.dev|clerk\./, (route) => route.abort('blockedbyclient'));

  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/games/roulette`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await wait(1500);

    const wheel = page.locator('[data-testid="roulette-wheel"]').first();
    const board = page.locator('.roulette-board').first();
    const placeBtn = page
      .locator('button')
      .filter({ hasText: /PLACE BET/ })
      .first();

    await wheel.waitFor({ state: 'visible', timeout: 10000 });
    await board.waitFor({ state: 'visible', timeout: 10000 });
    await placeBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Wheel and board visible');

    await spinRound(page, 1);
    await spinRound(page, 2);
    await spinRound(page, 3);

    const errorToast = page
      .locator('[role="status"], .toast')
      .filter({ hasText: /error|failed|insufficient/i });
    const count = await errorToast.count();
    if (count > 0) {
      throw new Error(`Found ${count} error toast(s)`);
    }

    console.log('✓ Three consecutive roulette spins completed successfully');
  } catch (e) {
    console.error('Test failed:', e);
    await page.screenshot({ path: 'scripts/roulette-e2e-failure.png', fullPage: true });
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
