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
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to /games...');
  await page.goto('http://localhost:3015/games', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Find the first game card
  const firstCard = page.locator('article').first();
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const box = await firstCard.boundingBox();
  if (box) {
    // Move mouse over the card to trigger hover transition angle & sheen
    const mouseX = box.x + box.width * 0.35;
    const mouseY = box.y + box.height * 0.38;
    console.log('Moving mouse to', mouseX, mouseY);
    await page.mouse.move(mouseX, mouseY);
    await page.waitForTimeout(1200);

    const file1 = path.join(DOCS_DIR, '05_success_game_card.png');
    const file2 = path.join(BRAIN_DIR, '05_success_game_card.png');

    await firstCard.screenshot({ path: file1 });
    fs.copyFileSync(file1, file2);
    console.log('SUCCESS: Captured 05_success_game_card.png with active directional sheen!');
  } else {
    console.error('ERROR: Could not find bounding box for first card');
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
