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

  // 1. Big Win Overlay
  console.log('Capturing Big Win Overlay...');
  await page.goto('http://localhost:3015/testing/fe-25-big-win', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  const file1Docs = path.join(DOCS_DIR, 'prop_particle_1_big_win.png');
  const file1Brain = path.join(BRAIN_DIR, 'prop_particle_1_big_win.png');
  
  await page.screenshot({ 
    path: file1Docs,
    clip: { x: 320, y: 140, width: 800, height: 620 }
  });
  fs.copyFileSync(file1Docs, file1Brain);
  console.log('Captured 1: Big Win Overlay');

  // 2. Lobby Hero
  console.log('Capturing Lobby Hero...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file2Docs = path.join(DOCS_DIR, 'prop_particle_2_lobby_hero.png');
  const file2Brain = path.join(BRAIN_DIR, 'prop_particle_2_lobby_hero.png');

  await page.screenshot({ path: file2Docs, clip: { x: 80, y: 80, width: 1280, height: 460 } });
  fs.copyFileSync(file2Docs, file2Brain);
  console.log('Captured 2: Lobby Hero');

  // 3. Vault Header
  console.log('Capturing Vault Header...');
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const file3Docs = path.join(DOCS_DIR, 'prop_particle_3_vault_header.png');
  const file3Brain = path.join(BRAIN_DIR, 'prop_particle_3_vault_header.png');

  await page.screenshot({ path: file3Docs, clip: { x: 80, y: 80, width: 1280, height: 480 } });
  fs.copyFileSync(file3Docs, file3Brain);
  console.log('Captured 3: Vault Header');

  await browser.close();
  console.log('Done capturing Particle Typography proposals!');
}

main().catch(err => { console.error(err); process.exit(1); });
