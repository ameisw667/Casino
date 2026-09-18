import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const DOCS_DIR = path.resolve('docs/frontend/screenshots');
  const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/200a5f80-b3de-4684-884e-e8cd43798aee/screenshots';

  for (const dir of [DOCS_DIR, BRAIN_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Also copy existing prop files to current brain dir
  for (const f of ['prop_cascade_1_jackpot.png', 'prop_cascade_2_leaderboard.png', 'prop_cascade_3_dice.png']) {
    const src = path.join(DOCS_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(BRAIN_DIR, f));
    }
  }

  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. Jackpot Ticker Card on Lobby
  console.log('Capturing Jackpot Ticker...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file1Docs = path.join(DOCS_DIR, 'success_cascade_1_jackpot.png');
  const file1Brain = path.join(BRAIN_DIR, 'success_cascade_1_jackpot.png');
  
  await page.screenshot({ 
    path: file1Docs,
    clip: { x: 500, y: 140, width: 440, height: 380 }
  });
  fs.copyFileSync(file1Docs, file1Brain);
  console.log('Captured 1: Jackpot Ticker');

  // 2. Leaderboard Podium
  console.log('Capturing Leaderboard Podium...');
  await page.goto('http://localhost:3015/leaderboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file2Docs = path.join(DOCS_DIR, 'success_cascade_2_leaderboard.png');
  const file2Brain = path.join(BRAIN_DIR, 'success_cascade_2_leaderboard.png');

  await page.screenshot({ 
    path: file2Docs,
    clip: { x: 220, y: 120, width: 1000, height: 480 }
  });
  fs.copyFileSync(file2Docs, file2Brain);
  console.log('Captured 2: Leaderboard Podium');

  // 3. Dice Game Multiplier & Target Display
  console.log('Capturing Dice Game...');
  await page.goto('http://localhost:3015/games/dice', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file3Docs = path.join(DOCS_DIR, 'success_cascade_3_dice.png');
  const file3Brain = path.join(BRAIN_DIR, 'success_cascade_3_dice.png');

  await page.screenshot({ 
    path: file3Docs,
    clip: { x: 260, y: 100, width: 920, height: 500 }
  });
  fs.copyFileSync(file3Docs, file3Brain);
  console.log('Captured 3: Dice Stage');

  await browser.close();
  console.log('Done capturing Letter Cascade success screenshots!');
}

main().catch(err => { console.error(err); process.exit(1); });
