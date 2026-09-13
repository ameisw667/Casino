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
    channel: 'chrome',
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3015/...');
  await page.goto('http://localhost:3015/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  // Stimulate liquid waves with mouse movement
  await page.mouse.move(720, 250);
  await page.waitForTimeout(1000);
  await page.mouse.move(900, 320);
  await page.waitForTimeout(1500);

  const file1 = path.join(DOCS_DIR, '07_success_ambient_background.png');
  const file2 = path.join(BRAIN_DIR, '07_success_ambient_background.png');

  await page.screenshot({
    path: file1,
    clip: { x: 0, y: 60, width: 1440, height: 500 },
  });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 07_success_ambient_background.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
