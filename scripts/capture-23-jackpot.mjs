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
  console.log('Navigating to http://localhost:3015/...');
  await page.goto('http://localhost:3015/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  const cascade = page.locator('[data-testid="jackpot-letter-cascade"]').first();
  await cascade.scrollIntoViewIfNeeded();
  await cascade.waitFor({ state: 'visible', timeout: 10000 });

  // Hover over the cascading letters
  await cascade.hover();
  await page.waitForTimeout(350);

  // Capture the parent jackpot card container
  const jackpotCard = cascade.locator('xpath=ancestor::div[contains(@style, "width: 320px") or contains(@style, "border-radius: 18px") or contains(@style, "min-height")]').first();
  const targetElement = (await jackpotCard.count() > 0) ? jackpotCard : cascade;

  const file1 = path.join(DOCS_DIR, '23_success_letter_cascade.png');
  const file2 = path.join(BRAIN_DIR, '23_success_letter_cascade.png');

  await targetElement.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 23_success_letter_cascade.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
