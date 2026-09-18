import { chromium } from 'playwright';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto('http://127.0.0.1:3015/testing/fe-50-chat', {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  await page.waitForTimeout(2000);

  const quickBar = page.locator('text=Quick Bar').first();
  await quickBar.waitFor({ state: 'visible', timeout: 10000 });

  // Hover over the quick bar buttons
  const box = await quickBar.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 140, box.y + 14);
    await page.waitForTimeout(400);
  }

  // Hide any dev indicators if present
  await page.evaluate(() => {
    const devBadge = document.querySelector('nextjs-portal, [data-nextjs-toast]');
    if (devBadge) devBadge.style.display = 'none';
  });

  const file1 = path.join(DOCS_DIR, '28_success_chat_dock.png');
  await page.screenshot({
    path: file1,
    clip: { x: 1160, y: 710, width: 280, height: 140 },
  });
  console.log('Successfully saved ' + file1);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
