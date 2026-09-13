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
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3015/...');
  await page.goto('http://localhost:3015/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(3500);

  const flipStack = page.locator('[data-testid="security-audit-flip-stack"]').first();
  await flipStack.scrollIntoViewIfNeeded();
  await flipStack.waitFor({ state: 'visible', timeout: 10000 });

  // Hover over the card to engage subtle hover state
  await flipStack.hover();
  await page.waitForTimeout(800);

  const file1 = path.join(DOCS_DIR, '18_success_security_audits.png');
  const file2 = path.join(BRAIN_DIR, '18_success_security_audits.png');

  // Capture the footer section containing the flip stack and trust seals
  const footer = page.locator('[data-testid="casino-footer"]').first();
  await footer.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log('SUCCESS: Captured 18_success_security_audits.png!');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
