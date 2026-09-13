import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/frontend/screenshots');
const BRAIN_DIR = 'C:/Users/hambu/.gemini/antigravity/brain/c9a8df95-62ac-40f0-8141-30ce203a759d/screenshots';

async function saveClip(page, filename, clip) {
  const file1 = path.join(DOCS_DIR, filename);
  const file2 = path.join(BRAIN_DIR, filename);
  await page.screenshot({ path: file1, clip });
  try { fs.copyFileSync(file1, file2); } catch (e) {}
  console.log('Saved: ' + filename);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

  // 25: Settings Popover in Sidebar
  console.log('25: Capturing Settings Popover...');
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const settingsBtn = page.locator('button[aria-label="Settings"]').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await page.waitForTimeout(1000);
    await saveClip(page, '25_weakness_mac_keyboard.png', { x: 10, y: 380, width: 220, height: 350 });
  }

  // 28: Global Chat Drawer
  console.log('28: Capturing Open Chat Drawer...');
  // Click mobile or desktop chat icon in MobileNav or open via evaluation
  await page.evaluate(() => {
    const s = (window).store || window.__casino_store__;
    // Dispatch custom event or click chat button
    const chatBtn = document.querySelector('button[aria-label*="chat"], button[aria-label*="Chat"]');
    if (chatBtn) (chatBtn).click();
  });
  await page.waitForTimeout(1000);
  await saveClip(page, '28_weakness_chat_dock.png', { x: 1020, y: 650, width: 400, height: 220 });

  // 29: Leaderboard Podium Stream
  console.log('29: Capturing Leaderboard Podium...');
  await page.goto('http://127.0.0.1:3015/leaderboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await saveClip(page, '29_weakness_leaderboard_podium.png', { x: 260, y: 80, width: 1100, height: 320 });

  // 30: Stats Page Summary Cards
  console.log('30: Capturing Stats Page...');
  await page.goto('http://127.0.0.1:3015/stats', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await saveClip(page, '30_weakness_stats_counter.png', { x: 260, y: 70, width: 1100, height: 300 });

  await browser.close();
  console.log('Fixed 25, 28, 29, 30 cleanly!');
}

run().catch(console.error);
