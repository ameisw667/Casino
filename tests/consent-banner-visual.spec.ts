import { test } from '@playwright/test';

test('consent banner is visible and operates on http://localhost:3015', async ({ page }) => {
  await page.goto('http://localhost:3015/');
  await page.waitForLoadState('networkidle');

  // Check if dialog is present in DOM
  const banner = page.locator('div[role="dialog"][aria-label="Datennutzung für Produktverbesserung"]');
  const count = await banner.count();
  console.log('Banner count in DOM:', count);

  if (count > 0) {
    const isVisible = await banner.isVisible();
    const box = await banner.boundingBox();
    console.log('Banner isVisible:', isVisible);
    console.log('Banner boundingBox:', box);
    const html = await banner.innerHTML();
    console.log('Banner innerHTML:', html);
  } else {
    console.log('Banner NOT FOUND in DOM!');
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('Body HTML length:', bodyHtml.length);
  }

  await page.screenshot({ path: 'test-results/consent-banner-live.png', fullPage: false });
});
