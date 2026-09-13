import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const DOCS_DIR = path.resolve('docs/frontend/screenshots');
  const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/f9759803-5163-4a04-8fed-30c619880196/screenshots';

  for (const dir of [DOCS_DIR, BRAIN_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3015/games/dice ...');
  await page.goto('http://localhost:3015/games/dice', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  const rippleContainer = page.locator('[data-testid="game-ripple-transition"]').first();
  await rippleContainer.waitFor({ state: 'visible', timeout: 15000 });

  // Click on the central 3D dice area to trigger the concentric chromatic ripple shockwave
  const stage = page.locator('.dice-container').first();
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.45);
  } else {
    await rippleContainer.click();
  }

  // Wait 300ms for ripple to expand across the table stage
  await page.waitForTimeout(300);

  const file1 = path.join(DOCS_DIR, '27_success_ripple_transition.png');
  const file2 = path.join(BRAIN_DIR, '27_success_ripple_transition.png');

  await page.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 27_success_ripple_transition.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
