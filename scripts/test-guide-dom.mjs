import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3015/games/blackjack', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const guideHtml = await page.evaluate(() => {
    // Dispatch custom event to open guide
    window.dispatchEvent(new CustomEvent('royale-guide-open-with-prompt', { detail: { prompt: '' } }));
    
    // Check after event
    return {
      hasDialog: !!document.querySelector('section[role="dialog"]'),
      dialogHtml: document.querySelector('section[role="dialog"]')?.outerHTML?.slice(0, 300),
      buttonsWithText: Array.from(document.querySelectorAll('button')).map(b => ({
        label: b.getAttribute('aria-label'),
        text: b.textContent?.trim().slice(0, 40),
        html: b.outerHTML.slice(0, 150),
      })).filter(b => b.text?.includes('Guide') || b.label?.includes('Guide')),
    };
  });

  console.log('After dispatching event:', JSON.stringify(guideHtml, null, 2));

  // wait a bit for animation
  await page.waitForTimeout(1000);
  const dialogNow = await page.locator('section[role="dialog"]').count();
  console.log('Dialog count after 1s:', dialogNow);

  if (dialogNow > 0) {
    const dialogText = await page.locator('section[role="dialog"]').innerText();
    console.log('Dialog innerText sample:', dialogText.slice(0, 200));
  }

  await browser.close();
}

main().catch(console.error);
