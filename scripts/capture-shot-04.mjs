import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const DOCS_DIR = path.resolve('docs/frontend/screenshots');
  const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/f9759803-5163-4a04-8fed-30c619880196/screenshots';

  for (const dir of [DOCS_DIR, BRAIN_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  console.log('Navigating to VIP Tiers testing page...');
  await page.goto('http://localhost:3015/testing/fe-26-vip-tiers', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForTimeout(3000);

  // Click on the Gold tier card or dot to showcase the gold luxury tier in the 3D stack
  const goldDot = page.locator('button[aria-label="Select tier 3"]').first();
  if (await goldDot.isVisible()) {
    await goldDot.click();
    await page.waitForTimeout(1000);
  }

  const modalContainer = page.locator('div.glass').first();
  await modalContainer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const file1 = path.join(DOCS_DIR, '04_success_vip_tiers.png');
  const file2 = path.join(BRAIN_DIR, '04_success_vip_tiers.png');

  await modalContainer.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 04_success_vip_tiers.png!');

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
