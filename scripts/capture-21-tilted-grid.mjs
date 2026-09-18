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
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3015/games...');
  await page.goto('http://localhost:3015/games', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  const grid = page.locator('[data-testid="scroll-tilted-games-grid"]').first();
  await grid.scrollIntoViewIfNeeded();
  await grid.waitFor({ state: 'visible', timeout: 10000 });

  // Move mouse to trigger 3D tilt dynamic perspective
  const box = await grid.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
    await page.waitForTimeout(600);
  }

  const file1 = path.join(DOCS_DIR, '21_success_scroll_tilted_grid.png');
  const file2 = path.join(BRAIN_DIR, '21_success_scroll_tilted_grid.png');

  await grid.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 21_success_scroll_tilted_grid.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
