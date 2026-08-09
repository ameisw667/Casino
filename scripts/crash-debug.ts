/**
 * Crash Game Debugger — spielt 10 Runden und dokumentiert alle Bugs
 */
import { chromium, Page } from '@playwright/test';
import * as fs from 'fs';

const BASE_URL = 'http://127.0.0.1:3001';
const SCREENSHOT_DIR = 'scripts/crash-screenshots';
const bugs: string[] = [];

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function bug(description: string) {
  bugs.push(description);
  log(`🐛 BUG: ${description}`);
}

async function screenshot(page: Page, name: string) {
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  log(`📸 Screenshot: ${path}`);
  return path;
}

async function getMultiplierText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1[style*="tabular-nums"]') as HTMLElement;
    return h1 ? h1.innerText : 'NOT_FOUND';
  });
}

async function getStatus(page: Page): Promise<string> {
  return page.evaluate(() => {
    const crashed = document.querySelector('.animate-slide-up');
    if (crashed) return 'CRASHED';
    const btn = document.querySelector('button.btn.btn-primary') as HTMLButtonElement;
    if (!btn) return 'UNKNOWN';
    const text = btn.textContent?.trim() || '';
    if (text.includes('BET') || text.includes('AUTO') || text.includes('PROCESSING')) return 'IDLE';
    if (text.includes('CASHOUT') || text.includes('WIN')) return 'RUNNING';
    return 'UNKNOWN:' + text;
  });
}

async function waitForStatus(page: Page, target: string, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = await getStatus(page);
    if (s === target) return true;
    await page.waitForTimeout(200);
  }
  return false;
}

async function getBetButtonText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const btn = document.querySelector('button.btn.btn-primary') as HTMLButtonElement;
    return btn ? btn.textContent?.trim() || '' : 'NOT_FOUND';
  });
}

async function getBalance(page: Page): Promise<number> {
  return page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span.mono'));
    for (const span of spans) {
      const text = span.textContent?.trim() || '';
      if (text.startsWith('$')) {
        return parseFloat(text.replace('$', '')) || 0;
      }
    }
    return -1;
  });
}

async function getCrashHistory(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.game-area div[class*="glass"]'));
    return chips.slice(0, 5).map((c) => (c as HTMLElement).textContent?.trim() || '');
  });
}

async function getLiveBetsCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const rows = document.querySelectorAll('tbody tr');
    return rows.length;
  });
}

