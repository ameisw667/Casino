import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const DOCS_DIR = path.resolve('docs/frontend/screenshots');
  const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/f9759803-5163-4a04-8fed-30c619880196/screenshots';

  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  }).catch(() => chromium.launch({ headless: true, channel: 'msedge' }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  const save = (name) => {
    const f1 = path.join(DOCS_DIR, name);
    const f2 = path.join(BRAIN_DIR, name);
    if (fs.existsSync(f1)) {
      fs.copyFileSync(f1, f2);
    }
  };

  console.log('Recapturing Split Card 1 (Lobby Promo Card full context)...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  // Full promo card container in lobby
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_split_1_promo_hero_fixed.png'),
    clip: { x: 160, y: 350, width: 600, height: 200 }
  });
  save('prop_split_1_promo_hero_fixed.png');

  console.log('Recapturing Split Card 2 (Vault Full Profile & Status Header)...');
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  // Full Vault Profile & Status Card (not just a cut-off edge!)
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_split_2_vault_activation_fixed.png'),
    clip: { x: 180, y: 70, width: 1080, height: 200 }
  });
  save('prop_split_2_vault_activation_fixed.png');

  console.log('Recapturing Split Card 3 (Leaderboard Prize Pool banner)...');
  await page.goto('http://localhost:3015/leaderboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_split_3_leaderboard_pot_fixed.png'),
    clip: { x: 180, y: 130, width: 1080, height: 160 }
  });
  save('prop_split_3_leaderboard_pot_fixed.png');

  await browser.close();
  console.log('Done recapturing Scroll Split Card screenshots!');
}

main().catch(err => { console.error(err); process.exit(1); });
