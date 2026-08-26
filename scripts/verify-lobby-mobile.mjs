import { chromium } from 'playwright';

async function testLobby() {
  const browser = await chromium.launch({ headless: true });
  console.log('=== STARTING LOBBY VERIFICATION ===\n');

  // 1. TEST MOBILE (iPhone 15: 393 x 852)
  console.log('--- 1. Testing Mobile Viewport (iPhone 15: 393x852) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(2500);

  const mobileMetrics = await mobilePage.evaluate(() => {
    // Check Hero Headline & Column
    const h1 = document.querySelector('h1');
    const h1Rect = h1 ? h1.getBoundingClientRect() : null;

    // Check Game Grid
    const gameGrid = document.querySelector('section > div[style*="grid"]');
    const gameCards = document.querySelectorAll('section > div[style*="grid"] > div');
    const firstCard = gameCards[0] ? gameCards[0].getBoundingClientRect() : null;
    const secondCard = gameCards[1] ? gameCards[1].getBoundingClientRect() : null;

    // Check Live Activity Feed
    const desktopTable = document.querySelector('.live-activity-desktop-table');
    const mobileList = document.querySelector('.live-activity-mobile-list');
    const mobileBetRows = document.querySelectorAll('.live-activity-mobile-list > div');
    const firstRow = mobileBetRows[1] ? mobileBetRows[1].getBoundingClientRect() : null; // [0] is header

    return {
      h1: {
        text: h1 ? h1.innerText.replace(/\n/g, ' ') : null,
        height: h1Rect ? Math.round(h1Rect.height) : null,
      },
      grid: {
        count: gameCards.length,
        firstCardWidth: firstCard ? Math.round(firstCard.width) : null,
        firstCardHeight: firstCard ? Math.round(firstCard.height) : null,
        secondCardWidth: secondCard ? Math.round(secondCard.width) : null,
        secondCardTop: secondCard ? Math.round(secondCard.top) : null,
        isSideBySide: firstCard && secondCard ? Math.abs(firstCard.top - secondCard.top) < 10 : false,
      },
      feed: {
        desktopTableVisible: desktopTable ? window.getComputedStyle(desktopTable).display !== 'none' : false,
        mobileListVisible: mobileList ? window.getComputedStyle(mobileList).display !== 'none' : false,
        rowCount: mobileBetRows.length,
        firstRowHeight: firstRow ? Math.round(firstRow.height) : null,
      },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  console.log('Mobile Metrics:', JSON.stringify(mobileMetrics, null, 2));

  // 2. TEST DESKTOP (1440 x 900)
  console.log('\n--- 2. Testing Desktop Viewport (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2500);

  const desktopMetrics = await desktopPage.evaluate(() => {
    const gameCards = document.querySelectorAll('section > div[style*="grid"] > div');
    const cardsTops = Array.from(gameCards).slice(0, 5).map(c => Math.round(c.getBoundingClientRect().top));
    const allSameRow = cardsTops.every(t => Math.abs(t - cardsTops[0]) < 10);

    const desktopTable = document.querySelector('.live-activity-desktop-table');
    const mobileList = document.querySelector('.live-activity-mobile-list');
    const tableHeaders = document.querySelectorAll('.live-activity-desktop-table th');

    return {
      grid: {
        count: gameCards.length,
        first5CardsSameRow: allSameRow,
        cardsTops,
      },
      feed: {
        desktopTableVisible: desktopTable ? window.getComputedStyle(desktopTable).display !== 'none' : false,
        mobileListVisible: mobileList ? window.getComputedStyle(mobileList).display !== 'none' : false,
        headerCount: tableHeaders.length,
        headers: Array.from(tableHeaders).map(h => h.innerText.trim()),
      },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  console.log('Desktop Metrics:', JSON.stringify(desktopMetrics, null, 2));

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

testLobby().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
