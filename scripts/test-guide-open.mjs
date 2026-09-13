import { chromium } from '@playwright/test';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => console.log('PAGE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  console.log('Navigating...');
  await page.goto('http://localhost:3015/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Check if Cookie banner / Onboarding is blocking or open
  const banners = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).map((b) => b.textContent?.trim());
    return btns;
  });
  console.log('All buttons on page:', banners);

  // Check if there is an "Akzeptieren" / "Zustimmen" button
  const acceptBtn = page.locator('button:has-text("Zustimmen"), button:has-text("Akzeptieren")');
  if (await acceptBtn.count() > 0) {
    console.log('Clicking cookie/consent accept button...');
    await acceptBtn.first().click();
    await page.waitForTimeout(1000);
  }

  // Now dispatch royale-guide-open-with-prompt
  console.log('Dispatching open event...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('royale-guide-open-with-prompt', { detail: { prompt: '' } }));
  });
  await page.waitForTimeout(1500);

  const dialogFound = await page.evaluate(() => {
    const dialog = document.querySelector('section[role="dialog"]');
    return {
      found: !!dialog,
      title: document.querySelector('#royale-guide-title')?.textContent,
      classes: dialog?.className,
      inner: dialog?.textContent?.slice(0, 100),
    };
  });
  console.log('Dialog status:', dialogFound);

  await browser.close();
}

test().catch(console.error);
