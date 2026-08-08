import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.LEADERBOARD_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'tests', 'screenshots');

interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const box = await page.locator(selector).first().boundingBox().catch(() => null);
  if (!box) return false;
  const viewport = await page.evaluate(() => ({ height: window.innerHeight }));
  return box.y + box.height <= viewport.height && box.y >= 0;
}

async function runViewport(page: Page, width: number, height: number, label: string) {
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500); // hydration + images

  const results: CheckResult[] = [];
  const errors: string[] = [];

  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  const heading = page.locator('h1');
  const headingVisible = await heading.isVisible().catch(() => false);
  results.push({
    name: `${label} — H1 visible`,
    passed: headingVisible,
    message: headingVisible ? undefined : 'H1 not visible',
  });

  const titleText = await heading.textContent().catch(() => '');
  results.push({
    name: `${label} — H1 contains Leaderboard`,
    passed: /Leaderboard/i.test(titleText || ''),
    message: titleText || 'empty',
  });

  const podium = page.locator('[data-testid="podium"]');
  const podiumVisible = await podium.isVisible().catch(() => false);
  results.push({
    name: `${label} — Top 3 podium visible`,
    passed: podiumVisible,
    message: podiumVisible ? undefined : 'Podium not visible',
  });

  const topPlayer = page.locator('[data-testid="podium"]').getByText('Alex Martinez');
  results.push({
    name: `${label} — Top player name visible in podium`,
    passed: await topPlayer.isVisible().catch(() => false),
  });

  const table = page.locator('table');
  const cards = page.locator('[data-testid="leader-cards"]');
  const rankingsVisible = (await table.isVisible().catch(() => false)) ||
    (await cards.isVisible().catch(() => false));
  results.push({
    name: `${label} — Rankings table/cards visible`,
    passed: rankingsVisible,
  });

  const myRank = page.getByText('YOUR RANK');
  const myRankVisible = await myRank.isVisible().catch(() => false);
  results.push({
    name: `${label} — My rank bar visible`,
    passed: myRankVisible,
  });

  const headerInViewport = await isInViewport(page, 'header');
  const myRankInViewport = await isInViewport(page, 'text=YOUR RANK');
  results.push({
    name: `${label} — Header is above the fold`,
    passed: headerInViewport,
    message: headerInViewport ? undefined : 'Header below viewport',
  });
  results.push({
    name: `${label} — My rank bar is above the fold`,
    passed: myRankInViewport,
    message: myRankInViewport ? undefined : 'My rank bar below viewport',
  });

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUT_DIR, `leaderboard-2-${label.toLowerCase().replace(/\s+/g, '-')}.png`),
    fullPage: false,
  });

  results.push({
    name: `${label} — No console/page errors`,
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.slice(0, 5).join('; ') : undefined,
  });

  return results;
}

async function runSearchTest(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1500);

  const results: CheckResult[] = [];
  const rankings = page.locator('table tbody, [data-testid="leader-cards"]');
  const sarahInRankings = await rankings.getByText('Sarah Williams').isVisible().catch(() => false);
  const michaelInRankings = await rankings.getByText('Michael Chen').isVisible().catch(() => false);
  results.push({ name: 'Rankings — Sarah Williams visible', passed: sarahInRankings });
  results.push({ name: 'Rankings — Michael Chen visible', passed: michaelInRankings });

  return results;
}

async function main() {
  let browser: Browser | undefined;
  const allResults: CheckResult[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    const desktopPage = await context.newPage();
    allResults.push(...(await runViewport(desktopPage, 1440, 900, 'Desktop')));

    const mobilePage = await context.newPage();
    allResults.push(...(await runViewport(mobilePage, 375, 812, 'Mobile')));

    const searchPage = await context.newPage();
    allResults.push(...(await runSearchTest(searchPage)));

    const failed = allResults.filter((r) => !r.passed);

    console.log('\n=== Leaderboard Verification Results ===\n');
    for (const r of allResults) {
      const icon = r.passed ? '✓' : '✗';
      console.log(`${icon} ${r.name}${r.message ? ` — ${r.message}` : ''}`);
    }
    console.log(`\n${failed.length} of ${allResults.length} checks failed.`);

    if (failed.length > 0) {
      process.exit(1);
    }
  } finally {
    await browser?.close();
  }
}

main().catch((e) => {
  console.error('Verification failed with error:', e);
  process.exit(1);
});
