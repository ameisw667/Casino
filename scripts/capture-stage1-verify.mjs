import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/41c27a89-bc98-4a25-bf0c-9609271f39c6/screenshots';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // 1. Arcade & Hall of Fame alignment
  console.log('Capturing Hall of Fame alignment...');
  const hof = page.getByText('HALL OF FAME').first();
  await hof.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const shot1 = path.join(DOCS_DIR, '68_verified_hall_of_fame_alignment.png');
  await page.screenshot({ path: shot1 });
  fs.copyFileSync(shot1, path.join(BRAIN_DIR, '68_verified_hall_of_fame_alignment.png'));

  // 2. Unified Live Stage (2/3 Live Payouts & 1/3 Progressive Jackpot)
  console.log('Capturing Unified Live Stage & Jackpot...');
  const liveTitle = page.getByText('LIVE AUSZAHLUNGEN').first();
  await liveTitle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const shot2 = path.join(DOCS_DIR, '68_verified_unified_live_stage_jackpot.png');
  await page.screenshot({ path: shot2 });
  fs.copyFileSync(shot2, path.join(BRAIN_DIR, '68_verified_unified_live_stage_jackpot.png'));

  // Also clip the unified stage specifically
  const unifiedStage = liveTitle.locator('xpath=ancestor::div[contains(@style, "grid-template-columns") or contains(@style, "gridTemplateColumns")][1]');
  if (await unifiedStage.isVisible()) {
    const shot3 = path.join(DOCS_DIR, '68_verified_unified_stage_clip.png');
    await unifiedStage.screenshot({ path: shot3 });
    fs.copyFileSync(shot3, path.join(BRAIN_DIR, '68_verified_unified_stage_clip.png'));
  }

  await browser.close();
  console.log('Stage 1 verification screenshots complete!');
}

main().catch(console.error);