async function runRound(
  page: Page,
  round: number,
  action: 'cashout' | 'crash',
  cashoutAt?: number,
) {
  log(`\n=== RUNDE ${round} (Aktion: ${action}${cashoutAt ? ` @ ${cashoutAt}x` : ''}) ===`);

  // Prüfe Initialzustand
  const initialBtn = await getBetButtonText(page);
  const initialBalance = await getBalance(page);
  log(`Initialzustand: Button="${initialBtn}", Balance=${initialBalance}`);

  if (
    !initialBtn.includes('BET') &&
    !initialBtn.includes('AUTO') &&
    !initialBtn.includes('PROCESSING')
  ) {
    bug(`Runde ${round}: Button im Initialzustand zeigt "${initialBtn}" statt "BET"`);
  }

  // Screenshot vor Start
  await screenshot(page, `r${round}_01_before_bet`);

  // Klicke BET
  const betBtn = page.locator('button.btn.btn-primary').first();
  await betBtn.click();
  log('BET geklickt');
  await page.waitForTimeout(300);

  // Prüfe ob Button sofort auf CASHOUT wechselt
  const afterClickBtn = await getBetButtonText(page);
  log(`Button nach Klick: "${afterClickBtn}"`);

  if (afterClickBtn.includes('PROCESSING')) {
    log('Button zeigt PROCESSING — warte auf Spielstart...');
    const started = await waitForStatus(page, 'RUNNING', 5000);
    if (!started) {
      bug(`Runde ${round}: Spiel kam nie aus PROCESSING heraus`);
      await screenshot(page, `r${round}_BUG_stuck_processing`);
      return;
    }
  }

  // Warte auf RUNNING
  const running = await waitForStatus(page, 'RUNNING', 5000);
  if (!running) {
    bug(`Runde ${round}: Status nie RUNNING erreicht nach BET`);
    await screenshot(page, `r${round}_BUG_no_running`);
    return;
  }
  log('Status: RUNNING');

  // Prüfe Multiplier-Anzeige beim Start
  await page.waitForTimeout(500);
  const startMultiplier = await getMultiplierText(page);
  log(`Multiplier bei Start: "${startMultiplier}"`);
  if (startMultiplier === 'NOT_FOUND' || startMultiplier === '') {
    bug(`Runde ${round}: Multiplier-Display leer beim Start`);
  }
  if (startMultiplier === '1.00x' || parseFloat(startMultiplier) < 1.0) {
    // OK — könnte auch noch am Anfang sein
  }

  // Screenshot kurz nach Start
  await screenshot(page, `r${round}_02_running`);

  // Live-Bets prüfen
  await page.waitForTimeout(800);
  const liveBetsCount = await getLiveBetsCount(page);
  log(`Live-Bets: ${liveBetsCount}`);
  if (liveBetsCount === 0) {
    bug(`Runde ${round}: Keine Live-Bets angezeigt während RUNNING`);
  }

  if (action === 'cashout') {
    // Warte bis Multiplier ~cashoutAt erreicht
    const target = cashoutAt || 1.5;
    log(`Warte auf Multiplier >= ${target}x...`);
    let reached = false;
    for (let i = 0; i < 80; i++) {
      await page.waitForTimeout(200);
      const st = await getStatus(page);
      if (st === 'CRASHED') {
        log(`Rakete crashte vor Cashout-Ziel (${target}x)`);
        reached = false;
        break;
      }
      const mText = await getMultiplierText(page);
      const m = parseFloat(mText);
      if (!isNaN(m) && m >= target) {
        reached = true;
        break;
      }
    }

    if (reached) {
      const mAtCashout = await getMultiplierText(page);
      log(`Cashout bei ${mAtCashout}`);
      const cashoutBtn = page.locator('button.btn.btn-primary').first();
      await cashoutBtn.click();
      log('CASHOUT geklickt');
      await page.waitForTimeout(400);

      // Prüfe Feedback
      await screenshot(page, `r${round}_03_cashout_clicked`);
      const feedbackVisible = await page.evaluate(() => {
        const el = document.body.innerText;
        return el.includes('CASHED OUT');
      });
      if (!feedbackVisible) {
        bug(`Runde ${round}: "CASHED OUT" Feedback nicht sichtbar nach Cashout`);
      }

      // Prüfe ob Button deaktiviert ist (darf nicht mehr klickbar sein)
      const btnAfterCashout = await getBetButtonText(page);
      log(`Button nach Cashout: "${btnAfterCashout}"`);
      if (btnAfterCashout.includes('CASHOUT') && !btnAfterCashout.includes('WIN')) {
        bug(`Runde ${round}: Button zeigt noch aktiven CASHOUT statt WIN-Betrag nach Cashout`);
      }
    }
  }

  // Warte auf CRASHED
  log('Warte auf CRASHED...');
  const crashed = await waitForStatus(page, 'CRASHED', 20000);
  if (!crashed) {
    bug(`Runde ${round}: Status nie CRASHED erreicht (Timeout 20s)`);
    await screenshot(page, `r${round}_BUG_no_crash`);
    return;
  }

  log('Status: CRASHED');
  await screenshot(page, `r${round}_04_crashed`);

  // Prüfe "CRASHED" Text
  const crashedText = await page.evaluate(() => {
    const el = document.querySelector('.animate-slide-up');
    return el ? el.textContent?.trim() : 'NOT_FOUND';
  });
  log(`Crashed-Text: "${crashedText}"`);
  if (crashedText !== 'CRASHED') {
    bug(`Runde ${round}: "CRASHED" Text fehlt oder falsch: "${crashedText}"`);
  }

  // Prüfe Countdown
  await page.waitForTimeout(200);
  const countdownVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Next round in');
  });
  log(`Countdown sichtbar: ${countdownVisible}`);
  if (!countdownVisible) {
    bug(`Runde ${round}: Countdown "Next round in..." nicht sichtbar nach Crash`);
  }

  // Prüfe Crash-History Chip
  await page.waitForTimeout(500);
  const history = await getCrashHistory(page);
  log(`Crash-History (letzte 5): ${history.join(', ')}`);

  // Warte auf Rückkehr zu IDLE
  log('Warte auf IDLE...');
  const idle = await waitForStatus(page, 'IDLE', 6000);
  if (!idle) {
    bug(`Runde ${round}: Nach Crash nie zurück zu IDLE`);
    await screenshot(page, `r${round}_BUG_stuck_crashed`);
    return;
  }

  // Prüfe ob BET-Button wieder aktiv
  const afterCrashBtn = await getBetButtonText(page);
  log(`Button nach Crash/IDLE: "${afterCrashBtn}"`);
  if (!afterCrashBtn.includes('BET') && !afterCrashBtn.includes('AUTO')) {
    bug(`Runde ${round}: Nach Crash zeigt Button "${afterCrashBtn}" statt "BET"`);
  }

  await screenshot(page, `r${round}_05_idle`);

  const finalBalance = await getBalance(page);
  log(`Balance: ${initialBalance} → ${finalBalance}`);

  if (action === 'cashout' && finalBalance <= initialBalance) {
    bug(
      `Runde ${round}: Nach erfolgreichem Cashout ist Balance nicht gestiegen (${initialBalance} → ${finalBalance})`,
    );
  }

  log(`Runde ${round} abgeschlossen ✓`);
}

