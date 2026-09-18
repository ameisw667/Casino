import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const DOCS_DIR = path.resolve('docs/frontend/screenshots');
  const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/f9759803-5163-4a04-8fed-30c619880196/screenshots';

  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('Capturing Jackpot Ticker Card precisely...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3500);

  const jackpotLocator = page.locator('div').filter({ hasText: 'PROGRESSIVE JACKPOT' }).first();
  const file1Docs = path.join(DOCS_DIR, 'prop_cascade_1_jackpot.png');
  const file1Brain = path.join(BRAIN_DIR, 'prop_cascade_1_jackpot.png');

  // Element screenshot of the card
  const jackpotCard = page.locator('div').filter({ hasText: /PROGRESSIVE JACKPOT.*\$[0-9,.]+/ }).last();
  if (await jackpotCard.isVisible()) {
    await jackpotCard.screenshot({ path: file1Docs });
  } else {
    await page.screenshot({ path: file1Docs, clip: { x: 740, y: 220, width: 380, height: 420 } });
  }
  fs.copyFileSync(file1Docs, file1Brain);
  console.log('Recaptured 1: Jackpot Ticker Card');

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
