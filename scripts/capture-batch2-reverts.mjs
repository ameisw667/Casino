import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = 'v:/VibeCoding/Casino/docs/frontend/screenshots';
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/f9759803-5163-4a04-8fed-30c619880196/screenshots';

for (const dir of [DOCS_DIR, BRAIN_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveBoth(pageOrElement, filename, clipOptions = {}) {
  const file1 = path.join(DOCS_DIR, filename);
  const file2 = path.join(BRAIN_DIR, filename);
  await pageOrElement.screenshot({ path: file1, ...clipOptions });
  try {
    fs.copyFileSync(file1, file2);
  } catch (e) {}
  console.log('Saved: ' + filename);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 09: Reverted Brand Logo
  console.log('Capturing 09_success_brand_logo.png...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  await saveBoth(page, '09_success_brand_logo.png', {
    clip: { x: 0, y: 0, width: 260, height: 120 }
  });

  // 14: Reverted Promo Redeem Card
  console.log('Capturing 14_success_promo_split_card.png...');
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  const redeemBox = page.locator('div:has-text("REDEEM CODE")').last();
  const redeemParent = redeemBox.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  if (await redeemParent.isVisible()) {
    await saveBoth(redeemParent, '14_success_promo_split_card.png');
  } else {
    await saveBoth(page, '14_success_promo_split_card.png', {
      clip: { x: 500, y: 350, width: 600, height: 240 }
    });
  }

  // 16: Reverted VIP Benefits Modal
  console.log('Capturing 16_success_vip_certificate.png...');
  await page.goto('http://127.0.0.1:3015/testing/fe-26-vip-tiers', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const modal = page.locator('div[role="dialog"]').first();
  if (await modal.isVisible()) {
    await saveBoth(modal, '16_success_vip_certificate.png');
  } else {
    await saveBoth(page, '16_success_vip_certificate.png', {
      clip: { x: 400, y: 50, width: 640, height: 800 }
    });
  }

  await browser.close();
  console.log('Done capturing reverts!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
