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
  fs.copyFileSync(file1, file2);
  console.log(`Saved: ${filename}`);
}

async function main() {
  console.log('Launching headless browser...');
  const browser = await chromium.launch({ headless: true });

  // ─────────────────────────────────────────────────────────────
  // 1. MOBILE NAV (Mobile Viewport: 393 x 841)
  // ─────────────────────────────────────────────────────────────
  console.log('1. Capturing Mobile Navigation...');
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 841 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3015/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const mobileNav = mobilePage.locator('nav.mobile-only, nav[class*="mobile-only"]').first();
  if (await mobileNav.isVisible()) {
    await saveBoth(mobileNav, '01_weakness_mobile_nav.png');
  } else {
    // Fallback clip bottom 100px
    await saveBoth(mobilePage, '01_weakness_mobile_nav.png', {
      clip: { x: 0, y: 741, width: 393, height: 100 },
    });
  }
  await mobileContext.close();

  // ─────────────────────────────────────────────────────────────
  // DESKTOP CONTEXT (1440 x 900)
  // ─────────────────────────────────────────────────────────────
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  // ─────────────────────────────────────────────────────────────
  // 2. JACKPOT CELL (Desktop Lobby)
  // ─────────────────────────────────────────────────────────────
  console.log('2. Capturing Bento Jackpot Cell...');
  await page.goto('http://localhost:3015/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const jackpotCell = page.locator('div:has-text("Live Progressive Jackpot")').last();
  const jackpotParent = jackpotCell.locator('xpath=ancestor::div[contains(@style, "border") or contains(@style, "grid-column")][1]');
  if (await jackpotParent.isVisible()) {
    await jackpotParent.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await saveBoth(jackpotParent, '02_weakness_jackpot_ticker.png');
  } else {
    console.log('Jackpot cell not found by selector, clipping lobby bento area...');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await saveBoth(page, '02_weakness_jackpot_ticker.png', {
      clip: { x: 400, y: 300, width: 640, height: 260 },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BIG WIN OVERLAY (Isolated Preview)
  // ─────────────────────────────────────────────────────────────
  console.log('3. Capturing Big Win Overlay...');
  await page.goto('http://localhost:3015/testing/big-win-preview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Center clip around big win card
  await saveBoth(page, '03_weakness_big_win_overlay.png', {
    clip: { x: 320, y: 150, width: 800, height: 600 },
  });

  // ─────────────────────────────────────────────────────────────
  // 4. VIP / RANK SYSTEM (Rank Benefits Modal or /vault)
  // ─────────────────────────────────────────────────────────────
  console.log('4. Capturing VIP Rank Benefits...');
  await page.goto('http://localhost:3015/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click on Level / Rank in header
  const rankButton = page.locator('button:has-text("LEVEL"), button:has-text("BRONZE")').first();
  if (await rankButton.isVisible()) {
    await rankButton.click();
    await page.waitForTimeout(1000);
    const modal = page.locator('div[role="dialog"], section[role="dialog"]').first();
    if (await modal.isVisible()) {
      await saveBoth(modal, '04_weakness_vip_tiers.png');
    } else {
      await page.goto('http://localhost:3015/vault', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await saveBoth(page, '04_weakness_vip_tiers.png', {
        clip: { x: 200, y: 100, width: 1040, height: 600 },
      });
    }
  } else {
    await page.goto('http://localhost:3015/vault', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await saveBoth(page, '04_weakness_vip_tiers.png', {
      clip: { x: 200, y: 100, width: 1040, height: 600 },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 5. GAME CARD (ElevatedGameCard on /games)
  // ─────────────────────────────────────────────────────────────
  console.log('5. Capturing ElevatedGameCard on /games...');
  await page.goto('http://localhost:3015/games', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const firstCard = page.locator('article').first();
  if (await firstCard.isVisible()) {
    await saveBoth(firstCard, '05_weakness_game_card.png');
  } else {
    await saveBoth(page, '05_weakness_game_card.png', {
      clip: { x: 120, y: 180, width: 380, height: 440 },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. PROVABLY FAIR TOOL (Dice Game)
  // ─────────────────────────────────────────────────────────────
  console.log('6. Capturing Provably Fair Tool...');
  await page.goto('http://localhost:3015/games/dice', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Click Provably Fair / Fairness button
  const fairBtn = page.locator('button:has-text("Provably Fair"), button:has-text("Fairness"), button[aria-label*="Fair"]').first();
  if (await fairBtn.isVisible()) {
    await fairBtn.click();
    await page.waitForTimeout(1000);
    const modal = page.locator('div[role="dialog"], section[role="dialog"]').first();
    if (await modal.isVisible()) {
      await saveBoth(modal, '06_weakness_provably_fair.png');
    } else {
      await saveBoth(page, '06_weakness_provably_fair.png', {
        clip: { x: 250, y: 100, width: 940, height: 700 },
      });
    }
  } else {
    // If no button on dice, try footer or shortcut
    await saveBoth(page, '06_weakness_provably_fair.png', {
      clip: { x: 200, y: 200, width: 800, height: 500 },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 7. AMBIENT BACKGROUND & HERO LIGHT
  // ─────────────────────────────────────────────────────────────
  console.log('7. Capturing Ambient Background behind Hero...');
  await page.goto('http://localhost:3015/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await saveBoth(page, '07_weakness_ambient_background.png', {
    clip: { x: 0, y: 60, width: 1440, height: 420 },
  });

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
