import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

const metadataPages = [
  { path: '/', expectedTitleIncludes: 'Casino Royale' },
  { path: '/admin', expectedTitleIncludes: 'Admin Overview' },
  { path: '/admin/games', expectedTitleIncludes: 'Game Management' },
  { path: '/admin/simulation', expectedTitleIncludes: 'Bet Simulation' },
  { path: '/admin/users', expectedTitleIncludes: 'User Management' },
  { path: '/sign-in', expectedTitleIncludes: 'Sign In' },
  { path: '/sign-up', expectedTitleIncludes: 'Sign Up' },
  { path: '/games', expectedTitleIncludes: 'Games' },
  { path: '/games/blackjack', expectedTitleIncludes: 'Blackjack' },
  { path: '/games/blackjack-v2', expectedTitleIncludes: 'Blackjack V2' },
  { path: '/games/slots-v2', expectedTitleIncludes: 'Slots V2' },
  { path: '/history', expectedTitleIncludes: 'Bet History' },
  { path: '/leaderboard', expectedTitleIncludes: 'Leaderboard' },
  { path: '/vault', expectedTitleIncludes: 'Vault' },
];

(async () => {
  const browser = await chromium.launch();
  const results = { metadata: [], console: [], hydration: null };

  // --- Priority 2: metadata checks ---
  for (const p of metadataPages) {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    try {
      const resp = await page.goto(BASE + p.path, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(500);
      const title = await page.title();
      const ok = title.includes(p.expectedTitleIncludes);
      results.metadata.push({ path: p.path, status: resp.status(), title, ok });
    } catch (e) {
      results.metadata.push({ path: p.path, error: String(e) });
    }

    if (consoleErrors.length) {
      results.console.push({ path: p.path, errors: consoleErrors });
    }
    await page.close();
  }

  // --- Priority 3: hydration check on "/" with localStorage pre-seeded ---
  const ctx = await browser.newContext();
  const page1 = await ctx.newPage();
  await page1.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
  await page1.waitForTimeout(500);
  // Seed localStorage with a fake balance via the persisted store key
  await page1.evaluate(() => {
    const existing = localStorage.getItem('casino-storage');
    let data = existing ? JSON.parse(existing) : { state: {}, version: 1 };
    data.state = { ...data.state, balance: 123456.78, xp: 999, level: 5 };
    localStorage.setItem('casino-storage', JSON.stringify(data));
  });

  // Reload and immediately snapshot the balance text at multiple points
  const snapshots = [];
  await page1.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  for (let i = 0; i < 8; i++) {
    const text = await page1.evaluate(() => {
      const el = document.body;
      return el
        ? el.innerText.includes('INITIALIZING CASINO')
          ? 'INITIALIZING'
          : (el.innerText.match(/\$[\d,]+\.\d{2}/) || [null])[0]
        : null;
    });
    snapshots.push(text);
    await page1.waitForTimeout(50);
  }
  results.hydration = { snapshots };

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
