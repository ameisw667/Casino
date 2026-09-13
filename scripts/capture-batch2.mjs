import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots';

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
  console.log('Launching browser for Batch 2 screenshots (fast mode)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 08: Desktop Header & Quick Navigation
  console.log('08: Desktop Header...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const header = page.locator('header.glass-header').first();
  if (await header.isVisible()) {
    await saveBoth(header, '08_weakness_desktop_header.png');
  } else {
    await saveBoth(page, '08_weakness_desktop_header.png', {
      clip: { x: 0, y: 0, width: 1440, height: 80 }
    });
  }

  // 09: Casino Royale Marken-Wappen & Logo
  console.log('09: Brand Logo in Sidebar...');
  await saveBoth(page, '09_weakness_brand_logo.png', {
    clip: { x: 0, y: 0, width: 260, height: 120 }
  });

  // 10: Spielauswahl & Featured Wheel (/games page header & game grid)
  console.log('10: Games Selection & Header on /games...');
  await page.goto('http://127.0.0.1:3015/games', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  await saveBoth(page, '10_weakness_wheel_carousel.png', {
    clip: { x: 260, y: 80, width: 1100, height: 320 }
  });

  // 11: Hall of Fame & Größte Wochengewinne (Bento Arcade / Live Wins on /)
  console.log('11: Hall of Fame & Top Wins on Bento...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(1000);
  await saveBoth(page, '11_weakness_spiral_3d_slider.png', {
    clip: { x: 260, y: 200, width: 1100, height: 420 }
  });

  // 12: Crash Game Arena Backdrop (/games/crash)
  console.log('12: Crash Game Backdrop...');
  await page.goto('http://127.0.0.1:3015/games/crash', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);
  await saveBoth(page, '12_weakness_crash_backdrop.png', {
    clip: { x: 260, y: 100, width: 1100, height: 500 }
  });

  // 13: VIP Club Magazin & Benefits-Bücher (/vault)
  console.log('13: VIP Tier Showcase on /vault...');
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(1000);
  await saveBoth(page, '13_weakness_newsletter_bookshelf.png', {
    clip: { x: 260, y: 150, width: 1100, height: 450 }
  });

  // 14: Bonus-Enthüllung & Promo-Einlösung (Redeem Card on /vault)
  console.log('14: Promo Redeem Card on /vault...');
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  const redeemBox = page.locator('div:has-text("REDEEM CODE")').last();
  const redeemParent = redeemBox.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  if (await redeemParent.isVisible()) {
    await saveBoth(redeemParent, '14_weakness_promo_split_card.png');
  } else {
    await saveBoth(page, '14_weakness_promo_split_card.png', {
      clip: { x: 500, y: 350, width: 600, height: 240 }
    });
  }

  // 15: Tischfilz & Action-Button Feedback (Bet Button in Dice)
  console.log('15: Game Action Button in Dice...');
  await page.goto('http://127.0.0.1:3015/games/dice', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);
  const actionBtn = page.locator('button:has-text("ROLL DICE"), button:has-text("BET"), button:has-text("Roll")').first();
  if (await actionBtn.isVisible()) {
    await saveBoth(actionBtn, '15_weakness_game_action_button.png');
  } else {
    await saveBoth(page, '15_weakness_game_action_button.png', {
      clip: { x: 260, y: 450, width: 450, height: 180 }
    });
  }

  // 16: Royal Obsidian VIP-Beitritts-Urkunde (Rank Benefits Modal or LevelProgress)
  console.log('16: VIP Rank Certificate / Modal...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  const rankBtn = page.locator('header button:has-text("BRONZE"), header button:has-text("LEVEL"), header button:has-text("LVL")').first();
  if (await rankBtn.isVisible()) {
    await rankBtn.click();
    await page.waitForTimeout(1000);
    const modal = page.locator('div[role="dialog"], div.glass.animate-slide-up').first();
    if (await modal.isVisible()) {
      await saveBoth(modal, '16_weakness_vip_certificate.png');
    } else {
      await saveBoth(page, '16_weakness_vip_certificate.png', {
        clip: { x: 400, y: 150, width: 640, height: 600 }
      });
    }
  } else {
    await saveBoth(page, '16_weakness_vip_certificate.png', {
      clip: { x: 400, y: 150, width: 640, height: 600 }
    });
  }

  // 17: Interactive Headline & Text-Repel (Hero Showcase on /)
  console.log('17: Hero Showcase Headline on /...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  const headline = page.locator('h1').first();
  if (await headline.isVisible()) {
    await saveBoth(headline, '17_weakness_hero_text_repel.png');
  } else {
    await saveBoth(page, '17_weakness_hero_text_repel.png', {
      clip: { x: 260, y: 80, width: 700, height: 350 }
    });
  }

  await browser.close();
  console.log('ALL BATCH 2 SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
