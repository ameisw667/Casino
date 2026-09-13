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
  console.log('Navigating to http://localhost:3015/vault...');
  await page.goto('http://localhost:3015/vault', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  const card = page.locator('div[aria-label="Vault Redeem Split Card"]').first();
  await card.waitFor({ state: 'visible', timeout: 10000 });

  // Focus input and type a code to demonstrate open split fold state
  const input = card.locator('input').first();
  await input.fill('ROYALE-VIP-2026');
  await page.waitForTimeout(500);

  // Hide floating Guide trigger button
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Open Royale Guide"]');
    if (btn) btn.style.display = 'none';
  });
  await page.waitForTimeout(500);

  const file1 = path.join(DOCS_DIR, '14_success_promo_split_card.png');
  const file2 = path.join(BRAIN_DIR, '14_success_promo_split_card.png');

  await card.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 14_success_promo_split_card.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
