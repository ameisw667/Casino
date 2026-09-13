import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots';

for (const dir of [DOCS_DIR, BRAIN_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveClip(page, filename, clip) {
  const file1 = path.join(DOCS_DIR, filename);
  const file2 = path.join(BRAIN_DIR, filename);
  await page.screenshot({ path: file1, clip });
  try { fs.copyFileSync(file1, file2); } catch (e) {}
  console.log('Saved: ' + filename);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  async function cleanOverlay() {
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        if (el.textContent && el.textContent.includes('ROYALE GUIDE') && el.tagName === 'BUTTON') {
          el.remove();
        }
      });
    });
  }

  // 20: Casino Originals Entdecker-Leiste (/games filter bar)
  console.log('20: Category Filter Bar...');
  await page.goto('http://127.0.0.1:3015/games', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '20_weakness_collection_surfer.png', { x: 260, y: 140, width: 1100, height: 80 });

  // 21: Spielekatalog Perspektiven-Raster (/games cards grid)
  console.log('21: Games Grid...');
  await page.evaluate(() => window.scrollTo(0, 180));
  await page.waitForTimeout(500);
  await saveClip(page, '21_weakness_scroll_tilted_grid.png', { x: 260, y: 220, width: 1100, height: 480 });

  // 22: Währungs- & Wallet-Umschalter (Header Wallet)
  console.log('22: Wallet Chip...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await saveClip(page, '22_weakness_text_morph.png', { x: 1050, y: 15, width: 260, height: 50 });

  // 23: Multiplikator- & Jackpot-Ankündigungen (Jackpot Box)
  console.log('23: Bento Jackpot...');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await saveClip(page, '23_weakness_letter_cascade.png', { x: 580, y: 150, width: 420, height: 260 });

  // 24: Landing-Page Story-Choreografie (Bento Grid)
  console.log('24: Bento Story Area...');
  await saveClip(page, '24_weakness_scroll_choreography.png', { x: 260, y: 100, width: 1100, height: 550 });

  // 25: Tastatur-Shortcuts Cheat-Sheet
  console.log('25: Shortcuts Area...');
  await saveClip(page, '25_weakness_mac_keyboard.png', { x: 20, y: 550, width: 220, height: 220 });

  // 26: High-Roller VIP Lounge Hintergrund (/vault)
  console.log('26: VIP Vault Backdrop...');
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '26_weakness_prism_gradient.png', { x: 260, y: 80, width: 1100, height: 450 });

  // 27: Rundenübergänge & Game-Reset (/games/dice stage)
  console.log('27: Dice Stage Reset...');
  await page.goto('http://127.0.0.1:3015/games/dice', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '27_weakness_ripple_transition.png', { x: 260, y: 100, width: 1100, height: 400 });

  // 28: Live-Chat Drawer Quick-Bar
  console.log('28: Live Chat Dock...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => {
    const store = window.__casino_store__;
    if (store && store.getState) store.getState().setIsChatOpen(true);
  });
  await page.waitForTimeout(1000);
  await saveClip(page, '28_weakness_chat_dock.png', { x: 1050, y: 800, width: 370, height: 90 });

  // 29: Leaderboard Rang-Karten (/leaderboard)
  console.log('29: Leaderboard Podium...');
  await page.goto('http://127.0.0.1:3015/leaderboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '29_weakness_leaderboard_podium.png', { x: 260, y: 100, width: 1100, height: 400 });

  // 30: Stats-Dashboard Gewinn-Zähler (/stats)
  console.log('30: Stats Counter...');
  await page.goto('http://127.0.0.1:3015/stats', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '30_weakness_stats_counter.png', { x: 260, y: 100, width: 1100, height: 300 });

  // 31: Blackjack Kartentisch Ambient-Backdrop (/games/blackjack)
  console.log('31: Blackjack Ambient...');
  await page.goto('http://127.0.0.1:3015/games/blackjack', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '31_weakness_blackjack_ambient.png', { x: 260, y: 80, width: 1100, height: 500 });

  // 32: Community-Gewinnerwand (/history)
  console.log('32: History Table Grid...');
  await page.goto('http://127.0.0.1:3015/history', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '32_weakness_history_grid.png', { x: 260, y: 120, width: 1100, height: 500 });

  // 33: Live-Wetten Ticker & Rollen (/ Bento Live Stream)
  console.log('33: Live Bets Stream...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(600);
  await saveClip(page, '33_weakness_live_bets_flip.png', { x: 260, y: 450, width: 500, height: 350 });

  // 34: Admin Dashboard KPI-Header (/admin)
  console.log('34: Admin KPI Header...');
  await page.goto('http://127.0.0.1:3015/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '34_weakness_admin_kpi_header.png', { x: 0, y: 0, width: 1440, height: 400 });

  // 35: Footer CTA & Community-Abschluss (Bottom of Lobby)
  console.log('35: Footer Closing Section...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(800);
  await saveClip(page, '35_weakness_footer_closing_plasma.png', { x: 260, y: 300, width: 1100, height: 500 });

  // 36: Wett-Modus Umschalter (/games/crash tabs)
  console.log('36: Bet Mode Tabs...');
  await page.goto('http://127.0.0.1:3015/games/crash', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveClip(page, '36_weakness_bet_mode_tabs.png', { x: 280, y: 220, width: 280, height: 80 });

  // 37: Dynamic Ambient Glow in Bento-Cards (Crash Hero Card)
  console.log('37: Bento Hero Card Glow...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  await saveClip(page, '37_weakness_bento_ambient_glow.png', { x: 260, y: 150, width: 700, height: 450 });

  await browser.close();
  console.log('COMPLETE 20 TO 37 SCREENSHOTS CAPTURED!');
}

run().catch(console.error);
