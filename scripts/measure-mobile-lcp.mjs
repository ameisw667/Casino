import { chromium, devices } from 'playwright';

const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/measure-mobile-lcp.mjs <absolute-route-url>');
}

const profile = {
  device: 'Pixel 5',
  cpuThrottlingRate: 4,
  network: { latencyMs: 150, downloadMbps: 1.6, uploadKbps: 750 },
};

async function measure(run) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices[profile.device],
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  let requestCount = 0;
  const browserErrors = [];

  cdp.on('Network.requestWillBeSent', () => requestCount++);
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await cdp.send('Network.enable');
  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.network.latencyMs,
    downloadThroughput: (profile.network.downloadMbps * 1024 * 1024) / 8,
    uploadThroughput: (profile.network.uploadKbps * 1024) / 8,
    connectionType: 'cellular4g',
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuThrottlingRate });

  await page.addInitScript(() => {
    const state = { fcp: null, lcpEntries: [] };
    window.__mobileLcpState = state;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') state.fcp = entry.startTime;
      }
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const element = entry.element;
        state.lcpEntries.push({
          startTime: entry.startTime,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          size: entry.size,
          url: entry.url || '',
          element: element
            ? `${element.tagName}${element.id ? `#${element.id}` : ''}${
                typeof element.className === 'string' && element.className
                  ? `.${element.className.trim().split(/\s+/).join('.')}`
                  : ''
              }`
            : '',
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(8_000);
  const metrics = await page.evaluate(() => {
    const state = window.__mobileLcpState;
    const lcp = state.lcpEntries.at(-1) ?? null;
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      initiatorType: entry.initiatorType,
    }));
    return {
      fcp: state.fcp,
      lcp,
      lcpResource: lcp ? (resources.find((resource) => resource.name === lcp.url) ?? null) : null,
      resourceCount: resources.length,
    };
  });
  await browser.close();
  return { run, requestCount, browserErrors, ...metrics };
}

const results = [];
for (let run = 1; run <= 2; run++) results.push(await measure(run));
console.log(JSON.stringify({ target, profile, results }, null, 2));
