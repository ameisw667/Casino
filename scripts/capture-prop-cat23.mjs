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

  // Helper to save to both locations
  const save = (name) => {
    const f1 = path.join(DOCS_DIR, name);
    const f2 = path.join(BRAIN_DIR, name);
    if (fs.existsSync(f1)) {
      fs.copyFileSync(f1, f2);
    }
  };

  console.log('--- 1. Orbit Card Stack ---');
  // O1: Vault Tiers Progression
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_orbit_1_vault_tiers.png'),
    clip: { x: 180, y: 220, width: 720, height: 260 }
  });
  save('prop_orbit_1_vault_tiers.png');

  // O2: Leaderboard Podium Top 3
  await page.goto('http://localhost:3015/leaderboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_orbit_2_leaderboard_podium.png'),
    clip: { x: 200, y: 220, width: 1040, height: 380 }
  });
  save('prop_orbit_2_leaderboard_podium.png');

  // O3: VIP Tiers Testing Page
  await page.goto('http://localhost:3015/testing/fe-26-vip-tiers', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_orbit_3_vip_modal.png'),
    clip: { x: 260, y: 100, width: 920, height: 580 }
  });
  save('prop_orbit_3_vip_modal.png');

  console.log('--- 2. Sticky Scroll Cards ---');
  // S1: Reuse existing 19_success_onboarding_flow.png if available
  const s1Source = path.join(DOCS_DIR, '19_success_onboarding_flow.png');
  if (fs.existsSync(s1Source)) {
    fs.copyFileSync(s1Source, path.join(DOCS_DIR, 'prop_sticky_1_onboarding.png'));
    save('prop_sticky_1_onboarding.png');
  }

  // S2: Provably Fair Modal
  await page.goto('http://localhost:3015/testing/fe-28-provably-fair', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_sticky_2_provably_fair.png'),
    clip: { x: 380, y: 120, width: 680, height: 500 }
  });
  save('prop_sticky_2_provably_fair.png');

  // S3: Vault Bookshelf Magazine
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_sticky_3_vault_magazine.png'),
    clip: { x: 180, y: 500, width: 1080, height: 380 }
  });
  save('prop_sticky_3_vault_magazine.png');

  console.log('--- 3. Case Study Flip Stack ---');
  // F1: Footer Trust & Security Audits
  const f1Source = path.join(DOCS_DIR, '18_success_security_audits.png');
  if (fs.existsSync(f1Source)) {
    fs.copyFileSync(f1Source, path.join(DOCS_DIR, 'prop_flip_1_security_audits.png'));
    save('prop_flip_1_security_audits.png');
  } else {
    await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(DOCS_DIR, 'prop_flip_1_security_audits.png'),
      clip: { x: 180, y: 700, width: 1080, height: 200 }
    });
    save('prop_flip_1_security_audits.png');
  }

  // F2: Vault Archive Bookshelf (reuse S3 target with focused crop)
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_flip_2_vault_bookshelf.png'),
    clip: { x: 180, y: 520, width: 1080, height: 350 }
  });
  save('prop_flip_2_vault_bookshelf.png');

  // F3: Blackjack Strategy Heatmap
  await page.goto('http://localhost:3015/games/blackjack', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_flip_3_blackjack_strategy.png'),
    clip: { x: 1100, y: 80, width: 320, height: 500 }
  });
  save('prop_flip_3_blackjack_strategy.png');

  console.log('--- 4. Scroll Split Card ---');
  // C1: Promo Hero Box on Lobby
  const c1Source = path.join(DOCS_DIR, '14_success_promo_split_card.png');
  if (fs.existsSync(c1Source)) {
    fs.copyFileSync(c1Source, path.join(DOCS_DIR, 'prop_split_1_promo_hero.png'));
    save('prop_split_1_promo_hero.png');
  } else {
    await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(DOCS_DIR, 'prop_split_1_promo_hero.png'),
      clip: { x: 260, y: 350, width: 500, height: 160 }
    });
    save('prop_split_1_promo_hero.png');
  }

  // C2: Vault Status Activation
  await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_split_2_vault_activation.png'),
    clip: { x: 920, y: 110, width: 340, height: 160 }
  });
  save('prop_split_2_vault_activation.png');

  // C3: Leaderboard Prize Pool Card
  await page.goto('http://localhost:3015/leaderboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_split_3_leaderboard_pot.png'),
    clip: { x: 200, y: 130, width: 1040, height: 120 }
  });
  save('prop_split_3_leaderboard_pot.png');

  console.log('--- 5. Collection Surfer ---');
  // U1: Games Originals Surfer
  const u1Source = path.join(DOCS_DIR, '20_success_collection_surfer.png');
  if (fs.existsSync(u1Source)) {
    fs.copyFileSync(u1Source, path.join(DOCS_DIR, 'prop_surfer_1_games_originals.png'));
    save('prop_surfer_1_games_originals.png');
  }

  // U2: Live Payouts Ticker
  await page.goto('http://localhost:3015/games', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_surfer_2_live_payouts.png'),
    clip: { x: 260, y: 120, width: 920, height: 80 }
  });
  save('prop_surfer_2_live_payouts.png');

  // U3: History Bets Browser
  await page.goto('http://localhost:3015/history', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(DOCS_DIR, 'prop_surfer_3_history_bets.png'),
    clip: { x: 240, y: 100, width: 960, height: 450 }
  });
  save('prop_surfer_3_history_bets.png');

  await browser.close();
  console.log('Done capturing all 15 section screenshots for Category 2 & 3!');
}

main().catch(err => { console.error(err); process.exit(1); });
