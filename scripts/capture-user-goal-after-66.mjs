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
  await page.waitForTimeout(4000);

  console.log('Capturing 66_success_live_activity_feed.png...');
  const liveFeedBadge = page.getByText('LIVE CASINO FEED').first();
  await liveFeedBadge.scrollIntoViewIfNeeded({ timeout: 10000 });
  await page.waitForTimeout(1000);
  const feedCard = liveFeedBadge.locator('xpath=ancestor::div[contains(@style, "border") or contains(@style, "border-radius")][last()]');
  if (await feedCard.isVisible()) {
    await saveBoth(feedCard, '66_success_live_activity_feed.png');
  } else {
    const parentContainer = liveFeedBadge.locator('xpath=ancestor::div[3]');
    await saveBoth(parentContainer, '66_success_live_activity_feed.png');
  }

  await browser.close();
  console.log('Screenshot 66 finished!');
}

main().catch((err) => {
  console.error('Error in script:', err);
  process.exit(1);
});
