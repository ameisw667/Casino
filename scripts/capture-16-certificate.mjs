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
    viewport: { width: 800, height: 1200 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3015/testing/fe-26-vip-tiers...');
  await page.goto('http://localhost:3015/testing/fe-26-vip-tiers', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(2500);

  const cert = page.locator('div[aria-label="Royal VIP Accreditation Certificate"]').first();
  await cert.waitFor({ state: 'visible', timeout: 10000 });

  // Scroll to certificate inside the modal
  await cert.scrollIntoViewIfNeeded();
  // Wait for signature draw animation to complete smoothly
  await page.waitForTimeout(2000);

  const file1 = path.join(DOCS_DIR, '16_success_vip_certificate.png');
  const file2 = path.join(BRAIN_DIR, '16_success_vip_certificate.png');

  await cert.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 16_success_vip_certificate.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
