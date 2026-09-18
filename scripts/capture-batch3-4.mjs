import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots';

for (const dir of [DOCS_DIR, BRAIN_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveBoth(pageOrElement, filename, clipOptions = {}) {
  const file1 = path.join(DOCS_DIR, filename);
  const file2 = path.join(BRAIN_DIR, filename);
  await pageOrElement.screenshot({ path: file1, ...clipOptions });
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

  // Helper to remove any guide overlay
  async function cleanOverlay() {
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        if (el.textContent && el.textContent.includes('ROYALE GUIDE') && el.tagName === 'BUTTON') {
          el.remove();
        }
      });
    });
  }

  // Helper to dismiss cookie banner
  async function dismissConsent() {
    const btn = page.locator('button:has-text("Zustimmen"), button:has-text("Ablehnen")').first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }

  // ----------------------------------------------------------------
  // BATCH 3: 18 to 27
  // ----------------------------------------------------------------

  // 18: Sicherheits- & Auszahlungs-Audits (Sidebar Bottom / Trust Shield)
  console.log('18: Capturing Trust Shield / Security Audits...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await dismissConsent();
  await cleanOverlay();
  const trustBadge = page.locator('aside div:has-text("SECURE & FAIR")').first();
  const trustParent = trustBadge.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  if (await trustParent.isVisible()) {
    await saveBoth(trustParent, '18_weakness_security_audits.png');
  } else {
    await saveBoth(page, '18_weakness_security_audits.png', {
      clip: { x: 15, y: 700, width: 220, height: 100 }
    });
  }

  // 19: VIP Onboarding & Feature-Tour (Trigger onboarding modal)
  console.log('19: Capturing Onboarding Flow...');
  await page.evaluate(() => {
    // try to open onboarding via store
    const store = window.__casino_store__;
    if (store && store.getState) store.getState().startOnboarding();
  });
  await page.waitForTimeout(1000);
  const onbModal = page.locator('div:has-text("Willkommen im Casino Royale"), div[role="dialog"]').first();
  if (await onbModal.isVisible()) {
    await saveBoth(onbModal, '19_weakness_onboarding_flow.png');
  } else {
    await saveBoth(page, '19_weakness_onboarding_flow.png', {
      clip: { x: 350, y: 150, width: 740, height: 500 }
    });
  }

  // 20: Casino Originals Entdecker-Leiste (Filter Category bar on /games)
  console.log('20: Capturing Casino Originals Category Filter Bar...');
  await page.goto('http://127.0.0.1:3015/games', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  const filterBar = page.locator('div:has-text("FILTER:"), div:has-text("ORIGINALS")').first();
  if (await filterBar.isVisible()) {
    const p = filterBar.locator('xpath=ancestor::div[contains(@style, "display")][1]');
    await saveBoth(p.isVisible() ? p : filterBar, '20_weakness_collection_surfer.png');
  } else {
    await saveBoth(page, '20_weakness_collection_surfer.png', {
      clip: { x: 260, y: 140, width: 1100, height: 90 }
    });
  }

  // 21: Spielekatalog Perspektiven-Raster (Games Grid on /games)
  console.log('21: Capturing Games Grid on /games...');
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(600);
  await saveBoth(page, '21_weakness_scroll_tilted_grid.png', {
    clip: { x: 260, y: 220, width: 1100, height: 480 }
  });

  // 22: Währungs- & Wallet-Umschalter (Header Wallet Chip)
  console.log('22: Capturing Wallet Chip & Balance in Header...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  const walletChip = page.locator('header div.header-chip:has-text("$")').first();
  if (await walletChip.isVisible()) {
    await saveBoth(walletChip, '22_weakness_text_morph.png');
  } else {
    await saveBoth(page, '22_weakness_text_morph.png', {
      clip: { x: 1050, y: 15, width: 220, height: 50 }
    });
  }

  // 23: Multiplikator- & Jackpot-Ankündigungen (Bento Jackpot Banner)
  console.log('23: Capturing Bento Jackpot Cell Headline...');
  const jackpotCell = page.locator('div:has-text("Live Progressive Jackpot")').last();
  const jackpotParent = jackpotCell.locator('xpath=ancestor::div[contains(@style, "border")][1]');
  if (await jackpotParent.isVisible()) {
    await jackpotParent.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await saveBoth(jackpotParent, '23_weakness_letter_cascade.png');
  } else {
    await saveBoth(page, '23_weakness_letter_cascade.png', {
      clip: { x: 500, y: 350, width: 500, height: 260 }
    });
  }

  // 24: Landing-Page Story-Choreografie (Bento Mosaic Area)
  console.log('24: Capturing Bento Mosaic Section...');
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  await saveBoth(page, '24_weakness_scroll_choreography.png', {
    clip: { x: 260, y: 100, width: 1100, height: 600 }
  });

  // 25: Tastatur-Shortcuts Cheat-Sheet (Settings modal / shortcuts)
  console.log('25: Capturing Shortcuts / Settings...');
  const gearBtn = page.locator('aside button:has-text("SETTINGS"), aside svg[class*="Settings"]').first();
  if (await gearBtn.isVisible()) {
    await gearBtn.click();
    await page.waitForTimeout(800);
    const popover = page.locator('div:has-text("SHORTCUTS"), div:has-text("Navigation")').first();
    if (await popover.isVisible()) {
      await saveBoth(popover, '25_weakness_mac_keyboard.png');
    } else {
      await saveBoth(page, '25_weakness_mac_keyboard.png', {
        clip: { x: 20, y: 500, width: 260, height: 300 }
      });
    }
  } else {
    await saveBoth(page, '25_weakness_mac_keyboard.png', {
      clip: { x: 20, y: 500, width: 260, height: 300 }
    });
  }

  // 26: High-Roller VIP Lounge Hintergrund (/vault background area)
  console.log('26: Capturing VIP Vault Background...');
  await page.goto('http://127.0.0.1:3015/vault', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveBoth(page, '26_weakness_prism_gradient.png', {
    clip: { x: 260, y: 80, width: 1100, height: 420 }
  });

  // 27: Rundenübergänge & Game-Reset (Dice Game Stage Reset Area)
  console.log('27: Capturing Game Round Transition in Dice...');
  await page.goto('http://127.0.0.1:3015/games/dice', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  const diceStage = page.locator('div[class*="dice"], div[style*="perspective"]').first();
  if (await diceStage.isVisible()) {
    await saveBoth(diceStage, '27_weakness_ripple_transition.png');
  } else {
    await saveBoth(page, '27_weakness_ripple_transition.png', {
      clip: { x: 260, y: 120, width: 1100, height: 380 }
    });
  }

  // ----------------------------------------------------------------
  // BATCH 4: 28 to 37
  // ----------------------------------------------------------------

  // 28: Live-Chat Drawer Quick-Bar (Open Global Chat & capture input bar)
  console.log('28: Capturing Live Chat Drawer Input Bar...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  const chatTrigger = page.locator('button[aria-label*="Chat"], button:has-text("Chat"), svg[class*="MessageSquare"]').first();
  if (await chatTrigger.isVisible()) {
    await chatTrigger.click();
    await page.waitForTimeout(1000);
  }
  const chatInputBar = page.locator('div:has(input[placeholder*="Nachricht"]), div:has(button svg[class*="Send"])').last();
  if (await chatInputBar.isVisible()) {
    await saveBoth(chatInputBar, '28_weakness_chat_dock.png');
  } else {
    await saveBoth(page, '28_weakness_chat_dock.png', {
      clip: { x: 1000, y: 750, width: 420, height: 120 }
    });
  }

  // 29: Leaderboard Rang-Karten (Top 3 Podium on /leaderboard)
  console.log('29: Capturing Leaderboard Podium...');
  await page.goto('http://127.0.0.1:3015/leaderboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  const podium = page.locator('div:has-text("1"), div[class*="podium"]').first();
  await saveBoth(page, '29_weakness_leaderboard_podium.png', {
    clip: { x: 260, y: 120, width: 1100, height: 380 }
  });

  // 30: Stats-Dashboard Gewinn-Zähler (Summary Tiles on /stats)
  console.log('30: Capturing Stats Summary Tiles...');
  await page.goto('http://127.0.0.1:3015/stats', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveBoth(page, '30_weakness_stats_counter.png', {
    clip: { x: 260, y: 100, width: 1100, height: 280 }
  });

  // 31: Blackjack Kartentisch Ambient-Backdrop (/games/blackjack)
  console.log('31: Capturing Blackjack Table Backdrop...');
  await page.goto('http://127.0.0.1:3015/games/blackjack', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveBoth(page, '31_weakness_blackjack_ambient.png', {
    clip: { x: 260, y: 80, width: 1100, height: 500 }
  });

  // 32: Community-Gewinnerwand (/history Table Stream)
  console.log('32: Capturing History Table Stream...');
  await page.goto('http://127.0.0.1:3015/history', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveBoth(page, '32_weakness_history_grid.png', {
    clip: { x: 260, y: 150, width: 1100, height: 500 }
  });

  // 33: Live-Wetten Ticker & Rollen (LiveHighlightStream in Bento on /)
  console.log('33: Capturing Live Highlight Stream Cell...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(600);
  const streamBox = page.locator('div:has-text("WhaleWatcher"), div:has-text("Satoshi_X")').first();
  if (await streamBox.isVisible()) {
    const parent = streamBox.locator('xpath=ancestor::div[contains(@style, "border") or contains(@style, "border-radius")][1]');
    await saveBoth(parent.isVisible() ? parent : streamBox, '33_weakness_live_bets_flip.png');
  } else {
    await saveBoth(page, '33_weakness_live_bets_flip.png', {
      clip: { x: 260, y: 500, width: 500, height: 350 }
    });
  }

  // 34: Admin Dashboard KPI-Header (/admin)
  console.log('34: Capturing Admin Dashboard...');
  await page.goto('http://127.0.0.1:3015/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  await saveBoth(page, '34_weakness_admin_kpi_header.png', {
    clip: { x: 0, y: 0, width: 1440, height: 400 }
  });

  // 35: Footer CTA & Community-Abschluss (Bottom of Bento Lobby / Live Activity Feed)
  console.log('35: Capturing Bottom Section of Home...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(800);
  await saveBoth(page, '35_weakness_footer_closing_plasma.png', {
    clip: { x: 260, y: 400, width: 1100, height: 450 }
  });

  // 36: Wett-Modus Umschalter (BetModeTabs in Crash or Testing)
  console.log('36: Capturing Bet Mode Tabs in Crash...');
  await page.goto('http://127.0.0.1:3015/games/crash', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await cleanOverlay();
  const tabs = page.locator('button:has-text("Manual"), button:has-text("Auto Pilot")').first();
  if (await tabs.isVisible()) {
    const parentTabs = tabs.locator('xpath=ancestor::div[contains(@style, "display")][1]');
    await saveBoth(parentTabs.isVisible() ? parentTabs : tabs, '36_weakness_bet_mode_tabs.png');
  } else {
    await saveBoth(page, '36_weakness_bet_mode_tabs.png', {
      clip: { x: 280, y: 220, width: 280, height: 80 }
    });
  }

  // 37: Dynamic Ambient Glow in Bento-Cards (Bento Arcade Hero Crash Cell)
  console.log('37: Capturing Bento Hero Cell Ambient Glow...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await cleanOverlay();
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  await saveBoth(page, '37_weakness_bento_ambient_glow.png', {
    clip: { x: 260, y: 150, width: 700, height: 450 }
  });

  await browser.close();
  console.log('ALL BATCH 3 & BATCH 4 SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch(console.error);
