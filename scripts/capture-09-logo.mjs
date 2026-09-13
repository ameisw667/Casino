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

  // Hover over the logo emblem in the sidebar to activate the particle dispersion
  const logo = page.locator('aside.glass-sidebar a[href="/"]').first();
  await logo.waitFor({ state: 'visible', timeout: 10000 });
  await logo.hover();
  await page.waitForTimeout(600);

  const file1 = path.join(DOCS_DIR, '09_success_brand_logo.png');
  const file2 = path.join(BRAIN_DIR, '09_success_brand_logo.png');

  await page.screenshot({
    path: file1,
    clip: { x: 0, y: 0, width: 250, height: 100 },
  });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 09_success_brand_logo.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
