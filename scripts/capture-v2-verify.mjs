import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/41c27a89-bc98-4a25-bf0c-9609271f39c6/screenshots';

for (const dir of [DOCS_DIR, BRAIN_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3015/testing/hero-v2 ...');
  await page.goto('http://localhost:3015/testing/hero-v2', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Capture full V2 Hero Showcase
  console.log('Capturing 69_verified_hero_cinematic_showcase_v2.png...');
  const heroV2 = page.locator('section[aria-label="Casino Royale Hero V2"]').first();
  if (await heroV2.isVisible()) {
    const shot = path.join(DOCS_DIR, '69_verified_hero_cinematic_showcase_v2.png');
    await heroV2.screenshot({ path: shot });
    fs.copyFileSync(shot, path.join(BRAIN_DIR, '69_verified_hero_cinematic_showcase_v2.png'));
    console.log('Saved hero V2 screenshot!');
  } else {
    // Fallback full page
    const shot = path.join(DOCS_DIR, '69_verified_hero_cinematic_showcase_v2.png');
    await page.screenshot({ path: shot });
    fs.copyFileSync(shot, path.join(BRAIN_DIR, '69_verified_hero_cinematic_showcase_v2.png'));
  }

  // Also capture with pointer hovering on the headline to demonstrate Text Repel
  console.log('Hovering headline to capture Text Repel in action...');
  const headline = page.locator('h1').first();
  if (await headline.isVisible()) {
    const box = await headline.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
      await page.waitForTimeout(500);
      const shotHover = path.join(DOCS_DIR, '69_verified_hero_v2_text_repel_active.png');
      await page.screenshot({ path: shotHover });
      fs.copyFileSync(shotHover, path.join(BRAIN_DIR, '69_verified_hero_v2_text_repel_active.png'));
      console.log('Saved text repel hover screenshot!');
    }
  }

  await browser.close();
  console.log('All V2 screenshots captured successfully!');
}

main().catch(console.error);
