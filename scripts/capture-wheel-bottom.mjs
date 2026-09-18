import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 1.5 });
  const page = await context.newPage();
  await page.goto('http://localhost:3015/games', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const wheel = page.locator('[aria-label="3D Featured Games Carousel"]').first();
  await wheel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/frontend/screenshots/games_page_bottom_wheel_actual.png' });
  await browser.close();
  console.log('CAPTURED_WHEEL_ACTUAL');
}

main().catch(console.error);
