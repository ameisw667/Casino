import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // hide any guide trigger or overlay
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent && el.textContent.includes('ROYALE GUIDE') && el.tagName === 'BUTTON') {
        el.remove();
      }
    });
  });

  const redeemCard = page.locator('div:has-text("REDEEM CODE")').last();
  const parent = redeemCard.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  
  const box = await parent.boundingBox();
  console.log('Box:', box);
  if (box) {
    await page.screenshot({
      path: 'docs/frontend/screenshots/14_weakness_promo_split_card.png',
      clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height }
    });
    fs.copyFileSync('docs/frontend/screenshots/14_weakness_promo_split_card.png', 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots/14_weakness_promo_split_card.png');
    console.log('Clean shot 14 saved!');
  }
  await browser.close();
}
run().catch(console.error);
