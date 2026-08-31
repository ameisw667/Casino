import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 841 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Mock endpoints
  await page.route('**/api/user/history', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows: [
          {
            id: '1',
            game: 'blackjack',
            type: 'bet',
            amount: -50,
            balance_after: 18469.23,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            game: 'blackjack',
            type: 'win',
            amount: 150,
            balance_after: 18519.23,
            created_at: new Date(Date.now() - 10000).toISOString(),
          },
          {
            id: '3',
            game: 'crash',
            type: 'bet',
            amount: -25,
            balance_after: 18369.23,
            created_at: new Date(Date.now() - 20000).toISOString(),
          },
          {
            id: '4',
            game: 'dice',
            type: 'win',
            amount: 80,
            balance_after: 18394.23,
            created_at: new Date(Date.now() - 30000).toISOString(),
          },
          {
            id: '5',
            game: 'roulette',
            type: 'bet',
            amount: -10,
            balance_after: 18314.23,
            created_at: new Date(Date.now() - 40000).toISOString(),
          },
        ],
        count: 5,
      }),
    });
  });

  await page.route('**/api/user/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalBets: 100,
        totalWins: 33,
        totalWagered: 3030.0,
        totalPayout: 3265.0,
        totalProfit: 235.0,
        winRate: 33.0,
      }),
    });
  });

  await page.goto('http://localhost:3015/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll('div[style*="gridTemplateColumns"] > div'),
    ).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        text: el.innerText.replace(/\n/g, ' '),
      };
    });

    const rows = Array.from(
      document.querySelectorAll('div[style*="flexDirection: column"] > div'),
    ).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        text: el.innerText.replace(/\n/g, ' '),
      };
    });

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cards,
      rowsCount: rows.length,
      sampleRows: rows.slice(0, 5),
    };
  });

  console.log('PLAYWRIGHT MOCK HISTORY AUDIT RESULT:\n', JSON.stringify(data, null, 2));
  await page.screenshot({ path: 'scripts/history_mock_result.png', fullPage: true });
  await browser.close();
}

run().catch(console.error);
