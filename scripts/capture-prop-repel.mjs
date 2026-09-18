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

  // 1. VIP Vault Slogan & Tier Badge
  console.log('Capturing VIP Vault Tier & Slogan...');
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file1Docs = path.join(DOCS_DIR, 'prop_repel_1_vip_badge.png');
  const file1Brain = path.join(BRAIN_DIR, 'prop_repel_1_vip_badge.png');
  
  // Element screenshot of VIP profile tier card
  await page.screenshot({ 
    path: file1Docs,
    clip: { x: 260, y: 110, width: 440, height: 160 }
  });
  fs.copyFileSync(file1Docs, file1Brain);
  console.log('Captured 1: VIP Badge & Slogan');

  // 2. Provably Fair Modal & Cryptographic Hash Badge
  console.log('Capturing Provably Fair Trust Badge...');
  await page.goto('http://localhost:3015/testing/fe-28-provably-fair', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  const file2Docs = path.join(DOCS_DIR, 'prop_repel_2_provably_fair.png');
  const file2Brain = path.join(BRAIN_DIR, 'prop_repel_2_provably_fair.png');

  // Provably fair modal header & seed info
  await page.screenshot({ 
    path: file2Docs,
    clip: { x: 380, y: 150, width: 680, height: 380 }
  });
  fs.copyFileSync(file2Docs, file2Brain);
  console.log('Captured 2: Provably Fair Modal');

  // 3. Games Catalog Section Header
  console.log('Capturing Games Catalog Header...');
  await page.goto('http://localhost:3015/games', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file3Docs = path.join(DOCS_DIR, 'prop_repel_3_catalog_header.png');
  const file3Brain = path.join(BRAIN_DIR, 'prop_repel_3_catalog_header.png');

  // Games page header
  await page.screenshot({ 
    path: file3Docs,
    clip: { x: 240, y: 80, width: 960, height: 260 }
  });
  fs.copyFileSync(file3Docs, file3Brain);
  console.log('Captured 3: Catalog Header');

  await browser.close();
  console.log('Done capturing Text Repel proposals!');
}

main().catch(err => { console.error(err); process.exit(1); });