async function testAutoCashout(page: Page) {
  log('\n=== TEST: Auto-Cashout Toggle ===');

  // Prüfe ob Toggle sichtbar ist
  const toggleVisible = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    return labels.some((l) => l.textContent?.includes('AUTO CASHOUT'));
  });
  log(`Auto-Cashout Label sichtbar: ${toggleVisible}`);
  if (!toggleVisible) {
    bug('Auto-Cashout Toggle nicht in der UI sichtbar');
    return;
  }

  // Toggle aktivieren — gefunden über seinen Container

  const autoCashoutSection = page.locator('text=AUTO CASHOUT').first();
  const toggleInSection = autoCashoutSection.locator('..').locator('button');
  await toggleInSection.click();
  await page.waitForTimeout(300);

  // Prüfe ob Input erscheint
  const inputVisible = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    return inputs.length >= 2; // bet amount + auto cashout input
  });
  log(`Auto-Cashout Input nach Toggle sichtbar: ${inputVisible}`);
  if (!inputVisible) {
    bug('Auto-Cashout Input erscheint nicht nach Toggle-Aktivierung');
  }
  await screenshot(page, 'auto_cashout_toggle_on');

  // Toggle wieder deaktivieren
  await toggleInSection.click();
  await page.waitForTimeout(300);
  await screenshot(page, 'auto_cashout_toggle_off');
}

async function testTabLock(page: Page) {
  log('\n=== TEST: Tab-Lock während RUNNING ===');

  const betBtn = page.locator('button.btn.btn-primary').first();
  await betBtn.click();
  await page.waitForTimeout(500);

  const running = await waitForStatus(page, 'RUNNING', 5000);
  if (!running) {
    bug('Tab-Lock Test: Konnte RUNNING nicht erreichen');
    return;
  }

  // Versuche Tab zu wechseln
  const autoTabBtn = page.locator('button', { hasText: 'Auto' }).first();
  const isDisabled = await autoTabBtn.isDisabled();
  log(`Auto-Tab disabled während RUNNING: ${isDisabled}`);
  if (!isDisabled) {
    bug('Tab-Buttons sind während laufender Runde NICHT deaktiviert');
  }

  // Warte auf Crash
  await waitForStatus(page, 'CRASHED', 20000);
  await waitForStatus(page, 'IDLE', 6000);
  log('Tab-Lock Test abgeschlossen');
}

