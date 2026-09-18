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
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. Crash Game Status Overlay
  console.log('Capturing Crash Game...');
  await page.goto('http://localhost:3015/games/crash', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file1Docs = path.join(DOCS_DIR, 'prop_kinetic_1_crash.png');
  const file1Brain = path.join(BRAIN_DIR, 'prop_kinetic_1_crash.png');
  
  // Element screenshot of Crash canvas / multiplier stage
  await page.screenshot({ 
    path: file1Docs,
    clip: { x: 260, y: 120, width: 880, height: 500 }
  });
  fs.copyFileSync(file1Docs, file1Brain);
  console.log('Captured 1: Crash Game Stage');

  // 2. Blackjack Game Table & Verdict
  console.log('Capturing Blackjack Table...');
  await page.goto('http://localhost:3015/games/blackjack', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file2Docs = path.join(DOCS_DIR, 'prop_kinetic_2_blackjack.png');
  const file2Brain = path.join(BRAIN_DIR, 'prop_kinetic_2_blackjack.png');

  // Table center clip
  await page.screenshot({ 
    path: file2Docs,
    clip: { x: 260, y: 120, width: 920, height: 520 }
  });
  fs.copyFileSync(file2Docs, file2Brain);
  console.log('Captured 2: Blackjack Table Stage');

  // 3. Roulette Wheel & Result Callout
  console.log('Capturing Roulette...');
  await page.goto('http://localhost:3015/games/roulette', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file3Docs = path.join(DOCS_DIR, 'prop_kinetic_3_roulette.png');
  const file3Brain = path.join(BRAIN_DIR, 'prop_kinetic_3_roulette.png');

  // Roulette stage clip
  await page.screenshot({ 
    path: file3Docs,
    clip: { x: 260, y: 100, width: 920, height: 520 }
  });
  fs.copyFileSync(file3Docs, file3Brain);
  console.log('Captured 3: Roulette Stage');

  await browser.close();
  console.log('Done capturing Kinetic Text Reveal proposals!');
}

main().catch(err => { console.error(err); process.exit(1); });
