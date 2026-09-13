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
  console.log('Navigating to http://localhost:3015/...');
  await page.goto('http://localhost:3015/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(2500);

  // Click the shortcuts trigger button
  const trigger = page.locator('[data-testid="keyboard-shortcuts-trigger"]').first();
  await trigger.waitFor({ state: 'visible', timeout: 5000 });
  await trigger.click();

  const modal = page.locator('[data-testid="mac-keyboard-shortcuts-modal"]').first();
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(1000);

  // Press Space to light up the spacebar and 1
  await page.keyboard.down('Space');
  await page.waitForTimeout(300);

  const card = modal.locator('> div').first();
  const targetElement = (await card.count() > 0) ? card : modal;

  const file1 = path.join(DOCS_DIR, '25_success_mac_keyboard.png');
  const file2 = path.join(BRAIN_DIR, '25_success_mac_keyboard.png');

  await targetElement.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 25_success_mac_keyboard.png!');

  await page.keyboard.up('Space');
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