async function testAutoTab(page: Page) {
  log('\n=== TEST: Auto-Tab — 2 Runden Auto-Bet ===');

  // Wechsle auf Auto-Tab
  const autoBtn = page.locator('button', { hasText: 'Auto' }).first();
  await autoBtn.click();
  await page.waitForTimeout(300);

  await screenshot(page, 'auto_tab_open');

  // Prüfe ob ON LOSS Buttons sichtbar
  const onLossVisible = await page.evaluate(() => {
    return document.body.innerText.includes('ON LOSS');
  });
  log(`ON LOSS Buttons sichtbar: ${onLossVisible}`);
  if (!onLossVisible) {
    bug('Auto-Tab: ON LOSS Buttons nicht sichtbar');
  }

  // Starte Auto-Bet
  const betBtn = page.locator('button.btn.btn-primary').first();
  await betBtn.click();
  log('Auto-Bet gestartet');
  await page.waitForTimeout(500);

  await screenshot(page, 'auto_bet_running');

  // Warte auf ersten Crash
  const crashed = await waitForStatus(page, 'CRASHED', 20000);
  if (!crashed) {
    bug('Auto-Tab: Erste Runde crashte nicht');
    return;
  }

  // Warte auf automatischen Neustart
  log('Warte auf automatischen Neustart...');
  const restarted = await waitForStatus(page, 'RUNNING', 7000);
  log(`Automatischer Neustart: ${restarted}`);
  if (!restarted) {
    bug('Auto-Tab: Nach Crash kein automatischer Neustart');
  }

  // Zweiten Crash abwarten und dann manuell stoppen
  await waitForStatus(page, 'CRASHED', 20000);
  await waitForStatus(page, 'IDLE', 6000);

  // Wechsle zurück auf Manual
  const manualBtn = page.locator('button', { hasText: 'Manual' }).first();
  await manualBtn.click();
  log('Zurück auf Manual-Tab');
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  log('Crash-Debugger startet');

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Console-Error-Listener
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', (err) => {
    bug(`PAGE ERROR: ${err.message}`);
  });

  await page.goto(`${BASE_URL}/games/crash`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // Warte bis INITIALIZING CASINO... verschwindet
  await page.waitForFunction(() => !document.body.innerText.includes('INITIALIZING'), {
    timeout: 15000,
  });
  await page.waitForTimeout(1500);
  log('Seite geladen');

  // Initialer Screenshot
  await screenshot(page, '00_initial_state');

  // Prüfe initiale UI-Elemente
  const hasMultiplierDisplay = await page.evaluate(() => {
    return !!document.querySelector('h1[style*="tabular-nums"]');
  });
  log(`Multiplier-Display vorhanden: ${hasMultiplierDisplay}`);
  if (!hasMultiplierDisplay) bug('Multiplier-Display-Element fehlt im DOM');

  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  log(`Canvas vorhanden: ${hasCanvas}`);
  if (!hasCanvas) bug('Canvas fehlt');

  const hasHistoryChips = await page.evaluate(() => {
    return document.querySelectorAll('.game-area div[class*="glass"]').length > 0;
  });
  log(`Crash-History Chips vorhanden: ${hasHistoryChips}`);

  // === 10 Runden spielen ===
  // Runden 1-3: Cashout bei ~1.5x
  await runRound(page, 1, 'cashout', 1.5);
  await runRound(page, 2, 'cashout', 1.8);
  await runRound(page, 3, 'cashout', 2.0);

  // Runden 4-6: Crash abwarten
  await runRound(page, 4, 'crash');
  await runRound(page, 5, 'crash');
  await runRound(page, 6, 'crash');

  // Runde 7: Auto-Cashout Test
  await testAutoCashout(page);
  await runRound(page, 7, 'crash');

  // Runde 8: Tab-Lock Test
  await testTabLock(page);

  // Runden 9-10: Auto-Tab
  await testAutoTab(page);

  // Runde 10: Abschließender manueller Test
  await runRound(page, 10, 'cashout', 1.3);

  // Console-Errors prüfen
  if (consoleErrors.length > 0) {
    const unique = [...new Set(consoleErrors)];
    unique.forEach((e) => bug(`Console-Error: ${e}`));
  }

  // Finaler Screenshot
  await screenshot(page, '99_final_state');

  await browser.close();

  // Bug-Report ausgeben
  console.log('\n' + '='.repeat(60));
  console.log('CRASH GAME DEBUG-REPORT');
  console.log('='.repeat(60));
  if (bugs.length === 0) {
    console.log('✅ Keine Bugs gefunden!');
  } else {
    console.log(`🐛 ${bugs.length} Bug(s) gefunden:\n`);
    bugs.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
  }
  console.log('='.repeat(60));

  // Bugs in Datei schreiben
  fs.writeFileSync(
    'scripts/crash-debug-report.md',
    [
      '# Crash Game Debug Report',
      `Datum: ${new Date().toISOString()}`,
      `Bugs gesamt: ${bugs.length}`,
      '',
      '## Gefundene Bugs',
      ...bugs.map((b, i) => `${i + 1}. ${b}`),
      '',
      '## Screenshots',
      `Gespeichert in: ${SCREENSHOT_DIR}/`,
    ].join('\n'),
  );

  process.exit(bugs.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(2);
});
