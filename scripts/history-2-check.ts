import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.join(process.cwd(), 'history-2-screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const DEMO_STATE = {
  version: 1,
  state: {
    balance: 2450.75,
    xp: 8750,
    level: 12,
    rank: 'Silver',
    bets: [
      { id: 'bet-crash-001', time: '10:42 AM', game: 'Crash', user: 'You', amount: 50, multiplier: 3.25, payout: 162.5, win: true },
      { id: 'bet-dice-002', time: '10:38 AM', game: 'Dice', user: 'You', amount: 25, multiplier: 0, payout: 0, win: false },
      { id: 'bet-roulette-003', time: '10:31 AM', game: 'Roulette', user: 'You', amount: 100, multiplier: 2, payout: 200, win: true },
      { id: 'bet-crash-004', time: '10:25 AM', game: 'Crash', user: 'You', amount: 75, multiplier: 1.85, payout: 138.75, win: true },
      { id: 'bet-slots-005', time: '10:18 AM', game: 'Slots', user: 'You', amount: 40, multiplier: 0, payout: 0, win: false },
      { id: 'bet-dice-006', time: '10:12 AM', game: 'Dice', user: 'You', amount: 60, multiplier: 2.1, payout: 126, win: true },
      { id: 'bet-crash-007', time: '10:05 AM', game: 'Crash', user: 'You', amount: 30, multiplier: 0, payout: 0, win: false },
      { id: 'bet-roulette-008', time: '09:58 AM', game: 'Roulette', user: 'You', amount: 80, multiplier: 0, payout: 0, win: false },
    ],
    gameStats: {
      CRASH: { totalBets: 3, wins: 2, losses: 1, profit: 176.25, peakWinMultiplier: 3.25 },
      DICE: { totalBets: 2, wins: 1, losses: 1, profit: 41 },
      ROULETTE: { totalBets: 2, wins: 1, losses: 1, profit: -80 },
      SLOTS: { totalBets: 1, wins: 0, losses: 1, profit: -40 },
    },
    analytics: {
      totalWagered: 460,
      totalPayout: 627.25,
      winRate: 50,
      totalSessionTime: 1800000,
      activityHeatmap: { '8': 4, '9': 2, '10': 2 },
    },
    responsibleGaming: {
      sessionDuration: 30,
      sessionLoss: 120,
      martingaleDetected: false,
      lossLimit: 500,
      winLimit: 1000,
    },
  },
};

async function run() {
  const browser = await chromium.launch();
  const results: { name: string; ok: boolean; errors: string[] }[] = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const errors: string[] = [];

    try {
      await page.goto('http://localhost:3000/history-2', { waitUntil: 'networkidle', timeout: 15000 });

      // Seed localStorage so the table renders with demo data
      await page.evaluate((demo) => {
        window.localStorage.setItem('casino-storage', JSON.stringify(demo));
      }, DEMO_STATE);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);

      // Check key elements
      const checks = [
        { selector: 'text=BET HISTORY', name: 'BET HISTORY heading' },
        { selector: 'text=TOTAL EARNED', name: 'TOTAL EARNED stat' },
        { selector: 'text=NET PROFIT', name: 'NET PROFIT stat' },
        { selector: 'text=SUCCESS RATE', name: 'SUCCESS RATE stat' },
        { selector: 'text=TOTAL ACTIONS', name: 'TOTAL ACTIONS stat' },
        { selector: 'text=GAME PERFORMANCE', name: 'GAME PERFORMANCE card' },
        { selector: 'text=ACTIVITY', name: 'ACTIVITY table header' },
        { selector: 'text=VERIFICATION', name: 'VERIFICATION table header' },
        { selector: 'text=ALL', name: 'ALL filter' },
        { selector: 'text=WINS', name: 'WINS filter' },
        { selector: 'text=RESPONSIBLE GAMING', name: 'RESPONSIBLE GAMING footer' },
      ];

      for (const check of checks) {
        const visible = await page.locator(check.selector).first().isVisible().catch(() => false);
        if (!visible) errors.push(`Missing or hidden: ${check.name}`);
      }

      // Full page screenshot
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-full.png`), fullPage: true });
      // Above-the-fold viewport screenshot
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-above-fold.png`) });

      // Check that main table is within first viewport (above the fold)
      const tableHeader = page.locator('text=ACTIVITY').first();
      const box = await tableHeader.boundingBox().catch(() => null);
      if (box) {
        if (box.y > vp.height * 0.78) {
          errors.push(`ACTIVITY table starts too low (${Math.round(box.y)}px), may be below fold on ${vp.name}`);
        }
      }

      // Verify at least 4 demo rows render
      const rows = await page.locator('tbody tr').count();
      if (rows < 4) errors.push(`Expected >= 4 table rows, found ${rows}`);

      results.push({ name: vp.name, ok: errors.length === 0, errors });
    } catch (e) {
      results.push({ name: vp.name, ok: false, errors: [`Exception: ${e instanceof Error ? e.message : String(e)}`] });
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-error.png`), fullPage: true });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('=== History-2 Headless Check Results ===');
  for (const r of results) {
    console.log(`\n${r.name}: ${r.ok ? 'OK' : 'FAIL'}`);
    for (const err of r.errors) console.log(`  - ${err}`);
  }

  const allOk = results.every(r => r.ok);
  process.exit(allOk ? 0 : 1);
}

run();
