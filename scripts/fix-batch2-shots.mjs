import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots';

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

  // 14: Vault Redeem Card without Royale Guide overlap
  console.log('14: Capturing Vault Redeem Card...');
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Hide guide trigger if visible
  await page.evaluate(() => {
    const guide = document.querySelector('button[aria-label*="Guide"], div[class*="guide"]');
    if (guide) guide.style.display = 'none';
  });
  const redeemBox = page.locator('div:has-text("REDEEM CODE")').last();
  const redeemParent = redeemBox.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  if (await redeemParent.isVisible()) {
    await saveBoth(redeemParent, '14_weakness_promo_split_card.png');
  }

  // 15: Game Action Button in Dice
  console.log('15: Capturing Game Action Button in Dice...');
  await page.goto('http://127.0.0.1:3015/games/dice', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const rollBtn = page.locator('button:has-text("ROLL DICE")').first();
  if (await rollBtn.isVisible()) {
    await saveBoth(rollBtn, '15_weakness_game_action_button.png');
  } else {
    // try any primary bet action button
    const anyBtn = page.locator('button[style*="e5c158"], button.btn-primary').first();
    if (await anyBtn.isVisible()) {
      await saveBoth(anyBtn, '15_weakness_game_action_button.png');
    }
  }

  // 16: VIP Rank Benefits Modal
  console.log('16: Capturing VIP Rank Modal...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  // dismiss consent banner first
  const consentBtn = page.locator('button:has-text("Zustimmen"), button:has-text("Ablehnen")').first();
  if (await consentBtn.isVisible()) {
    await consentBtn.click();
    await page.waitForTimeout(500);
  }
  const rankChip = page.locator('header button.header-chip-gold, header button:has-text("LVL")').first();
  if (await rankChip.isVisible()) {
    await rankChip.click();
    await page.waitForTimeout(1000);
    const modal = page.locator('div.glass.animate-slide-up, div[role="dialog"]').first();
    if (await modal.isVisible()) {
      await saveBoth(modal, '16_weakness_vip_certificate.png');
    }
  }

  await browser.close();
  console.log('RE-CAPTURED 14, 15, 16 SUCCESSFULLY!');
}

main().catch(console.error);
