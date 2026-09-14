import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/d53fa26a-5663-41db-8d88-4969d6026f77/screenshots';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch();

  // Desktop (1440x1080)
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    console.log('Navigating to desktop lobby...');
    await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Scroll directly to the Jackpot cell
    const jackpotCell = page
      .locator('text=Live Progressive Jackpot')
      .locator('xpath=ancestor::div[contains(@style, "border-radius")][last()]');
    await jackpotCell.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const desktopSectionPath = path.join(OUT_DIR, 'bento_section2_desktop.png');
    await page.screenshot({ path: desktopSectionPath });
    console.log('Captured desktop section:', desktopSectionPath);

    // Exact capture of Jackpot Bento Cell with 3D Vault Drum
    const jackpotPath = path.join(OUT_DIR, 'vault_kinetic_drum_desktop.png');
    await jackpotCell.screenshot({ path: jackpotPath });
    console.log('Captured vault kinetic drum:', jackpotPath);

    // Scroll to Platform Stats
    const statsCell = page
      .locator('text=Gesamt ausgezahlt')
      .locator('xpath=ancestor::div[contains(@style, "grid-template-columns")][1]');
    if ((await statsCell.count()) > 0) {
      await statsCell.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const statsPath = path.join(OUT_DIR, 'platform_stats_3d_desktop.png');
      await statsCell.screenshot({ path: statsPath });
      console.log('Captured platform stats:', statsPath);
    }

    // Scroll to Tournament Podium Strip
    const podiumStrip = page
      .locator('text=$10,000 Daily Race')
      .locator('xpath=ancestor::div[contains(@style, "border-radius")][last()]');
    await podiumStrip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const carouselPath = path.join(OUT_DIR, 'cylindrical_podium_carousel_desktop.png');
    await podiumStrip.screenshot({ path: carouselPath });
    console.log('Captured cylindrical podium carousel:', carouselPath);

    await ctx.close();
  }

  // Mobile (390x844)
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    console.log('Navigating to mobile lobby...');
    await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    // Trigger mobile scroll event to reveal deferred content
    await page.evaluate(() => {
      window.scrollTo(0, 300);
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(1500);

    // Scroll directly to Jackpot
    const jackpotCell = page
      .locator('text=Live Progressive Jackpot')
      .locator('xpath=ancestor::div[contains(@style, "border-radius")][last()]');
    await jackpotCell.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const mobileJackpotPath = path.join(OUT_DIR, 'vault_kinetic_drum_mobile.png');
    await jackpotCell.screenshot({ path: mobileJackpotPath });
    console.log('Captured mobile vault drum:', mobileJackpotPath);

    // Scroll to Podium
    const podiumStrip = page
      .locator('text=$10,000 Daily Race')
      .locator('xpath=ancestor::div[contains(@style, "border-radius")][last()]');
    await podiumStrip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const mobilePodiumPath = path.join(OUT_DIR, 'cylindrical_podium_carousel_mobile.png');
    await podiumStrip.screenshot({ path: mobilePodiumPath });
    console.log('Captured mobile podium carousel:', mobilePodiumPath);

    const mobileSectionPath = path.join(OUT_DIR, 'bento_section2_mobile.png');
    await page.screenshot({ path: mobileSectionPath });
    console.log('Captured mobile section overview:', mobileSectionPath);

    await ctx.close();
  }

  await browser.close();
  console.log('All visual captures completed.');
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
