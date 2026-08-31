import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('http://localhost:3015/testing/guide-sandbox', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const outputPath =
    'C:/Users/hambu/.gemini/antigravity/brain/1f342ccd-047d-41f0-b5a5-8a82ab0a9bfa/guide_sandbox_v4.png';
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log('Screenshot saved to:', outputPath);

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
