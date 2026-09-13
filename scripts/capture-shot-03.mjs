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
    viewport: {width: 1440, height: 900},
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  console.log('Navigating to Big Win Overlay testing page...');
  await page.goto('http://localhost:3015/testing/fe-25-big-win', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForTimeout(3500);

  // Simulate mouse movement across canvas to activate particle repulsion
  await page.mouse.move(500, 450);
  await page.waitForTimeout(300);
  await page.mouse.move(720, 420);
  await page.waitForTimeout(800);

  const file1 = path.join(DOCS_DIR, '03_success_big_win_overlay.png');
  const file2 = path.join(BRAIN_DIR, '03_success_big_win_overlay.png');

  await page.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 03_success_big_win_overlay.png!');

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });