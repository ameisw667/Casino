import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
    .catch(() => chromium.launch({ headless: true, channel: 'msedge' }));
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  console.log('Navigating to http://localhost:3015/vault ...');
  const res = await page.goto('http://localhost:3015/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Status:', res?.status(), 'URL:', page.url());

  await page.waitForTimeout(4000);
  console.log('Current URL after wait:', page.url());
  const text = await page.locator('body').innerText();
  console.log('Body preview:', text.slice(0, 300));
  await browser.close();
}

main().catch(console.error);
