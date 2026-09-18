import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/41c27a89-bc98-4a25-bf0c-9609271f39c6/screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Scroll so that Unified Live Stage + Platform Stats are visible
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('main > div[style*="overflow-y: auto"], main > div[style*="overflowY: auto"]');
    if (scrollContainer) {
      scrollContainer.scrollTop = 1000;
    }
  });
  await page.waitForTimeout(1000);

  const shot = path.join(DOCS_DIR, '68_verified_unified_stage_and_stats.png');
  await page.screenshot({ path: shot });
  fs.copyFileSync(shot, path.join(BRAIN_DIR, '68_verified_unified_stage_and_stats.png'));

  await browser.close();
  console.log('Saved 68_verified_unified_stage_and_stats.png');
}

main().catch(console.error);
