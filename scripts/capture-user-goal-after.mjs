import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/41c27a89-bc98-4a25-bf0c-9609271f39c6/screenshots';

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
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3015/ ...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Wait for deferred content
  await page.waitForTimeout(4000);

  // 1. Cineastische Storyline (now above Daily Tournament)
  console.log('Capturing 62_success_cineastische_storyline.png...');
  try {
    const storylineEl = page.locator('[data-testid="lobby-scroll-choreography"]').first();
    await storylineEl.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await saveBoth(storylineEl, '62_success_cineastische_storyline.png');
  } catch (err) {
    console.error('Error 62:', err.message);
  }

  // 2. Live-Auszahlungen Spiral 3D Stage
  console.log('Capturing 63_success_live_auszahlungen.png...');
  try {
    const livePayoutsTitle = page.getByText('Live Auszahlungen').first();
    await livePayoutsTitle.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const spiralCard = livePayoutsTitle.locator('xpath=ancestor::div[contains(@style, "border") or contains(@style, "border-radius") or contains(@style, "overflow: hidden")][last()]');
    await saveBoth(spiralCard, '63_success_live_auszahlungen.png');
  } catch (err) {
    console.error('Error 63:', err.message);
  }

  // 3. Jackpot & Gesamt Ausgezahlt (Frameless Canvas)
  console.log('Capturing 64_success_jackpot_gesamt_ausgezahlt.png...');
  try {
    const jackpotTitle = page.getByText('Live Progressive Jackpot').first();
    await jackpotTitle.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);
    // Capture both jackpot and the frameless stats row
    const statsTitle = page.getByText('GESAMT AUSGEZAHLT').first();
    const statsContainer = statsTitle.locator('xpath=ancestor::div[contains(@style, "grid-column: 1 / -1") or contains(@style, "gridColumn: 1 / -1") or contains(@style, "grid-column: 1 / -1")][1]');
    if (await statsContainer.isVisible()) {
      await saveBoth(statsContainer, '64_success_jackpot_gesamt_ausgezahlt.png');
    } else {
      const statsFallback = statsTitle.locator('xpath=ancestor::div[3]');
      await saveBoth(statsFallback, '64_success_jackpot_gesamt_ausgezahlt.png');
    }
  } catch (err) {
    console.error('Error 64:', err.message);
  }

  // 4. Daily Tournament Podium with Avatars
  console.log('Capturing 65_success_daily_tournament_podium.png...');
  try {
    const tournamentTitle = page.getByText('$10,000 Daily Race').first();
    await tournamentTitle.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const tournamentCard = tournamentTitle.locator('xpath=ancestor::div[contains(@style, "border") or contains(@style, "border-radius")][last()]');
    await saveBoth(tournamentCard, '65_success_daily_tournament_podium.png');
  } catch (err) {
    console.error('Error 65:', err.message);
  }

  // 5. Live Activity Feed (All Bets, Magnetic Dock tabs, luxury styling)
  console.log('Capturing 66_success_live_activity_feed.png...');
  try {
    const activityFeed = page.getByText('Live-Aktivität').first();
    await activityFeed.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const feedSection = activityFeed.locator('xpath=ancestor::section | ancestor::div[contains(@style, "max-width: 1560px") or contains(@style, "maxWidth: 1560px")][1]');
    await saveBoth(feedSection, '66_success_live_activity_feed.png');
  } catch (err) {
    console.error('Error 66:', err.message);
  }

  await browser.close();
  console.log('Screenshot script finished!');
}

main().catch((err) => {
  console.error('Error in script:', err);
  process.exit(1);
});
