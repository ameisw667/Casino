import { chromium } from 'playwright';

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  console.log('=== STARTING 5-SCREENSHOT VERIFICATION AUDIT ===\n');

  // 1. MOBILE LOBBY AUDIT (iPhone 15: 393 x 841)
  console.log('--- 1. Testing Mobile Lobby (/ at 393x841) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 841 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(2000);

  // Measure Above the fold & Ticker
  const lobbyTopMetrics = await mobilePage.evaluate(() => {
    const h1 = document.querySelector('h1');
    const ticker = document.querySelector('div[style*="rgba(12, 12, 18, 0.75)"]');

    return {
      h1Text: h1 ? h1.innerText.replace(/\n/g, ' ') : null,
      h1Height: h1 ? Math.round(h1.getBoundingClientRect().height) : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Lobby Top Metrics:', JSON.stringify(lobbyTopMetrics, null, 2));

  // Scroll to games grid
  await mobilePage.evaluate(() => window.scrollTo(0, 600));
  await mobilePage.waitForTimeout(1000);

  const lobbyGridMetrics = await mobilePage.evaluate(() => {
    const cards = document.querySelectorAll('section > div[style*="grid"] > div');
    const cardRects = Array.from(cards).map(c => {
      const r = c.getBoundingClientRect();
      return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
    });

    return {
      totalCards: cards.length,
      firstCard: cardRects[0] || null,
      secondCard: cardRects[1] || null,
      lastCard: cardRects[cardRects.length - 1] || null,
      isSpan2: cardRects[cardRects.length - 1] && cardRects[0] ? cardRects[cardRects.length - 1].width > cardRects[0].width * 1.5 : false,
    };
  });
  console.log('Lobby Grid Metrics:', JSON.stringify(lobbyGridMetrics, null, 2));

  // Scroll to bottom (Jackpot + Live Feed)
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobilePage.waitForTimeout(1000);

  const lobbyBottomMetrics = await mobilePage.evaluate(() => {
    const mobileList = document.querySelector('.live-activity-mobile-list');
    const rows = document.querySelectorAll('.live-activity-mobile-list > div');
    const desktopTable = document.querySelector('.live-activity-desktop-table');

    return {
      desktopTableHidden: desktopTable ? window.getComputedStyle(desktopTable).display === 'none' : true,
      mobileListVisible: mobileList ? window.getComputedStyle(mobileList).display !== 'none' : false,
      mobileRowCount: rows.length,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Lobby Bottom & Feed Metrics:', JSON.stringify(lobbyBottomMetrics, null, 2));

  // 2. MOBILE GAMES CATALOG AUDIT (/games at 393x841)
  console.log('\n--- 2. Testing Mobile Games Catalog (/games at 393x841) ---');
  await mobilePage.goto('http://localhost:3015/games', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(2000);

  const gamesMetrics = await mobilePage.evaluate(() => {
    const kbdHints = document.querySelectorAll('kbd');
    const gameCards = document.querySelectorAll('article, a[aria-label^="Play"]');
    const firstCard = gameCards[0] ? gameCards[0].getBoundingClientRect() : null;

    return {
      kbdHintsVisibleCount: Array.from(kbdHints).filter(k => window.getComputedStyle(k).display !== 'none').length,
      cardCount: gameCards.length,
      firstCardWidth: firstCard ? Math.round(firstCard.width) : null,
      firstCardHeight: firstCard ? Math.round(firstCard.height) : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Games Catalog Metrics:', JSON.stringify(gamesMetrics, null, 2));

  // 3. DESKTOP INTEGRITY AUDIT (1440x900)
  console.log('\n--- 3. Testing Desktop Viewport (1440x900) ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2000);

  const desktopMetrics = await desktopPage.evaluate(() => {
    const cards = document.querySelectorAll('section > div[style*="grid"] > div');
    const desktopTable = document.querySelector('.live-activity-desktop-table');
    const mobileList = document.querySelector('.live-activity-mobile-list');
    const tableHeaders = document.querySelectorAll('.live-activity-desktop-table th');

    return {
      gameCardsCount: cards.length,
      desktopTableVisible: desktopTable ? window.getComputedStyle(desktopTable).display !== 'none' : false,
      mobileListHidden: mobileList ? window.getComputedStyle(mobileList).display === 'none' : true,
      headersCount: tableHeaders.length,
      headers: Array.from(tableHeaders).map(h => h.innerText.trim()),
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Desktop Metrics:', JSON.stringify(desktopMetrics, null, 2));

  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
